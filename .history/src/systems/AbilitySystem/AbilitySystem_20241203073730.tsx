// will keep track of all the abilities that the player has and their cooldowns and other ability related logic in the game.
// It will provide functions for activating abilities, checking cooldowns, and updating the ability state.
// It will be used to separate the ability logic from the rendering and input handling, weapons and game logic code.
// src/systems/AbilitySystem/AbilitySystem.tsx

// src/systems/AbilitySystem/AbilitySystem.ts

import { Ability, AbilityConfig, AbilityState } from "../../types/ability.types";
import { useAbilityStore } from "../../stores/abilityStore";
import { EventDispatcher } from "../../utils/EventDispatcher";

/**
 * Singleton Class: AbilitySystemClass
 * Manages all player abilities, their cooldowns, and related logic.
 */
export class AbilitySystemClass {
  private static instance: AbilitySystemClass | null = null;

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  /**
   * Retrieves the singleton instance of AbilitySystemClass.
   * @returns The singleton instance.
   */
  public static getInstance(): AbilitySystemClass {
    if (!AbilitySystemClass.instance) {
      AbilitySystemClass.instance = new AbilitySystemClass();
    }
    return AbilitySystemClass.instance;
  }

  /**
   * Initializes the AbilitySystem with optional configuration.
   * @param config Configuration object for initializing the system.
   */
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

  // Public API Methods

  /**
   * Adds a new ability to the system.
   * @param ability The ability to add.
   */
  public addAbility(ability: Ability): void {
    useAbilityStore.getState().addAbility(ability);
  }

  /**
   * Uses an ability by its ID.
   * @param id The ID of the ability to use.
   */
  public useAbility(id: string): void {
    const ability = this.getAbility(id);
    if (!ability) {
      console.warn(`Ability "${id}" not found.`);
      return;
    }

    // Do cooldown check before attempting to use ability
    if (!ability.isAvailable) {
      console.warn(`Ability "${id}" is on cooldown.`);
      return;
    }

    useAbilityStore.getState().useAbility(id);
  }

  /**
   * Updates the cooldowns of all abilities based on the current time.
   * @param currentTime The current time in milliseconds.
   */
  public update(currentTime: number): void {
    useAbilityStore.getState().updateCooldowns(currentTime);
  }

  /**
   * Retrieves an ability by its ID.
   * @param id The ID of the ability to retrieve.
   * @returns The ability if found, otherwise undefined.
   */
  public getAbility(id: string): Ability | undefined {
    return useAbilityStore.getState().getAbilityById(id);
  }

  /**
   * Resets the AbilitySystem to its initial state.
   */
  public reset(): void {
    // Implement reset logic if necessary
    console.log("AbilitySystem reset.");
    useAbilityStore.getState().resetAbilities();
  }

  /**
   * Serializes the current state of the AbilitySystem.
   * @returns The serialized state.
   */
  public serializeState(): AbilityState {
    return useAbilityStore.getState().serialize();
  }

  /**
   * Deserializes and sets the state of the AbilitySystem.
   * @param state The state to deserialize.
   */
  public deserializeState(state: AbilityState): void {
    useAbilityStore.getState().deserialize(state);
  }
}

// Export the singleton instance
export const AbilitySystem = AbilitySystemClass.getInstance();

// Configuration for the AbilitySystem (can be customized)
const config: AbilityConfig = {
  initialAbilities: [], // Define any initial abilities here
  debug: true, // Enable debug logs
};

// Initialize the AbilitySystem (typically done in a central initialization file)
AbilitySystem.initialize(config);
