// src/systems/LODSystem/LODSystem.test.tsx

import { LODSystem, LODLevel, LODObject } from './LODSystem';
import {
  Camera,
  Vector3,
  BufferGeometry,
  MeshBasicMaterial,
  Mesh,
  BoxGeometry
} from 'three';
import { EventDispatcher } from '../../utils/EventDispatcher';

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
    (LODSystem as any).instance = null;

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
    lodSystem = LODSystem.getInstance({
      maxDistance: 100,
      levelCount: 3,
      debug: true
    });

    lodSystem.initialize(camera);

    // Clear event listeners
    (EventDispatcher as any).events = {};
  });

  afterEach(() => {
    lodSystem.cleanup();

    // Dispose of geometries
    mockGeometryHigh.dispose();
    mockGeometryMed.dispose();
    mockGeometryLow.dispose();
    mockMaterial.dispose();
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

    // Verify the object was registered
    const objects = (lodSystem as any).useLODStore.getState().objects;
    expect(objects['test-object']).toBeDefined();
    expect(objects['test-object'].levels.length).toBe(3);
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

    // Move camera close to object
    camera.position.set(0, 0, 5);
    (lodSystem as any).update();

    const objects = (lodSystem as any).useLODStore.getState().objects;
    expect(objects['test-object'].currentLevel).toBe(0); // Should use high detail

    // Move camera far from object
    camera.position.set(0, 0, 50);
    (lodSystem as any).update();

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

    const objects = (lodSystem as any).useLODStore.getState().objects;
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

    const objects = (lodSystem as any).useLODStore.getState().objects;
    expect(Object.keys(objects).length).toBe(0);
  });

  it('should warn when registering object with no LOD levels', () => {
    const consoleSpy = jest.spyOn(console, 'warn');

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
      expect.stringContaining('has no LOD levels')
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

    const objects = (lodSystem as any).useLODStore.getState().objects;
    expect(objects['test-object'].levels[0].distance).toBe(10); // High detail should be first
    expect(objects['test-object'].levels[1].distance).toBe(100);
  });
});
