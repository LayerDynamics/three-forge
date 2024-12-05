// src/stores/logicStore.ts

import {create,SetState,GetState} from 'zustand';
import {LogicState, GameEvent, LogicComponent, GameState} from '../types/logic.types';

export const useLogicStore=create<LogicState>((set: SetState<LogicState>,get: GetState<LogicState>) => ({
	gameState: 'menu',
	eventsQueue: [],
	logicComponents: {},
	setGameState: (state: GameState) => set({gameState: state}),
	enqueueEvent: (event: GameEvent) => set({eventsQueue: [...get().eventsQueue,event]}),
	dequeueEvent: () => {
		const queue=get().eventsQueue;
		const event=queue.shift();
		set({eventsQueue: queue});
		return event;
	},
	registerLogicComponent: (component: LogicComponent) =>
		set({logicComponents: {...get().logicComponents,[component.id]: component}}),
	unregisterLogicComponent: (id: string) => {
		const {[id]: _,...rest}=get().logicComponents;
		set({logicComponents: rest});
	},
}));
