// src/systems/AISystem/modifiers/aggressionModifier.ts

import { AIEntity, AIModifier } from '../../../types/ai.types';
import { useProgressionStore } from '../../../stores/progressionStore';

export class AggressionModifier implements AIModifier {
  public type = 'aggression';
  private baseAggression: number;
  private maxAggression: number;

  constructor(baseAggression: number = 1, maxAggression: number = 5) {
    this.baseAggression = baseAggression;
    this.maxAggression = maxAggression;
  }

  public apply(entity: AIEntity): void {
    const healthPercentage = entity.health / entity.maxHealth;
    const baseModifier = this.calculateBaseModifier(healthPercentage);

    entity.aggressionLevel = Math.min(
      this.maxAggression,
      baseModifier * this.getProgressionMultiplier()
    );

    // Modify detection and attack ranges based on aggression
    entity.detectionRange *= (1 + (entity.aggressionLevel * 0.2));
    entity.attackRange *= (1 + (entity.aggressionLevel * 0.1));
    entity.attackCooldown *= (1 - (entity.aggressionLevel * 0.05));
  }

  public update(entity: AIEntity, deltaTime: number): void {
    // Dynamic aggression updates based on combat situation
    if (entity.targetId) {
      entity.aggressionLevel = Math.min(
        this.maxAggression,
        entity.aggressionLevel * 1.1
      );
    } else {
      entity.aggressionLevel = Math.max(
        this.baseAggression,
        entity.aggressionLevel * 0.95
      );
    }
  }

  private calculateBaseModifier(healthPercentage: number): number {
    // Aggression increases as health decreases
    return this.baseAggression * (2 - healthPercentage);
  }

  private getProgressionMultiplier(): number {
    const { currentLevel } = useProgressionStore.getState();
    // Increase aggression by 10% per player level
    return 1 + ((currentLevel - 1) * 0.1);
  }
}
