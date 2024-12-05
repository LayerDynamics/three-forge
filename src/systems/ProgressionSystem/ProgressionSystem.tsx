// src/systems/ProgressionSystem/ProgressionSystem.ts

import { ProgressionLevel } from '../../types/progression.types';
import { useProgressionStore } from '../../stores/progressionStore';
import { EventDispatcher } from '../../utils/EventDispatcher';

export class ProgressionSystem {
  private static instance: ProgressionSystem | null = null;

  private constructor() {
    this.setupEventListeners();
  }

  public static getInstance(): ProgressionSystem {
    if (!ProgressionSystem.instance) {
      ProgressionSystem.instance = new ProgressionSystem();
    }
    return ProgressionSystem.instance;
  }

  private setupEventListeners(): void {
    EventDispatcher.on("LEVEL_UP", this.handleLevelUp.bind(this));
  }

  private handleLevelUp(data: { oldLevel: number; newLevel: number }): void {
    const store = useProgressionStore.getState();
    const newLevelData = store.levels[data.newLevel];

    if (newLevelData) {
      store.setLevel(data.newLevel);

      // Notify other systems of unlocks
      if (newLevelData.rewards.abilities) {
        EventDispatcher.dispatch("ABILITIES_UNLOCKED", {
          abilities: newLevelData.rewards.abilities
        });
      }

      if (newLevelData.rewards.items) {
        EventDispatcher.dispatch("ITEMS_UNLOCKED", {
          items: newLevelData.rewards.items
        });
      }
    }
  }

  public initialize(levels: Record<number, ProgressionLevel>): void {
    useProgressionStore.setState({ levels });
  }

  public addXp(amount: number): void {
    if (amount <= 0) return;

    useProgressionStore.getState().addXp(amount);
    EventDispatcher.dispatch("XP_GAINED", { amount });
  }

  public getCurrentLevel(): number {
    return useProgressionStore.getState().currentLevel;
  }

  public getModifiedStats() {
    return useProgressionStore.getState().modifiedStats;
  }

  public reset(): void {
    useProgressionStore.getState().resetProgression();
  }

  public cleanup(): void {
    EventDispatcher.off("LEVEL_UP", this.handleLevelUp.bind(this));
  }
}
