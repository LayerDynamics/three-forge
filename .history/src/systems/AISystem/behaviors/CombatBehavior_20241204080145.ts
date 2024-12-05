// src/systems/AISystem/behaviors/CombatBehavior.ts

import {AIBehavior,AIBehaviorType,AIEntity} from '../../../types/ai.types';
import {Vector3} from 'three';
import {PathfindingSystem} from '../../PathfindingSystem/PathfindingSystem';
import {EventDispatcher} from '../../../utils/EventDispatcher';

export class CombatBehavior implements AIBehavior {
	public type: AIBehaviorType='combat';
	public priority: number=3;
	private pathfindingSystem: PathfindingSystem;
	private repositionThreshold: number=2.0;
	private lastRepositionTime: number=0;
	private repositionCooldown: number=3000; // ms

	constructor(priority: number=3) {
		this.pathfindingSystem=PathfindingSystem.getInstance();
		this.priority=priority;
	}

	public get conditions() {
		return [
			{
				type: 'distance',
				value: 20,
				operator: '<',
				compare: (entity: AIEntity) => {
					if(!entity.targetId) return false;
					// Implement distance check to target
					return true;
				}
			},
			{
				type: 'health',
				value: 0.1,
				operator: '>',
				compare: (entity: AIEntity) => {
					return entity.health/entity.maxHealth>0.1;
				}
			}
		];
	}

	public execute(entity: AIEntity): void {
		if(!entity.targetId) return;

		const currentTime=Date.now();
		const targetPosition=this.getTargetPosition(entity.targetId);
		if(!targetPosition) return;

		const distanceToTarget=entity.position.distanceTo(targetPosition);

		// Check if we should attack
		if(distanceToTarget<=entity.attackRange&&
			currentTime-entity.lastAttackTime>entity.attackCooldown) {
			this.performAttack(entity,targetPosition);
			return;
		}

		// Check if we should reposition
		if(currentTime-this.lastRepositionTime>this.repositionCooldown) {
			const idealPosition=this.calculateIdealPosition(entity,targetPosition);
			if(entity.position.distanceTo(idealPosition)>this.repositionThreshold) {
				this.reposition(entity,idealPosition);
				this.lastRepositionTime=currentTime;
			}
		}

		// Update path to target if needed
		if(!entity.path?.length) {
			const path=this.pathfindingSystem.findPath(entity.position,targetPosition);
			entity.path=path;
		}
	}

	public update(entity: AIEntity,deltaTime: number): void {
		if(!entity.path?.length) return;

		const nextPosition=entity.path[0];
		const direction=nextPosition.clone().sub(entity.position).normalize();

		// Move towards next path point
		entity.position.add(direction.multiplyScalar(entity.speed*deltaTime));

		// Update rotation to face movement direction
		const targetRotation=Math.atan2(direction.x,direction.z);
		entity.rotation.y=this.lerpAngle(entity.rotation.y,targetRotation,5*deltaTime);

		// Remove reached path points
		if(entity.position.distanceTo(nextPosition)<0.5) {
			entity.path.shift();
		}
	}

	private performAttack(entity: AIEntity,targetPosition: Vector3): void {
		entity.lastAttackTime=Date.now();

		// Face target
		const direction=targetPosition.clone().sub(entity.position);
		entity.rotation.y=Math.atan2(direction.x,direction.z);

		// Dispatch attack event
		EventDispatcher.dispatch('AI_ATTACK',{
			attackerId: entity.id,
			targetId: entity.targetId,
			position: entity.position.clone(),
			direction: direction.normalize()
		});
	}

	private calculateIdealPosition(entity: AIEntity,targetPosition: Vector3): Vector3 {
		// Calculate position based on attack range and aggression level
		const directionToTarget=targetPosition.clone().sub(entity.position).normalize();
		const idealDistance=entity.attackRange*(1-(entity.aggressionLevel/5));

		// Add some randomness to prevent predictable positioning
		const angle=Math.random()*Math.PI*2;
		const offset=new Vector3(
			Math.cos(angle)*idealDistance*0.3,
			0,
			Math.sin(angle)*idealDistance*0.3
		);

		return targetPosition.clone()
			.sub(directionToTarget.multiplyScalar(idealDistance))
			.add(offset);
	}

	private reposition(entity: AIEntity,position: Vector3): void {
		const path=this.pathfindingSystem.findPath(entity.position,position);
		entity.path=path;
	}

	private getTargetPosition(targetId: string): Vector3|null {
		// Implement getting target position from game state
		return null;
	}

	private lerpAngle(start: number,end: number,t: number): number {
		const diff=end-start;
		const adjusted=((diff+Math.PI)%(Math.PI*2))-Math.PI;
		return start+adjusted*t;
	}
}