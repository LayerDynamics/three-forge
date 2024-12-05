// src/systems/AISystem/behaviors/FleeBehavior.ts

import {AIBehavior,AIBehaviorType,AIEntity} from '../../../types/ai.types';
import {Vector3} from 'three';
import {PathfindingSystem} from '../../PathfindingSystem/PathfindingSystem';
import {EventDispatcher} from '../../../utils/EventDispatcher';

export class FleeBehavior implements AIBehavior {
	public type: AIBehaviorType='flee';
	public priority: number=4;  // High priority for survival
	private pathfindingSystem: PathfindingSystem;
	private readonly SAFE_DISTANCE=30;
	private readonly PATH_UPDATE_INTERVAL=500;  // ms
	private lastPathUpdateTime: number=0;
	private fleeStartPosition?: Vector3;

	constructor(priority: number=4) {
		this.pathfindingSystem=PathfindingSystem.getInstance();
		this.priority=priority;
	}

	public get conditions() {
		return [
			{
				type: 'health',
				value: 0.3,
				operator: '<',
				compare: (entity: AIEntity) => {
					return entity.health/entity.maxHealth<0.3;
				}
			},
			{
				type: 'distance',
				value: 15,
				operator: '<',
				compare: (entity: AIEntity) => {
					if(!entity.targetId) return false;
					// Implement distance check to threat
					return true;
				}
			}
		];
	}

	public execute(entity: AIEntity): void {
		const currentTime=Date.now();
		if(!this.fleeStartPosition) {
			this.fleeStartPosition=entity.position.clone();
			EventDispatcher.dispatch('AI_FLEE_START',{
				entityId: entity.id,
				position: entity.position
			});
		}

		// Update escape path periodically
		if(currentTime-this.lastPathUpdateTime>this.PATH_UPDATE_INTERVAL) {
			const safePosition=this.findSafePosition(entity);
			if(safePosition) {
				const path=this.pathfindingSystem.findPath(
					entity.position,
					safePosition
				);

				// If we found a valid path, use it
				if(path.length>0) {
					entity.path=path;
					this.lastPathUpdateTime=currentTime;
				}
			}
		}

		// Check if we've reached safety
		if(this.hasSafetyBeenReached(entity)) {
			this.fleeStartPosition=undefined;
			EventDispatcher.dispatch('AI_FLEE_COMPLETE',{
				entityId: entity.id,
				position: entity.position
			});
		}
	}

	public update(entity: AIEntity,deltaTime: number): void {
		if(!entity.path?.length) return;

		const nextPosition=entity.path[0];
		const direction=nextPosition.clone().sub(entity.position).normalize();

		// Move faster while fleeing
		const fleeSpeed=entity.speed*1.5;
		entity.position.add(direction.multiplyScalar(fleeSpeed*deltaTime));

		// Update rotation to face movement direction
		const targetRotation=Math.atan2(direction.x,direction.z);
		entity.rotation.y=this.lerpAngle(
			entity.rotation.y,
			targetRotation,
			8*deltaTime  // Faster rotation while fleeing
		);

		// Remove reached path points
		if(entity.position.distanceTo(nextPosition)<0.5) {
			entity.path.shift();
		}
	}

	private findSafePosition(entity: AIEntity): Vector3|null {
		const threatPosition=this.getThreatPosition(entity);
		if(!threatPosition) return null;

		// Try multiple directions to find a safe position
		for(let i=0;i<8;i++) {
			const angle=(i*Math.PI/4)+(Math.random()*Math.PI/4);
			const testPosition=new Vector3(
				entity.position.x+Math.cos(angle)*this.SAFE_DISTANCE,
				entity.position.y,
				entity.position.z+Math.sin(angle)*this.SAFE_DISTANCE
			);

			// Check if this position is safer than current position
			if(this.isSafePosition(testPosition,threatPosition)) {
				return testPosition;
			}
		}

		return null;
	}

	private hasSafetyBeenReached(entity: AIEntity): boolean {
		if(!this.fleeStartPosition) return false;

		const threatPosition=this.getThreatPosition(entity);
		if(!threatPosition) return true;

		return entity.position.distanceTo(threatPosition)>=this.SAFE_DISTANCE;
	}

	private isSafePosition(position: Vector3,threatPosition: Vector3): boolean {
		// Check if position is far enough from threat
		if(position.distanceTo(threatPosition)<this.SAFE_DISTANCE) {
			return false;
		}

		// Additional safety checks could be added here
		// - Check for cover
		// - Check for other threats
		// - Check for terrain obstacles

		return true;
	}

	private getThreatPosition(entity: AIEntity): Vector3|null {
		if(!entity.targetId) return null;
		// Implement getting threat position from game state
		return null;
	}

	private lerpAngle(start: number,end: number,t: number): number {
		const diff=end-start;
		const adjusted=((diff+Math.PI)%(Math.PI*2))-Math.PI;
		return start+adjusted*t;
	}
}