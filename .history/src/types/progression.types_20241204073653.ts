// src/types/progression.types.ts
export interface ProgressionLevel {
	level: number;
	requiredXp: number;
	rewards: {
		abilities?: string[];
		stats?: {
			health?: number;
			damage?: number;
			defense?: number;
		};
		items?: string[];
	};
}

export interface ProgressionState {
	currentLevel: number;
	currentXp: number;
	totalXp: number;
	levels: Record<number,ProgressionLevel>;
	unlockedAbilities: string[];
	unlockedItems: string[];
	baseStats: {
		health: number;
		damage: number;
		defense: number;
	};
	modifiedStats: {
		health: number;
		damage: number;
		defense: number;
	};
}
