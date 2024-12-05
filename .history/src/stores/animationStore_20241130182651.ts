// src/stores/animationStore.ts
import create } from "zustand";
import {AnimationState,AnimationData} from "../types/animation.types";

interface AnimationStore extends AnimationState {
	addAnimation: (id: string,animation: AnimationData) => void;
	playAnimation: (id: string) => void;
	pauseAnimation: (id: string) => void;
	stopAnimation: (id: string) => void;
	removeAnimation: (id: string) => void;
}

export const useAnimationStore=create<AnimationStore>((set) => ({
	animations: {},

	addAnimation: (id,animation) =>
		set((state) => ({
			animations: {...state.animations,[id]: animation},
		})),

	playAnimation: (id) =>
		set((state) => ({
			animations: {
				...state.animations,
				[id]: {...state.animations[id],state: "playing"},
			},
		})),

	pauseAnimation: (id) =>
		set((state) => ({
			animations: {
				...state.animations,
				[id]: {...state.animations[id],state: "paused"},
			},
		})),

	stopAnimation: (id) =>
		set((state) => ({
			animations: {
				...state.animations,
				[id]: {...state.animations[id],state: "stopped"},
			},
		})),

	removeAnimation: (id) =>
		set((state) => {
			const newAnimations={...state.animations};
			delete newAnimations[id];
			return {animations: newAnimations};
		}),
}));
