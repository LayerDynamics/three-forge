// src/stores/cameraStore.ts

import {create} from 'zustand';
import {Vector3,Euler,Camera} from 'three';
import {CameraState,CameraTransition,CameraMode} from '../types/camera.types';

export const useCameraStore=create<CameraState>((set,get) => ({
	activeCamera: null, // Updated to allow null
	cameras: {},
	transitions: {},
	defaultCamera: null,
	mode: 'thirdPerson',
	target: new Vector3(),
	offset: new Vector3(0,2,5),
	rotation: new Euler(),
	shake: {
		active: false,
		intensity: 0,
		decay: 0.95,
		trauma: 0 // Ensure 'trauma' is included
	},

	setActiveCamera: (id: string|null) => set({activeCamera: id}),

	registerCamera: (id: string,camera: Camera) => set(state => ({
		cameras: {...state.cameras,[id]: camera}
	})),

	unregisterCamera: (id: string) => set(state => {
		const {[id]: removed,...remaining}=state.cameras;
		return {cameras: remaining};
	}),

	addTransition: (transition: CameraTransition) => set(state => ({
		transitions: {...state.transitions,[transition.id]: transition}
	})),

	removeTransition: (id: string) => set(state => {
		const {[id]: removed,...remaining}=state.transitions;
		return {transitions: remaining};
	}),

	setMode: (mode: CameraMode) => set({mode}),

	setTarget: (target: Vector3) => set({target}),

	setOffset: (offset: Vector3) => set({offset}),

	setRotation: (rotation: Euler) => set({rotation}),

	setShake: (intensity: number,decay: number=0.95) => set({
		shake: {
			active: intensity>0,
			intensity,
			decay,
			trauma: intensity
		}
	}),

	updateShake: () => set(state => ({
		shake: {
			...state.shake,
			trauma: state.shake.trauma*state.shake.decay,
			active: state.shake.trauma>0.01
		}
	})),

	reset: () => set({
		activeCamera: null,
		cameras: {},
		transitions: {},
		mode: 'thirdPerson',
		target: new Vector3(),
		offset: new Vector3(0,2,5),
		rotation: new Euler(),
		shake: {
			active: false,
			intensity: 0,
			decay: 0.95,
			trauma: 0
		}
	})
}));
