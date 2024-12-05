// src/types/ai.types.ts

import { Vector3 } from 'three';

export type AIBehaviorType = 'patrol' | 'combat' | 'flee' | 'idle' | 'flock';

export interface AICondition {
  type: 'health' | 'distance' | 'time' | 'target';
  value: number;
  operator: '<' | '>' | '==' | '>=';
  compare: (entity: AIEntity) => boolean;
}

export interface AIBehavior {
  type: AIBehaviorType;
  priority: number;
  conditions: AICondition[];
  execute: (entity: AIEntity) => void;
  update: (entity: AIEntity, deltaTime: number) => void;
}

export interface AIEntity {
  id: string;
  position: Vector3;
  rotation: Vector3;
  health: number;
  maxHealth: number;
  speed: number;
  currentBehavior: AIBehaviorType;
  targetId?: string;
  path?: Vector3[];
  behaviors: AIBehavior[];
  aggressionLevel: number;
  detectionRange: number;
  attackRange: number;
  lastAttackTime: number;
  attackCooldown: number;
}

export interface AIModifier {
  type: string;
  apply: (entity: AIEntity) => void;
  update: (entity: AIEntity, deltaTime: number) => void;
}

export interface AIState {
  entities: Record<string, AIEntity>;
  behaviorTree: Record<string, AIBehavior>;
  modifiers: Record<string, AIModifier>;
  pathfindingEnabled: boolean;

  // Store Methods
  addEntity: (entity: AIEntity) => void;
  updateEntity: (id: string, updates: Partial<AIEntity>) => void;
  removeEntity: (id: string) => void;
  addBehavior: (behavior: AIBehavior) => void;
  addModifier: (modifier: AIModifier) => void;
  togglePathfinding: () => void;
}

// Pathfinding types remain unchanged
export interface PathNode {
  position: Vector3;
  neighbors: PathNode[];
  gCost: number;
  hCost: number;
  parent?: PathNode;
}

export interface NavigationMesh {
  nodes: PathNode[];
  obstacles: Vector3[];
}