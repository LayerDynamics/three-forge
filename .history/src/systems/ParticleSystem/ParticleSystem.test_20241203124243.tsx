// src/systems/ParticleSystem/ParticleSystem.test.ts

import { ParticleSystem } from './ParticleSystem';
import { useParticleStore } from '../../stores/particleStore';
import { Vector3, Color } from 'three';
import { EmitterConfig } from '../../types/particle.types';

describe('ParticleSystem', () => {
  let particleSystem: ParticleSystem;

  beforeEach(() => {
    // Reset the ParticleSystem instance
    (ParticleSystem as any).instance = null;
    particleSystem = ParticleSystem.getInstance(true);

    // Reset the store
    useParticleStore.getState().reset();

    // Mock RAF
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => setTimeout(cb, 16));
  });

  afterEach(() => {
    particleSystem.cleanup();
    jest.restoreAllMocks();
  });

  it('should be a singleton', () => {
    const instance1 = ParticleSystem.getInstance();
    const instance2 = ParticleSystem.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should create and remove emitters', () => {
    const config: EmitterConfig = {
      id: 'test-emitter',
      position: new Vector3(0, 0, 0),
      direction: new Vector3(0, 1, 0),
      spread: new Vector3(1, 1, 1),
      rate: 10,
      speed: { min: 1, max: 2 },
      startColor: new Color(1, 0, 0),
      sizeRange: { min: 0.1, max: 0.5 },
      lifetimeRange: { min: 1, max: 2 },
      massRange: { min: 1, max: 1 },
      drag: 0.1,
      useGravity: true,
      useCollision: true
    };

    const emitter = particleSystem.createEmitter(config);
    expect(useParticleStore.getState().emitters[config.id]).toBeDefined();

    particleSystem.removeEmitter(config.id);
    expect(useParticleStore.getState().emitters[config.id]).toBeUndefined();
  });

  it('should update particles over time', (done) => {
    const config: EmitterConfig = {
      id: 'test-emitter',
      position: new Vector3(0, 10, 0),
      direction: new Vector3(0, 1, 0),
      spread: new Vector3(0, 0, 0),
      rate: 1,
      speed: { min: 1, max: 1 },
      startColor: new Color(1, 0, 0),
      sizeRange: { min: 0.1, max: 0.1 },
      lifetimeRange: { min: 1, max: 1 },
      massRange: { min: 1, max: 1 },
      drag: 0,
      useGravity: true,
      useCollision: true
    };

    const emitter = particleSystem.createEmitter(config);
    emitter.start();
    particleSystem.start();

    // Check after one frame
    setTimeout(() => {
      const particles = Object.values(useParticleStore.getState().particles);
      expect(particles.length).toBeGreaterThan(0);

      const particle = particles[0];
      const initialY = particle.position.y;

      // Check after gravity has affected the particle
      setTimeout(() => {
        const updatedParticle = useParticleStore.getState().particles[particle.id];
        if (updatedParticle) {
          expect(updatedParticle.position.y).toBeLessThan(initialY);
        }
        done();
      }, 100);
    }, 16);
  });

  it('should handle particle collisions', (done) => {
    const config: EmitterConfig = {
      id: 'test-emitter',
      position: new Vector3(0, 10, 0),
      direction: new Vector3(0, -1, 0),
      spread: new Vector3(0, 0, 0),
      rate: 1,
      speed: { min: 10, max: 10 },
      startColor: new Color(1, 0, 0),
      sizeRange: { min: 0.1, max: 0.1 },
      lifetimeRange: { min: 2, max: 2 },
      massRange: { min: 1, max: 1 },
      drag: 0,
      useGravity: true,
      useCollision: true
    };

    const emitter = particleSystem.createEmitter(config);
    emitter.start();
    particleSystem.start();

    // Wait for collision with ground
    setTimeout(() => {
      const particles = Object.values(useParticleStore.getState().particles);
      const particle = particles[0];
      expect(particle.position.y).toBeGreaterThanOrEqual(0);
      expect(particle.velocity.y).toBeGreaterThan(0); // Should bounce
      done();
    }, 500);
  });

  it('should respect particle lifetime', (done) => {
    const config: EmitterConfig = {
      id: 'test-emitter',
      position: new Vector3(0, 0, 0),
      direction: new Vector3(0, 1, 0),
      spread: new Vector3(0, 0, 0),
      rate: 1,
      speed: { min: 1, max: 1 },
      startColor: new Color(1, 0, 0),
      sizeRange: { min: 0.1, max: 0.1 },
      lifetimeRange: { min: 0.1, max: 0.1 }, // Very short lifetime
      massRange: { min: 1, max: 1 },
      drag: 0,
      useGravity: false,
      useCollision: false
    };

    const emitter = particleSystem.createEmitter(config);
    emitter.start();
    particleSystem.start();

    // Wait for particle to spawn
    setTimeout(() => {
      const initialParticles = Object.values(useParticleStore.getState().particles);
      expect(initialParticles.length).toBe(1);

      // Wait for particle to die
      setTimeout(() => {
        const remainingParticles = Object.values(useParticleStore.getState().particles);
        expect(remainingParticles.length).toBe(0);
        done();
      }, 200);
    }, 16);
  });

  it('should handle emitter duration and looping', (done) => {
    const config: EmitterConfig = {
      id: 'test-emitter',
      position: new Vector3(0, 0, 0),
      direction: new Vector3(0, 1, 0),
      spread: new Vector3(0, 0, 0),
      rate: 10,
      duration: 0.1,
      loop: true,
      speed: { min: 1, max: 1 },
      startColor: new Color(1, 0, 0),
      sizeRange: { min: 0.1, max: 0.1 },
      lifetimeRange: { min: 0.5, max: 0.5 },
      massRange: { min: 1, max: 1 },
      drag: 0,
      useGravity: false,
      useCollision: false
    };

    const emitter = particleSystem.createEmitter(config);
    emitter.start();
    particleSystem.start();

    // Wait for first emission cycle
    setTimeout(() => {
      const firstCycleParticles = Object.values(useParticleStore.getState().particles).length;

      // Wait for second emission cycle
      setTimeout(() => {
        const secondCycleParticles = Object.values(useParticleStore.getState().particles).length;
        expect(secondCycleParticles).toBeGreaterThan(0);
        expect(secondCycleParticles).toBeCloseTo(firstCycleParticles, -1);
        done();
      }, 200);
    }, 150);
  });

  it('should handle system pause and resume', () => {
    const config: EmitterConfig = {
      id: 'test-emitter',
      position: new Vector3(0, 0, 0),
      direction: new Vector3(0, 1, 0),
      spread: new Vector3(0, 0, 0),
      rate: 10,
      speed: { min: 1, max: 1 },
      startColor: new Color(1, 0, 0),
      sizeRange: { min: 0.1, max: 0.1 },
      lifetimeRange: { min: 1, max: 1 },
      massRange: { min: 1, max: 1 },
      drag: 0,
      useGravity: false,
      useCollision: false
    };

    const emitter = particleSystem.createEmitter(config);
    emitter.start();
    particleSystem.start();

    particleSystem.stop();
    expect(useParticleStore.getState().active).toBe(false);

    particleSystem.start();
    expect(useParticleStore.getState().active).toBe(true);
  });

  it('should clean up resources properly', () => {
    const config: EmitterConfig = {
      id: 'test-emitter',
      position: new Vector3(0, 0, 0),
      direction: new Vector3(0, 1, 0),
      spread: new Vector3(0, 0, 0),
      rate: 10,
      speed: { min: 1, max: 1 },
      startColor: new Color(1, 0, 0),
      sizeRange: { min: 0.1, max: 0.1 },
      lifetimeRange: { min: 1, max: 1 },
      massRange: { min: 1, max: 1 },
      drag: 0,
      useGravity: false,
      useCollision: false
    };

    const emitter = particleSystem.createEmitter(config);
    emitter.start();
    particleSystem.start();

    particleSystem.cleanup();

    expect(useParticleStore.getState().particles).toEqual({});
    expect(useParticleStore.getState().emitters).toEqual({});
    expect(useParticleStore.getState().active).toBe(true);
    expect(useParticleStore.getState().particleCount).toBe(0);
  });
});
