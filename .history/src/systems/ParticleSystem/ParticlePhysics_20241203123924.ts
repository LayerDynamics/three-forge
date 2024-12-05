// physics logic for the particle system
// src/systems/ParticleSystem/ParticlePhysics.ts

import {Vector3} from 'three';
import {Particle} from '../../types/particle.types';

export class ParticlePhysics {
	private static readonly GRAVITY=new Vector3(0,-9.81,0);
	private collisionDamping: number=0.5;

	public updateParticle(particle: Particle,deltaTime: number): void {
		// Update velocity with forces
		if(particle.useGravity) {
			particle.velocity.add(ParticlePhysics.GRAVITY.clone().multiplyScalar(deltaTime));
		}

		// Apply drag
		particle.velocity.multiplyScalar(1-particle.drag*deltaTime);

		// Update position
		particle.position.add(particle.velocity.clone().multiplyScalar(deltaTime));

		// Apply ground collision if enabled
		if(particle.useCollision&&particle.position.y<=0) {
			particle.position.y=0;
			particle.velocity.y=-particle.velocity.y*this.collisionDamping;
			particle.velocity.x*=0.98; // Ground friction
			particle.velocity.z*=0.98;
		}
	}

	public applyForce(particle: Particle,force: Vector3): void {
		particle.velocity.add(force.divideScalar(particle.mass));
	}

	public checkCollision(particle: Particle,bounds: {min: Vector3,max: Vector3}): void {
		if(!particle.useCollision) return;

		const {position,velocity}=particle;
		const {min,max}=bounds;

		// X-axis collision
		if(position.x<min.x) {
			position.x=min.x;
			velocity.x=-velocity.x*this.collisionDamping;
		} else if(position.x>max.x) {
			position.x=max.x;
			velocity.x=-velocity.x*this.collisionDamping;
		}

		// Y-axis collision
		if(position.y<min.y) {
			position.y=min.y;
			velocity.y=-velocity.y*this.collisionDamping;
		} else if(position.y>max.y) {
			position.y=max.y;
			velocity.y=-velocity.y*this.collisionDamping;
		}

		// Z-axis collision
		if(position.z<min.z) {
			position.z=min.z;
			velocity.z=-velocity.z*this.collisionDamping;
		} else if(position.z>max.z) {
			position.z=max.z;
			velocity.z=-velocity.z*this.collisionDamping;
		}
	}
}