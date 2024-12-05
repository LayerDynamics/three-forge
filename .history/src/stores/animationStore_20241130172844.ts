// src/stores/animationStore.ts

import {create} from "zustand";
import {AnimationState,AnimationData} from "../types/animation.types";

export const useAnimationStore=create<AnimationState>((set,get) => ({
	animations: {},

	addAnimation: (id: string,animationData: AnimationData) => {
		set((state) => ({
			animations: {
				...state.animations,
				[id]: animationData,
			},
		}));
		if((animationData as any).debug) {
			console.log(`Animation added: ${id}`);
		}
	},

	removeAnimation: (id: string) => {
		set((state) => {
			const {[id]: removedAnimation,...remainingAnimations}=state.animations;
			return {animations: remainingAnimations};
		});
		console.log(`Animation removed: ${id}`);
	},

	playAnimation: (id: string) => {
		const animation=get().animations[id];
		if(animation) {
			animation.action.play();
			set((state) => ({
				animations: {
					...state.animations,
					[id]: {...animation,state: "playing"},
				},
			}));
			console.log(`Animation played: ${id}`);
		} else {
			console.warn(`Animation ${id} not found.`);
		}
	},

	pauseAnimation: (id: string) => {
		const animation=get().animations[id];
		if(animation) {
			animation.action.paused=true;
			set((state) => ({
				animations: {
					...state.animations,
					[id]: {...animation,state: "paused"},
				},
			}));
			console.log(`Animation paused: ${id}`);
		} else {
			console.warn(`Animation ${id} not found.`);
		}
	},

	stopAnimation: (id: string) => {
		const animation=get().animations[id];
		if(animation) {
			animation.action.stop();
			set((state) => ({
				animations: {
					...state.animations,
					[id]: {...animation,state: "stopped"},
				},
			}));
			console.log(`Animation stopped: ${id}`);
		} else {
			console.warn(`Animation ${id} not found.`);
		}
	},

	updateAnimations: () => {
		const delta=0.016; // Approximate frame time (~60fps)
		Object.values(get().animations).forEach((animation) => {
			animation.mixer.update(delta);
		});
	},
}));
