// camera system is responsible for managing the camera and its position in the game world it is a core system that is required for the game to function properly
//
// src/systems/CameraSystem/CameraSystem.ts

import { Camera, Vector3, Euler } from 'three';
import { CameraController } from './CameraController';
import { useCameraStore } from '../../stores/cameraStore';
import { CameraMode, CameraTransition } from '../../types/camera.types';
import { EventDispatcher } from '../../utils/EventDispatcher';

export class CameraSystem {
  private static instance: CameraSystem | null = null;
  private controllers: Map<string, CameraController>;
  private activeController: CameraController | null;
  private frameId: number | null;
  private lastUpdate: number;
  private debug: boolean;

  private constructor(debug: boolean = false) {
    this.controllers = new Map();
    this.activeController = null;
    this.frameId = null;
    this.lastUpdate = 0;
    this.debug = debug;
  }

  public static getInstance(debug?: boolean): CameraSystem {
    if (!CameraSystem.instance) {
      CameraSystem.instance = new CameraSystem(debug);
    }
    return CameraSystem.instance;
  }

  public registerCamera(id: string, camera: Camera): void {
    const controller = new CameraController(camera);
    this.controllers.set(id, controller);
    useCameraStore.getState().registerCamera(id, camera);

    if (this.debug) {
      console.log(`Camera registered: ${id}`);
    }

    // If this is the first camera, make it active
    if (this.controllers.size === 1) {
      this.setActiveCamera(id);
    }

    this.startUpdate();
  }

  public unregisterCamera(id: string): void {
    this.controllers.delete(id);
    useCameraStore.getState().unregisterCamera(id);

    if (this.debug) {
      console.log(`Camera unregistered: ${id}`);
    }

    if (this.controllers.size === 0) {
      this.stopUpdate();
    }
  }

  public setActiveCamera(id: string): void {
    const controller = this.controllers.get(id);
    if (!controller) {
      console.warn(`Camera ${id} not found`);
      return;
    }

    this.activeController = controller;
    useCameraStore.getState().setActiveCamera(id);

    if (this.debug) {
      console.log(`Active camera set to: ${id}`);
    }

    EventDispatcher.dispatch('CAMERA_CHANGED', { id });
  }

  public setTarget(target: Vector3): void {
    if (!this.activeController) return;
    this.activeController.setTarget(target);
    useCameraStore.getState().setTarget(target);
  }

  public setOffset(offset: Vector3): void {
    if (!this.activeController) return;
    this.activeController.setOffset(offset);
    useCameraStore.getState().setOffset(offset);
  }

  public setRotation(rotation: Euler): void {
    if (!this.activeController) return;
    this.activeController.setRotation(rotation);
    useCameraStore.getState().setRotation(rotation);
  }

  public setMode(mode: CameraMode): void {
    if (!this.activeController) return;
    this.activeController.setMode(mode);
    useCameraStore.getState().setMode(mode);

    if (this.debug) {
      console.log(`Camera mode set to: ${mode}`);
    }
  }

  public startTransition(transition: CameraTransition): void {
    if (!this.activeController) return;
    this.activeController.startTransition(transition);
    useCameraStore.getState().addTransition(transition);

    EventDispatcher.dispatch('CAMERA_TRANSITION_STARTED', {
      id: transition.id,
      duration: transition.duration
    });
  }

  public shake(intensity: number, decay: number = 0.95): void {
    if (!this.activeController) return;
    useCameraStore.getState().setShake(intensity, decay);
  }

  private update = (timestamp: number): void => {
    if (!this.activeController) return;

    const deltaTime = (timestamp - this.lastUpdate) / 1000;
    this.activeController.update(deltaTime);

    // Update camera shake
    const shakeState = useCameraStore.getState().shake;
    if (shakeState.active) {
      this.activeController.applyShake(shakeState.trauma);
      useCameraStore.getState().updateShake();
    }

    this.lastUpdate = timestamp;
    this.frameId = requestAnimationFrame(this.update);
  };

  private startUpdate(): void {
    if (this.frameId === null) {
      this.lastUpdate = performance.now();
      this.frameId = requestAnimationFrame(this.update);
    }
  }

  private stopUpdate(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  public cleanup(): void {
    this.stopUpdate();
    this.controllers.clear();
    this.activeController = null;
    useCameraStore.getState().reset();

    if (this.debug) {
      console.log('Camera system cleaned up');
    }
  }
}
