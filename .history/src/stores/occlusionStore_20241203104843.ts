// src/stores/occlusionStore.ts

import {create} from 'zustand';
import {OcclusionState,OccluderObject} from '../types/occlusion.types';

/**
 * Zustand store for managing occluders within the application.
 */
export const useOcclusionStore=create<OcclusionState>((set,get) => ({
	occluders: {},

	/**
	 * Adds a new occluder to the store.
	 * @param object - The OccluderObject to add.
	 */
	addOccluder: (object: OccluderObject): void => set((state) => ({
		occluders: {...state.occluders,[object.id]: object},
	})),

	/**
	 * Removes an existing occluder from the store by its ID.
	 * @param id - The unique identifier of the occluder to remove.
	 */
	removeOccluder: (id: string): void => set((state) => {
		const {[id]: removed,...rest}=state.occluders;
		return {occluders: rest};
	}),

	/**
	 * Updates the visibility status of a specific occluder.
	 * @param id - The unique identifier of the occluder.
	 * @param visible - The new visibility status.
	 */
	updateVisibility: (id: string,visible: boolean): void => set((state) => ({
		occluders: {
			...state.occluders,
			[id]: {...state.occluders[id],visible},
		},
	})),

	/**
	 * Retrieves the visibility status of a specific occluder.
	 * @param id - The unique identifier of the occluder.
	 * @returns A boolean indicating whether the occluder is visible. Defaults to `true` if not found.
	 */
	getObjectVisibility: (id: string): boolean => {
		const object=get().occluders[id];
		return object? object.visible:true;
	},
}));
