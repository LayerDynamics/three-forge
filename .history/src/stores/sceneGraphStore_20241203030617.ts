// sceneGraphStore.ts
//Purpose: Tracks all objects and their relationships in the scene graph.
// Interacts With: SceneGraph,GameObject.
// src/stores/sceneGraphStore.ts

import {create} from "zustand";
import {SceneGraphState,SceneGraphNode} from "../types/sceneGraph.types";

/**
 * Zustand store for managing the Scene Graph.
 */
export const useSceneGraphStore=create<SceneGraphState>((set,get) => ({
	nodes: {},

	/**
	 * Adds a new node to the scene graph.
	 * @param node The SceneGraphNode to add.
	 */
	addNode: (node: SceneGraphNode) => {
		set((state) => ({
			nodes: {
				...state.nodes,
				[node.id]: {
					...node,
					childrenIds: node.childrenIds||[],
				},
			},
		}));
		console.log(`SceneGraph: Node added - ${node.id}`);
	},

	/**
	 * Removes a node from the scene graph.
	 * @param id The ID of the node to remove.
	 */
	removeNode: (id: string) => {
		set((state) => {
			const {[id]: removedNode,...remainingNodes}=state.nodes;

			if(!removedNode) {
				console.warn(`SceneGraph: Attempted to remove non-existent node - ${id}`);
				return state;
			}

			// Remove the node from its parent's childrenIds
			if(removedNode.parentId) {
				const parent=state.nodes[removedNode.parentId];
				if(parent) {
					remainingNodes[removedNode.parentId]={
						...parent,
						childrenIds: parent.childrenIds.filter((childId) => childId!==id),
					};
				} else {
					console.warn(`SceneGraph: Parent node ${removedNode.parentId} not found for node ${id}.`);
				}
			}

			// Detach children from the removed node by setting their parentId to undefined
			removedNode.childrenIds.forEach((childId) => {
				const child=state.nodes[childId];
				if(child) {
					remainingNodes[childId]={
						...child,
						parentId: undefined,
					};
				} else {
					console.warn(`SceneGraph: Child node ${childId} not found for node ${id}.`);
				}
			});

			return {nodes: remainingNodes};
		});
		console.log(`SceneGraph: Node removed - ${id}`);
	},

	/**
	 * Updates properties of an existing node.
	 * @param id The ID of the node to update.
	 * @param updatedFields The fields to update.
	 */
	updateNode: (id: string,updatedFields: Partial<SceneGraphNode>) => {
		set((state) => {
			const existingNode=state.nodes[id];
			if(!existingNode) {
				console.warn(`SceneGraph: Attempted to update non-existent node - ${id}`);
				return state;
			}

			return {
				nodes: {
					...state.nodes,
					[id]: {
						...existingNode,
						...updatedFields,
						childrenIds: updatedFields.childrenIds||existingNode.childrenIds,
					},
				},
			};
		});
		console.log(`SceneGraph: Node updated - ${id}`);
	},

	/**
	 * Retrieves a node by its ID.
	 * @param id The ID of the node to retrieve.
	 * @returns The SceneGraphNode or undefined if not found.
	 */
	getNode: (id: string) => {
		return get().nodes[id];
	},

	/**
	 * Sets or changes the parent of a node.
	 * @param childId The ID of the child node.
	 * @param parentId The ID of the new parent node, or undefined to detach.
	 */
	setParent: (childId: string,parentId?: string) => {
		const childNode=get().nodes[childId];
		if(!childNode) {
			console.warn(`SceneGraph: Child node ${childId} not found.`);
			return;
		}

		const currentParentId=childNode.parentId;

		if(currentParentId===parentId) {
			// No change in parent
			return;
		}

		set((state) => {
			const updatedNodes={...state.nodes};

			// Remove child from current parent
			if(currentParentId) {
				const currentParent=state.nodes[currentParentId];
				if(currentParent) {
					updatedNodes[currentParentId]={
						...currentParent,
						childrenIds: currentParent.childrenIds.filter((id) => id!==childId),
					};
				} else {
					console.warn(`SceneGraph: Current parent node ${currentParentId} not found for child ${childId}.`);
				}
			}

			// Set new parent
			if(parentId) {
				const newParent=state.nodes[parentId];
				if(newParent) {
					updatedNodes[parentId]={
						...newParent,
						childrenIds: [...newParent.childrenIds,childId],
					};
				} else {
					console.warn(`SceneGraph: New parent node ${parentId} not found for child ${childId}.`);
				}
				updatedNodes[childId]={
					...childNode,
					parentId,
				};
			} else {
				// Detach from parent
				updatedNodes[childId]={
					...childNode,
					parentId: undefined,
				};
			}

			return {nodes: updatedNodes};
		});

		console.log(`SceneGraph: Node ${childId} parent set to ${parentId}`);
	},
}));
