// src/systems/AISystem/behaviors/PatrolBehavior.ts

import {AIBehavior,AIBehaviorType,AIEntity,AICondition} from '../../../types/ai.types';
import {Vector3} from 'three';
import {PathfindingSystem} from '../../PathfindingSystem/PathfindingSystem';
import {useAIStore} from '../../../stores/aiStore';
import {EventDispatcher} from '../../../utils/EventDispatcher';

export class PatrolBehavior implements AIBehavior {
	public type: AIBehaviorType='patrol';
	public priority: number=1; // Lower priority than combat

	private pathfindingSystem: PathfindingSystem;
	private patrolPoints: Vector3[];
	private currentPatrolIndex: number=0;
	private readonly PATROL_RADIUS: number=15;

	constructor(patrolPoints: Vector3[]=[],priority: number=1) {
		this.priority=priority;
		this.pathfindingSystem=PathfindingSystem.getInstance();
		this.patrolPoints=patrolPoints.length>0? patrolPoints:[new Vector3(),new Vector3()];
	}

	public get conditions(): AICondition[] {
		return [
			{
				type: 'health',
				value: 1, // Always true for patrol
				operator: '>',
				compare: (entity: AIEntity) => true,
			},
			{
				type: 'distance',
				value: 10,
				operator: '<',
				compare: (entity: AIEntity) => {
					if(!entity.targetId) return true; // No target means continue patrolling
					const target=useAIStore.getState().entities[entity.targetId];
					if(!target) return true;
					return entity.position.distanceTo(target.position)>=10;
				},
			},
		];
	}

	public execute(entity: AIEntity): void {
		if(this.patrolPoints.length===0) return;

		const targetPoint=this.patrolPoints[this.currentPatrolIndex];
		const path=this.pathfindingSystem.findPath(entity.position,targetPoint);
		if(path.length>0) {
			entity.path=path;
		} else {
			// If no path found, skip to next patrol point
			this.currentPatrolIndex=(this.currentPatrolIndex+1)%this.patrolPoints.length;
			EventDispatcher.dispatch('AI_PATROL_POINT_UNREACHABLE',{
				entityId: entity.id,
				patrolIndex: this.currentPatrolIndex,
			});
		}
	}

	public update(entity: AIEntity,deltaTime: number): void {
		if(!entity.path||entity.path.length===0) return;

		const targetPosition=entity.path[0];
		const direction=targetPosition.clone().sub(entity.position).normalize();

		// Move towards the patrol point
		entity.position.add(direction.multiplyScalar(entity.speed*deltaTime));

		// Update rotation to face movement direction
		if(direction.lengthSq()>0.001) {
			const targetRotation=Math.atan2(direction.x,direction.z);
			entity.rotation.y=this.lerpAngle(entity.rotation.y,targetRotation,5*deltaTime);
		}

		// Remove reached path points
		if(entity.position.distanceTo(targetPosition)<0.5) {
			entity.path.shift();
			this.currentPatrolIndex=(this.currentPatrolIndex+1)%this.patrolPoints.length;
			EventDispatcher.dispatch('AI_PATROL_POINT_REACHED',{
				entityId: entity.id,
				patrolIndex: this.currentPatrolIndex,
			});
		}
	}

	private lerpAngle(start: number,end: number,t: number): number {
		const diff=end-start;
		const adjusted=((diff+Math.PI)%(Math.PI*2))-Math.PI;
		return start+adjusted*t;
	}
}