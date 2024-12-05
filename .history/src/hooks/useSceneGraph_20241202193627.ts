// useSceneGraph.ts

// Purpose: Provides access to scene-specific state for objects and transformations.
// Depends On: sceneGraphStore.
// Interacts With: SceneGraphSystm, Scene components and LogicEngine.
// src/hooks/useSceneGraph.ts

import {useCallback} from "react";
import {SceneGraphSystem} from "../systems/SceneGraphSystem/SceneGraphSystem";
import {SceneGraphNode,GameEvent} from "../types/sceneGraph.types";
import {Object3D,Scene} from "three";

/**
 * Hook: useSceneGraph
 * Provides an interface to interact with the SceneGraphSystem.
 */
export const useSceneGraph=(threeScene: Scene) => {
	// Initialize the SceneGraphSystem with the Three.js Scene
	SceneGraphSystem.initialize({debug: true},threeScene);
	SceneGraphSystem.processEvents();

	/**
	 * Adds a new object to the scene graph.
	 * @param id Unique identifier for the node.
	 * @param name Human-readable name for the node.
	 * @param object3D The Three.js Object3D instance.
	 * @param parentId The ID of the parent node, if any.
	 */
	const addObject=useCallback(
		(id: string,name: string,object3D: Object3D,parentId?: string) => {
			SceneGraphSystem.addObject(id,name,object3D,parentId);
		},
		[]
	);

	/**
	 * Removes an object from the scene graph.
	 * @param id The ID of the node to remove.
	 */
	const removeObject=useCallback(
		(id: string) => {
			SceneGraphSystem.removeObject(id);
		},
		[]
	);

	/**
	 * Moves an object to a new parent within the scene graph.
	 * @param childId The ID of the child node.
	 * @param newParentId The ID of the new parent node, or undefined to detach.
	 */
	const moveObject=useCallback(
		(childId: string,newParentId?: string) => {
			SceneGraphSystem.moveObject(childId,newParentId);
		},
		[]
	);

	/**
	 * Registers a new logic component related to the scene graph.
	 * @param component The LogicComponent to register.
	 */
	const registerLogicComponent=useCallback(
		(component: LogicComponent) => {
			SceneGraphSystem.registerLogicComponent(component);
		},
		[]
	);

	/**
	 * Unregisters a logic component from the scene graph.
	 * @param id The ID of the LogicComponent to unregister.
	 */
	const unregisterLogicComponent=useCallback(
		(id: string) => {
			SceneGraphSystem.unregisterLogicComponent(id);
		},
		[]
	);

	return {
		addObject,
		removeObject,
		moveObject,
		registerLogicComponent,
		unregisterLogicComponent,
	};
};
