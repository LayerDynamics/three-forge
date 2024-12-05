// src/hooks/useProgression.ts

import { useCallback } from 'react';
import { ProgressionSystem } from '../systems/ProgressionSystem/ProgressionSystem';
import { useProgressionStore } from '../stores/progressionStore';

export const useProgression = () => {
  const system = ProgressionSystem.getInstance();

  const {
    currentLevel,
    currentXp,
    totalXp,
    unlockedAbilities,
    unlockedItems,
    modifiedStats
  } = useProgressionStore();

  const addXp = useCallback((amount: number) => {
    system.addXp(amount);
  }, [system]);

  const getProgressToNextLevel = useCallback(() => {
    const nextLevelXp = useProgressionStore.getState().getNextLevelXp();
    if (!nextLevelXp) return 1; // Max level

    return currentXp / nextLevelXp;
  }, [currentXp]);

  return {
    currentLevel,
    currentXp,
    totalXp,
    unlockedAbilities,
    unlockedItems,
    modifiedStats,
    addXp,
    getProgressToNextLevel,
    getModifiedStats: system.getModifiedStats.bind(system),
    reset: system.reset.bind(system)
  };
};
