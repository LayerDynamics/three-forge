// src/stores/logicStore.ts

import {create} from "zustand";
import {LogicState,GameState,GameEvent,LogicComponent} from "../types/logic.types";

export const useLogicStore=create<LogicState>((set,get) => ({
	gameState: "menu",
	eventsQueue: [],
	logicComponents: {},

	setGameState: (state: GameState) => {
		set({gameState: state});
		console.log(`Game state changed to: ${state}`);
	},

	enqueueEvent: (event: GameEvent) => {
		set((state) => ({
			eventsQueue: [...state.eventsQueue,event],
		}));
		console.log(`Event enqueued: ${event.type}`);
	},

	dequeueEvent: () => {
		const currentQueue=get().eventsQueue;
		if(currentQueue.length===0) return undefined;
		const [nextEvent,...remainingEvents]=currentQueue;
		set({eventsQueue: remainingEvents});
		console.log(`Event dequeued: ${nextEvent.type}`);
		return nextEvent;
	},

	registerLogicComponent: (component: LogicComponent) => {
		set((state) => ({
			logicComponents: {
				...state.logicComponents,
				[component.id]: component,
			},
		}));
		console.log(`Logic component registered: ${component.id}`);
	},

	unregisterLogicComponent: (id: string) => {
		set((state) => {
			const {[id]: removedComponent,...remainingComponents}=state.logicComponents;
			return {logicComponents: remainingComponents};
		});
		console.log(`Logic component unregistered: ${id}`);
	},
}));
