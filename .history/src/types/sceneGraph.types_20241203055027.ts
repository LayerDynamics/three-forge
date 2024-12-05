// src/types/sceneGraph.types.ts

import {Object3D} from "three";

/**
 * Interface representing a node in the scene graph (Store Version).
 * Excludes `object3D` to prevent storing mutable objects.
 */
export interface SceneGraphStoreNode {
	id: string; // Unique identifier for the node
	name: string; // Human-readable name
	parentId?: string; // ID of the parent node, if any
	childrenIds: string[]; // IDs of child nodes
}

/**
 * Interface representing a node in the scene graph (System Version).
 * Includes `object3D` for Three.js instance management.
 */
export interface SceneGraphNode extends SceneGraphStoreNode {
	object3D: Object3D; // Three.js Object3D instance
}

/**
 * Interface for the SceneGraph state managed by Zustand.
 */
export interface SceneGraphState {
	nodes: Record<string,SceneGraphStoreNode>; // Map of node IDs to SceneGraphStoreNodes
	addNode: (node: SceneGraphStoreNode) => void; // Function to add a new node
	removeNode: (id: string) => void; // Function to remove a node
	updateNode: (id: string,updatedFields: Partial<SceneGraphStoreNode>) => void; // Update node properties
	getNode: (id: string) => SceneGraphStoreNode|undefined; // Retrieve a node by ID
	setParent: (childId: string,parentId?: string) => void; // Set or change the parent of a node
}
