import {Vector3,Color} from 'three';

export interface Particle {
	id: string;
	position: Vector3;
	velocity: Vector3;
	acceleration: Vector3;
	life: number;
	maxLife: number;
	size: number;
	color: Color;
	opacity: number;
	rotation: Euler;
}

export interface EmitterConfig {
	position: Vector3;
	direction: Vector3;
	spread: number;
	rate: number;
	burstCount: number;
	duration: number;
	loop: boolean;
}

export interface ParticleSystemConfig {
	maxParticles: number;
	usePhysics: boolean;
	collisionEnabled: boolean;
	debug?: boolean;
}

export interface ParticleState {
	particles: Record<string,Particle>;
	emitters: Record<string,EmitterConfig>;
	active: boolean;
	particleCount: number;
}
