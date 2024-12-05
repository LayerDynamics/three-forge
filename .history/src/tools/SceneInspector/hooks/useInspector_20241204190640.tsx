import { useState, useCallback } from 'react';
import { Object3D } from 'three';
import create from 'zustand';

interface InspectorState {
  isVisible: boolean;
  selectedObject: Object3D | null;
  toggleVisibility: () => void;
  setSelectedObject: (object: Object3D | null) => void;
}

export const useInspector = create<InspectorState>((set) => ({
  isVisible: true,
  selectedObject: null,
  toggleVisibility: () => set((state) => ({ isVisible: !state.isVisible })),
  setSelectedObject: (object) => set({ selectedObject: object }),
}));