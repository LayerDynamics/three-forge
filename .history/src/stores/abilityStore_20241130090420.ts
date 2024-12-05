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
					isAvailable: ability.isAvailable??true,
					lastUsed: ability.lastUsed??0,
				},
			},
		}));
		if(ability.debug) {
			console.log(`Ability added: ${ability.name}`);
		}
	},

	useAbility: (id: string) => {
		const ability=get().abilities[id];

		if(!ability) {
			console.warn(`Ability ${id} not found.`);
			return;
		}

		const currentTime=Date.now();
		const elapsedTime=(currentTime-ability.lastUsed)/1000;
		const isOnCooldown=!ability.isAvailable&&elapsedTime<ability.cooldown;

		if(isOnCooldown) {
			console.warn(`Ability ${id} is on cooldown. ${Math.ceil(ability.cooldown-elapsedTime)}s remaining.`);
			return;
		}

		try {
			ability.activate();
			set((state) => ({
				abilities: {
					...state.abilities,
					[id]: {
						...ability,
						lastUsed: currentTime,
						isAvailable: false,
					},
				},
			}));
			console.log(`Ability used: ${ability.name}`);
			EventDispatcher.dispatch("ABILITY_USED",{
				abilityId: id,
				timestamp: currentTime
			});
		} catch(error) {
			console.error(`Error activating ability ${id}:`,error);
		}
	},

	updateCooldowns: (currentTime: number) => {
		const updatedAbilities: Record<string,Ability>={};
		let hasUpdates=false;

		Object.values(get().abilities).forEach((ability) => {
			if(!ability.isAvailable) {
				const elapsedTime=(currentTime-ability.lastUsed)/1000;
				if(elapsedTime>=ability.cooldown) {
					updatedAbilities[ability.id]={
						...ability,
						isAvailable: true
					};
					hasUpdates=true;
					EventDispatcher.dispatch("ABILITY_READY",{
						abilityId: ability.id,
						timestamp: currentTime
					});
				} else {
					updatedAbilities[ability.id]=ability;
				}
			}
		});

		if(hasUpdates) {
			set((state) => ({
				abilities: {
					...state.abilities,
					...updatedAbilities
				},
			}));
		}
	},

	getAbilityById: (id: string) => get().abilities[id],

	getRemainingCooldown: (id: string): number => {
		const ability=get().abilities[id];
		if(!ability||ability.isAvailable) return 0;

		const elapsedTime=(Date.now()-ability.lastUsed)/1000;
		return Math.max(0,ability.cooldown-elapsedTime);
	}
}));
