// src/types/animation.types.ts

import {AnimationClip,AnimationMixer,AnimationAction} from "three";

/**
 * Enum for animation states.
 */
export type AnimationStateEnum="playing"|"paused"|"stopped";

/**
 * Interface for an individual animation.
 */
export interface AnimationData {
	clip: AnimationClip;
	mixer: AnimationMixer;
	action: AnimationAction;
	state: AnimationStateEnum;
}

/**
 * Interface for animation configurations.
 */
export interface AnimationConfig {
	debug: boolean;
}

/**
 * Interface for managing animations in the store.
 */
export interface AnimationState {
	animations: Record<string,AnimationData>;
}
