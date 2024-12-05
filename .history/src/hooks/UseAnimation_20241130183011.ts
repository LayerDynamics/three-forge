// useAnimation: a custom hook to animate the component, Simplifies animation playback and management.
// It provides functions for playing animations, stopping animations, and setting animation speed.
// useAnimations.ts

// Purpose: Simplifies skeletal animation management.
// Depends On: AnimationSystem.
// Interacts With: Character models.
// src/hooks/useAnimation.ts

import {useFrame} from "@react-three/fiber";
import {AnimationClip,Object3D} from "three";
import {AnimationSystem} from "../systems/AnimationSystem/AnimationSystem";
import {useAnimationStore} from "../stores/animationStore";

export const useAnimation=() => {
	// Update animations every frame
	useFrame((state,delta) => {
		AnimationSystem.update(delta);
	});

	/**
	 * Adds an animation to the system.
	 * @param id Unique identifier for the animation.
	 * @param clip Three.js AnimationClip.
	 * @param object Three.js Object3D to which the animation applies.
	 */
	const addAnimation=(id: string,clip: AnimationClip,object: Object3D) => {
		AnimationSystem.addAnimation(id,clip,object);
	};

	/**
	 * Plays a specific animation.
	 * @param id Unique identifier for the animation.
	 */
	const playAnimation=(id: string) => {
		AnimationSystem.playAnimation(id);
	};

	/**
	 * Pauses a specific animation.
	 * @param id Unique identifier for the animation.
	 */
	const pauseAnimation=(id: string) => {
		AnimationSystem.pauseAnimation(id);
	};

	/**
	 * Stops a specific animation.
	 * @param id Unique identifier for the animation.
	 */
	const stopAnimation=(id: string) => {
		AnimationSystem.stopAnimation(id);
	};

	return {addAnimation,playAnimation,pauseAnimation,stopAnimation};
};
