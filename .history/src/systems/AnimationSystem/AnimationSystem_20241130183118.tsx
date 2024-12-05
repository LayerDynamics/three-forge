// src/systems/AnimationSystem/AnimationSystem.tsx

import { AnimationClip, Object3D, AnimationMixer, AnimationAction } from "three";
import { AnimationConfig, AnimationData } from "../../types/animation.types";
import { useAnimationStore } from "../../stores/animationStore";
import { EventDispatcher } from "../../utils/EventDispatcher";

/**
 * Singleton Class for managing animations.
 */
export class AnimationSystemClass {
  private static instance: AnimationSystemClass | null = null;
  private config: AnimationConfig;

  private constructor(config: AnimationConfig = { debug: false }) {
    this.config = config;
  }

  /**
   * Initializes the AnimationSystem with the provided configuration.
   * @param config Configuration settings for the AnimationSystem.
   */
  public initialize(config: AnimationConfig = { debug: false }): void {
    this.config = config;
    if (this.config.debug) {
      console.log("AnimationSystem initialized with config:", config);
    }

    // Subscribe to global events if necessary
    EventDispatcher.on("RESET_GAME", () => this.reset());
  }

  /**
   * Retrieves the singleton instance of AnimationSystemClass.
   * @returns The singleton instance.
   */
  public static getInstance(): AnimationSystemClass {
    if (!AnimationSystemClass.instance) {
      AnimationSystemClass.instance = new AnimationSystemClass();
    }
    return AnimationSystemClass.instance;
  }

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
    const animation = useAnimationStore.getState().animations[id];
    if (animation) {
      animation.action.play();
      useAnimationStore.getState().playAnimation(id);
      if (this.config.debug) {
        console.log(`AnimationSystem: Played animation ${id}`);
      }
    } else {
      console.warn(`AnimationSystem: Animation ${id} not found.`);
    }
  }

  /**
   * Pauses an animation.
   * @param id Unique identifier for the animation.
   */
  public pauseAnimation(id: string): void {
    const animation = useAnimationStore.getState().animations[id];
    if (animation) {
      // Set the paused property instead of calling pause() method
      animation.action.paused = true;
      useAnimationStore.getState().pauseAnimation(id);
      if (this.config.debug) {
        console.log(`AnimationSystem: Paused animation ${id}`);
      }
    } else {
      console.warn(`AnimationSystem: Animation ${id} not found.`);
    }
  }

  /**
   * Stops an animation.
   * @param id Unique identifier for the animation.
   */
  public stopAnimation(id: string): void {
    const animation = useAnimationStore.getState().animations[id];
    if (animation) {
      animation.action.stop();
      useAnimationStore.getState().stopAnimation(id);
      if (this.config.debug) {
        console.log(`AnimationSystem: Stopped animation ${id}`);
      }
    } else {
      console.warn(`AnimationSystem: Animation ${id} not found.`);
    }
  }

  /**
   * Updates all animations. Should be called in the game loop.
   * @param delta Time elapsed since the last frame (in seconds).
   */
  public update(delta: number): void {
    const animations = useAnimationStore.getState().animations;
    Object.values(animations).forEach(({ mixer }) => {
      mixer.update(delta);
    });
    if (this.config.debug) {
      console.log("AnimationSystem: Updated all animations.");
    }
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
