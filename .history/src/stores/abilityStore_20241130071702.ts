// a store for ability data and methods to update the ability data and manage the ability logic for the player and enemies using zustand
// it defines ability data and methods to update the ability data and manage the ability logic and cooldowns for the player and enemies using zustand
// it provides functions for activating abilities, checking cooldowns, and updating the ability state
// it is used to separate the ability logic from the rendering and input handling, weapons and game logic code

// src/stores/abilityStore.ts

import {create} from "zustand";
import {Ability,AbilityState} from "../types/ability.types";

export const useAbilityStore=create<AbilityState>((set,get) => ({
	abilities: {},
	addAbility: (ability: Ability) => {
		set((state) => ({
			abilities: {
				...state.abilities,
				[ability.id]: {
					...ability,
					isAvailable: true,
					lastUsed: 0,
				},
			},
		}));
		if(ability.debug) {
			console.log(`Ability added: ${ability.name}`);
		}
	},
	useAbility: (id: string) => {
		const ability=get().abilities[id];
		if(ability&&ability.isAvailable) {
			ability.activate();
			set((state) => ({
				abilities: {
					...state.abilities,
					[id]: {...ability,lastUsed: Date.now(),isAvailable: false},
				},
			}));
			console.log(`Ability used: ${ability.name}`);
			// Dispatch an event that the ability was used
			EventDispatcher.dispatch("ABILITY_USED",{abilityId: id});
		} else {
			console.warn(`Ability ${id} is not available.`);
		}
	},
	updateCooldowns: (currentTime: number) => {
		const updatedAbilities: Record<string,Ability>={};
		Object.values(get().abilities).forEach((ability) => {
			if(!ability.isAvailable) {
				const elapsed=(currentTime-ability.lastUsed)/1000; // Convert ms to seconds
				if(elapsed>=ability.cooldown) {
					updatedAbilities[ability.id]={...ability,isAvailable: true};
					console.log(`Ability ready: ${ability.name}`);
					// Optionally, dispatch an event that the ability is ready
					EventDispatcher.dispatch("ABILITY_READY",{abilityId: ability.id});
				} else {
					updatedAbilities[ability.id]=ability;
				}
			}
		});
		set((state) => ({
			abilities: {...state.abilities,...updatedAbilities},
		}));
	},
	getAbilityById: (id: string) => get().abilities[id],
}));

