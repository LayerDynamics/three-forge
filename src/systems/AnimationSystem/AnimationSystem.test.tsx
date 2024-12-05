// src/systems/AnimationSystem/AnimationSystem.test.tsx

import { AnimationClip, Object3D, AnimationAction, AnimationMixer } from "three";
import { AnimationSystem } from "./AnimationSystem";
import { useAnimationStore } from "../../stores/animationStore";

// Mock Object3D
const mockObject = new Object3D();

// Mock AnimationClip
const mockClip = new AnimationClip("testClip", -1, []);

// Initialize AnimationSystem for testing
beforeAll(() => {
  AnimationSystem.initialize({ debug: false });
});

afterEach(() => {
  AnimationSystem.reset();
  jest.clearAllMocks();
});

describe("AnimationSystem", () => {
  it("should add an animation", () => {
    AnimationSystem.addAnimation("anim1", mockClip, mockObject);
    const animation = useAnimationStore.getState().animations["anim1"];
    expect(animation).toBeDefined();
    expect(animation.clip).toBe(mockClip);
    expect(animation.mixer).toBeDefined();
    expect(animation.action).toBeDefined();
    expect(animation.state).toBe("stopped");
  });

  it("should play an animation", () => {
    const playSpy = jest.spyOn(AnimationAction.prototype, "play");
    AnimationSystem.addAnimation("anim2", mockClip, mockObject);
    AnimationSystem.playAnimation("anim2");
    expect(playSpy).toHaveBeenCalled();
    const animation = useAnimationStore.getState().animations["anim2"];
    expect(animation.state).toBe("playing");
  });

  it("should pause an animation", () => {
    AnimationSystem.addAnimation("anim3", mockClip, mockObject);
    AnimationSystem.pauseAnimation("anim3");
    const animation = useAnimationStore.getState().animations["anim3"];
    expect(animation.action.paused).toBe(true);
    expect(animation.state).toBe("paused");
  });

  it("should stop an animation", () => {
    const stopSpy = jest.spyOn(AnimationAction.prototype, "stop");
    AnimationSystem.addAnimation("anim4", mockClip, mockObject);
    AnimationSystem.stopAnimation("anim4");
    expect(stopSpy).toHaveBeenCalled();
    const animation = useAnimationStore.getState().animations["anim4"];
    expect(animation.state).toBe("stopped");
  });

  it("should update all animations with delta", () => {
    const updateSpy = jest.spyOn(AnimationMixer.prototype, "update");
    AnimationSystem.addAnimation("anim5", mockClip, mockObject);
    AnimationSystem.update(0.016); // Assuming 60 FPS (~16ms per frame)
    expect(updateSpy).toHaveBeenCalledWith(0.016);
  });

  it("should reset all animations", () => {
    AnimationSystem.addAnimation("anim6", mockClip, mockObject);
    AnimationSystem.reset();
    const animations = useAnimationStore.getState().animations;
    expect(Object.keys(animations)).toHaveLength(0);
  });

  it("should warn if playing a non-existent animation", () => {
    console.warn = jest.fn();
    AnimationSystem.playAnimation("nonExistentAnim");
    expect(console.warn).toHaveBeenCalledWith("AnimationSystem: Animation nonExistentAnim not found.");
  });

  it("should warn if pausing a non-existent animation", () => {
    console.warn = jest.fn();
    AnimationSystem.pauseAnimation("nonExistentAnim");
    expect(console.warn).toHaveBeenCalledWith("AnimationSystem: Animation nonExistentAnim not found.");
  });

  it("should warn if stopping a non-existent animation", () => {
    console.warn = jest.fn();
    AnimationSystem.stopAnimation("nonExistentAnim");
    expect(console.warn).toHaveBeenCalledWith("AnimationSystem: Animation nonExistentAnim not found.");
  });
});
