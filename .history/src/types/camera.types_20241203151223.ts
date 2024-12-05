// src/types/camera.types.ts

import {Vector3,Euler,Camera} from 'three';

export type CameraMode='firstPerson'|'thirdPerson'|'orbital'|'cinematic';

export interface CameraTransition {
	id: string;
	startPosition: Vector3;
	endPosition: Vector3;
	startTarget: Vector3;
	endTarget: Vector3;
	duration: number;
	progress: number;
	easing: (t: number) => number;
}

export interface ShakeState {
	active: boolean;
	intensity: number;
	decay: number;
	trauma: number;
}

export interface CameraState {
	activeCamera: string|null; // Updated to allow null
	cameras: Record<string,Camera>;
	transitions: Record<string,CameraTransition>;
	defaultCamera: Camera|null;
	mode: CameraMode;
	target: Vector3;
	offset: Vector3;
	rotation: Euler;
	shake: ShakeState;

	setActiveCamera: (id: string|null) => void;
	registerCamera: (id: string,camera: Camera) => void;
	unregisterCamera: (id: string) => void;
	addTransition: (transition: CameraTransition) => void;
	removeTransition: (id: string) => void;
	setMode: (mode: CameraMode) => void;
	setTarget: (target: Vector3) => void;
	setOffset: (offset: Vector3) => void;
	setRotation: (rotation: Euler) => void;
	setShake: (intensity: number,decay?: number) => void;
	updateShake: () => void;
	reset: () => void;
}
