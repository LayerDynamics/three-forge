// transform controls component for the sceneinspector 
// Transform controls component for the scene inspector
// Provides UI controls for manipulating position, rotation and scale of objects

import { Vector3, Euler, Object3D } from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

export class SceneTransformControls {
  private transformControls: TransformControls;
  private selectedObject: Object3D | null = null;
  
  constructor(camera: THREE.Camera, domElement: HTMLElement) {
    this.transformControls = new TransformControls(camera, domElement);
    this.transformControls.addEventListener('dragging-changed', this.onDraggingChanged);
    this.transformControls.addEventListener('change', this.onChange);
  }

  public attach(object: Object3D): void {
    this.selectedObject = object;
    this.transformControls.attach(object);
  }

  public detach(): void {
    this.selectedObject = null;
    this.transformControls.detach();
  }

  public setMode(mode: 'translate' | 'rotate' | 'scale'): void {
    this.transformControls.setMode(mode);
