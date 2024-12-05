// src/types/particle.types.ts

import {Vector3,Color} from 'three';

export interface Particle {
	id: string;
	position: Vector3;
	velocity: Vector3;
	acceleration: Vector3;
	color: Color;
	size: number;
	life: number;
	maxLife: number;
	mass: number;
	drag: number;
	useGravity: boolean;
	useCollision: boolean;
	opacity: number;
	rotation: {x: number; y: number; z: number};
}

export interface EmitterConfig {
	id: string;
	position: Vector3;
	direction: Vector3;
	spread: Vector3;
	rate: number;
	burstCount: number;
	speed: {min: number; max: number};
	startColor: Color;
	endColor?: Color;
	sizeRange: {min: number; max: number};
	lifetimeRange: {min: number; max: number};
	massRange: {min: number; max: number};
	drag: number;
	useGravity: boolean;
	useCollision: boolean;
	duration?: number;
	loop: boolean;
}

export interface Emitter {
	config: EmitterConfig;
	start: () => void;
	stop: () => void;
	update: (currentTime: number) => void;
}
