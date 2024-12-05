// src/stores/memoryStore.ts

import {create} from 'zustand';
import {MemoryState,MemoryStats,MemoryObject} from '../types/memory.types';
import {MemorySystemInstance} from '../systems/MemorySystem/MemorySystem';

export const useMemoryStore=create<MemoryState>((set,get) => ({
	objects: {},
	totalMemory: 0,
	maxMemory: 1024*1024*1024, // Example: 1GB
	lastCleanup: Date.now(),
	stats: {
		totalMemory: 0,
		maxMemory: 1024*1024*1024, // 1GB
		objectCount: {
			model: 0,
			texture: 0,
			sound: 0,
			video: 0,
			other: 0,
			geometry: 0,
			audio: 0,
			material: 0,
			animation: 0,
			physics: 0,
		},
		largestObjects: []
	},

	addObject: (object: MemoryObject) => set((state) => {
		const newObjects={...state.objects,[object.id]: object};
		const newTotalMemory=state.totalMemory+object.size;
		const newStats=MemorySystemInstance.calculateStats(Object.values(newObjects));

		return {
			objects: newObjects,
			totalMemory: newTotalMemory,
			stats: newStats
		};
	}),

	removeObject: (id: string) => set((state) => {
		const object=state.objects[id];
		if(!object) return state;

		const {[id]: removed,...remainingObjects}=state.objects;
		const newTotalMemory=state.totalMemory-object.size;
		const newStats=MemorySystemInstance.calculateStats(Object.values(remainingObjects));

		object.dispose();

		return {
			objects: remainingObjects,
			totalMemory: newTotalMemory,
			stats: newStats
		};
	}),

	updateUsage: (id: string) => set((state) => ({
		objects: {
			...state.objects,
			[id]: {
				...state.objects[id],
				lastUsed: Date.now()
			}
		}
	})),

	addReference: (id: string,refId: string) => set((state) => {
		const object=state.objects[id];
		if(!object) return state;

		object.refs.add(refId);
		return {
			objects: {
				...state.objects,
				[id]: object
			}
		};
	}),

	removeReference: (id: string,refId: string) => set((state) => {
		const object=state.objects[id];
		if(!object) return state;

		object.refs.delete(refId);
		return {
			objects: {
				...state.objects,
				[id]: object
			}
		};
	}),

	getStats: () => get().stats
}));