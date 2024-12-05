// src/systems/AISystem/modifiers/progressionModifier.ts

import { AIEntity, AIModifier } from '../../../types/ai.types';
import { useProgressionStore } from '../../../stores/progressionStore';

export class ProgressionModifier implements AIModifier {
  public type = 'progression';
  private baseStats: {
    health: number;
    damage: number;
    speed: number;
  };

  constructor(baseStats: { health: number; damage: number; speed: number }) {
    this.baseStats = baseStats;
  }

  public apply(entity: AIEntity): void {
    const { currentLevel } = useProgressionStore.getState();
    const progressionMultiplier = this.calculateProgressionMultiplier(currentLevel);

    // Scale entity stats based on player progression
    entity.maxHealth = this.baseStats.health * progressionMultiplier;
    entity.health = entity.maxHealth;
    entity.speed = this.baseStats.speed * (1 + ((currentLevel - 1) * 0.05));

    // Adjust combat capabilities
    entity.attackCooldown *= (1 - ((currentLevel - 1) * 0.02));
    entity.detectionRange *= (1 + ((currentLevel - 1) * 0.03));
  }

  public update(entity: AIEntity, deltaTime: number): void {
    // Dynamic stat adjustments based on ongoing progression
    const { currentLevel } = useProgressionStore.getState();
    const progressionMultiplier = this.calculateProgressionMultiplier(currentLevel);

    // Periodically update stats to match current progression
    if (entity.maxHealth !== this.baseStats.health * progressionMultiplier) {
      this.apply(entity);
    }
  }

  private calculateProgressionMultiplier(level: number): number {
    // Base scaling: 15% increase per level
    const baseIncrease = 1 + ((level - 1) * 0.15);

    // Additional scaling for milestone levels
    const milestoneBonus = Math.floor(level / 5) * 0.1;

    return baseIncrease + milestoneBonus;
  }
}
