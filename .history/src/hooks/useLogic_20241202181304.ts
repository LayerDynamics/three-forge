// src/hooks/useLogic.ts

import {useCallback} from "react";
import {LogicSystem} from "../systems/LogicSystem/LogicSystem";
import {GameRule,GameEvent,GameState} from "../types/logic.types";
import {EventDispatcher} from "../utils/EventDispatcher";
import {useLogicStore} from "../stores/logicStore";

/**
 * Hook: useLogic
 * Provides an interface to interact with the LogicSystem.
 */
export const useLogic=() => {
	const {setGameState,updateScore,updateLives}=useLogicStore();

	/**
	 * Add a game rule.
	 * @param rule The game rule to add.
	 */
	const addRule=useCallback(
		(rule: GameRule) => {
			LogicSystem.addRule(rule);
		},
		[]
	);

	/**
	 * Remove a game rule by ID.
	 * @param id The ID of the rule to remove.
	 */
	const removeRule=useCallback(
		(id: string) => {
			LogicSystem.removeRule(id);
		},
		[]
	);

	/**
	 * Change the current game state.
	 * @param newState The new game state.
	 */
	const changeGameState=useCallback(
		(newState: GameState) => {
			LogicSystem.changeGameState(newState);
		},
		[]
	);

	/**
	 * Dispatch a game event.
	 * @param event The game event to dispatch.
	 */
	const dispatchEvent=useCallback(
		(event: GameEvent) => {
			EventDispatcher.dispatch("GAME_EVENT",event);
		},
		[]
	);

	/**
	 * Function to handle specific game logic actions.
	 * Can be expanded as needed.
	 */

	return {
		addRule,
		removeRule,
		changeGameState,
		dispatchEvent,
		setGameState, // Expose directly if needed
		updateScore,
		updateLives,
		// Add more helper functions as needed
	};
};
