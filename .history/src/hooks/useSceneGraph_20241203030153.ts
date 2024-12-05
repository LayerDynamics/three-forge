// useSceneGraph.ts

// Purpose: Provides access to scene-specific state for objects and transformations.
// Depends On: sceneGraphStore.
// Interacts With: SceneGraphSystm, Scene components and LogicEngine.
// src/hooks/useSceneGraph.ts

import { useCallback, useEffect } from "react";
import { Scene } from "three";
import { SceneGraphNode } from "../types/sceneGraph.types";
import { GameEvent, LogicComponent } from "../types/logic.types";
import { Object3D } from "three";
import { EventDispatcher } from "../utils/EventDispatcher";
import { SceneGraphSystemClass } from "../systems/SceneGraphSystem/SceneGraphSystem";

/**
 * Hook: useSceneGraph
 * Provides an interface to interact with the SceneGraphSystem.
 * @param threeScene The Three.js Scene instance.
 * @returns Methods to manipulate the scene graph.
 */
export const useSceneGraph = (threeScene: Scene) => {
  useEffect(() => {
    // Initialize the SceneGraphSystem with configuration and Three.js Scene
    const config = { debug: true };
    const sceneGraphSystem = SceneGraphSystemClass.getInstance(config, threeScene);

    // Cleanup on unmount
    return () => {
      sceneGraphSystem.cleanup();
    };
  }, [threeScene]);

  /**
   * Adds a new object to the scene graph.
   * @param id Unique identifier for the node.
   * @param name Human-readable name for the node.
   * @param object3D The Three.js Object3D instance.
   * @param parentId The ID of the parent node, if any.
   */
  const addObject = useCallback(
    (id: string, name: string, object3D: Object3D, parentId?: string) => {
      const sceneGraphSystem = SceneGraphSystemClass.getInstance({}, threeScene);
      sceneGraphSystem.addObject(id, name, object3D, parentId);
    },
    [threeScene]
  );

  /**
   * Removes an object from the scene graph.
   * @param id The ID of the node to remove.
   */
  const removeObject = useCallback(
    (id: string) => {
      const sceneGraphSystem = SceneGraphSystemClass.getInstance({}, threeScene);
      sceneGraphSystem.removeObject(id);
    },
    [threeScene]
  );

  /**
   * Moves an object to a new parent within the scene graph.
   * @param childId The ID of the child node.
   * @param newParentId The ID of the new parent node.
   */
  const moveObject = useCallback(
    (childId: string, newParentId: string) => {
      const sceneGraphSystem = SceneGraphSystemClass.getInstance({}, threeScene);
      sceneGraphSystem.moveObject(childId, newParentId);
    },
    [threeScene]
  );

  /**
   * Registers a logic component with the SceneGraphSystem.
   * @param component The logic component to register.
   */
  const registerLogicComponent = useCallback(
    (component: LogicComponent) => {
      const sceneGraphSystem = SceneGraphSystemClass.getInstance({}, threeScene);
      sceneGraphSystem.registerLogicComponent(component);
    },
    [threeScene]
  );

  /**
   * Unregisters a logic component from the SceneGraphSystem.
   * @param id The ID of the logic component to unregister.
   */
  const unregisterLogicComponent = useCallback(
    (id: string) => {
      const sceneGraphSystem = SceneGraphSystemClass.getInstance({}, threeScene);
      sceneGraphSystem.unregisterLogicComponent(id);
    },
    [threeScene]
  );

  /**
   * Emits a game event to be processed by the SceneGraphSystem.
   * @param event The game event to emit.
   */
  const emitEvent = useCallback(
    (event: GameEvent) => {
      // Dispatch the event through EventDispatcher
      EventDispatcher.dispatch("NEW_GAME_EVENT", event);
    },
    []
  );

  return {
    addObject,
    removeObject,
    moveObject,
    registerLogicComponent,
    unregisterLogicComponent,
    emitEvent,
  };
};
