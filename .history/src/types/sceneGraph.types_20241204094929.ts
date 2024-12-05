// src/types/sceneGraph.types.ts

/**
 * Represents a node in the Scene Graph.
 */
export interface SceneGraphStoreNode {
	id: string;
	name: string;
	childrenIds: string[];
	parentId?: string; // Made optional to allow undefined
}

/**
 * Represents the state of the Scene Graph in the store.
 */
export interface SceneGraphState {
	nodes: Record<string,SceneGraphStoreNode>;
}