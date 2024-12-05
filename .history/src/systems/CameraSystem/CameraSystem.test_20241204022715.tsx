// src/systems/CameraSystem/CameraSystem.test.tsx

import { CameraSystem } from './CameraSystem';
import { PerspectiveCamera, Vector3, Euler } from 'three';
import { useCameraStore } from '../../stores/cameraStore';
import { CameraTransition, CameraMode } from '../../types/camera.types';

describe('CameraSystem', () => {
  let cameraSystem: CameraSystem;
  let camera: PerspectiveCamera;

  beforeEach(() => {
    // Reset the CameraSystem instance
    (CameraSystem as any).instance = null;

    // Create a test camera
    camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    // Initialize CameraSystem
    cameraSystem = CameraSystem.getInstance();

    // Reset the store
    useCameraStore.getState().reset();
  });

  afterEach(() => {
    cameraSystem.cleanup();
    jest.restoreAllMocks();
  });

  it('should be a singleton', () => {
    const instance1 = CameraSystem.getInstance();
    const instance2 = CameraSystem.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should register and manage cameras', () => {
    cameraSystem.registerCamera('main', camera);
    expect((cameraSystem as any).controllers.has('main')).toBe(true);

    cameraSystem.setActiveCamera('main');
    expect(useCameraStore.getState().activeCamera).toBe('main');

    cameraSystem.unregisterCamera('main');
    expect((cameraSystem as any).controllers.has('main')).toBe(false);
  });

  it('should handle camera transitions', () => {
    cameraSystem.registerCamera('main', camera);
    cameraSystem.setActiveCamera('main');

    const startPosition = new Vector3(0, 0, 5);
    const endPosition = new Vector3(5, 5, 5);

    const transition: CameraTransition = {
      id: 'test-transition',
      startPosition,
      endPosition,
      startTarget: new Vector3(),
      endTarget: new Vector3(0, 0, 0),
      duration: 0.1, // Transition duration in seconds
      easing: t => t, // Linear easing
      progress: 0
    };

    camera.position.copy(startPosition);
    cameraSystem.startTransition(transition);

    // Simulate updates over the duration of the transition
    const totalUpdates = 10;
    const deltaTime = transition.duration / totalUpdates;

    for (let i = 0; i <= totalUpdates; i++) {
      cameraSystem.manualUpdate(deltaTime);
    }

    // Check if the camera position has reached the end position
    expect(camera.position.x).toBeCloseTo(endPosition.x, 5);
    expect(camera.position.y).toBeCloseTo(endPosition.y, 5);
    expect(camera.position.z).toBeCloseTo(endPosition.z, 5);
  });

  it('should handle camera modes correctly', () => {
    cameraSystem.registerCamera('main', camera);
    cameraSystem.setActiveCamera('main');

    const modes: CameraMode[] = ['firstPerson', 'thirdPerson', 'orbital', 'cinematic'];
    modes.forEach(mode => {
      cameraSystem.setMode(mode);
      expect(useCameraStore.getState().mode).toBe(mode);
    });
  });

  it('should handle camera shake', () => {
    cameraSystem.registerCamera('main', camera);
    cameraSystem.setActiveCamera('main');

    const initialPosition = camera.position.clone();
    cameraSystem.shake(1.0);

    // Simulate updates over time to allow shake to decay
    const totalUpdates = 60;
    const deltaTime = 1 / 60; // Simulate 60 FPS

    for (let i = 0; i < totalUpdates; i++) {
      cameraSystem.manualUpdate(deltaTime);
    }

    // Expect the shake to have decayed and the camera to have stopped shaking
    expect(useCameraStore.getState().shake.active).toBe(false);
  });

  it('should update target and offset', () => {
    cameraSystem.registerCamera('main', camera);
    cameraSystem.setActiveCamera('main');

    const newTarget = new Vector3(1, 1, 1);
    const newOffset = new Vector3(0, 5, 5);

    cameraSystem.setTarget(newTarget);
    cameraSystem.setOffset(newOffset);

    expect(useCameraStore.getState().target).toEqual(newTarget);
    expect(useCameraStore.getState().offset).toEqual(newOffset);
  });

  it('should handle cleanup correctly', () => {
    cameraSystem.registerCamera('main', camera);
    cameraSystem.setActiveCamera('main');

    cameraSystem.cleanup();

    // Check that controllers are cleared and activeController is null
    expect((cameraSystem as any).controllers.size).toBe(0);
    expect((cameraSystem as any).activeController).toBeNull();
    expect(useCameraStore.getState().activeCamera).toBeNull();
  });
});
