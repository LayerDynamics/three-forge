// src/systems/LODSystem/LODSystem.test.tsx

import { LODSystem } from './LODSystem';
import { LODLevel, LODObject } from '../../types/lod.types';
import {
  Camera,
  Vector3,
  BufferGeometry,
  MeshBasicMaterial,
  Mesh,
  BoxGeometry
} from 'three';
import { useLODStore } from './LODSystem'; // Correct import path

describe('LODSystem', () => {
  let lodSystem: LODSystem;
  let camera: Camera;
  let mockGeometryHigh: BufferGeometry;
  let mockGeometryMed: BufferGeometry;
  let mockGeometryLow: BufferGeometry;
  let mockMaterial: MeshBasicMaterial;
  let mockObject: Mesh;

  beforeEach(() => {
    // Reset the LODSystem instance
    LODSystem.resetInstance(); // Utilize the new resetInstance method
    lodSystem = LODSystem.getInstance({
      maxDistance: 100,
      levelCount: 3,
      debug: true
    });

    // Create mock geometries with different complexities
    mockGeometryHigh = new BoxGeometry(1, 1, 1, 32, 32, 32);
    mockGeometryMed = new BoxGeometry(1, 1, 1, 16, 16, 16);
    mockGeometryLow = new BoxGeometry(1, 1, 1, 8, 8, 8);

    mockMaterial = new MeshBasicMaterial();
    mockObject = new Mesh(mockGeometryHigh, mockMaterial);

    // Create a mock camera
    camera = new Camera();
    camera.position.set(0, 0, 10);

    // Initialize LODSystem with test configuration
    lodSystem.initialize(camera);

    // Reset the LOD store state before each test
    useLODStore.setState({ objects: {} });

    // Mock console methods if necessary
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    lodSystem.cleanup();

    // Dispose of geometries
    mockGeometryHigh.dispose();
    mockGeometryMed.dispose();
    mockGeometryLow.dispose();
    mockMaterial.dispose();

    // Restore console methods
    jest.restoreAllMocks();
  });

  it('should be a singleton', () => {
    const instance1 = LODSystem.getInstance();
    const instance2 = LODSystem.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should register an object with multiple LOD levels', () => {
    const levels: LODLevel[] = [
      {
        id: 'high',
        distance: 10,
        geometry: mockGeometryHigh,
        material: mockMaterial
      },
      {
        id: 'medium',
        distance: 50,
        geometry: mockGeometryMed,
        material: mockMaterial
      },
      {
        id: 'low',
        distance: 100,
        geometry: mockGeometryLow,
        material: mockMaterial
      }
    ];

    const lodObject: LODObject = {
      id: 'test-object',
      levels,
      currentLevel: 0,
      object: mockObject,
      position: new Vector3(0, 0, 0),
      visible: true
    };

    lodSystem.registerObject(lodObject);

    // Verify the object was registered using the imported useLODStore
    const objects = useLODStore.getState().objects;
    expect(objects['test-object']).toBeDefined();
    expect(objects['test-object'].levels.length).toBe(3);
    expect(objects['test-object'].currentLevel).toBe(0);
    expect(objects['test-object'].visible).toBe(true);
  });

  it('should update LOD levels based on camera distance', () => {
    const levels: LODLevel[] = [
      {
        id: 'high',
        distance: 10,
        geometry: mockGeometryHigh,
        material: mockMaterial
      },
      {
        id: 'low',
        distance: 100,
        geometry: mockGeometryLow,
        material: mockMaterial
      }
    ];

    const lodObject: LODObject = {
      id: 'test-object',
      levels,
      currentLevel: 0,
      object: mockObject,
      position: new Vector3(0, 0, 0),
      visible: true
    };

    lodSystem.registerObject(lodObject);

    // Initial state: camera at (0,0,10), distance = 10
    lodSystem.update();
    let objects = useLODStore.getState().objects;
    expect(objects['test-object'].currentLevel).toBe(0); // Should use high detail

    // Move camera close to object: distance = 5
    camera.position.set(0, 0, 5);
    lodSystem.update();
    objects = useLODStore.getState().objects;
    expect(objects['test-object'].currentLevel).toBe(0); // Still high detail

    // Move camera far from object: distance = 50
    camera.position.set(0, 0, 50);
    lodSystem.update();
    objects = useLODStore.getState().objects;
    expect(objects['test-object'].currentLevel).toBe(1); // Should use low detail
  });

  it('should handle object unregistration', () => {
    const lodObject: LODObject = {
      id: 'test-object',
      levels: [{
        id: 'high',
        distance: 10,
        geometry: mockGeometryHigh,
        material: mockMaterial
      }],
      currentLevel: 0,
      object: mockObject,
      position: new Vector3(0, 0, 0),
      visible: true
    };

    lodSystem.registerObject(lodObject);
    lodSystem.unregisterObject('test-object');

    const objects = useLODStore.getState().objects;
    expect(objects['test-object']).toBeUndefined();
  });

  it('should handle system reset', () => {
    const lodObject: LODObject = {
      id: 'test-object',
      levels: [{
        id: 'high',
        distance: 10,
        geometry: mockGeometryHigh,
        material: mockMaterial
      }],
      currentLevel: 0,
      object: mockObject,
      position: new Vector3(0, 0, 0),
      visible: true
    };

    lodSystem.registerObject(lodObject);
    lodSystem.reset();

    const objects = useLODStore.getState().objects;
    expect(Object.keys(objects).length).toBe(0);
  });

  it('should warn when registering object with no LOD levels', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const lodObject: LODObject = {
      id: 'test-object',
      levels: [],
      currentLevel: 0,
      object: mockObject,
      position: new Vector3(0, 0, 0),
      visible: true
    };

    lodSystem.registerObject(lodObject);

    expect(consoleSpy).toHaveBeenCalledWith(
      `LODSystem: Object test-object has no LOD levels`
    );
  });

  it('should sort LOD levels by distance on registration', () => {
    const levels: LODLevel[] = [
      {
        id: 'low',
        distance: 100,
        geometry: mockGeometryLow,
        material: mockMaterial
      },
      {
        id: 'high',
        distance: 10,
        geometry: mockGeometryHigh,
        material: mockMaterial
      }
    ];

    const lodObject: LODObject = {
      id: 'test-object',
      levels,
      currentLevel: 0,
      object: mockObject,
      position: new Vector3(0, 0, 0),
      visible: true
    };

    lodSystem.registerObject(lodObject);

    const objects = useLODStore.getState().objects;
    expect(objects['test-object'].levels[0].distance).toBe(10); // High detail should be first
    expect(objects['test-object'].levels[1].distance).toBe(100);
  });

  it('should update target and offset', () => {
    const highGeometry = new BoxGeometry(1, 1, 1, 32, 32, 32);
    const lowGeometry = new BoxGeometry(1, 1, 1, 8, 8, 8);
    const levels: LODLevel[] = [
      {
        id: 'high',
        distance: 10,
        geometry: highGeometry,
        material: mockMaterial
      },
      {
        id: 'low',
        distance: 100,
        geometry: lowGeometry,
        material: mockMaterial
      }
    ];

    const lodObject: LODObject = {
      id: 'test-object',
      levels,
      currentLevel: 0,
      object: mockObject,
      position: new Vector3(1, 1, 1),
      visible: true
    };

    lodSystem.registerObject(lodObject);

    // Verify initial state
    let objects = useLODStore.getState().objects;
    expect(objects['test-object']).toBeDefined();
    expect(objects['test-object'].position).toEqual(new Vector3(1, 1, 1));
    expect(objects['test-object'].visible).toBe(true);

    // Update position
    objects['test-object'].position.set(2, 2, 2);
    lodSystem.update();

    // Simulate updates to allow position-based LOD changes
    const totalUpdates = 50;
    const deltaTime = 1 / 60; // Simulate 60 FPS

    for (let i = 0; i < totalUpdates; i++) {
      lodSystem.update();
    }

    // Since position is set to (2,2,2), distance should be calculated accordingly
    // Assuming camera is at (0,0,10), distance = sqrt(4 + 4 + 64) = sqrt(72) ≈ 8.485
    // Should still be at high detail (distance < 10)
    objects = useLODStore.getState().objects;
    expect(objects['test-object'].currentLevel).toBe(0);
    expect(objects['test-object'].visible).toBe(true);
  });
});
