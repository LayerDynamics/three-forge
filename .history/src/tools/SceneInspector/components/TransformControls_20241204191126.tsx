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
  }

  public setSpace(space: 'world' | 'local'): void {
    this.transformControls.setSpace(space);
  }

  public setSize(size: number): void {
    this.transformControls.size = size;
  }

  public setEnabled(enabled: boolean): void {
    this.transformControls.enabled = enabled;
  }

  public getObject(): Object3D | null {
    return this.selectedObject;
  }

  private onDraggingChanged = (event: { value: boolean }): void => {
    if (this.selectedObject) {
      // Update object transform when dragging ends
      if (!event.value) {
        const position = new Vector3();
        const rotation = new Euler();
        const scale = new Vector3();
        
        this.selectedObject.updateMatrixWorld();
        this.selectedObject.matrixWorld.decompose(position, rotation, scale);
      }
    }
  }

  private onChange = (): void => {
    if (this.selectedObject) {
      this.selectedObject.updateMatrix();
    }
  }

  public dispose(): void {
    this.transformControls.dispose();
  }

  public addToScene(scene: THREE.Scene): void {
    scene.add(this.transformControls);
  }

  public removeFromScene(scene: THREE.Scene): void {
    scene.remove(this.transformControls);
  }
}
