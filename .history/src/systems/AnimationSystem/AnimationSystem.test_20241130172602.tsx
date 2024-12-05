// src/systems/AnimationSystem/AnimationSystem.test.tsx

import { AnimationSystemClass } from "./AnimationSystem";
import { AnimationClip, Object3D, AnimationMixer, AnimationAction } from "three";
import { useAnimationStore } from "../../stores/animationStore";
import { EventDispatcher } from "../../utils/EventDispatcher";

jest.mock("three", () => {
  const actualThree = jest.requireActual("three");
  return {
    ...actualThree,
    AnimationMixer: jest.fn().mockImplementation(() => ({
      update: jest.fn(),
      clipAction: jest.fn().mockReturnValue({
        play: jest.fn(),
        pause: jest.fn(),
        stop: jest.fn(),
      }),
    })),
    AnimationAction: jest.fn(),
  };
});

describe("AnimationSystem", () => {
  const animationSystem = AnimationSystemClass.getInstance();

  beforeEach(() => {
    // Reset the AnimationStore before each test
    useAnimationStore.setState({ animations: {} });
    // Clear all events
    (EventDispatcher as any).events = {};
    // Reset mock implementations
    (AnimationMixer as jest.Mock).mockClear();
  });

  it("should initialize the AnimationSystem", () => {
    animationSystem.initialize({ debug: true });
    expect(AnimationMixer).toHaveBeenCalled();
  });

  it("should add an animation", () => {
    const mockObject = new Object3D();
    const mockClip = new AnimationClip("testClip", 1, []);
    animationSystem.addAnimation("anim1", mockClip, mockObject);

    const storedAnimation = useAnimationStore.getState().animations["anim1"];
    expect(storedAnimation).toBeDefined();
    expect(storedAnimation.clip).toBe(mockClip);
    expect(AnimationMixer).toHaveBeenCalledWith(mockObject);
    expect(storedAnimation.action.play).toHaveBeenCalledTimes(0);
  });

  it("should play an animation", () => {
    const mockObject = new Object3D();
    const mockClip = new AnimationClip("testClip", 1, []);
    const mockMixer = new AnimationMixer(mockObject);
    const mockAction = mockMixer.clipAction(mockClip);
    animationSystem.addAnimation("anim1", mockClip, mockObject);

    animationSystem.playAnimation("anim1");

    const storedAnimation = useAnimationStore.getState().animations["anim1"];
    expect(storedAnimation.state).toBe("playing");
    expect(mockAction.play).toHaveBeenCalledTimes(1);
  });

  it("should pause an animation", () => {
    const mockObject = new Object3D();
    const mockClip = new AnimationClip("testClip", 1, []);
    const mockMixer = new AnimationMixer(mockObject);
    const mockAction = mockMixer.clipAction(mockClip);
    animationSystem.addAnimation("anim1", mockClip, mockObject);
    animationSystem.playAnimation("anim1");

    animationSystem.pauseAnimation("anim1");

    const storedAnimation = useAnimationStore.getState().animations["anim1"];
    expect(storedAnimation.state).toBe("paused");
    expect(mockAction.paused).toBe(true);
  });

  it("should stop an animation", () => {
    const mockObject = new Object3D();
    const mockClip = new AnimationClip("testClip", 1, []);
    const mockMixer = new AnimationMixer(mockObject);
    const mockAction = mockMixer.clipAction(mockClip);
    animationSystem.addAnimation("anim1", mockClip, mockObject);
    animationSystem.playAnimation("anim1");

    animationSystem.stopAnimation("anim1");

    const storedAnimation = useAnimationStore.getState().animations["anim1"];
    expect(storedAnimation.state).toBe("stopped");
    expect(mockAction.stop).toHaveBeenCalledTimes(1);
  });

  it("should update all animations", () => {
    const mockObject1 = new Object3D();
    const mockClip1 = new AnimationClip("clip1", 1, []);
    const mockMixer1 = new AnimationMixer(mockObject1);
    const mockAction1 = mockMixer1.clipAction(mockClip1);
    animationSystem.addAnimation("anim1", mockClip1, mockObject1);

    const mockObject2 = new Object3D();
    const mockClip2 = new AnimationClip("clip2", 2, []);
    const mockMixer2 = new AnimationMixer(mockObject2);
    const mockAction2 = mockMixer2.clipAction(mockClip2);
    animationSystem.addAnimation("anim2", mockClip2, mockObject2);

    animationSystem.update();

    expect(mockMixer1.update).toHaveBeenCalledWith(0.016);
    expect(mockMixer2.update).toHaveBeenCalledWith(0.016);
  });

  it("should reset the AnimationSystem", () => {
    const mockObject = new Object3D();
    const mockClip = new AnimationClip("testClip", 1, []);
    animationSystem.addAnimation("anim1", mockClip, mockObject);
    expect(Object.keys(useAnimationStore.getState().animations)).toHaveLength(1);

    animationSystem.reset();
    expect(Object.keys(useAnimationStore.getState().animations)).toHaveLength(0);
  });
});
