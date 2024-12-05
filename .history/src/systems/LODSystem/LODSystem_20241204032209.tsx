 // src/systems/LODSystem/LODSystem.tsx

import create, { SetState } from 'zustand';
import {
  Vector3,
  Camera,
  BufferGeometry,
  MeshBasicMaterial,
  Mesh
} from 'three';
import { LODLevel, LODObject, LODConfig } from '../../types/lod.types';

/**
 * LODState defines the Zustand store state for LODSystem.
 */
interface LODState {
  objects: Record<string, LODObject>;
  setObjects: (objects: Record<string, LODObject>) => void;
  addObject: (lodObject: LODObject) => void;
  removeObject: (id: string) => void;
  resetObjects: () => void;
}

/**
 * Zustand store for managing LOD objects.
 */
export const useLODStore = create<LODState>((set: SetState<LODState>) => ({
  objects: {},
  setObjects: (objects: Record<string, LODObject>) => set({ objects }),
  addObject: (lodObject: LODObject) =>
    set((state) => ({
      objects: { ...state.objects, [lodObject.id]: lodObject }
    })),
  removeObject: (id: string) =>
    set((state) => {
      const { [id]: removed, ...remaining } = state.objects;
      return { objects: remaining };
    }),
  resetObjects: () => set({ objects: {} }),
}));

/**
 * LODSystem manages Level of Detail (LOD) for objects based on camera distance.
 */
export class LODSystem {
  private static instance: LODSystem | null = null;
  private camera: Camera | null = null;
  private config: LODConfig | null = null;
  private debug: boolean = false;

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  /**
   * Retrieves the singleton instance of LODSystem.
   * @param config LOD configuration parameters.
   * @returns LODSystem instance.
   */
  public static getInstance(config?: LODConfig): LODSystem {
    if (!LODSystem.instance) {
      LODSystem.instance = new LODSystem();
    }
    if (config) {
      LODSystem.instance.configure(config);
    }
    return LODSystem.instance;
  }

  /**
   * Configures the LODSystem with the provided settings.
   * @param config LOD configuration parameters.
   */
  private configure(config: LODConfig): void {
    this.config = config;
    this.debug = config.debug || false;
  }

  /**
   * Initializes the LODSystem with the camera.
   * @param camera The camera to use for distance calculations.
   */
  public initialize(camera: Camera): void {
    this.camera = camera;
  }

  /**
   * Registers an object with multiple LOD levels.
   * @param lodObject The LODObject to register.
   */
  public registerObject(lodObject: LODObject): void {
    if (lodObject.levels.length === 0) {
      console.warn(`LODSystem: Object ${lodObject.id} has no LOD levels`);
      return;
    }

    // Sort LOD levels by distance in ascending order
    lodObject.levels.sort((a, b) => a.distance - b.distance);
    lodObject.currentLevel = this.getLODLevelIndex(lodObject);

    // Add object to the store
    useLODStore.getState().addObject(lodObject);
  }

  /**
   * Unregisters an object from the LODSystem.
   * @param id The ID of the object to unregister.
   */
  public unregisterObject(id: string): void {
    useLODStore.getState().removeObject(id);
  }

  /**
   * Updates LOD levels for all registered objects based on camera distance.
   */
  public update(): void {
    if (!this.camera) {
      console.warn('LODSystem: Camera not initialized');
      return;
    }

    const objects = useLODStore.getState().objects;
    const cameraPosition = this.camera.position;

    Object.values(objects).forEach((lodObject: LODObject) => {
      const distance = lodObject.position.distanceTo(cameraPosition);
      const newLevel = this.getLODLevelIndex(lodObject, distance);

      if (newLevel !== lodObject.currentLevel) {
        lodObject.currentLevel = newLevel;
        const newLODLevel = lodObject.levels[newLevel];

        // Update mesh geometry and material
        lodObject.object.geometry.dispose();
        lodObject.object.material.dispose();
        lodObject.object.geometry = newLODLevel.geometry.clone();
        lodObject.object.material = newLODLevel.material.clone();

        // Optionally log debug information
        if (this.debug) {
          console.log(
            `LODSystem: Updated ${lodObject.id} to level ${newLODLevel.id} at distance ${distance}`
          );
        }
      }

      // Update visibility based on maxDistance
      if (this.config && distance > this.config.maxDistance) {
        lodObject.visible = false;
        lodObject.object.visible = false;
      } else {
        lodObject.visible = true;
        lodObject.object.visible = true;
      }
    });
  }

  /**
   * Resets the LODSystem by clearing all registered objects.
   */
  public reset(): void {
    useLODStore.getState().resetObjects();
  }

  /**
   * Cleans up the LODSystem by resetting objects.
   */
  public cleanup(): void {
    this.reset();
  }

  /**
   * Determines the appropriate LOD level index for an object based on distance.
   * @param lodObject The LODObject to evaluate.
   * @param distance Optional distance override. If not provided, calculated from camera.
   * @returns The index of the appropriate LOD level.
   */
  private getLODLevelIndex(lodObject: LODObject, distanceOverride?: number): number {
    const distance = distanceOverride !== undefined
      ? distanceOverride
      : (this.camera?.position.distanceTo(lodObject.position) || 0);

    for (let i = 0; i < lodObject.levels.length; i++) {
      if (distance < lodObject.levels[i].distance) {
        return i;
      }
    }
    return lodObject.levels.length - 1; // Return the lowest detail level
  }
}
