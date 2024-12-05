// src/hooks/useParticles.ts

import { useEffect, useCallback, useMemo } from 'react';
import { Vector3, Color } from 'three';
import { ParticleSystem } from '../systems/ParticleSystem/ParticleSystem';
import { useParticleStore } from '../stores/particleStore';
import { EmitterConfig } from '../types/particle.types';

export const useParticles = () => {
  const system = ParticleSystem.getInstance();

  useEffect(() => {
    // Start the particle system when the hook is first used
    system.start();

    // Cleanup when the hook is unmounted
    return () => {
      system.stop();
    };
  }, []);

  const createEmitter = useCallback((config: Partial<EmitterConfig> = {}) => {
    const defaultConfig: EmitterConfig = {
      id: `emitter_${Date.now()}`,
      position: new Vector3(0, 0, 0),
      direction: new Vector3(0, 1, 0),
      spread: new Vector3(1, 1, 1),
      rate: 10,
      speed: { min: 1, max: 2 },
      startColor: new Color(1, 1, 1),
      endColor: undefined,
      sizeRange: { min: 0.1, max: 0.5 },
      lifetimeRange: { min: 1, max: 2 },
      massRange: { min: 1, max: 1 },
      drag: 0.1,
      useGravity: true,
      useCollision: true,
      duration: undefined,
      loop: false
    };

    const finalConfig = { ...defaultConfig, ...config };
    return system.createEmitter(finalConfig);
  }, []);

  const removeEmitter = useCallback((id: string) => {
    system.removeEmitter(id);
  }, []);

  const setBounds = useCallback((min: Vector3, max: Vector3) => {
    system.setBounds(min, max);
  }, []);

  const resetSystem = useCallback(() => {
    system.reset();
  }, []);

  // Get particle stats
  const stats = useMemo(() => {
    const store = useParticleStore.getState();
    return {
      activeParticles: store.particleCount,
      emitterCount: Object.keys(store.emitters).length,
      isActive: store.active
    };
  }, [useParticleStore((state) => state.particleCount)]);

  // Create common particle effects
  const createExplosion = useCallback((position: Vector3, options: Partial<EmitterConfig> = {}) => {
    const explosionConfig: EmitterConfig = {
      id: `explosion_${Date.now()}`,
      position: position,
      direction: new Vector3(0, 1, 0),
      spread: new Vector3(1, 1, 1),
      rate: 100,
      speed: { min: 5, max: 10 },
      startColor: new Color(1, 0.5, 0),
      endColor: new Color(1, 0, 0),
      sizeRange: { min: 0.2, max: 0.5 },
      lifetimeRange: { min: 0.5, max: 1 },
      massRange: { min: 1, max: 2 },
      drag: 0.1,
      useGravity: true,
      useCollision: true,
      duration: 0.1,
      loop: false,
      ...options
    };

    const emitter = system.createEmitter(explosionConfig);
    emitter.start();

    // Auto-cleanup after duration
    setTimeout(() => {
      system.removeEmitter(explosionConfig.id);
    }, (explosionConfig.duration || 0) * 1000 + 2000);

    return emitter;
  }, []);

  const createTrail = useCallback((position: Vector3, options: Partial<EmitterConfig> = {}) => {
    const trailConfig: EmitterConfig = {
      id: `trail_${Date.now()}`,
      position: position,
      direction: new Vector3(0, -1, 0),
      spread: new Vector3(0.1, 0.1, 0.1),
      rate: 20,
      speed: { min: 0.1, max: 0.3 },
      startColor: new Color(0.5, 0.5, 1),
      endColor: new Color(0, 0, 0.5),
      sizeRange: { min: 0.1, max: 0.2 },
      lifetimeRange: { min: 0.5, max: 1 },
      massRange: { min: 0.1, max: 0.2 },
      drag: 0.05,
      useGravity: false,
      useCollision: false,
      loop: true,
      ...options
    };

    const emitter = system.createEmitter(trailConfig);
    emitter.start();
    return emitter;
  }, []);

  return {
    createEmitter,
    removeEmitter,
    setBounds,
    resetSystem,
    stats,
    effects: {
      createExplosion,
      createTrail
    },
    // Direct store access for more complex use cases
    particles: useParticleStore((state) => state.particles),
    emitters: useParticleStore((state) => state.emitters)
  };
};
