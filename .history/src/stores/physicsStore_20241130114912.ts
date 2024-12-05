// src/stores/physicsStore.ts

import {create} from "zustand";
import {PhysicsBody,PhysicsState} from "../types/physics.types";

export const usePhysicsStore=create<PhysicsState>((set) => ({
	bodies: {},
	addBody: (body: PhysicsBody) => {
		set((state) => ({
			bodies: {
				...state.bodies,
				[body.id]: body,
			},
		}));
		console.log(`Physics body added: ${body.id}`);
	},
	removeBody: (id: string) => {
		set((state) => {
			const {[id]: removedBody,...remainingBodies}=state.bodies;
			return {bodies: remainingBodies};
		});
		console.log(`Physics body removed: ${id}`);
	},
	updateBody: (id: string,updatedBody: Partial<PhysicsBody>) => {
		set((state) => ({
			bodies: {
				...state.bodies,
				[id]: {
					...state.bodies[id],
					...updatedBody,
				},
			},
		}));
		console.log(`Physics body updated: ${id}`);
	},
}));
