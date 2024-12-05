// src/stores/sceneGraphStore.ts

import create from 'zustand';
import {SceneGraphStoreNode,SceneGraphState} from '../types/sceneGraph.types';

/**
 * Zustand store for managing the Scene Graph.
 */
export const useSceneGraphStore=create<SceneGraphState>((set,get) => ({
	nodes: {},

	/**
	 * Adds a new node to the Scene Graph.
	 * @param node The SceneGraphStoreNode to add.
	 */
	addNode: (node: SceneGraphStoreNode) => {
		set((state) => ({
			nodes: {...state.nodes,[node.id]: node},
		}));
	},

	/**
	 * Updates an existing node in the Scene Graph.
	 * @param id The ID of the node to update.
	 * @param updates Partial updates to apply to the node.
	 */
	updateNode: (id: string,updates: Partial<SceneGraphStoreNode>) => {
		set((state) => ({
			nodes: {
				...state.nodes,
				[id]: {...state.nodes[id],...updates},
			},
		}));
	},

	/**
	 * Removes a node from the Scene Graph.
	 * @param id The ID of the node to remove.
	 */
	removeNode: (id: string) => {
		set((state) => {
			const {[id]: removed,...remaining}=state.nodes;
			return {nodes: remaining};
		});
	},

	/**
	 * Sets the parent of a child node.
	 * @param childId The ID of the child node.
	 * @param parentId The ID of the new parent node. Can be undefined to detach.
	 */
	setParent: (childId: string,parentId?: string) => {
		const child=get().nodes[childId];
		if(!child) return;

		set((state) => {
			const updatedNodes={...state.nodes};

			// Remove child from previous parent's childrenIds
			if(child.parentId) {
				const previousParent=updatedNodes[child.parentId];
				if(previousParent) {
					updatedNodes[child.parentId]={
						...previousParent,
						childrenIds: previousParent.childrenIds.filter((id) => id!==childId),
					};
				}
			}

			// Set new parentId
			updatedNodes[childId]={...child,parentId};

			// Add child to new parent's childrenIds
			if(parentId) {
				const newParent=updatedNodes[parentId];
				if(newParent&&!newParent.childrenIds.includes(childId)) {
					updatedNodes[parentId]={
						...newParent,
						childrenIds: [...newParent.childrenIds,childId],
					};
				}
			}

			return {nodes: updatedNodes};
		});
	},

	/**
	 * Retrieves a node by its ID.
	 * @param id The ID of the node to retrieve.
	 * @returns The SceneGraphStoreNode or undefined if not found.
	 */
	getNode: (id: string) => get().nodes[id],
}));