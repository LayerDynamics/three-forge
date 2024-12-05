// src/systems/OcclusionSystem/OcclusionSystem.test.tsx

import { OcclusionSystem } from './OcclusionSystem';
import { Camera, Object3D, Vector3, Box3, Mesh, BoxGeometry, MeshBasicMaterial, PerspectiveCamera } from 'three';
import { useOcclusionStore } from '../../stores/occlusionStore';
import { EventDispatcher } from '../../utils/EventDispatcher';

interface OcclusionConfig {
  // existing properties
  updateFrequency: number;
  // add other necessary properties
}

describe('OcclusionSystem', () => {
  let occlusionSystem: OcclusionSystem;
  let camera: Camera;
  let mockObject: Mesh;

  beforeEach(() => {
    // Reset the OcclusionSystem instance
    (OcclusionSystem as any).instance = null;

    // Create a mock camera
    camera = new PerspectiveCamera();
    camera.position.set(0, 0, 10);

    // Create a mock object with actual geometry for better testing
    const geometry = new BoxGeometry(1, 1, 1);
    const material = new MeshBasicMaterial({ color: 0xffffff });
    mockObject = new Mesh(geometry, material);
    mockObject.position.set(0, 0, 0);

    // Initialize OcclusionSystem with test configuration
    occlusionSystem = OcclusionSystem.getInstance({
      maxOccluders: 10,
      cullDistance: 100,
      updateFrequency: 16.67,
      debug: true
    });

    occlusionSystem.initialize(camera);

    // Clear event listeners
    (EventDispatcher as any).events = {};
  });

  afterEach(() => {
    occlusionSystem.cleanup();
    useOcclusionStore.setState({ occluders: {} });
    if (mockObject.geometry) mockObject.geometry.dispose();
    if (mockObject.material) mockObject.material.dispose();
  });

  it('should be a singleton', () => {
    const instance1 = OcclusionSystem.getInstance();
    const instance2 = OcclusionSystem.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should register objects correctly', () => {
    occlusionSystem.registerObject(mockObject);
    const occluders = useOcclusionStore.getState().occluders;

    expect(occluders[mockObject.uuid]).toBeDefined();
    expect(occluders[mockObject.uuid].isOccluder).toBe(true);
    expect(occluders[mockObject.uuid].isOccludable).toBe(true);
    expect(occluders[mockObject.uuid].visible).toBe(true);
  });

  it('should handle object registration with custom options', () => {
    occlusionSystem.registerObject(mockObject, {
      isOccluder: false,
      isOccludable: true
    });

    const occluders = useOcclusionStore.getState().occluders;
    expect(occluders[mockObject.uuid].isOccluder).toBe(false);
    expect(occluders[mockObject.uuid].isOccludable).toBe(true);
  });

  it('should unregister objects correctly', () => {
    occlusionSystem.registerObject(mockObject);
    occlusionSystem.unregisterObject(mockObject.uuid);

    const occluders = useOcclusionStore.getState().occluders;
    expect(occluders[mockObject.uuid]).toBeUndefined();
  });

  it('should update visibility based on occlusion', () => {
    // Create two objects for occlusion testing
    const occluder = new Mesh(
      new BoxGeometry(2, 2, 2),
      new MeshBasicMaterial()
    );
    occluder.position.set(0, 0, 5);

    const occludee = new Mesh(
      new BoxGeometry(1, 1, 1),
      new MeshBasicMaterial()
    );
    occludee.position.set(0, 0, 0);

    occlusionSystem.registerObject(occluder, { isOccluder: true, isOccludable: false });
    occlusionSystem.registerObject(occludee, { isOccluder: false, isOccludable: true });

    // Force an update cycle
    (occlusionSystem as any).update(performance.now());

    const occluders = useOcclusionStore.getState().occluders;
    expect(occluders[occludee.uuid].visible).toBe(false); // Should be occluded by occluder

    // Clean up
    occluder.geometry.dispose();
    occluder.material.dispose();
    occludee.geometry.dispose();
    occludee.material.dispose();
  });

  it('should respect frustum culling', () => {
    // Position object far outside the camera frustum
    mockObject.position.set(0, 0, -1000);
    occlusionSystem.registerObject(mockObject);

    // Update camera frustum
    camera.far = 100;
    camera.updateProjectionMatrix();

    // Force an update cycle
    (occlusionSystem as any).update(performance.now());

    const occluders = useOcclusionStore.getState().occluders;
    expect(occluders[mockObject.uuid].visible).toBe(false);
  });

  it('should handle system reset', () => {
    occlusionSystem.registerObject(mockObject);
    occlusionSystem.reset();

    const occluders = useOcclusionStore.getState().occluders;
    expect(Object.keys(occluders).length).toBe(0);
  });

  it('should respect update frequency', () => {
    jest.useFakeTimers();
    const updateSpy = jest.spyOn(occlusionSystem as any, 'updateObjectVisibility');

    occlusionSystem.registerObject(mockObject);

    // Advance time by less than update frequency
    jest.advanceTimersByTime(10); // Less than 16.67ms
    expect(updateSpy).not.toHaveBeenCalled();

    // Advance time beyond update frequency
    jest.advanceTimersByTime(20); // Total 30ms
    expect(updateSpy).toHaveBeenCalled();

    jest.useRealTimers();
    updateSpy.mockRestore();
  });

  it('should handle cleanup correctly', () => {
    occlusionSystem.registerObject(mockObject);
    occlusionSystem.cleanup();

    const occluders = useOcclusionStore.getState().occluders;
    expect(Object.keys(occluders).length).toBe(0);
    expect((occlusionSystem as any).camera).toBeNull();
    expect((occlusionSystem as any).frameId).toBeNull();
  });

  it('should prioritize closer occluders', () => {
    const nearOccluder = new Mesh(
      new BoxGeometry(2, 2, 2),
      new MeshBasicMaterial()
    );
    nearOccluder.position.set(0, 0, 5);

    const farOccluder = new Mesh(
      new BoxGeometry(2, 2, 2),
      new MeshBasicMaterial()
    );
    farOccluder.position.set(0, 0, 8);

    const target = new Mesh(
      new BoxGeometry(1, 1, 1),
      new MeshBasicMaterial()
    );
    target.position.set(0, 0, 0);

    occlusionSystem.registerObject(nearOccluder, { isOccluder: true });
    occlusionSystem.registerObject(farOccluder, { isOccluder: true });
    occlusionSystem.registerObject(target, { isOccludable: true });

    (occlusionSystem as any).update(performance.now());

    const occluders = useOcclusionStore.getState().occluders;
    expect(occluders[target.uuid].visible).toBe(false);

    // Clean up
    nearOccluder.geometry.dispose();
    nearOccluder.material.dispose();
    farOccluder.geometry.dispose();
    farOccluder.material.dispose();
    target.geometry.dispose();
    target.material.dispose();
  });

  it('should handle non-occludable objects correctly', () => {
    const occluder = new Mesh(
      new BoxGeometry(2, 2, 2),
      new MeshBasicMaterial()
    );
    occluder.position.set(0, 0, 5);

    const nonOccludableObject = new Mesh(
      new BoxGeometry(1, 1, 1),
      new MeshBasicMaterial()
    );
    nonOccludableObject.position.set(0, 0, 0);

    occlusionSystem.registerObject(occluder, { isOccluder: true });
    occlusionSystem.registerObject(nonOccludableObject, { isOccludable: false });

    (occlusionSystem as any).update(performance.now());

    const occluders = useOcclusionStore.getState().occluders;
    expect(occluders[nonOccludableObject.uuid].visible).toBe(true);

    // Clean up
    occluder.geometry.dispose();
    occluder.material.dispose();
    nonOccludableObject.geometry.dispose();
    nonOccludableObject.material.dispose();
  });
});
