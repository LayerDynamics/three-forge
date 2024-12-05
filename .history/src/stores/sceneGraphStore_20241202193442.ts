// sceneGraphStore.ts
//Purpose: Tracks all objects and their relationships in the scene graph.
// Interacts With: SceneGraph,GameObject.
// src/stores/sceneGraphStore.ts

import { create } from "zustand";
import { SceneGraphState, SceneGraphNode } from "../types/sceneGraph.types";

/**
 * Zustand store for managing the Scene Graph.
 */
export const useSceneGraphStore = create<SceneGraphState>((set, get) => ({
  nodes: {},

  /**
   * Adds a new node to the scene graph.
   * @param node The SceneGraphNode to add.
   */
  addNode: (node: SceneGraphNode) => {
    set((state) => ({
      nodes: {
        ...state.nodes,
        [node.id]: node,
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
      const { [id]: removedNode, ...remainingNodes } = state.nodes;

      // Remove the node from its parent's childrenIds
      if (removedNode.parentId) {
        const parent = remainingNodes[removedNode.parentId];
        if (parent) {
          parent.childrenIds = parent.childrenIds.filter((childId) => childId !== id);
        }
      }

      // Remove the node from its children's parentId
      removedNode.childrenIds.forEach((childId) => {
        const child = remainingNodes[childId];
        if (child) {
          child.parentId = undefined;
        }
      });

      return { nodes: remainingNodes };
    });
    console.log(`SceneGraph: Node removed - ${id}`);
  },

  /**
   * Updates properties of an existing node.
   * @param id The ID of the node to update.
   * @param updatedFields The fields to update.
   */
  updateNode: (id: string, updatedFields: Partial<SceneGraphNode>) => {
    set((state) => ({
      nodes: {
        ...state.nodes,
        [id]: {
          ...state.nodes[id],
          ...updatedFields,
        },
      },
    }));
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
  setParent: (childId: string, parentId?: string) => {
    const childNode = get().nodes[childId];
    if (!childNode) {
      console.warn(`SceneGraph: Child node ${childId} not found.`);
      return;
    }

    const currentParentId = childNode.parentId;

    if (currentParentId === parentId) {
      // No change in parent
      return;
    }

    set((state) => {
      const updatedNodes = { ...state.nodes };

      // Remove child from current parent
      if (currentParentId) {
        const currentParent = updatedNodes[currentParentId];
        if (currentParent) {
          currentParent.childrenIds = currentParent.childrenIds.filter((id) => id !== childId);
        }
      }

      // Set new parent
      if (parentId) {
        const newParent = updatedNodes[parentId];
        if (newParent) {
          newParent.childrenIds.push(childId);
        } else {
          console.warn(`SceneGraph: New parent node ${parentId} not found.`);
        }
        updatedNodes[childId] = {
          ...updatedNodes[childId],
          parentId,
        };
      } else {
        // Detach from parent
        updatedNodes[childId] = {
          ...updatedNodes[childId],
          parentId: undefined,
        };
      }

      return { nodes: updatedNodes };
    });

    console.log(`SceneGraph: Node ${childId} parent set to ${parentId}`);
  },
}));
