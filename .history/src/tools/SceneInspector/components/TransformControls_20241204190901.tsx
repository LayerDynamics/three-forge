// transform controls component for the sceneinspector 
// Transform controls component for the scene inspector
// Provides UI controls for manipulating position, rotation and scale of objects

import { Vector3, Euler, Object3D } from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

export class SceneTransformControls {
  private transformControls: TransformControls;
