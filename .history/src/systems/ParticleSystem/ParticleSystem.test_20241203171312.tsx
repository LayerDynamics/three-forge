// src/systems/ParticleSystem/ParticleSystem.test.tsx

import { ParticleSystem } from './ParticleSystem';
import { useParticleStore } from '../../stores/particleStore';
import { EmitterConfig } from '../../types/particle.types';
import { Vector3, Color, Particle } from 'three';

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
      spread: new Vector3(1, 1, 1), // Now correctly a Vector3
      rate: 10,
      burstCount: 0, // Provided as per updated interface
      speed: { min: 1, max: 2 }, // Added as per updated interface
      startColor: new Color(1, 0, 0),
      sizeRange: { min: 0.1, max: 0.5 },
      lifetimeRange: { min: 1, max: 2 },
      massRange: { min: 1, max: 1 },
      drag: 0.1,
      useGravity: true,
      useCollision: true,
      duration: 5, // Optional
      loop: false
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
      burstCount: 0,
      speed: { min: 1, max: 1 },
      startColor: new Color(1, 0, 0),
      sizeRange: { min: 0.1, max: 0.1 },
      lifetimeRange: { min: 1, max: 1 },
      massRange: { min: 1, max: 1 },
      drag: 0,
      useGravity: true,
      useCollision: true,
      loop: false
    };

    const emitter = particleSystem.createEmitter(config);
    emitter.start();
    particleSystem.start();

    // Check after one frame (16ms)
    setTimeout(() => {
      const store = useParticleStore.getState();
      expect(store.particleCount).toBeGreaterThan(0);
      done();
    }, 16);
  });

  it('should handle particle collisions', (done) => {
    const config: EmitterConfig = {
      id: 'test-emitter',
      position: new Vector3(0, 10, 0),
      direction: new Vector3(0, -1, 0),
      spread: new Vector3(0, 0, 0),
      rate: 1,
      burstCount: 0,
      speed: { min: 10, max: 10 },
      startColor: new Color(1, 0, 0),
      sizeRange: { min: 0.1, max: 0.1 },
      lifetimeRange: { min: 2, max: 2 },
      massRange: { min: 1, max: 1 },
      drag: 0,
      useGravity: true,
      useCollision: true,
      loop: false
    };

    const emitter = particleSystem.createEmitter(config);
    emitter.start();
    particleSystem.start();

    // Wait for collision with ground (assuming ground at y=0)
    setTimeout(() => {
      const store = useParticleStore.getState();
      const particles = Object.values(store.particles) as Particle[];
      expect(particles.length).toBeGreaterThan(0);
      const particle = particles[0];
      expect(particle.position.y).toBeGreaterThanOrEqual(0);
      expect(particle.velocity.y).toBeLessThanOrEqual(0); // Should have bounced or stopped
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
      burstCount: 0,
      speed: { min: 1, max: 1 },
      startColor: new Color(1, 0, 0),
      sizeRange: { min: 0.1, max: 0.1 },
      lifetimeRange: { min: 0.1, max: 0.1 },
      massRange: { min: 1, max: 1 },
      drag: 0,
      useGravity: false,
      useCollision: false,
      loop: false
    };

    const emitter = particleSystem.createEmitter(config);
    emitter.start();
    particleSystem.start();

    // Wait for particle to spawn and expire
    setTimeout(() => {
      const store = useParticleStore.getState();
      expect(store.emitters[config.id]).toBeDefined();
      expect(store.particleCount).toBe(1); // One particle created
      // After lifetime, particle should be removed
      setTimeout(() => {
        expect(store.particleCount).toBe(0);
        done();
      }, 200); // 0.1s lifetime + buffer
    }, 16);
  });

  it('should handle emitter duration and looping', (done) => {
    const config: EmitterConfig = {
      id: 'test-emitter',
      position: new Vector3(0, 0, 0),
      direction: new Vector3(0, 1, 0),
      spread: new Vector3(0, 0, 0),
      rate: 10,
      burstCount: 0,
      speed: { min: 1, max: 1 },
      startColor: new Color(1, 0, 0),
      sizeRange: { min: 0.1, max: 0.1 },
      lifetimeRange: { min: 0.5, max: 0.5 },
      massRange: { min: 1, max: 1 },
      drag: 0,
      useGravity: false,
      useCollision: false,
      duration: 0.1, // Duration in seconds
      loop: true
    };

    const emitter = particleSystem.createEmitter(config);
    emitter.start();
    particleSystem.start();

    // After duration + buffer, emitter should still be active because loop is true
    setTimeout(() => {
      const store = useParticleStore.getState();
      expect(store.emitters[config.id]).toBeDefined(); // Should still exist
      done();
    }, 200); // 0.1s duration + buffer
  });

  it('should handle system pause and resume', () => {
    // Implement your pause and resume logic
    // Example:
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
      burstCount: 0,
      speed: { min: 1, max: 1 },
      startColor: new Color(1, 0, 0),
      sizeRange: { min: 0.1, max: 0.1 },
      lifetimeRange: { min: 0.5, max: 0.5 },
      massRange: { min: 1, max: 1 },
      drag: 0,
      useGravity: false,
      useCollision: false,
      loop: false
    };

    const emitter = particleSystem.createEmitter(config);
    particleSystem.start();
    particleSystem.cleanup();

    expect(useParticleStore.getState().emitters[config.id]).toBeUndefined();
    expect(useParticleStore.getState().particles).toEqual({});
    expect(useParticleStore.getState().particleCount).toBe(0);
    expect(particleSystem['frameId']).toBeNull();
  });
});
