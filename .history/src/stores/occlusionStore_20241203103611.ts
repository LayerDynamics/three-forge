// src/stores/occlusionStore.ts

import {create} from 'zustand';
import {OcclusionState} from '../types/occlusion.types';

export const useOcclusionStore=create<OcclusionState>((set,get) => ({
	occluders: {},

	addOccluder: (object) => set((state) => ({
		occluders: {...state.occluders,[object.id]: object}
	})),

	removeOccluder: (id) => set((state) => {
		const {[id]: removed,...rest}=state.occluders;
		return {occluders: rest};
	}),

	updateVisibility: (id,visible) => set((state) => ({
		occluders: {
			...state.occluders,
			[id]: {...state.occluders[id],visible}
		}
	})),

	getObjectVisibility: (id) => {
		const object=get().occluders[id];
		return object? object.visible:true;
	}
}));
