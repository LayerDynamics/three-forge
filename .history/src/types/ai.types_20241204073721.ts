// src/types/ai.types.ts
export type AIBehaviorType='patrol'|'combat'|'flee'|'idle';

export interface AIBehavior {
	type: AIBehaviorType;
	priority: number;
	conditions: AICondition[];
	execute: (entity: Entity) => void;
}

export interface AIEntity {
	id: string;
	position: Vector3;
	health: number;
	currentBehavior: AIBehaviorType;
	targetId?: string;
	path?: Vector3[];
	behaviors: AIBehavior[];
}

export interface AIState {
	entities: Record<string,AIEntity>;
	behaviorTree: Record<string,AIBehavior>;
	pathfindingGrid: NavigationMesh;
}