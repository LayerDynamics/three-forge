// src/stores/sceneGraphStore.ts

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { SceneGraphState, SceneGraphNode } from "../types/sceneGraph.types";

/**
 * Zustand store for managing the Scene Graph.
 * Note: `object3D` has been removed from SceneGraphNode to prevent storing mutable objects.
 */
export const useSceneGraphStore = create<SceneGraphState & {
  addObject: (node: SceneGraphNode) => void;
  removeObject: (id: string) => void;
  updateObject: (id: string, updates: Partial<SceneGraphNode>) => void;
  setParent: (childId: string, parentId?: string) => void;
}>()(
  devtools((set, get) => ({
    nodes: {},

    /**
     * Adds a new object to the scene graph.
     * @param node The SceneGraphNode to add (excluding `object3D`).
     */
    addObject: (node: SceneGraphNode) => {
      set((state) => ({
        nodes: {
          ...state.nodes,
          [node.id]: {
            ...node,
            childrenIds: node.childrenIds || [],
          },
        },
      }));
      console.log(`SceneGraph: Object added - ${node.id}`);
    },

    /**
     * Removes an object from the scene graph.
     * @param id The ID of the object to remove.
     */
    removeObject: (id: string) => {
      set((state) => {
        const { [id]: removedNode, ...remainingNodes } = state.nodes;

        if (!removedNode) {
          console.warn(`SceneGraph: Attempted to remove non-existent object - ${id}`);
          return state;
        }

        // Remove the node from its parent's childrenIds
        if (removedNode.parentId) {
          const parent = state.nodes[removedNode.parentId];
          if (parent) {
            remainingNodes[removedNode.parentId] = {
              ...parent,
              childrenIds: parent.childrenIds.filter((childId) => childId !== id),
            };
          } else {
            console.warn(`SceneGraph: Parent object ${removedNode.parentId} not found for object ${id}.`);
          }
        }

        // Detach children from the removed node by setting their parentId to undefined
        removedNode.childrenIds.forEach((childId) => {
          const child = state.nodes[childId];
          if (child) {
            remainingNodes[childId] = {
              ...child,
              parentId: undefined,
            };
          } else {
            console.warn(`SceneGraph: Child object ${childId} not found for object ${id}.`);
          }
        });

        return { nodes: remainingNodes };
      });
      console.log(`SceneGraph: Object removed - ${id}`);
    },

    /**
     * Updates properties of an existing object.
     * @param id The ID of the object to update.
     * @param updatedFields The fields to update (excluding `object3D`).
     */
    updateObject: (id: string, updatedFields: Partial<SceneGraphNode>) => {
      set((state) => {
        const existingNode = state.nodes[id];
        if (!existingNode) {
          console.warn(`SceneGraph: Attempted to update non-existent object - ${id}`);
          return {};
        }

        return {
          nodes: {
            ...state.nodes,
            [id]: {
              ...existingNode,
              ...updatedFields,
              childrenIds: updatedFields.childrenIds || existingNode.childrenIds,
            },
          },
        };
      });
      console.log(`SceneGraph: Object updated - ${id}`, updatedFields);
    },

    /**
     * Sets or changes the parent of an object.
     * @param childId The ID of the child object.
     * @param parentId The ID of the new parent object, or undefined to detach.
     */
    setParent: (childId: string, parentId?: string) => {
      const childNode = get().nodes[childId];
      if (!childNode) {
        console.warn(`SceneGraph: Child object ${childId} not found.`);
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
          const currentParent = state.nodes[currentParentId];
          if (currentParent) {
            updatedNodes[currentParentId] = {
              ...currentParent,
              childrenIds: currentParent.childrenIds.filter((id) => id !== childId),
            };
          } else {
            console.warn(`SceneGraph: Current parent object ${currentParentId} not found for child ${childId}.`);
          }
        }

        // Set new parent
        if (parentId) {
          const newParent = state.nodes[parentId];
          if (newParent) {
            updatedNodes[parentId] = {
              ...newParent,
              childrenIds: [...newParent.childrenIds, childId],
            };
          } else {
            console.warn(`SceneGraph: New parent object ${parentId} not found for child ${childId}.`);
          }
          updatedNodes[childId] = {
            ...childNode,
            parentId,
          };
        } else {
          // Detach from parent
          updatedNodes[childId] = {
            ...childNode,
            parentId: undefined,
          };
        }

        return { nodes: updatedNodes };
      });

      console.log(`SceneGraph: Object ${childId} parent set to ${parentId}`);
    },
  }))
);
