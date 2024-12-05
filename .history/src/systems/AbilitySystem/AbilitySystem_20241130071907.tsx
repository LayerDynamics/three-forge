// will keep track of all the abilities that the player has and their cooldowns and other ability related logic in the game.
// It will provide functions for activating abilities, checking cooldowns, and updating the ability state.
// It will be used to separate the ability logic from the rendering and input handling, weapons and game logic code.
// src/systems/AbilitySystem/AbilitySystem.tsx

// src/systems/AbilitySystem/AbilitySystem.ts

import { Ability, AbilityConfig } from "../../types/ability.types";
import { useAbilityStore } from "../../stores/abilityStore";
import { EventDispatcher } from "../../utils/EventDispatcher";

// Singleton Class
export class AbilitySystem {
  private static instance: AbilitySystem | null = null;

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  // Initialize with optional configuration
  public initialize(config: AbilityConfig = {}): void {
    const { initialAbilities = [], debug = false } = config;

    if (initialAbilities.length > 0) {
      initialAbilities.forEach((ability) => {
        this.addAbility(ability);
      });
    }

    if (debug) {
      console.log("AbilitySystem initialized with config:", config);
    }

    // Subscribe to global events if necessary
    EventDispatcher.on("RESET_GAME", () => this.reset());
  }

  // Get the singleton instance
  public static getInstance(): AbilitySystem {
    if (!AbilitySystem.instance) {
      AbilitySystem.instance = new AbilitySystem();
    }
    return AbilitySystem.instance;
  }

  // Public API Methods
  public addAbility(ability: Ability): void {
    useAbilityStore.getState().addAbility(ability);
  }

  public useAbility(id: string): void {
    useAbilityStore.getState().useAbility(id);
  }

  public update(currentTime: number): void {
    useAbilityStore.getState().updateCooldowns(currentTime);
  }

  public getAbility(id: string): Ability | undefined {
    return useAbilityStore.getState().getAbilityById(id);
  }

  public reset(): void {
    // Implement reset logic if necessary
    console.log("AbilitySystem reset.");
  }

	public serializeState(): AbilityState {
		return useAbilityStore.getState();
	}

	public deserializeState(state: AbilityState): void {
		useAbilityStore.setState(state);
	}

}

// Configuration for the AbilitySystem (can be customized)
const config: AbilityConfig = {
  initialAbilities: [], // Define any initial abilities here
  debug: true, // Enable debug logs
};

// Initialize the AbilitySystem (typically done in a central initialization file)
AbilitySystem.getInstance().initialize(config);
