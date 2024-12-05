// src/stores/aiStore.ts

import {create} from 'zustand';
import {AIState,AIEntity,AIBehavior,AIModifier} from '../types/ai.types';

export const useAIStore=create<AIState>((set,get) => ({
	entities: {},
	behaviorTree: {},
	modifiers: {},
	pathfindingEnabled: true,

	addEntity: (entity: AIEntity) => set((state) => ({
		entities: {...state.entities,[entity.id]: entity}
	})),

	updateEntity: (id: string,updates: Partial<AIEntity>) => set((state) => ({
		entities: {
			...state.entities,
			[id]: {...state.entities[id],...updates}
		}
	})),

	removeEntity: (id: string) => set((state) => {
		const {[id]: removed,...remaining}=state.entities;
		return {entities: remaining};
	}),

	addBehavior: (behavior: AIBehavior) => set((state) => ({
		behaviorTree: {...state.behaviorTree,[behavior.type]: behavior}
	})),

	addModifier: (modifier: AIModifier) => set((state) => ({
		modifiers: {...state.modifiers,[modifier.type]: modifier}
	})),

	togglePathfinding: () => set((state) => ({
		pathfindingEnabled: !state.pathfindingEnabled
	}))
}));
