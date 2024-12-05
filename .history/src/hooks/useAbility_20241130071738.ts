// useAbility: a custom hook that handles the logic for using abilities and their cooldowns.
// It provides functions for activating abilities,checking cooldowns,and updating the ability state.
// It is used to separate the ability logic from the rendering and input handling code.
// useAbility.ts

// Purpose: Exposes functions for activating abilities and checking cooldowns.
// Depends On: AbilitySystem.
// Interacts With: AbilitySystem,playerStore.
// src/hooks/useAbility.ts

import {useEffect,useCallback} from "react";
import {AbilitySystem} from "../systems/AbilitySystem/AbilitySystem";
import {useAbilityStore} from "../stores/abilityStore";
import {Ability} from "../types/ability.types";

/**
 * Hook: useAbility
 * Provides an interface to interact with the AbilitySystem.
 */
export const useAbility=() => {
	// Access the singleton instance of the AbilitySystem
	const system=AbilitySystem.getInstance();

	// Access Zustand store state selectively
	const abilities=useAbilityStore((state) => state.abilities);

	// Wrap system methods with React-friendly callbacks
	const addAbility=useCallback(
		(ability: Ability) => {
			system.addAbility(ability);
		},
		[system]
	);

	const useAbilityById=useCallback(
		(id: string) => {
			system.useAbility(id);
		},
		[system]
	);

	// Update cooldowns every frame using requestAnimationFrame
	useEffect(() => {
		let animationFrameId: number;

		const update=() => {
			system.update(Date.now());
			animationFrameId=requestAnimationFrame(update);
		};

		update();

		return () => {
			cancelAnimationFrame(animationFrameId);
		};
	},[system]);

	// Optionally, subscribe to events
	useEffect(() => {
		const handleAbilityUsed=(data: any) => {
			console.log("Ability used event received:",data);
			// Handle event (e.g., trigger UI updates)
		};

		const handleAbilityReady=(data: any) => {
			console.log("Ability ready event received:",data);
			// Handle event (e.g., update UI to show ability is ready)
		};

		EventDispatcher.on("ABILITY_USED",handleAbilityUsed);
		EventDispatcher.on("ABILITY_READY",handleAbilityReady);

		return () => {
			EventDispatcher.off("ABILITY_USED",handleAbilityUsed);
			EventDispatcher.off("ABILITY_READY",handleAbilityReady);
		};
	},[]);

	// Return the API and state
	return {
		abilities, // All abilities
		addAbility,
		useAbility: useAbilityById,
		getAbility: (id: string) => system.getAbility(id),
	};
};
