// src/types/sceneGraph.types.ts

import { Object3D } from "three";

/**
 * Interface representing a node in the scene graph.
 */
export interface SceneGraphNode {
  id: string; // Unique identifier for the node
  name: string; // Human-readable name
  parentId?: string; // ID of the parent node, if any
  childrenIds: string[]; // IDs of child nodes
  object3D: Object3D; // Three.js Object3D instance
}

/**
 * Interface for the SceneGraph state managed by Zustand.
 */
export interface SceneGraphState {
  nodes: Record<string, SceneGraphNode>; // Map of node IDs to SceneGraphNodes
  addNode: (node: SceneGraphNode) => void; // Function to add a new node
  removeNode: (id: string) => void; // Function to remove a node
  updateNode: (id: string, updatedFields: Partial<SceneGraphNode>) => void; // Update node properties
  getNode: (id: string) => SceneGraphNode | undefined; // Retrieve a node by ID
  setParent: (childId: string, parentId?: string) => void; // Set or change a node's parent
}

/**
 * Interface for configuration options for the SceneGraphSystem.
 */
export interface SceneGraphConfig {
  debug?: boolean; // Enable debug mode for logging
}
