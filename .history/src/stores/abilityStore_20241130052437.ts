// a store for ability data and methods to update the ability data and manage the ability logic for the player and enemies using zustand
// It provides functions for activating abilities, checking cooldowns, and updating the ability state.
// It is used to separate the ability logic from the rendering and input handling code.
// It is used to manage the weapon logic for the player and enemies.
// It provides functions for creating, updating, and destroying weapons, as well as handling collision detection.
// It is used to separate the weapon logic from the rendering and input handling code.
import create from "zustand";
import { Ability, AbilityType } from "../types";

interface AbilityStoreState {
  abilities: Ability[];
  addAbility: (ability: Ability) => void;
  removeAbility: (id: string) => void;
  activateAbility: (id: string) => void;
}

const useAbilityStore = create<AbilityStoreState>((set) => ({
  abilities: [],
  addAbility: (ability) =>
    set((state) => ({
      abilities: [...state.abilities, ability],
    })),
  removeAbility: (id) =>
    set((state) => ({
      abilities: state.abilities.filter((ability) => ability.id !== id),
    })),
  activateAbility: (id) =>
    set((state) => ({
      abilities: state.abilities.map((ability) =>
        ability.id === id ? { ...ability, active: true } : ability
      ),
    })),
}));

export default useAbilityStore;
