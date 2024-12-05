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
	id: string; // Added 'id' as a required property
	position: Vector3;
	direction: Vector3;
	spread: Vector3; // Changed from 'number' to 'Vector3'
	rate: number;
	burstCount?: number; // Made optional if not always used
	speed: {min: number; max: number}; // Added based on usage in tests
	startColor: Color;
	endColor?: Color; // Made optional
	sizeRange: {min: number; max: number};
	lifetimeRange: {min: number; max: number};
	massRange: {min: number; max: number};
	drag: number;
	useGravity: boolean;
	useCollision: boolean;
	duration?: number; // Made optional
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
