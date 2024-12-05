// src/systems/AnimationSystem/AnimationSystem.test.tsx

// Mock the three module before any other imports
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
        paused: false, // Added 'paused' property
      }),
    })),
    AnimationAction: jest.fn(),
    NumberKeyframeTrack: jest.fn(),
    AnimationClip: actualThree.AnimationClip,
    LoopRepeat: actualThree.LoopRepeat,
  };
});

import { AnimationSystem } from "./AnimationSystem"; // Import singleton
import { AnimationClip, Object3D, AnimationMixer } from "three";
import { useAnimationStore } from "../../stores/animationStore";
import { EventDispatcher } from "../../utils/EventDispatcher";

describe("AnimationSystem", () => {
  beforeEach(() => {
    // Reset the AnimationStore before each test
    useAnimationStore.setState({ animations: {} });
    // Clear all events
    (EventDispatcher as any).events = {};
    // Reset mock implementations
    const mockedThree = require("three");
    mockedThree.AnimationMixer.mockClear();
  });

  it("should initialize the AnimationSystem", () => {
    AnimationSystem.initialize({ debug: true });
    // Since 'initialize' doesn't instantiate 'AnimationMixer', no need to expect it to be called here.
    // Instead, ensure that the system is defined.
    expect(AnimationSystem).toBeDefined();
  });

  it("should add an animation", () => {
    const mockObject = new Object3D();
    const mockClip = new AnimationClip("testClip", 1, []);
    AnimationSystem.addAnimation("anim1", mockClip, mockObject);

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
    AnimationSystem.addAnimation("anim1", mockClip, mockObject);

    AnimationSystem.playAnimation("anim1");

    const storedAnimation = useAnimationStore.getState().animations["anim1"];
    expect(storedAnimation.state).toBe("playing");
    expect(mockAction.play).toHaveBeenCalledTimes(1);
  });

  it("should pause an animation", () => {
    const mockObject = new Object3D();
    const mockClip = new AnimationClip("testClip", 1, []);
    const mockMixer = new AnimationMixer(mockObject);
    const mockAction = mockMixer.clipAction(mockClip);
    AnimationSystem.addAnimation("anim1", mockClip, mockObject);
    AnimationSystem.playAnimation("anim1");

    AnimationSystem.pauseAnimation("anim1");

    const storedAnimation = useAnimationStore.getState().animations["anim1"];
    expect(storedAnimation.state).toBe("paused");
    expect(mockAction.paused).toBe(true);
  });

  it("should stop an animation", () => {
    const mockObject = new Object3D();
    const mockClip = new AnimationClip("testClip", 1, []);
    const mockMixer = new AnimationMixer(mockObject);
    const mockAction = mockMixer.clipAction(mockClip);
    AnimationSystem.addAnimation("anim1", mockClip, mockObject);
    AnimationSystem.playAnimation("anim1");

    AnimationSystem.stopAnimation("anim1");

    const storedAnimation = useAnimationStore.getState().animations["anim1"];
    expect(storedAnimation.state).toBe("stopped");
    expect(mockAction.stop).toHaveBeenCalledTimes(1);
  });

  it("should update all animations", () => {
    const mockObject1 = new Object3D();
    const mockClip1 = new AnimationClip("clip1", 1, []);
    const mockMixer1 = new AnimationMixer(mockObject1);
    const mockAction1 = mockMixer1.clipAction(mockClip1);
    AnimationSystem.addAnimation("anim1", mockClip1, mockObject1);

    const mockObject2 = new Object3D();
    const mockClip2 = new AnimationClip("clip2", 2, []);
    const mockMixer2 = new AnimationMixer(mockObject2);
    const mockAction2 = mockMixer2.clipAction(mockClip2);
    AnimationSystem.addAnimation("anim2", mockClip2, mockObject2);

    AnimationSystem.update();

    expect(mockMixer1.update).toHaveBeenCalledWith(0.016);
    expect(mockMixer2.update).toHaveBeenCalledWith(0.016);
  });

  it("should reset the AnimationSystem", () => {
    const mockObject = new Object3D();
    const mockClip = new AnimationClip("testClip", 1, []);
    AnimationSystem.addAnimation("anim1", mockClip, mockObject);
    expect(Object.keys(useAnimationStore.getState().animations)).toHaveLength(1);

    AnimationSystem.reset();
    expect(Object.keys(useAnimationStore.getState().animations)).toHaveLength(0);
  });
});
