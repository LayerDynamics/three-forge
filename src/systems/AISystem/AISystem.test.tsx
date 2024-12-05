// src/systems/AISystem/AISystem.test.tsx

import { AISystem } from './AISystem';
import { useAIStore } from '../../stores/aiStore';
import { EventDispatcher } from '../../utils/EventDispatcher';
import { Vector3 } from 'three';
import { AIEntity } from '../../types/ai.types';
import { PathfindingSystem } from '../PathfindingSystem/PathfindingSystem';
import { IdleBehavior } from './behaviors/IdleBehavior';
import { PatrolBehavior } from './behaviors/PatrolBehavior';
import { CombatBehavior } from './behaviors/CombatBehavior';
import { FleeBehavior } from './behaviors/FleeBehavior';
import { FlockingBehavior } from './behaviors/FlockingBehavior';

describe('AISystem', () => {
  let aiSystem: AISystem;
  let mockPathfindingSystem: jest.Mocked<PathfindingSystem>;

  beforeEach(() => {
    // Reset the singleton instance
    (AISystem as any).instance = null;
    
    // Mock PathfindingSystem
    mockPathfindingSystem = {
      getInstance: jest.fn().mockReturnThis(),
      findPath: jest.fn().mockReturnValue([]),
      initialize: jest.fn(),
      cleanup: jest.fn(),
    } as unknown as jest.Mocked<PathfindingSystem>;

    (PathfindingSystem as any).instance = mockPathfindingSystem;

    aiSystem = AISystem.getInstance();

    // Reset the store
    useAIStore.setState({
      entities: {},
      behaviorTree: {},
      modifiers: {},
      pathfindingEnabled: true
    });

    // Mock performance.now
    jest.spyOn(performance, 'now').mockReturnValue(0);

    // Mock requestAnimationFrame
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => setTimeout(cb, 16));
  });

  afterEach(() => {
    aiSystem.cleanup();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should be a singleton', () => {
    const instance1 = AISystem.getInstance();
    const instance2 = AISystem.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should create an entity with default behaviors', () => {
    const entityId = aiSystem.addEntity();
    const entity = useAIStore.getState().entities[entityId];

    expect(entity.behaviors).toHaveLength(5);
    expect(entity.behaviors.some(b => b instanceof IdleBehavior)).toBeTruthy();
    expect(entity.behaviors.some(b => b instanceof PatrolBehavior)).toBeTruthy();
    expect(entity.behaviors.some(b => b instanceof CombatBehavior)).toBeTruthy();
    expect(entity.behaviors.some(b => b instanceof FleeBehavior)).toBeTruthy();
    expect(entity.behaviors.some(b => b instanceof FlockingBehavior)).toBeTruthy();
  });

  it('should assign and remove behaviors', () => {
    const entityId = aiSystem.addEntity();
    
    // Remove combat behavior
    aiSystem.removeBehavior(entityId, 'combat');
    let entity = useAIStore.getState().entities[entityId];
    expect(entity.behaviors.some(b => b instanceof CombatBehavior)).toBeFalsy();

    // Reassign combat behavior
    aiSystem.assignBehavior(entityId, 'combat');
    entity = useAIStore.getState().entities[entityId];
    expect(entity.behaviors.some(b => b instanceof CombatBehavior)).toBeTruthy();
  });

  it('should handle behavior transitions based on conditions', () => {
    const entityId = aiSystem.addEntity();
    aiSystem.start();

    // Trigger combat behavior through player detection
    EventDispatcher.dispatch('PLAYER_DETECTED', {
      entityId,
      playerId: 'player1'
    });

    const entity = useAIStore.getState().entities[entityId];
    expect(entity.currentBehavior).toBe('combat');
    expect(entity.targetId).toBe('player1');
  });

  it('should transition to flee behavior when health is low', () => {
    const entityId = aiSystem.addEntity();
    aiSystem.start();

    // Damage the entity significantly
    EventDispatcher.dispatch('ENTITY_DAMAGED', {
      entityId,
      damage: 80
    });

    const entity = useAIStore.getState().entities[entityId];
    expect(entity.health).toBe(20);
    expect(entity.currentBehavior).toBe('flee');
  });

  it('should apply and update modifiers', () => {
    const entityId = aiSystem.addEntity({
      health: 100,
      aggressionLevel: 1
    });

    // Simulate update cycle
    jest.advanceTimersByTime(16);
    
    const entity = useAIStore.getState().entities[entityId];
    expect(entity.aggressionLevel).toBeGreaterThan(1);
  });

  it('should handle custom entity configurations', () => {
    const customConfig = {
      position: new Vector3(1, 1, 1),
      health: 200,
      speed: 10,
      attackRange: 5,
      aggressionLevel: 2
    };

    const entityId = aiSystem.addEntity(customConfig);
    const entity = useAIStore.getState().entities[entityId];

    expect(entity.position).toEqual(customConfig.position);
    expect(entity.health).toBe(customConfig.health);
    expect(entity.speed).toBe(customConfig.speed);
    expect(entity.attackRange).toBe(customConfig.attackRange);
    expect(entity.aggressionLevel).toBe(customConfig.aggressionLevel);
  });

  it('should handle entity removal and cleanup', () => {
    const entityId = aiSystem.addEntity();
    
    aiSystem.removeEntity(entityId);
    
    const store = useAIStore.getState();
    expect(store.entities[entityId]).toBeUndefined();
  });

  it('should manage the update loop correctly', () => {
    jest.useFakeTimers();
    
    const entityId = aiSystem.addEntity();
    const updateSpy = jest.spyOn(AISystem.prototype as any, 'updateEntities');
    
    aiSystem.start();
    jest.advanceTimersByTime(1000);
    
    expect(updateSpy).toHaveBeenCalled();
    
    aiSystem.stop();
    updateSpy.mockClear();
    
    jest.advanceTimersByTime(1000);
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('should emit appropriate events during behavior changes', () => {
    const eventSpy = jest.spyOn(EventDispatcher, 'dispatch');
    const entityId = aiSystem.addEntity();
    
    aiSystem.start();
    
    // Trigger combat behavior
    EventDispatcher.dispatch('PLAYER_DETECTED', {
      entityId,
      playerId: 'player1'
    });

    expect(eventSpy).toHaveBeenCalledWith(
      "ENTITY_BEHAVIOR_CHANGE",
      expect.objectContaining({
        entityId,
        newBehavior: 'combat'
      })
    );
  });

  it('should handle complete system cleanup', () => {
    const entityId = aiSystem.addEntity();
    aiSystem.start();
    
    const eventOffSpy = jest.spyOn(EventDispatcher, 'off');
    
    aiSystem.cleanup();
    
    expect(eventOffSpy).toHaveBeenCalledTimes(3); // All event listeners
    expect(useAIStore.getState().entities).toEqual({});
    expect(useAIStore.getState().modifiers).toEqual({});
  });
});