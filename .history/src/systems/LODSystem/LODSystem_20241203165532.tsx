// src/systems/LODSystem/LODSystem.tsx

import create, { SetState } from 'zustand';
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
  addObject: (lodObject: LODObject) => set((state) => ({
    objects: { ...state.objects, [lodObject.id]: lodObject }
  })),
  removeObject: (id: string) => set((state) => {
    const { [id]: removed, ...remaining } = state.objects;
    return { objects: remaining };
  }),
  resetObjects: () => set({ objects: {} }),
}));
