// src/types/physics.types.ts

import {Vector3,Quaternion} from "three";

export type ColliderType="box"|"sphere"|"mesh";

export interface PhysicsBody {
	id: string; // Unique identifier for the physics body
	mass: number; // Weight of the object
	restitution: number; // Bounciness coefficient
	friction: number; // Surface friction coefficient
	velocity: Vector3; // Current velocity
	position: Vector3; // Current position
	rotation: Quaternion; // Current rotation
	collider: ColliderType; // Shape of the collider
	isDynamic: boolean; // If the object is movable
	// Additional properties as needed
}

export interface CollisionEvent {
	bodyA: string; // ID of the first body
	bodyB: string; // ID of the second body
	impactForce: number; // Magnitude of the collision
}

export interface PhysicsState {
	bodies: Record<string,PhysicsBody>; // All active physics bodies
	addBody: (body: PhysicsBody) => void; // Add a physics body
	removeBody: (id: string) => void; // Remove a physics body
	updateBody: (id: string,updates: Partial<PhysicsBody>) => void; // Update a physics body
	handleCollision: (event: CollisionEvent) => void; // Handle a collision event
}

export interface PhysicsConfig {
	gravity?: Vector3; // Gravity vector for the physics world
	debug?: boolean; // Enable debug mode for logging
}
