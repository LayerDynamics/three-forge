// a store for ability data and methods to update the ability data and manage the ability logic for the player and enemies using zustand
// it defines ability data and methods to update the ability data and manage the ability logic and cooldowns for the player and enemies using zustand
// it provides functions for activating abilities, checking cooldowns, and updating the ability state
// it is used to separate the ability logic from the rendering and input handling, weapons and game logic code

// src/stores/abilityStore.ts

import {create} from "zustand";
import {Ability,AbilityState} from "../types/ability.types";
import {EventDispatcher} from "../utils/EventDispatcher";

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
		// Add explicit check for ability existence and availability
		if(!ability) {
			console.warn(`Ability ${id} not found.`);
			return;
		}

		// Check if ability is available before activating
		if(!ability.isAvailable) {
			console.warn(`Ability ${id} is on cooldown.`);
			return;
		}

		// Only activate and update state if ability is available
		ability.activate();
		set((state) => ({
			abilities: {
				...state.abilities,
				[id]: {...ability,lastUsed: Date.now(),isAvailable: false},
			},
		}));
		console.log(`Ability used: ${ability.name}`);
		EventDispatcher.dispatch("ABILITY_USED",{abilityId: id});
	},

	updateCooldowns: (currentTime: number) => {
		const updatedAbilities: Record<string,Ability>={};
		Object.values(get().abilities).forEach((ability) => {
			if(!ability.isAvailable) {
				const elapsed=(currentTime-ability.lastUsed)/1000;
				if(elapsed>=ability.cooldown) {
					updatedAbilities[ability.id]={...ability,isAvailable: true};
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
