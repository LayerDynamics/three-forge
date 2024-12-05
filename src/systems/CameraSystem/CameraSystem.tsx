// camera system is responsible for managing the camera and its position in the game world it is a core system that is required for the game to function properly
//
// src/systems/CameraSystem/CameraSystem.tsx

import { Camera, Vector3, Euler } from 'three';
import { CameraController } from './CameraController';
import { CameraMode, CameraTransition } from '../../types/camera.types';
import { useCameraStore } from '../../stores/cameraStore';

/**
 * CameraSystem manages the camera and its position in the game world.
 */
export class CameraSystem {
  private static instance: CameraSystem | null = null;
  private controllers: Map<string, CameraController> = new Map();
  private activeController: CameraController | null = null;
  private frameId: number | null = null;
  private lastUpdate: number = 0;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): CameraSystem {
    if (!CameraSystem.instance) {
      CameraSystem.instance = new CameraSystem();
    }
    return CameraSystem.instance;
  }

  private initialize(): void {
    this.startUpdate();
  }

  public registerCamera(id: string, camera: Camera): void {
    const controller = new CameraController(camera);
    this.controllers.set(id, controller);
  }

  public unregisterCamera(id: string): void {
    this.controllers.delete(id);
  }

  public setActiveCamera(id: string): void {
    const controller = this.controllers.get(id);
    if (controller) {
      this.activeController = controller;
      // Update the store
      useCameraStore.getState().setActiveCamera(id);
    }
  }

  public setMode(mode: CameraMode): void {
    if (this.activeController) {
      this.activeController.setMode(mode);
      // Update the store
      useCameraStore.getState().setMode(mode);
    }
  }

  public setTarget(target: Vector3): void {
    if (this.activeController) {
      this.activeController.setTarget(target);
      // Update the store
      useCameraStore.getState().setTarget(target);
    }
  }

  public setOffset(offset: Vector3): void {
    if (this.activeController) {
      this.activeController.setOffset(offset);
      // Update the store
      useCameraStore.getState().setOffset(offset);
    }
  }

  public setRotation(rotation: Euler): void {
    if (this.activeController) {
      this.activeController.setRotation(rotation);
      // Update the store
      useCameraStore.getState().setRotation(rotation);
    }
  }

  public startTransition(transition: CameraTransition): void {
    if (this.activeController) {
      this.activeController.startTransition(transition);
      // Update the store
      useCameraStore.getState().addTransition(transition);
    }
  }

  public shake(intensity: number, decay: number = 0.95): void {
    if (this.activeController) {
      this.activeController.setShake(intensity, decay);
      // Update the store
      useCameraStore.getState().setShake(intensity, decay);
    }
  }

  private update = (timestamp: number): void => {
    if (!this.activeController) return;

    const deltaTime = (timestamp - this.lastUpdate) / 1000;
    this.lastUpdate = timestamp;

    this.activeController.update(deltaTime);

    this.frameId = requestAnimationFrame(this.update);
  };

  /**
   * Allows manual updates with specified deltaTime (in seconds).
   * Useful for testing purposes.
   * @param deltaTime Time in seconds since the last update.
   */
  public manualUpdate(deltaTime: number): void {
    if (!this.activeController) return;

    this.activeController.update(deltaTime);
  }

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
    // Reset the store
    useCameraStore.getState().reset();
  }

  // Optional: Getters for testing or other purposes
  public getActiveController(): CameraController | null {
    return this.activeController;
  }

  public getControllers(): Map<string, CameraController> {
    return this.controllers;
  }
}
