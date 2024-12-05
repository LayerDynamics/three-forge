// useAnimation: a custom hook to animate the component, Simplifies animation playback and management.
// It provides functions for playing animations, stopping animations, and setting animation speed.
// useAnimations.ts

// Purpose: Simplifies skeletal animation management.
// Depends On: AnimationSystem.
// Interacts With: Character models.
// src/hooks/useAnimation.ts

import {useEffect,useCallback} from "react";
import {AnimationSystem} from "../systems/AnimationSystem/AnimationSystem";
import {AnimationClip,Object3D} from "three"; // Imported Object3D
import {EventDispatcher} from "../utils/EventDispatcher";

/**
 * Hook: useAnimation
 * Provides an interface to interact with the AnimationSystem.
 */
export const useAnimation=() => {
	// Wrap system methods with React-friendly callbacks
	const addAnimation=useCallback(
		(id: string,clip: AnimationClip,object: Object3D) => {
			AnimationSystem.addAnimation(id,clip,object);
		},
		[]
	);

	const playAnimation=useCallback(
		(id: string) => {
			AnimationSystem.playAnimation(id);
		},
		[]
	);

	const pauseAnimation=useCallback(
		(id: string) => {
			AnimationSystem.pauseAnimation(id);
		},
		[]
	);

	const stopAnimation=useCallback(
		(id: string) => {
			AnimationSystem.stopAnimation(id);
		},
		[]
	);

	// Update animations every frame using requestAnimationFrame
	useEffect(() => {
		const animate=() => {
			AnimationSystem.update();
			requestAnimationFrame(animate);
		};

		animate();

		return () => {
			// Cleanup if necessary
		};
	},[]);

	// Optionally, subscribe to events
	useEffect(() => {
		const handleAnimationPlayed=(data: any) => {
			console.log("Animation played event received:",data);
			// Handle event (e.g., trigger UI updates)
		};

		const handleAnimationPaused=(data: any) => {
			console.log("Animation paused event received:",data);
			// Handle event
		};

		const handleAnimationStopped=(data: any) => {
			console.log("Animation stopped event received:",data);
			// Handle event
		};

		EventDispatcher.on("ANIMATION_PLAYED",handleAnimationPlayed);
		EventDispatcher.on("ANIMATION_PAUSED",handleAnimationPaused);
		EventDispatcher.on("ANIMATION_STOPPED",handleAnimationStopped);

		return () => {
			EventDispatcher.off("ANIMATION_PLAYED",handleAnimationPlayed);
			EventDispatcher.off("ANIMATION_PAUSED",handleAnimationPaused);
			EventDispatcher.off("ANIMATION_STOPPED",handleAnimationStopped);
		};
	},[]);

	// Return the API and state
	return {
		addAnimation,
		playAnimation,
		pauseAnimation,
		stopAnimation,
		// Additional methods as needed
	};
};
