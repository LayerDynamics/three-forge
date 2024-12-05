// src/types/physics.types.ts

import {Vector3} from "three";

export type PhysicsEngine="cannon"|"rapier";

export type ColliderShape=
	|"box"
	|"sphere"
	|"capsule"
	|"cone"
	|"cylinder"
	|"plane"
	|"mesh";

export type BoxArgs=[number,number,number];
export type SphereArgs=[number];
export type CapsuleArgs=[number,number];
export type CylinderArgs=[number,number,number,number];
export type ConeArgs=[number,number,number];
export type PlaneArgs=[number,number];
export type MeshArgs=any[]; // Customize as needed

export type PhysicsBodyArgs=
	|BoxArgs
	|SphereArgs
	|CapsuleArgs
	|CylinderArgs
	|ConeArgs
	|PlaneArgs
	|MeshArgs;

export interface PhysicsBody {
	id: string;
	type: "dynamic"|"static";
	shape: ColliderShape;
	position: Vector3;
	rotation: Vector3;
	mass?: number;
	args?: PhysicsBodyArgs;
	velocity?: Vector3;
	onCollide?: (otherBodyId: string,contactPoint: Vector3) => void;
}

export interface PhysicsConfig {
	engine: PhysicsEngine;
	gravity?: Vector3;
	debug?: boolean;
}

export interface PhysicsState {
	bodies: Record<string,PhysicsBody>;
	addBody: (body: PhysicsBody) => void;
	removeBody: (id: string) => void;
	updateBody: (id: string,updatedBody: Partial<PhysicsBody>) => void;
}
