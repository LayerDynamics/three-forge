

// src/stores/cameraStore.ts

import { create } from 'zustand';
import { Vector3, Euler, Camera } from 'three';
import { CameraState, CameraTransition, CameraMode } from '../types/camera.types';

export const useCameraStore = create<CameraState>((set, get) => ({
  activeCamera: null,
  cameras: {},
  transitions: {},
  defaultCamera: null,
  mode: 'thirdPerson',
  target: new Vector3(),
  offset: new Vector3(0, 2, 5),
  rotation: new Euler(),
  shake: {
    active: false,
    intensity: 0,
    decay: 0.95,
    trauma: 0
  },

  setActiveCamera: (id: string) => set({ activeCamera: id }),

  registerCamera: (id: string, camera: Camera) => set(state => ({
    cameras: { ...state.cameras, [id]: camera }
  })),

  unregisterCamera: (id: string) => set(state => {
    const { [id]: removed, ...remaining } = state.cameras;
    return { cameras: remaining };
  }),

  addTransition: (transition: CameraTransition) => set(state => ({
    transitions: { ...state.transitions, [transition.id]: transition }
  })),

  removeTransition: (id: string) => set(state => {
    const { [id]: removed, ...remaining } = state.transitions;
    return { transitions: remaining };
  }),

  setMode: (mode: CameraMode) => set({ mode }),

  setTarget: (target: Vector3) => set({ target }),

  setOffset: (offset: Vector3) => set({ offset }),

  setRotation: (rotation: Euler) => set({ rotation }),

  setShake: (intensity: number, decay: number = 0.95) => set({
    shake: {
      active: intensity > 0,
      intensity,
      decay,
      trauma: intensity
    }
  }),

  updateShake: () => set(state => ({
    shake: {
      ...state.shake,
      trauma: state.shake.trauma * state.shake.decay,
      active: state.shake.trauma > 0.01
    }
  })),

  reset: () => set({
    activeCamera: null,
    cameras: {},
    transitions: {},
    mode: 'thirdPerson',
    target: new Vector3(),
    offset: new Vector3(0, 2, 5),
    rotation: new Euler(),
    shake: {
      active: false,
      intensity: 0,
      decay: 0.95,
      trauma: 0
    }
  })
}));

// src/utils/CameraController.ts

import { Camera, Vector3, Euler, Quaternion, MathUtils } from 'three';
import { CameraMode, CameraTransition } from '../types/camera.types';

export class CameraController {
  private camera: Camera;
  private target: Vector3;
  private offset: Vector3;
  private rotation: Euler;
  private currentTransition: CameraTransition | null = null;
  private mode: CameraMode;

  constructor(camera: Camera) {
    this.camera = camera;
    this.target = new Vector3();
    this.offset = new Vector3(0, 2, 5);
    this.rotation = new Euler();
    this.mode = 'thirdPerson';
  }

  public update(deltaTime: number): void {
    if (this.currentTransition) {
      this.updateTransition(deltaTime);
    }

    switch (this.mode) {
      case 'firstPerson':
        this.updateFirstPerson();
        break;
      case 'thirdPerson':
        this.updateThirdPerson();
        break;
      case 'orbital':
        this.updateOrbital();
        break;
      case 'cinematic':
        this.updateCinematic();
        break;
    }
  }

  private updateTransition(deltaTime: number): void {
    if (!this.currentTransition) return;

    this.currentTransition.progress += deltaTime / this.currentTransition.duration;

    if (this.currentTransition.progress >= 1) {
      this.camera.position.copy(this.currentTransition.endPosition);
      this.target.copy(this.currentTransition.endTarget);
      this.currentTransition = null;
      return;
    }

    const t = this.currentTransition.easing(this.currentTransition.progress);
    this.camera.position.lerpVectors(
      this.currentTransition.startPosition,
      this.currentTransition.endPosition,
      t
    );
    this.target.lerpVectors(
      this.currentTransition.startTarget,
      this.currentTransition.endTarget,
      t
    );
  }

  private updateFirstPerson(): void {
    this.camera.position.copy(this.target);
    this.camera.rotation.copy(this.rotation);
  }

  private updateThirdPerson(): void {
    const position = this.target.clone().add(this.offset);
    this.camera.position.copy(position);
    this.camera.lookAt(this.target);
  }

  private updateOrbital(): void {
    const radius = this.offset.length();
    const theta = this.rotation.y;
    const phi = this.rotation.x;

    this.camera.position.set(
      radius * Math.sin(theta) * Math.cos(phi),
      radius * Math.sin(phi),
      radius * Math.cos(theta) * Math.cos(phi)
    ).add(this.target);

    this.camera.lookAt(this.target);
  }

  private updateCinematic(): void {
    // Implement custom cinematic camera behavior
  }

  public setTarget(target: Vector3): void {
    this.target.copy(target);
  }

  public setOffset(offset: Vector3): void {
    this.offset.copy(offset);
  }

  public setRotation(rotation: Euler): void {
    this.rotation.copy(rotation);
  }

  public setMode(mode: CameraMode): void {
    this.mode = mode;
  }

  public startTransition(transition: CameraTransition): void {
    this.currentTransition = transition;
  }

  public applyShake(trauma: number): void {
    if (trauma <= 0) return;

    const shake = trauma * trauma;
    const rotationShake = shake * 0.1;
    const positionShake = shake * 0.3;

    this.camera.position.add(new Vector3(
      MathUtils.randFloat(-1, 1) * positionShake,
      MathUtils.randFloat(-1, 1) * positionShake,
      MathUtils.randFloat(-1, 1) * positionShake
    ));

    this.camera.rotation.x += MathUtils.randFloat(-1, 1) * rotationShake;
    this.camera.rotation.y += MathUtils.randFloat(-1, 1) * rotationShake;
    this.camera.rotation.z += MathUtils.randFloat(-1, 1) * rotationShake;
  }
}
