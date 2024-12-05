// src/stores/logicStore.ts

import { create } from "zustand";
import { LogicState, GameState, GameEvent, LogicComponent } from "../types/logic.types";

/**
 * Zustand store for managing game logic.
 */
export const useLogicStore = create<LogicState>((set) => ({
  gameState: "menu",
  eventsQueue: [],
  logicComponents: {},

  setGameState: (state: GameState) => set({ gameState: state }),

  enqueueEvent: (event: GameEvent) =>
    set((state) => ({ eventsQueue: [...state.eventsQueue, event] })),

  dequeueEvent: () =>
    set((state) => {
      const [nextEvent, ...remaining] = state.eventsQueue;
      return { eventsQueue: remaining };
    }),

  registerLogicComponent: (component: LogicComponent) =>
    set((state) => ({
      logicComponents: { ...state.logicComponents, [component.id]: component },
    })),

  unregisterLogicComponent: (id: string) =>
    set((state) => {
      const { [id]: _, ...remaining } = state.logicComponents;
      return { logicComponents: remaining };
    }),
}));