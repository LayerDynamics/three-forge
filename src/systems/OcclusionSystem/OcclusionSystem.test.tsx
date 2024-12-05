// src/systems/OcclusionSystem/OcclusionSystem.test.tsx

import { PerspectiveCamera, Mesh, BoxGeometry, MeshBasicMaterial } from 'three';
import { OcclusionSystem } from './OcclusionSystem';
import { useOcclusionStore } from '../../stores/occlusionStore';
import { EventDispatcher } from '../../utils/EventDispatcher';

// Mock requestAnimationFrame to work with Jest's fake timers
beforeAll(() => {
  jest.spyOn(global, 'requestAnimationFrame').mockImplementation((cb) => setTimeout(cb, 0));
  jest.spyOn(global, 'cancelAnimationFrame').mockImplementation((id) => clearTimeout(id as unknown as number));
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('OcclusionSystem', () => {
  let occlusionSystem: OcclusionSystem;
  let camera: PerspectiveCamera;
  let mockObject: Mesh;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(console, 'log').mockImplementation(() => {}); // Suppress console logs during tests

    // Reset the OcclusionSystem instance
    (OcclusionSystem as any).instance = null;

    // Create a mock camera
    camera = new PerspectiveCamera();
    camera.position.set(0, 0, 10);
    camera.updateProjectionMatrix();

    // Create a mock object to act as the occludee
    const geometry = new BoxGeometry(1, 1, 1);
    const material = new MeshBasicMaterial({ color: 0xffffff });
    mockObject = new Mesh(geometry, material);
    mockObject.position.set(0, 0, 0); // Position in front of the camera

    // Initialize OcclusionSystem with test configuration
    occlusionSystem = OcclusionSystem.getInstance({
      maxOccluders: 10,
      cullDistance: 100,
      updateFrequency: 16.67, // ~60fps
      debug: true,
    });

    occlusionSystem.initialize(camera);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
    occlusionSystem.cleanup();
  });

  it('should be a singleton', () => {
    const instance1 = OcclusionSystem.getInstance();
    const instance2 = OcclusionSystem.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should register objects correctly', () => {
    occlusionSystem.registerObject(mockObject);
    const occluders = useOcclusionStore.getState().occluders;
    expect(Object.keys(occluders)).toHaveLength(1);
    expect(occluders[mockObject.uuid]).toBeDefined();
  });

  it('should handle object registration with custom options', () => {
    occlusionSystem.registerObject(mockObject, { isOccluder: false, isOccludable: false });
    const occluder = useOcclusionStore.getState().occluders[mockObject.uuid];
    expect(occluder.isOccluder).toBe(false);
    expect(occluder.isOccludable).toBe(false);
  });

  it('should unregister objects correctly', () => {
    occlusionSystem.registerObject(mockObject);
    occlusionSystem.unregisterObject(mockObject.uuid);
    const occluders = useOcclusionStore.getState().occluders;
    expect(occluders[mockObject.uuid]).toBeUndefined();
  });

  it('should update visibility based on occlusion', () => {
    // Create an occluder directly between the camera and the occludee
    const occluderGeometry = new BoxGeometry(1, 1, 1);
    const occluderMaterial = new MeshBasicMaterial({ color: 0xff0000 });
    const occluder = new Mesh(occluderGeometry, occluderMaterial);
    occluder.position.set(0, 0, 5); // Positioned between camera (z=10) and occludee (z=0)

    occlusionSystem.registerObject(occluder);

    // Initially, occludee should be visible
    expect(useOcclusionStore.getState().occluders[mockObject.uuid].visible).toBe(true);

    // Spy on updateObjectVisibility
    const updateSpy = jest.spyOn(occlusionSystem as any, 'updateObjectVisibility');

    // Advance time beyond update frequency to trigger update
    jest.advanceTimersByTime(20); // Total 20ms
    jest.runOnlyPendingTimers();    // Execute pending callbacks

    expect(updateSpy).toHaveBeenCalled();

    // After update, occludee should be invisible
    expect(useOcclusionStore.getState().occluders[mockObject.uuid].visible).toBe(false);

    // Clean up
    updateSpy.mockRestore();
    occluder.geometry.dispose();
    occluderMaterial.dispose();
  });

  it('should respect frustum culling', () => {
    // Position occludee outside the camera frustum
    mockObject.position.set(0, 0, -200); // Behind the camera

    occlusionSystem.registerObject(mockObject);

    // Spy on updateObjectVisibility
    const updateSpy = jest.spyOn(occlusionSystem as any, 'updateObjectVisibility');

    // Advance time to trigger update
    jest.advanceTimersByTime(20);
    jest.runOnlyPendingTimers();

    expect(updateSpy).toHaveBeenCalled();

    // Occludee should still be visible because it's outside the frustum
    expect(useOcclusionStore.getState().occluders[mockObject.uuid].visible).toBe(true);

    // Clean up
    updateSpy.mockRestore();
    mockObject.geometry.dispose();
    mockObject.material.dispose();
  });

  it('should handle system reset', () => {
    occlusionSystem.registerObject(mockObject);
    expect(Object.keys(useOcclusionStore.getState().occluders)).toHaveLength(1);

    occlusionSystem.reset();
    expect(Object.keys(useOcclusionStore.getState().occluders)).toHaveLength(0);
  });

  it('should respect update frequency', () => {
    // Spy on updateObjectVisibility
    const updateSpy = jest.spyOn(occlusionSystem as any, 'updateObjectVisibility');

    occlusionSystem.registerObject(mockObject);

    // Initially, update should not have been called
    expect(updateSpy).not.toHaveBeenCalled();

    // Advance time by less than update frequency
    jest.advanceTimersByTime(10);
    jest.runOnlyPendingTimers();
    expect(updateSpy).not.toHaveBeenCalled();

    // Advance time beyond update frequency
    jest.advanceTimersByTime(20); // Total 30ms
    jest.runOnlyPendingTimers();
    expect(updateSpy).toHaveBeenCalled();

    // Clean up
    updateSpy.mockRestore();
  });

  it('should prioritize closer occluders', () => {
    // Create two occluders at different distances
    const closeOccluder = new Mesh(
      new BoxGeometry(1, 1, 1),
      new MeshBasicMaterial({ color: 0x00ff00 })
    );
    closeOccluder.position.set(0, 0, 5); // Closer to camera

    const farOccluder = new Mesh(
      new BoxGeometry(1, 1, 1),
      new MeshBasicMaterial({ color: 0x0000ff })
    );
    farOccluder.position.set(0, 0, 15); // Farther from camera

    occlusionSystem.registerObject(closeOccluder);
    occlusionSystem.registerObject(farOccluder);

    // Create another occludee
    const occludeeGeometry = new BoxGeometry(1, 1, 1);
    const occludeeMaterial = new MeshBasicMaterial({ color: 0xffffff });
    const occludee = new Mesh(occludeeGeometry, occludeeMaterial);
    occludee.position.set(0, 0, 0); // In front of camera

    occlusionSystem.registerObject(occludee);

    // Spy on updateObjectVisibility
    const updateSpy = jest.spyOn(occlusionSystem as any, 'updateObjectVisibility');

    // Advance time to trigger update
    jest.advanceTimersByTime(20);
    jest.runOnlyPendingTimers();

    expect(updateSpy).toHaveBeenCalled();

    // Since closeOccluder is between camera and occludee, occludee should be invisible
    expect(useOcclusionStore.getState().occluders[occludee.uuid].visible).toBe(false);

    // Clean up
    updateSpy.mockRestore();
    closeOccluder.geometry.dispose();
    closeOccluder.material.dispose();
    farOccluder.geometry.dispose();
    farOccluder.material.dispose();
    occludee.geometry.dispose();
    occludee.material.dispose();
  });

  it('should handle non-occludable objects correctly', () => {
    // Register a non-occludable object
    occlusionSystem.registerObject(mockObject, { isOccludable: false });

    // Spy on updateObjectVisibility
    const updateSpy = jest.spyOn(occlusionSystem as any, 'updateObjectVisibility');

    // Advance time to trigger update
    jest.advanceTimersByTime(20);
    jest.runOnlyPendingTimers();

    expect(updateSpy).toHaveBeenCalled();

    // Since the object is not occludable, it should remain visible regardless of occluders
    expect(useOcclusionStore.getState().occluders[mockObject.uuid].visible).toBe(true);

    // Clean up
    updateSpy.mockRestore();
    mockObject.geometry.dispose();
    mockObject.material.dispose();
  });

  it('should handle cleanup correctly', () => {
    occlusionSystem.registerObject(mockObject);
    expect(Object.keys(useOcclusionStore.getState().occluders)).toHaveLength(1);

    occlusionSystem.cleanup();
    expect(Object.keys(useOcclusionStore.getState().occluders)).toHaveLength(0);
    expect(occlusionSystem['camera']).toBeNull();
  });
});
