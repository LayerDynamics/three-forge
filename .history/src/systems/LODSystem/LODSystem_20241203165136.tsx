// src/systems/LODSystem/LODSystem.tsx

import create from 'zustand';
import {
  Vector3,
  Camera,
  BufferGeometry,
  MeshBasicMaterial,
  Mesh
} from 'three';

/**
 * LODLevel defines each level of detail with associated geometry and material.
 */
export interface LODLevel {
  id: string;
  distance: number;
  geometry: BufferGeometry;
  material: MeshBasicMaterial;
}

/**
 * LODObject represents an object with multiple LOD levels.
 */
export interface LODObject {
  id: string;
  levels: LODLevel[];
  currentLevel: number;
  object: Mesh;
  position: Vector3;
  visible: boolean;
}

/**
 * LODState defines the Zustand store state for LODSystem.
 */
interface LODState {
  objects: Record<string, LODObject>;
  setObjects: (objects: Record<string, LODObject>) => void;
  // Add other state properties and methods as needed
}

/**
 * Zustand store for managing LOD objects.
 */
export const useLODStore = create<LODState>((set) => ({
  objects: {},
  setObjects: (objects) => set({ objects }),
  // Initialize other state properties and methods
}));

/**
 * LODSystem manages Level of Detail (LOD) for objects in the scene.
 */
export class LODSystem {
  private static instance: LODSystem | null = null;
  private maxDistance: number;
  private levelCount: number;
  private debug: boolean;
  private camera: Camera | null = null;

  /**
   * Retrieves the singleton instance of LODSystem.
   * @param config Optional configuration for initializing the system.
   * @returns The singleton instance of LODSystem.
   */
  static getInstance(config?: { maxDistance: number; levelCount: number; debug: boolean }): LODSystem {
    if (!LODSystem.instance) {
      LODSystem.instance = new LODSystem(config);
    }
    return LODSystem.instance;
  }

  /**
   * Constructs a new LODSystem.
   * @param config Configuration parameters for the LODSystem.
   */
  private constructor(config?: { maxDistance: number; levelCount: number; debug: boolean }) {
    this.maxDistance = config?.maxDistance ?? 100;
    this.levelCount = config?.levelCount ?? 3;
    this.debug = config?.debug ?? false;
    // Initialize other properties as needed
  }

  /**
   * Initializes the LODSystem with the provided camera.
   * @param camera The camera used to determine object distances.
   */
  initialize(camera: Camera): void {
    this.camera = camera;
    // Additional initialization logic
  }

  /**
   * Cleans up the LODSystem, removing all registered objects.
   */
  cleanup(): void {
    useLODStore.setState({ objects: {} });
    this.camera = null;
    // Additional cleanup logic
  }

  /**
   * Registers an object with multiple LOD levels.
   * @param lodObject The LODObject to register.
   */
  registerObject(lodObject: LODObject): void {
    if (lodObject.levels.length === 0) {
      console.warn(`LODSystem: Object ${lodObject.id} has no LOD levels`);
      return;
    }

    // Sort levels by distance ascending
    lodObject.levels.sort((a, b) => a.distance - b.distance);

    useLODStore.setState((state) => ({
      objects: { ...state.objects, [lodObject.id]: lodObject }
    }));
  }

  /**
   * Unregisters an object from the LODSystem.
   * @param id The ID of the object to unregister.
   */
  unregisterObject(id: string): void {
    useLODStore.setState((state) => {
      const { [id]: removed, ...remaining } = state.objects;
      return { objects: remaining };
    });
  }

  /**
   * Resets the LODSystem, removing all registered objects.
   */
  reset(): void {
    useLODStore.setState({ objects: {} });
  }

  /**
   * Updates the LOD levels of all registered objects based on camera distance.
   */
  update(): void {
    if (!this.camera) return;

    const cameraPosition = new Vector3();
    this.camera.getWorldPosition(cameraPosition);

    const objects = useLODStore.getState().objects;

    Object.values(objects).forEach((lodObject) => {
      const distance = lodObject.position.distanceTo(cameraPosition);
      let newLevel = lodObject.currentLevel;

      for (let i = 0; i < lodObject.levels.length; i++) {
        if (distance < lodObject.levels[i].distance) {
          newLevel = i;
          break;
        } else {
          newLevel = lodObject.levels.length - 1;
        }
      }

      if (newLevel !== lodObject.currentLevel) {
        lodObject.currentLevel = newLevel;
        lodObject.object.geometry = lodObject.levels[newLevel].geometry;
        lodObject.object.material = lodObject.levels[newLevel].material;

        if (this.debug) {
          console.log(`LODSystem: Updated ${lodObject.id} to level ${newLevel}`);
        }
      }

      lodObject.visible = distance < this.maxDistance;
      lodObject.object.visible = lodObject.visible;
    });
  }
}
