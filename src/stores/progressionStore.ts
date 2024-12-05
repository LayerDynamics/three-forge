// src/stores/progressionStore.ts

import { create } from 'zustand';
import { ProgressionState } from '../types/progression.types';
import { EventDispatcher } from '../utils/EventDispatcher';

export const useProgressionStore = create<ProgressionState>((set, get) => ({
  currentLevel: 1,
  currentXp: 0,
  totalXp: 0,
  levels: {},
  unlockedAbilities: [],
  unlockedItems: [],
  baseStats: {
    health: 100,
    damage: 10,
    defense: 5,
  },
  modifiedStats: {
    health: 100,
    damage: 10,
    defense: 5,
  },

  addXp: (amount: number) => {
    set((state) => {
      const newTotalXp = state.totalXp + amount;
      const currentLevel = state.levels[state.currentLevel];

      // Check if we should level up
      if (currentLevel && newTotalXp >= currentLevel.requiredXp) {
        EventDispatcher.dispatch("LEVEL_UP", {
          oldLevel: state.currentLevel,
          newLevel: state.currentLevel + 1
        });

        return {
          currentLevel: state.currentLevel + 1,
          totalXp: newTotalXp,
          currentXp: newTotalXp - currentLevel.requiredXp
        };
      }

      return {
        totalXp: newTotalXp,
        currentXp: state.currentXp + amount
      };
    });
  },

  setLevel: (level: number) => {
    if (level < 1) return;

    set((state) => {
      const levelData = state.levels[level];
      if (!levelData) return state;

      // Calculate modified stats based on level
      const modifiedStats = {
        health: state.baseStats.health + (levelData.rewards.stats?.health || 0),
        damage: state.baseStats.damage + (levelData.rewards.stats?.damage || 0),
        defense: state.baseStats.defense + (levelData.rewards.stats?.defense || 0),
      };

      // Unlock new abilities and items
      const newAbilities = [...state.unlockedAbilities];
      const newItems = [...state.unlockedItems];

      if (levelData.rewards.abilities) {
        newAbilities.push(...levelData.rewards.abilities);
      }
      if (levelData.rewards.items) {
        newItems.push(...levelData.rewards.items);
      }

      return {
        currentLevel: level,
        modifiedStats,
        unlockedAbilities: newAbilities,
        unlockedItems: newItems,
      };
    });
  },

  resetProgression: () => {
    set({
      currentLevel: 1,
      currentXp: 0,
      totalXp: 0,
      unlockedAbilities: [],
      unlockedItems: [],
      modifiedStats: { ...get().baseStats },
    });
  },

  getNextLevelXp: () => {
    const state = get();
    const nextLevel = state.levels[state.currentLevel + 1];
    return nextLevel ? nextLevel.requiredXp : null;
  }
}));
