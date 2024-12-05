// src/types/animation.types.ts

import {Object3D,AnimationClip,AnimationMixer,AnimationAction} from "three";

// Enum for animation states
export type AnimationStateEnum="playing"|"paused"|"stopped";

// Interface for an individual animation
export interface AnimationData {
	clip: AnimationClip; // Three.js AnimationClip
	mixer: AnimationMixer; // Three.js AnimationMixer
	action: AnimationAction; // Three.js AnimationAction
	state: AnimationStateEnum; // Current state of the animation
}

// Interface for animation configurations
export interface AnimationConfig {
	debug?: boolean; // Enable debug mode for logging
}

// Interface for managing animations in the store
export interface AnimationState {
	animations: Record<string,AnimationData>; // Map of animation IDs to AnimationData
	addAnimation: (id: string,animationData: AnimationData) => void; // Function to add a new animation
	removeAnimation: (id: string) => void; // Function to remove an animation
	playAnimation: (id: string) => void; // Function to play an animation
	pauseAnimation: (id: string) => void; // Function to pause an animation
	stopAnimation: (id: string) => void; // Function to stop an animation
	updateAnimations: () => void; // Function to update all mixers
}
