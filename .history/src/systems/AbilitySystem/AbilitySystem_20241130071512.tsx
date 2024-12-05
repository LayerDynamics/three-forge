// will keep track of all the abilities that the player has and their cooldowns and other ability related logic in the game.
// It will provide functions for activating abilities, checking cooldowns, and updating the ability state.
// It will be used to separate the ability logic from the rendering and input handling, weapons and game logic code.
// src/systems/AbilitySystem/AbilitySystem.tsx

import { create } from "zustand";
import { Ability, AbilityState, AbilityConfig } from "../../types/ability.types";
import { EventDispatcher } from "../../utils/EventDispatcher";

// Singleton Class
export class AbilitySystem {
  private static instance: AbilitySystem | null = null;

  // Zustand store for AbilityState
  public store = create<AbilityState>((set, get) => ({
    abilities: {},
    addAbility: (ability: Ability) => {
      set((state) => ({
        abilities: { ...state.abilities, [ability.id]: { ...ability, isAvailable: true, lastUsed: 0 } },
      }));
      if (config.debug) {
        console.log(`Ability added: ${ability.name}`);
      }
    },
    useAbility: (id: string) => {
      const ability = get().abilities[id];
      if (ability && ability.isAvailable) {
        ability.activate();
        set((state) => ({
          abilities: {
            ...state.abilities,
            [id]: { ...ability, lastUsed: Date.now(), isAvailable: false },
          },
        }));
        if (config.debug) {
          console.log(`Ability used: ${ability.name}`);
        }
        // Dispatch an event that the ability was used
        EventDispatcher.dispatch("ABILITY_USED", { abilityId: id });
      } else {
        if (config.debug) {
          console.warn(`Ability ${id} is not available.`);
        }
      }
    },
    updateCooldowns: (currentTime: number) => {
      const updatedAbilities: Record<string, Ability> = {};
      Object.values(get().abilities).forEach((ability) => {
        if (!ability.isAvailable) {
          const elapsed = (currentTime - ability.lastUsed) / 1000; // Convert ms to seconds
          if (elapsed >= ability.cooldown) {
            updatedAbilities[ability.id] = { ...ability, isAvailable: true };
            if (config.debug) {
              console.log(`Ability ready: ${ability.name}`);
            }
            // Optionally, dispatch an event that the ability is ready
            EventDispatcher.dispatch("ABILITY_READY", { abilityId: ability.id });
          } else {
            updatedAbilities[ability.id] = ability;
          }
        }
      });
      set((state) => ({
        abilities: { ...state.abilities, ...updatedAbilities },
      }));
    },
    getAbilityById: (id: string) => get().abilities[id],
  }));

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  // Initialize with optional configuration
  public initialize(config: AbilityConfig = {}): void {
    if (this.store.getState().abilities && Object.keys(this.store.getState().abilities).length > 0) {
      console.warn("AbilitySystem is already initialized.");
      return;
    }
    if (config.initialAbilities) {
      config.initialAbilities.forEach((ability) => this.store.getState().addAbility(ability));
    }
    if (config.debug) {
      console.log("AbilitySystem initialized with config:", config);
    }
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
    this.store.getState().addAbility(ability);
  }

  public useAbility(id: string): void {
    this.store.getState().useAbility(id);
  }

  public update(currentTime: number): void {
    this.store.getState().updateCooldowns(currentTime);
  }

  public getAbility(id: string): Ability | undefined {
    return this.store.getState().getAbilityById(id);
  }
}

// Configuration for the AbilitySystem
const config: AbilityConfig = {
  debug: true, // Enable debug logs
};

// Initialize the AbilitySystem (can be done in a central initialization file)
AbilitySystem.getInstance().initialize(config);
