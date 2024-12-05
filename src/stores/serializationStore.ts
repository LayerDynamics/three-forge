// src/stores/serializationStore.ts

import {create} from 'zustand';
import {SerializationState} from '../types/serialization.types';

export const useSerializationStore=create<SerializationState>((set) => ({
	lastSave: 0,
	autoSaveEnabled: true,
	saveSlots: {},
	pending: false,
	error: null,

	setLastSave: (timestamp) => set({lastSave: timestamp}),

	setSaveSlot: (slot,data) => set((state) => ({
		saveSlots: {...state.saveSlots,[slot]: data}
	})),

	removeSaveSlot: (slot) => set((state) => {
		const {[slot]: removed,...remaining}=state.saveSlots;
		return {saveSlots: remaining};
	}),

	setAutoSave: (enabled) => set({autoSaveEnabled: enabled}),

	setPending: (pending) => set({pending}),

	setError: (error) => set({error}),

	reset: () => set({
		lastSave: 0,
		autoSaveEnabled: true,
		saveSlots: {},
		pending: false,
		error: null
	})
}));