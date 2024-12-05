// src/systems/ProgressionSystem/ProgressionSystem.test.ts

import { ProgressionSystem } from './ProgressionSystem';
import { useProgressionStore } from '../../stores/progressionStore';
import { EventDispatcher } from '../../utils/EventDispatcher';

describe('ProgressionSystem', () => {
  let progressionSystem: ProgressionSystem;

  const mockLevels = {
    1: {
      level: 1,
      requiredXp: 100,
      rewards: {
        abilities: ['ability1'],
        stats: {
          health: 10,
          damage: 5,
          defense: 2
        }
      }
    },
    2: {
      level: 2,
      requiredXp: 250,
      rewards: {
        items: ['item1'],
        stats: {
          health: 15,
          damage: 7,
          defense: 3
        }
      }
    }
  };

  beforeEach(() => {
    // Reset the singleton instance
    (ProgressionSystem as any).instance = null;
    progressionSystem = ProgressionSystem.getInstance();

    // Reset the store
    useProgressionStore.setState({
      currentLevel: 1,
      currentXp: 0,
      totalXp: 0,
      unlockedAbilities: [],
      unlockedItems: [],
      levels: mockLevels,
      baseStats: {
        health: 100,
        damage: 10,
        defense: 5
      },
      modifiedStats: {
        health: 100,
        damage: 10,
        defense: 5
      }
    });
  });

  afterEach(() => {
    progressionSystem.cleanup();
    jest.clearAllMocks();
  });

  it('should initialize with provided levels', () => {
    progressionSystem.initialize(mockLevels);
    expect(useProgressionStore.getState().levels).toEqual(mockLevels);
  });

  it('should add XP and level up when threshold is reached', () => {
    const eventDispatchSpy = jest.spyOn(EventDispatcher, 'dispatch');

    progressionSystem.addXp(100);

    const state = useProgressionStore.getState();
    expect(state.currentLevel).toBe(2);
    expect(state.totalXp).toBe(100);
    expect(eventDispatchSpy).toHaveBeenCalledWith("LEVEL_UP", {
      oldLevel: 1,
      newLevel: 2
    });
  });

  it('should update stats on level up', () => {
    progressionSystem.addXp(100);

    const state = useProgressionStore.getState();
    expect(state.modifiedStats).toEqual({
      health: 115, // Base 100 + Level 2 bonus 15
      damage: 17,  // Base 10 + Level 2 bonus 7
      defense: 8   // Base 5 + Level 2 bonus 3
    });
  });

  it('should unlock abilities and items on level up', () => {
    progressionSystem.addXp(100);

    const state = useProgressionStore.getState();
    expect(state.unlockedAbilities).toContain('ability1');
    expect(state.unlockedItems).toContain('item1');
  });

  it('should reset progression correctly', () => {
    progressionSystem.addXp(100);
    progressionSystem.reset();

    const state = useProgressionStore.getState();
    expect(state.currentLevel).toBe(1);
    expect(state.currentXp).toBe(0);
    expect(state.totalXp).toBe(0);
    expect(state.unlockedAbilities).toHaveLength(0);
    expect(state.unlockedItems).toHaveLength(0);
  });

  it('should not level up when XP is insufficient', () => {
    progressionSystem.addXp(50);

    const state = useProgressionStore.getState();
    expect(state.currentLevel).toBe(1);
    expect(state.currentXp).toBe(50);
    expect(state.totalXp).toBe(50);
  });

  it('should calculate progress to next level correctly', () => {
    const { getProgressToNextLevel } = useProgressionStore.getState();

    progressionSystem.addXp(50);
    expect(getProgressToNextLevel()).toBe(0.5); // 50/100

    progressionSystem.addXp(50); // Level up
    expect(getProgressToNextLevel()).toBe(0); // 0/250 for level 2
  });
});
