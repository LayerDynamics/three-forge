export interface CameraConfig {
  fov: number;
  near: number;
  far: number;
  position: Vector3;
  target: Vector3;
}

export interface CameraTransition {
  id: string;
  startPosition: Vector3;
  endPosition: Vector3;
  startTarget: Vector3;
  endTarget: Vector3;
  duration: number;
  easing: (t: number) => number;
  progress: number;
}

export interface CameraState {
  activeCamera: string;
  cameras: Record<string, THREE.Camera>;
  transitions: Record<string, CameraTransition>;
  shake: {
    active: boolean;
    intensity: number;
    decay: number;
  };
}

export type CameraMode =
  | 'firstPerson'
  | 'thirdPerson'
  | 'orbital'
  | 'cinematic';
