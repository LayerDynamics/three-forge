// src/hooks/useLogic.ts

import {useEffect} from "react";
import {LogicEngine} from "../systems/LogicEngine/LogicEngine";
import {GameEvent,LogicComponent} from "../types/logic.types";
import {EventDispatcher} from "../utils/EventDispatcher";

/**
 * Hook: useLogic
 * Provides an interface to interact with the LogicEngine.
 */
export const useLogic=() => {
	// Start the LogicEngine when the hook is used
	useEffect(() => {
		LogicEngine.start();

		// Cleanup: Stop the LogicEngine when the component unmounts
		return () => {
			LogicEngine.stop();
		};
	},[]);

	/**
	 * Enqueues a new game event.
	 * @param event The game event to enqueue.
	 */
	const enqueueEvent=(event: GameEvent) => {
		// Dispatch the event to be handled by the LogicEngine
		EventDispatcher.dispatch("NEW_GAME_EVENT",event);
		// Add the event to the LogicStore's queue
		// Assuming that AssetLoadingSystem and other systems are subscribing to events
		// Alternatively, directly enqueue the event in the store
		// Here, we'll enqueue directly
		import("../stores/logicStore").then(({useLogicStore}) => {
			useLogicStore.getState().enqueueEvent(event);
		});
	};

	/**
	 * Registers a new logic component.
	 * @param component The logic component to register.
	 */
	const registerLogicComponent=(component: LogicComponent) => {
		LogicEngine.registerLogicComponent(component);
	};

	/**
	 * Unregisters a logic component by ID.
	 * @param id The ID of the logic component to unregister.
	 */
	const unregisterLogicComponent=(id: string) => {
		LogicEngine.unregisterLogicComponent(id);
	};

	return {
		enqueueEvent,
		registerLogicComponent,
		unregisterLogicComponent,
		gameState: useLogicStore((state) => state.gameState),
		eventsQueue: useLogicStore((state) => state.eventsQueue),
		logicComponents: useLogicStore((state) => state.logicComponents),
	};
};
