// src/hooks/useCamera.ts

import { useEffect, useCallback } from 'react';
import { Vector3, Euler, Camera } from 'three';
import { useCameraStore } from '../stores/cameraStore';
import { CameraSystem } from '../systems/CameraSystem/CameraSystem';
import { CameraMode, CameraTransition } from '../types/camera.types';

export const useCamera = () => {
  const system = CameraSystem.getInstance();

  useEffect(() => {
    return () => {
      system.cleanup();
    };
  }, []);

  const setActiveCamera = useCallback((id: string) => {
    system.setActiveCamera(id);
  }, []);

  const registerCamera = useCallback((id: string, camera: Camera) => {
    system.registerCamera(id, camera);
  }, []);

  const setTarget = useCallback((target: Vector3) => {
    system.setTarget(target);
  }, []);

  const setOffset = useCallback((offset: Vector3) => {
    system.setOffset(offset);
  }, []);

  const setRotation = useCallback((rotation: Euler) => {
    system.setRotation(rotation);
  }, []);

  const setMode = useCallback((mode: CameraMode) => {
    system.setMode(mode);
  }, []);

  const startTransition = useCallback((transition: CameraTransition) => {
    system.startTransition(transition);
  }, []);

  const shake = useCallback((intensity: number, decay: number = 0.95) => {
    system.shake(intensity, decay);
  }, []);

  return {
    setActiveCamera,
    registerCamera,
    setTarget,
    setOffset,
    setRotation,
    setMode,
    startTransition,
    shake,
    // Direct store access for current state
    activeCamera: useCameraStore(state => state.activeCamera),
    mode: useCameraStore(state => state.mode),
    target: useCameraStore(state => state.target),
    offset: useCameraStore(state => state.offset),
    rotation: useCameraStore(state => state.rotation)
  };
};