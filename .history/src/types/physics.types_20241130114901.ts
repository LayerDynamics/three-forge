// src/types/physics.types.ts

import {Vector3} from "three";

// Enum for physics engine choices
export type PhysicsEngine="cannon"|"rapier";

// Define the possible collider shapes
export type ColliderShape=
	|"box"
	|"sphere"
	|"capsule"
	|"cone"
	|"cylinder"
	|"plane"
	|"mesh";

// Base interface for a physics body
export interface PhysicsBody {
	id: string; // Unique identifier
	type: "dynamic"|"static"; // Type of body
	shape: ColliderShape; // Shape of the collider
	position: Vector3; // Initial position
	rotation: Vector3; // Initial rotation
	mass?: number; // Mass (for dynamic bodies)
	args?: any[]; // Arguments for the collider shape
	velocity?: Vector3; // Initial velocity
	// Additional properties as needed
	onCollide?: (otherBodyId: string,contactPoint: Vector3) => void; // Collision callback
}

// Physics configuration options
export interface PhysicsConfig {
	engine: PhysicsEngine; // Which physics engine to use
	gravity?: Vector3; // Gravity vector
	debug?: boolean; // Enable debug visuals
}

// Interface for physics state managed by the store
export interface PhysicsState {
	bodies: Record<string,PhysicsBody>; // Map of body IDs to bodies
	addBody: (body: PhysicsBody) => void; // Function to add a physics body
	removeBody: (id: string) => void; // Function to remove a physics body
	updateBody: (id: string,updatedBody: Partial<PhysicsBody>) => void; // Update a body's properties
}