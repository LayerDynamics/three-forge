// src/systems/AnimationSystem/AnimationSystem.test.tsx

// Mock the 'three' module before any other imports
jest.mock("three", () => {
  const actualThree = jest.requireActual("three");

  // Mock AnimationAction with 'play', 'pause', 'stop' methods
  const mockPlay = jest.fn();
  const mockPause = jest.fn();
  const mockStop = jest.fn();

  const AnimationActionMock = jest.fn(() => ({
    play: mockPlay,
    pause: mockPause,
    stop: mockStop,
  }));

  // Mock AnimationMixer with 'update' and 'clipAction' methods
  const mockUpdate = jest.fn();
  const AnimationMixerMock = jest.fn(() => ({
    update: mockUpdate,
    clipAction: jest.fn(() => new AnimationActionMock()),
  }));

  return {
    ...actualThree,
    AnimationMixer: AnimationMixerMock,
    AnimationAction: AnimationActionMock,
    NumberKeyframeTrack: jest.fn(),
    AnimationClip: actualThree.AnimationClip,
    LoopRepeat: actualThree.LoopRepeat,
  };
});

// Now import after mocking
import { AnimationSystem } from "./AnimationSystem"; // Import singleton after mocking
import { AnimationClip, Object3D, AnimationMixer } from "three";
import { useAnimationStore } from "../../stores/animationStore";
import { EventDispatcher } from "../../utils/EventDispatcher";

describe("AnimationSystem", () => {
  let mockMixer1: jest.Mocked<AnimationMixer>;
  let mockMixer2: jest.Mocked<AnimationMixer>;
  let mockAction1: any;
  let mockAction2: any;

  beforeEach(() => {
    // Reset the AnimationStore before each test
    useAnimationStore.setState({ animations: {} });

    // Clear all events
    (EventDispatcher as any).events = {};

    // Reset mock implementations
    const mockedThree = require("three");
    (mockedThree.AnimationMixer as jest.Mock).mockClear();
    (mockedThree.AnimationAction as jest.Mock).mockClear();
    (mockedThree.AnimationMixer as jest.Mock).mockImplementation(() => {
      return {
        update: jest.fn(),
        clipAction: jest.fn(() => new mockedThree.AnimationAction()),
      };
    });
  });

  it("should initialize the AnimationSystem", () => {
    AnimationSystem.initialize({ debug: true });
    expect(AnimationSystem).toBeDefined();
    // Additional checks can be added here if necessary
  });

  it("should add an animation", () => {
    const mockObject = new Object3D();
    const mockClip = new AnimationClip("testClip", 1, []);
    AnimationSystem.addAnimation("anim1", mockClip, mockObject);

    const storedAnimation = useAnimationStore.getState().animations["anim1"];
    expect(storedAnimation).toBeDefined();
    expect(storedAnimation.clip).toBe(mockClip);
    const mockedThree = require("three");
    expect(mockedThree.AnimationMixer).toHaveBeenCalledWith(mockObject);
    expect(storedAnimation.action.play).toHaveBeenCalledTimes(0);
  });

  it("should play an animation", () => {
    const mockObject = new Object3D();
    const mockClip = new AnimationClip("testClip", 1, []);
    AnimationSystem.addAnimation("anim1", mockClip, mockObject);

    // Retrieve the mock mixer and action
    const mockedThree = require("three");
    const mixerInstance = mockedThree.AnimationMixer.mock.instances[0] as jest.Mocked<AnimationMixer>;
    const mockAction = mixerInstance.clipAction.mock.results[0].value;

    AnimationSystem.playAnimation("anim1");

    const storedAnimation = useAnimationStore.getState().animations["anim1"];
    expect(storedAnimation.state).toBe("playing");
    expect(mockAction.play).toHaveBeenCalledTimes(1);
  });

  it("should pause an animation", () => {
    const mockObject = new Object3D();
    const mockClip = new AnimationClip("testClip", 1, []);
    AnimationSystem.addAnimation("anim1", mockClip, mockObject);

    // Retrieve the mock mixer and action
    const mockedThree = require("three");
    const mixerInstance = mockedThree.AnimationMixer.mock.instances[0] as jest.Mocked<AnimationMixer>;
    const mockAction = mixerInstance.clipAction.mock.results[0].value;

    // Play the animation first
    AnimationSystem.playAnimation("anim1");

    AnimationSystem.pauseAnimation("anim1");

    const storedAnimation = useAnimationStore.getState().animations["anim1"];
    expect(storedAnimation.state).toBe("paused");
    expect(mockAction.pause).toHaveBeenCalledTimes(1);
  });

  it("should stop an animation", () => {
    const mockObject = new Object3D();
    const mockClip = new AnimationClip("testClip", 1, []);
    AnimationSystem.addAnimation("anim1", mockClip, mockObject);

    // Retrieve the mock mixer and action
    const mockedThree = require("three");
    const mixerInstance = mockedThree.AnimationMixer.mock.instances[0] as jest.Mocked<AnimationMixer>;
    const mockAction = mixerInstance.clipAction.mock.results[0].value;

    // Play the animation first
    AnimationSystem.playAnimation("anim1");

    AnimationSystem.stopAnimation("anim1");

    const storedAnimation = useAnimationStore.getState().animations["anim1"];
    expect(storedAnimation.state).toBe("stopped");
    expect(mockAction.stop).toHaveBeenCalledTimes(1);
  });

  it("should update all animations", () => {
    const mockObject1 = new Object3D();
    const mockClip1 = new AnimationClip("clip1", 1, []);
    AnimationSystem.addAnimation("anim1", mockClip1, mockObject1);

    const mockObject2 = new Object3D();
    const mockClip2 = new AnimationClip("clip2", 2, []);
    AnimationSystem.addAnimation("anim2", mockClip2, mockObject2);

    // Retrieve the mock mixers
    const mockedThree = require("three");
    const mixers = mockedThree.AnimationMixer.mock.instances as jest.Mocked<AnimationMixer>[];

    const mockMixer1 = mixers[0];
    const mockMixer2 = mixers[1];

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

