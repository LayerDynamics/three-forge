// src/systems/AISystem/AISystem.ts


import { Vector3 } from 'three';
import { AIBehaviorType, AIBehavior, AIEntity } from '../../types/ai.types';
import { useAIStore } from '../../../stores/aiStore';
import { IdleBehavior } from './behaviors/IdleBehavior';
import { PatrolBehavior } from './behaviors/PatrolBehavior';
import { CombatBehavior } from './behaviors/CombatBehavior';
import { FleeBehavior } from './behaviors/FleeBehavior';
import { FlockingBehavior } from './behaviors/FlockingBehavior';
import { AggressionModifier } from './modifiers/aggressionModifier';
import { ProgressionModifier } from './modifiers/progressionModifier';
import { PathfindingSystem } from '../../PathFindingSystem/PathFindingSystem';
import { EventDispatcher } from '../../../utils/EventDispatcher';

export class AISystem {
  private static instance: AISystem | null = null;
  private pathfindingSystem: PathfindingSystem;
  private frameId: number | null = null;
  private lastUpdate: number = 0;
  private readonly UPDATE_RATE = 1000 / 60;

  // Default behaviors
  private defaultBehaviors: {
    idle: IdleBehavior;
    patrol: PatrolBehavior;
    combat: CombatBehavior;
    flee: FleeBehavior;
    flock: FlockingBehavior;
  };

  // Default modifiers
  private defaultModifiers: {
    aggression: AggressionModifier;
    progression: ProgressionModifier;
  };

  private constructor() {
    this.pathfindingSystem = PathfindingSystem.getInstance();
    
    // Initialize default behaviors
    this.defaultBehaviors = {
      idle: new IdleBehavior(0),
      patrol: new PatrolBehavior([], 1),
      combat: new CombatBehavior(3),
      flee: new FleeBehavior(4),
      flock: new FlockingBehavior(2)
    };

    // Initialize default modifiers
    this.defaultModifiers = {
      aggression: new AggressionModifier(),
      progression: new ProgressionModifier({
        health: 100,
        damage: 10,
        speed: 5
      })
    };

    this.setupEventListeners();
    this.initializeDefaultModifiers();
  }

  public static getInstance(): AISystem {
    if (!AISystem.instance) {
      AISystem.instance = new AISystem();
    }
    return AISystem.instance;
  }

  private initializeDefaultModifiers(): void {
    const store = useAIStore.getState();
    Object.entries(this.defaultModifiers).forEach(([key, modifier]) => {
      store.addModifier(modifier);
    });
  }

  private setupEventListeners(): void {
    EventDispatcher.on("ENTITY_DAMAGED", this.handleEntityDamaged.bind(this));
    EventDispatcher.on("PLAYER_DETECTED", this.handlePlayerDetected.bind(this));
    EventDispatcher.on("ENTITY_BEHAVIOR_CHANGE", this.handleBehaviorChange.bind(this));
  }

  public createEntity(config: Partial<AIEntity> = {}): AIEntity {
    const defaultEntity: AIEntity = {
      id: `ai-${Date.now()}`,
      position: config.position || new Vector3(),
      rotation: config.rotation || new Vector3(),
      health: config.health || 100,
      maxHealth: config.maxHealth || 100,
      speed: config.speed || 5,
      currentBehavior: 'idle',
      behaviors: [
        this.defaultBehaviors.idle,
        this.defaultBehaviors.patrol,
        this.defaultBehaviors.combat,
        this.defaultBehaviors.flee,
        this.defaultBehaviors.flock
      ],
      aggressionLevel: config.aggressionLevel || 1,
      detectionRange: config.detectionRange || 10,
      attackRange: config.attackRange || 2,
      lastAttackTime: 0,
      attackCooldown: config.attackCooldown || 1000,
      ...config
    };

    return defaultEntity;
  }

  public addEntity(config: Partial<AIEntity> = {}): string {
    const entity = this.createEntity(config);

    // Apply modifiers before adding to store
    Object.values(this.defaultModifiers).forEach(modifier => {
      modifier.apply(entity);
    });

    useAIStore.getState().addEntity(entity);
    EventDispatcher.dispatch("AI_ENTITY_ADDED", { entityId: entity.id });

    return entity.id;
  }

  public removeEntity(id: string): void {
    useAIStore.getState().removeEntity(id);
    EventDispatcher.dispatch("AI_ENTITY_REMOVED", { entityId: id });
  }

  public assignBehavior(entityId: string, behaviorType: keyof typeof this.defaultBehaviors): void {
    const entity = useAIStore.getState().entities[entityId];
    if (!entity) return;

    const behavior = this.defaultBehaviors[behaviorType];
    if (!behavior) return;

    if (!entity.behaviors.includes(behavior)) {
      this.updateEntity(entityId, {
        behaviors: [...entity.behaviors, behavior]
      });
    }
  }

  public removeBehavior(entityId: string, behaviorType: keyof typeof this.defaultBehaviors): void {
    const entity = useAIStore.getState().entities[entityId];
    if (!entity) return;

    this.updateEntity(entityId, {
      behaviors: entity.behaviors.filter(b => b.type !== behaviorType)
    });
  }

  private handleBehaviorChange(data: { entityId: string; newBehavior: string }): void {
    const entity = useAIStore.getState().entities[data.entityId];
    if (!entity) return;

    this.updateEntity(data.entityId, {
      currentBehavior: data.newBehavior as AIBehaviorType
    });
  }

  public updateEntity(id: string, updates: Partial<AIEntity>): void {
    useAIStore.getState().updateEntity(id, updates);
  }

  public start(): void {
    if (this.frameId !== null) return;
    this.lastUpdate = performance.now();
    this.update();
  }

  public stop(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  private update = (): void => {
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastUpdate) / 1000;

    if (deltaTime >= this.UPDATE_RATE) {
      this.updateEntities(deltaTime);
      this.lastUpdate = currentTime;
    }

    this.frameId = requestAnimationFrame(this.update);
  };

  private updateEntities(deltaTime: number): void {
    const store = useAIStore.getState();
    const entities = store.entities;

    Object.values(entities).forEach(entity => {
      // Update modifiers
      Object.values(this.defaultModifiers).forEach(modifier => {
        modifier.update(entity, deltaTime);
      });

      // Select and execute behavior
      const behavior = this.selectBehavior(entity);
      if (behavior) {
        if (behavior.type !== entity.currentBehavior) {
          EventDispatcher.dispatch("ENTITY_BEHAVIOR_CHANGE", {
            entityId: entity.id,
            newBehavior: behavior.type
          });
        }
        behavior.execute(entity);
        behavior.update(entity, deltaTime);
      }
    });
  }

  private selectBehavior(entity: AIEntity): AIBehavior | null {
    const behaviors = entity.behaviors.sort((a, b) => b.priority - a.priority);

    for (const behavior of behaviors) {
      if (this.checkBehaviorConditions(entity, behavior)) {
        return behavior;
      }
    }

    // Fallback to idle behavior if no other behavior is valid
    return this.defaultBehaviors.idle;
  }

  private checkBehaviorConditions(entity: AIEntity, behavior: AIBehavior): boolean {
    return behavior.conditions.every(condition => condition.compare(entity));
  }

  private handleEntityDamaged(data: { entityId: string; damage: number }): void {
    const entity = useAIStore.getState().entities[data.entityId];
    if (!entity) return;

    const newHealth = Math.max(0, entity.health - data.damage);
    this.updateEntity(data.entityId, { health: newHealth });

    // Consider fleeing if health is low
    if (newHealth < entity.maxHealth * 0.3) {
      this.assignBehavior(data.entityId, 'flee');
    }
  }

  private handlePlayerDetected(data: { entityId: string; playerId: string }): void {
    const entity = useAIStore.getState().entities[data.entityId];
    if (!entity) return;

    this.updateEntity(data.entityId, { 
      targetId: data.playerId,
      currentBehavior: 'combat'
    });
  }

  public cleanup(): void {
    this.stop();
    EventDispatcher.off("ENTITY_DAMAGED", this.handleEntityDamaged);
    EventDispatcher.off("PLAYER_DETECTED", this.handlePlayerDetected);
    EventDispatcher.off("ENTITY_BEHAVIOR_CHANGE", this.handleBehaviorChange);
    useAIStore.setState({ entities: {}, modifiers: {} });
  }
}