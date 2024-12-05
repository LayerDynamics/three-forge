// src/stores/inputStore.ts

import { create } from 'zustand';
import {
  InputState,
  InputAction,
  InputBinding,
  InputDevice
} from '../types/input.types';

const DEFAULT_BINDINGS: Record<string, InputBinding> = {
  moveForward: {
    device: 'keyboard',
    action: 'move',
    keys: ['w', 'ArrowUp']
  },
  moveBack: {
    device: 'keyboard',
    action: 'move',
    keys: ['s', 'ArrowDown']
  },
  jump: {
    device: 'keyboard',
    action: 'jump',
    keys: ['Space']
  },
  run: {
    device: 'keyboard',
    action: 'run',
    keys: ['Shift']
  }
};

export const useInputStore = create<InputState>((set, get) => ({
  activeActions: new Set<InputAction>(),
  axisValues: {},
  bindings: DEFAULT_BINDINGS,
  currentDevice: 'keyboard',
  isConnected: true,
  inputHistory: [],

  setActiveAction: (action: InputAction, active: boolean) => set(state => {
    const newActions = new Set(state.activeActions);
    if (active) {
      newActions.add(action);
    } else {
      newActions.delete(action);
    }
    const newHistory = active ? [...state.inputHistory, action] : state.inputHistory;
    return {
      activeActions: newActions,
      inputHistory: newHistory
    };
  }),

  setAxisValue: (axis: string, value: number) => set(state => ({
    axisValues: { ...state.axisValues, [axis]: value }
  })),

  updateBinding: (binding: InputBinding) => set(state => ({
    bindings: { ...state.bindings, [binding.action]: binding }
  })),

  setCurrentDevice: (device: InputDevice) => set({ currentDevice: device }),

  setConnectionState: (connected: boolean) => set({ isConnected: connected }),

  reset: () => set({
    activeActions: new Set<InputAction>(),
    axisValues: {},
    bindings: DEFAULT_BINDINGS,
    currentDevice: 'keyboard',
    isConnected: true,
    inputHistory: []
  })
}));
