// src/hooks/useOcclusion.ts

import { useEffect, useCallback } from 'react';
import { Object3D } from 'three';
import { OcclusionSystem } from '../systems/OcclusionSystem/OcclusionSystem';
import { useOcclusionStore } from '../stores/occlusionStore';

export const useOcclusion = () => {
  const registerObject = useCallback((
    object: Object3D,
    options?: { isOccluder?: boolean; isOccludable?: boolean }
  ) => {
    const system = OcclusionSystem.getInstance();
    system.registerObject(object, options);
  }, []);

  const unregisterObject = useCallback((id: string) => {
    const system = OcclusionSystem.getInstance();
    system.unregisterObject(id);
  }, []);

  const isObjectVisible = useCallback((id: string): boolean => {
    return useOcclusionStore.getState().getObjectVisibility(id);
  }, []);

  return {
    registerObject,
    unregisterObject,
    isObjectVisible,
    occluders: useOcclusionStore((state) => state.occluders)
  };
};

