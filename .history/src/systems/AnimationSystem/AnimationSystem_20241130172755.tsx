//  Manages animations for characters and objects, including skeletal animations.

// src/systems/AnimationSystem/AnimationSystem.tsx

import { AnimationClip, AnimationMixer, Object3D } from "three";
import { AnimationSystem } from "./AnimationSystem";
import { AnimationConfig, AnimationData } from "../../types/animation.types";
import { useAnimationStore } from "../../stores/animationStore";
import { EventDispatcher } from "../../utils/EventDispatcher";

// Singleton Class
export class AnimationSystemClass {
  private static instance: AnimationSystemClass | null = null;
  private config: AnimationConfig;

  private constructor(config: AnimationConfig = {}) {
    this.config = config;
  }

  // Initialize with optional configuration
  public initialize(config: AnimationConfig = {}): void {
    this.config = config;
    if (this.config.debug) {
      console.log("AnimationSystem initialized with config:", config);
    }

    // Subscribe to global events if necessary
    EventDispatcher.on("RESET_GAME", () => this.reset());
  }

  // Get the singleton instance
  public static getInstance(): AnimationSystemClass {
    if (!AnimationSystemClass.instance) {
      AnimationSystemClass.instance = new AnimationSystemClass();
    }
    return AnimationSystemClass.instance;
  }

  // Public API Methods

  /**
   * Adds an animation to the store.
   * @param id Unique identifier for the animation.
   * @param clip Three.js AnimationClip.
   * @param object Three.js Object3D to which the animation applies.
   */
  public addAnimation(id: string, clip: AnimationClip, object: Object3D): void {
    const mixer = new AnimationMixer(object);
    const action = mixer.clipAction(clip);

    const animationData: AnimationData = {
      clip,
      mixer,
      action,
      state: "stopped",
    };

    useAnimationStore.getState().addAnimation(id, animationData);

    if (this.config.debug) {
      console.log(`AnimationSystem: Added animation ${id}`);
    }
  }

  /**
   * Plays an animation.
   * @param id Unique identifier for the animation.
   */
  public playAnimation(id: string): void {
    useAnimationStore.getState().playAnimation(id);
    if (this.config.debug) {
      console.log(`AnimationSystem: Played animation ${id}`);
    }
  }

  /**
   * Pauses an animation.
   * @param id Unique identifier for the animation.
   */
  public pauseAnimation(id: string): void {
    useAnimationStore.getState().pauseAnimation(id);
    if (this.config.debug) {
      console.log(`AnimationSystem: Paused animation ${id}`);
    }
  }

  /**
   * Stops an animation.
   * @param id Unique identifier for the animation.
   */
  public stopAnimation(id: string): void {
    useAnimationStore.getState().stopAnimation(id);
    if (this.config.debug) {
      console.log(`AnimationSystem: Stopped animation ${id}`);
    }
  }

  /**
   * Updates all animations. Should be called in the game loop.
   */
  public update(): void {
    useAnimationStore.getState().updateAnimations();
  }

  /**
   * Resets the AnimationSystem by removing all animations.
   */
  public reset(): void {
    const animations = useAnimationStore.getState().animations;
    Object.keys(animations).forEach((id) => {
      useAnimationStore.getState().removeAnimation(id);
    });
    if (this.config.debug) {
      console.log("AnimationSystem: Reset all animations.");
    }
  }
}

// Export the singleton instance
export const AnimationSystem = AnimationSystemClass.getInstance();

// Initialize the AnimationSystem (typically done in a central initialization file)
AnimationSystem.initialize({
  debug: true, // Enable debug logs
});
