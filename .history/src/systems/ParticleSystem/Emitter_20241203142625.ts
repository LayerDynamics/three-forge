// src/systems/ParticleSystem/Emitter.ts

import {Vector3,Color} from 'three';
import {Particle,EmitterConfig} from '../../types/particle.types';
import {useParticleStore} from '../../stores/particleStore';

export class Emitter {
	private config: EmitterConfig;
	private particleCount: number=0;
	private active: boolean=false;
	private startTime: number;
	private lastEmitTime: number;

	constructor(config: EmitterConfig) {
		this.config=config;
		this.startTime=0;
		this.lastEmitTime=0;
	}

	public start(): void {
		this.active=true;
		this.startTime=performance.now();
		this.lastEmitTime=this.startTime;
	}

	public stop(): void {
		this.active=false;
	}

	public update(currentTime: number): void {
		if(!this.active) return;

		const deltaTime=currentTime-this.lastEmitTime;
		const emitCount=Math.floor(deltaTime*this.config.rate);

		if(emitCount>0) {
			for(let i=0;i<emitCount;i++) {
				this.emitParticle();
			}
			this.lastEmitTime=currentTime;
		}

		// Check duration
		if(this.config.duration&&currentTime-this.startTime>=this.config.duration*1000) { // Assuming duration is in seconds
			if(!this.config.loop) {
				this.stop();
			} else {
				this.startTime=currentTime;
			}
		}
	}

	private emitParticle(): void {
		const particle: Particle={
			id: `particle_${this.config.id}_${this.particleCount++}`,
			position: this.getEmissionPosition(),
			velocity: this.getEmissionVelocity(),
			acceleration: new Vector3(),
			color: this.getEmissionColor(),
			size: this.getRandomRange(this.config.sizeRange),
			life: 0,
			maxLife: this.getRandomRange(this.config.lifetimeRange),
			mass: this.getRandomRange(this.config.massRange),
			drag: this.config.drag,
			useGravity: this.config.useGravity,
			useCollision: this.config.useCollision,
			opacity: 1,
			rotation: {x: 0,y: 0,z: 0} // Assuming rotation is required
		};

		useParticleStore.getState().addParticle(particle);
	}

	private getEmissionPosition(): Vector3 {
		const {position,spread}=this.config;
		return new Vector3(
			position.x+(Math.random()-0.5)*spread.x,
			position.y+(Math.random()-0.5)*spread.y,
			position.z+(Math.random()-0.5)*spread.z
		);
	}

	private getEmissionVelocity(): Vector3 {
		const {direction,speed}=this.config;
		const velocity=direction.clone().normalize();
		return velocity.multiplyScalar(this.getRandomRange(speed));
	}

	private getEmissionColor(): Color {
		const {startColor,endColor}=this.config;
		if(!endColor) return startColor.clone();

		const t=Math.random();
		return new Color().lerpColors(startColor,endColor,t);
	}

	private getRandomRange(range: {min: number; max: number}): number {
		return range.min+Math.random()*(range.max-range.min);
	}
}
