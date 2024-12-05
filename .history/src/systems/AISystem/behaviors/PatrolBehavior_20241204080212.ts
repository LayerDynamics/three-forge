// src/systems/AISystem/behaviors/PatrolBehavior.ts

import {AIBehavior,AIBehaviorType,AIEntity} from '../../../types/ai.types';
import {Vector3} from 'three';
import {PathfindingSystem} from '../../PathfindingSystem/PathfindingSystem';

export class PatrolBehavior implements AIBehavior {
	public type: AIBehaviorType='patrol';
	public priority: number=1;
	private pathfindingSystem: PathfindingSystem;
	private waypointThreshold: number=1.0;
	private patrolPoints: Vector3[];
	private currentWaypointIndex: number=0;

	constructor(patrolPoints: Vector3[],priority: number=1) {
		this.pathfindingSystem=PathfindingSystem.getInstance();
		this.patrolPoints=patrolPoints;
		this.priority=priority;
	}

	public get conditions() {
		return [
			{
				type: 'distance',
				value: 20,
				operator: '>',
				compare: (entity: AIEntity) => {
					if(!entity.targetId) return true;
					// Implement distance check to target
					return true;
				}
			},
			{
				type: 'health',
				value: 0.3,
				operator: '>',
				compare: (entity: AIEntity) => {
					return entity.health/entity.maxHealth>0.3;
				}
			}
		];
	}

	public execute(entity: AIEntity): void {
		const currentWaypoint=this.patrolPoints[this.currentWaypointIndex];

		// Check if we've reached the current waypoint
		if(entity.position.distanceTo(currentWaypoint)<this.waypointThreshold) {
			this.currentWaypointIndex=(this.currentWaypointIndex+1)%this.patrolPoints.length;
			return;
		}

		// Get path to next waypoint
		const path=this.pathfindingSystem.findPath(entity.position,currentWaypoint);
		entity.path=path;
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
		if(entity.position.distanceTo(nextPosition)<this.waypointThreshold) {
			entity.path.shift();
		}
	}

	private lerpAngle(start: number,end: number,t: number): number {
		const diff=end-start;
		const adjusted=((diff+Math.PI)%(Math.PI*2))-Math.PI;
		return start+adjusted*t;
	}
}