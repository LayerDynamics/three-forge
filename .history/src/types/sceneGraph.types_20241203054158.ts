// src/types/sceneGraph.types.ts

import {Object3D} from "three";

/**
 * Interface representing a node in the scene graph for the Zustand store (excludes object3D).
 */
export interface SceneGraphNodeStore {
	id: string; // Unique identifier for the node
	name: string; // Human-readable name
	parentId?: string; // ID of the parent node, if any
	childrenIds: string[]; // IDs of child nodes
}

/**
 * Interface representing a node in the scene graph for the SceneGraphSystem (includes object3D).
 */
export interface SceneGraphNodeSystem extends SceneGraphNodeStore {
	object3D: Object3D; // Three.js Object3D instance
}

/**
 * Interface for the SceneGraph state managed by Zustand.
 */
export interface SceneGraphState {
	nodes: Record<string,SceneGraphNodeStore>; // Map of node IDs to SceneGraphNodes
	addObject: (node: SceneGraphNodeStore) => void; // Function to add a new node
	removeObject: (id: string) => void; // Function to remove a node
	updateObject: (id: string,updatedFields: Partial<SceneGraphNodeStore>) => void; // Update node properties
	getNode: (id: string) => SceneGraphNodeStore|undefined; // Retrieve a node by ID
	setParent: (childId: string,parentId?: string) => void; // Set or change the parent of a node
}
