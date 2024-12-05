// src/systems/ParticleSystem/ParticleSystem.ts

import { Vector3, Color } from 'three';
import { ParticlePhysics } from './ParticlePhysics';
import { Emitter } from './Emitter';
import { useParticleStore } from '../../stores/particleStore';
import { Particle, EmitterConfig } from '../../types/particle.types';
import { EventDispatcher } from '../../utils/EventDispatcher';

export class ParticleSystem {
  private static instance: ParticleSystem | null = null;
  private physics: ParticlePhysics;
  private bounds: { min: Vector3; max: Vector3 };
  private debug: boolean;
  private frameId: number | null = null;

  private constructor(debug: boolean = false) {
    this.physics = new ParticlePhysics();
    this.bounds = {
      min: new Vector3(-100, 0, -100),
      max: new Vector3(100, 100, 100)
    };
    this.debug = debug;
  }

  public static getInstance(debug?: boolean): ParticleSystem {
    if (!ParticleSystem.instance) {
      ParticleSystem.instance = new ParticleSystem(debug);
    }
    return ParticleSystem.instance;
  }

  public createEmitter(config: EmitterConfig): Emitter {
    const emitter = new Emitter(config);
    useParticleStore.getState().addEmitter(emitter);
    return emitter;
  }

  public removeEmitter(id: string): void {
    useParticleStore.getState().removeEmitter(id);
  }

  public start(): void {
    useParticleStore.getState().setActive(true);
    this.update();
  }

  public stop(): void {
    useParticleStore.getState().setActive(false);
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  private update = (): void => {
    const currentTime = performance.now();
    const store = useParticleStore.getState();

    if (!store.active) return;

    // Update emitters
    Object.values(store.emitters).forEach(emitter => {
      emitter.update(currentTime);
    });

    // Update particles
    Object.values(store.particles).forEach(particle => {
      this.updateParticle(particle, currentTime);
    });

    this.frameId = requestAnimationFrame(this.update);
  };

  private updateParticle(particle: Particle, currentTime: number): void {
    // Update lifetime
    particle.life += 1/60; // Assuming 60fps
    if (particle.life >= particle.maxLife) {
      useParticleStore.getState().removeParticle(particle.id);
      return;
    }

    // Update physics
    this.physics.updateParticle(particle, 1/60);
    this.physics.checkCollision(particle, this.bounds);

    // Update color and size based on lifetime
    const lifeFraction = particle.life / particle.maxLife;
    particle.opacity = 1 - lifeFraction;

    // Update store
    useParticleStore.getState().updateParticle(particle.id, particle);
  }

  public setBounds(min: Vector3, max: Vector3): void {
    this.bounds = { min, max };
  }

  public reset(): void {
    useParticleStore.getState().reset();
    if (this.debug) {
      console.log('ParticleSystem: Reset complete');
    }
  }

  public cleanup(): void {
    this.stop();
    this.reset();
    if (this.debug) {
      console.log('ParticleSystem: Cleanup complete');
    }
  }
}
