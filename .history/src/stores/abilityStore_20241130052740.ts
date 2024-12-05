// a store for ability data and methods to update the ability data and manage the ability logic for the player and enemies using zustand
// it defines ability data and methods to update the ability data and manage the ability logic and cooldowns for the player and enemies using zustand
// it provides functions for activating abilities, checking cooldowns, and updating the ability state
// it is used to separate the ability logic from the rendering and input handling, weapons and game logic code

import {create } from 'zustand'

export type Ability = {
  id: string
  name: string
  description: string
  cooldown: number
  range: number
  damage: number
  manaCost: number
  icon: string
}

export type AbilityStore = {
  abilities: Ability[]
  setAbilities: (abilities: Ability[]) => void
  activateAbility: (ability: Ability) => void
  getAbilityById: (id: string) => Ability | undefined
}

export const useAbilityStore = create<AbilityStore>((set) => ({
  abilities: [],
  setAbilities: (abilities) => set({ abilities }),
  activateAbility: (ability) => {
    console.log('Activating ability', ability)
  },
  getAbilityById: (id) => {
    return useAbilityStore.getState().abilities.find((a) => a.id === id)
  },
}))

