stores/xpStore.ts
Purpose: Tracks the player's XP, current level, and level-up thresholds.
State Structure:
{
	currentXp: number;         // Current accumulated XP
	level: number;             // Player's current level
	xpThreshold: number;       // XP required for next level
	addXp: (xp: number) => void;  // Function to add XP
	levelUp: () => void;       // Function to handle level-ups
}
Depends On:
Zustand for state management.
Interacts With:
XpSystem for calculations and updates.
gameStateStore for syncing overall game progression.
Example Initialization:

import create from 'zustand';

export const xpStore=create((set) => ({
	currentXp: 0,
	level: 1,
	xpThreshold: 100,
	addXp: (xp) => set((state) => ({
		currentXp: state.currentXp+xp,
	})),
	levelUp: () => set((state) => ({
		level: state.level+1,
		currentXp: 0,
		xpThreshold: state.xpThreshold+100, // Increase XP required for next level
	})),
}));
