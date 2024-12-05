// src/systems/CameraSystem/CameraSystem.test.ts

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

    // Mock RAF
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => setTimeout(cb, 16));
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
    expect(useCameraStore.getState().cameras['main']).toBe(camera);

    cameraSystem.setActiveCamera('main');
    expect(useCameraStore.getState().activeCamera).toBe('main');

    cameraSystem.unregisterCamera('main');
    expect(useCameraStore.getState().cameras['main']).toBeUndefined();
  });

  it('should handle camera transitions', (done) => {
    cameraSystem.registerCamera('main', camera);
    const startPosition = new Vector3(0, 0, 5);
    const endPosition = new Vector3(5, 5, 5);

    const transition: CameraTransition = {
      id: 'test-transition',
      startPosition,
      endPosition,
      startTarget: new Vector3(),
      endTarget: new Vector3(0, 0, 0),
      duration: 0.1,
      easing: t => t,
      progress: 0
    };

    camera.position.copy(startPosition);
    cameraSystem.startTransition(transition);

    // Wait for transition to complete
    setTimeout(() => {
      expect(camera.position).toEqual(endPosition);
      done();
    }, 200);
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

  it('should handle camera shake', (done) => {
    cameraSystem.registerCamera('main', camera);
    cameraSystem.setActiveCamera('main');

    const initialPosition = camera.position.clone();
    cameraSystem.shake(1.0);

    // Wait a few frames
    setTimeout(() => {
      expect(camera.position).not.toEqual(initialPosition);
      expect(useCameraStore.getState().shake.active).toBe(true);

      // Wait for shake to decay
      setTimeout(() => {
        expect(useCameraStore.getState().shake.active).toBe(false);
        done();
      }, 500);
    }, 32);
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

    expect(useCameraStore.getState().cameras).toEqual({});
    expect(useCameraStore.getState().activeCamera).toBeNull();
  });
});
