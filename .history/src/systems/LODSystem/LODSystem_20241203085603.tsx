// src/systems/LODSystem/LODSystem.tsx

import { Object3D, Vector3, Mesh, Material, BufferGeometry, Camera } from 'three';
import { create } from 'zustand';
import { EventDispatcher } from '../../utils/EventDispatcher';
import { useSceneGraphStore } from '../../stores/sceneGraphStore';

export interface LODLevel {
  id: string;
  distance: number;
  geometry: BufferGeometry;
  material: Material;
}

export interface LODObject {
  id: string;
  levels: LODLevel[];
  currentLevel: number;
  object: Object3D;
  position: Vector3;
  visible: boolean;
}

interface LODState {
  objects: Record<string, LODObject>;
  addObject: (object: LODObject) => void;
  removeObject: (id: string) => void;
  updateObjectLevel: (id: string, level: number) => void;
}

export interface LODConfig {
  maxDistance: number;
  levelCount: number;
  debug?: boolean;
}

const useLODStore = create<LODState>((set) => ({
  objects: {},
  addObject: (object) =>
    set((state) => ({
      objects: { ...state.objects, [object.id]: object },
    })),
  removeObject: (id) =>
    set((state) => {
      const { [id]: removed, ...rest } = state.objects;
      return { objects: rest };
    }),
  updateObjectLevel: (id, level) =>
    set((state) => ({
      objects: {
        ...state.objects,
        [id]: { ...state.objects[id], currentLevel: level },
      },
    })),
}));

export class LODSystem {
  private static instance: LODSystem | null = null;
  private config: LODConfig;
  private camera: Camera | null = null;
  private frameId: number | null = null;

  private constructor(config: LODConfig) {
    this.config = config;
    this.camera = null;
    this.frameId = null;
  }

  public static getInstance(config?: LODConfig): LODSystem {
    if (!LODSystem.instance) {
      LODSystem.instance = new LODSystem(config || {
        maxDistance: 1000,
        levelCount: 3,
        debug: false,
      });
    }
    return LODSystem.instance;
  }

  public initialize(camera: Camera): void {
    this.camera = camera;
    this.startUpdate();
    EventDispatcher.on("RESET_GAME", () => this.reset());

    if (this.config.debug) {
      console.log("LODSystem initialized with config:", this.config);
    }
  }

  public registerObject(object: LODObject): void {
    if (!object.levels.length) {
      console.warn(`LODSystem: Object ${object.id} has no LOD levels`);
      return;
    }

    // Sort levels by distance (descending)
    object.levels.sort((a, b) => b.distance - a.distance);

    // Initialize with highest detail level
    object.currentLevel = 0;
    this.updateObjectGeometry(object);

    useLODStore.getState().addObject(object);

    if (this.config.debug) {
      console.log(`LODSystem: Registered object ${object.id} with ${object.levels.length} levels`);
    }
  }

  public unregisterObject(id: string): void {
    useLODStore.getState().removeObject(id);

    if (this.config.debug) {
      console.log(`LODSystem: Unregistered object ${id}`);
    }
  }

  private updateObjectGeometry(object: LODObject): void {
    const level = object.levels[object.currentLevel];
    if (!level) return;

    const mesh = object.object as Mesh;
    if (!mesh.isMesh) return;

    mesh.geometry.dispose();
    mesh.geometry = level.geometry;
    mesh.material = level.material;
  }

  private calculateDistance(objectPosition: Vector3): number {
    if (!this.camera) return 0;
    return objectPosition.distanceTo(this.camera.position);
  }

  private determineAppropriateLevel(distance: number, levels: LODLevel[]): number {
    for (let i = 0; i < levels.length; i++) {
      if (distance <= levels[i].distance) {
        return i;
      }
    }
    return levels.length - 1;
  }

  private update = (): void => {
    if (!this.camera) return;

    const objects = useLODStore.getState().objects;
    const updateObjectLevel = useLODStore.getState().updateObjectLevel;

    Object.values(objects).forEach((object) => {
      const distance = this.calculateDistance(object.position);
      const appropriateLevel = this.determineAppropriateLevel(distance, object.levels);

      if (appropriateLevel !== object.currentLevel) {
        updateObjectLevel(object.id, appropriateLevel);
        this.updateObjectGeometry(object);

        if (this.config.debug) {
          console.log(
            `LODSystem: Object ${object.id} switched to level ${appropriateLevel} at distance ${distance.toFixed(2)}`
          );
        }
      }
    });

    this.frameId = requestAnimationFrame(this.update);
  };

  private startUpdate(): void {
    if (this.frameId === null) {
      this.frameId = requestAnimationFrame(this.update);
    }
  }

  private stopUpdate(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  public reset(): void {
    useLODStore.setState({ objects: {} });
    this.stopUpdate();

    if (this.config.debug) {
      console.log("LODSystem: Reset complete");
    }
  }

  public cleanup(): void {
    this.stopUpdate();
    this.camera = null;
    useLODStore.setState({ objects: {} });

    if (this.config.debug) {
      console.log("LODSystem: Cleanup complete");
    }
  }
}
