// src/types/ability.types.ts

export interface Ability {
	id: string; // Unique identifier for the ability
	name: string; // Display name
	description: string; // Detailed description of the ability
	cooldown: number; // Time in seconds before reuse
	lastUsed: number; // Timestamp of the last activation
	isAvailable: boolean; // True if off cooldown
	activate: () => void; // Function to trigger the ability
	iconPath?: string; // Optional: Path to the ability's icon for UI
	effects?: string[]; // IDs of status effects or additional impacts
	debug?: boolean;
}

export interface AbilityState {
	abilities: Record<string,Ability>; // Map of ability IDs to definitions
	addAbility: (ability: Ability) => void; // Function to register a new ability
	useAbility: (id: string) => void; // Activate an ability by ID
	updateCooldowns: (currentTime: number) => void; // Refresh cooldowns
	getAbilityById: (id: string) => Ability|undefined; // Retrieve ability details
}

export interface AbilityConfig {
	initialAbilities?: Ability[]; // Optional initial abilities to load
	debug?: boolean; // Enable debug mode for logging
}
