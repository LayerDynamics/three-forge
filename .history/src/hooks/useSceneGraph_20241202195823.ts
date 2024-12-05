// useSceneGraph.ts

// Purpose: Provides access to scene-specific state for objects and transformations.
// Depends On: sceneGraphStore.
// Interacts With: SceneGraphSystm, Scene components and LogicEngine.
// src/hooks/useSceneGraph.ts

import { useCallback, useEffect } from "react";
import { Scene } from "three";
import { SceneGraphSystem } from "../systems/SceneGraphSystem/SceneGraphSystem";
import { SceneGraphNode } from "../types/sceneGraph.types";
import { GameEvent, LogicComponent } from "../types/logic.types"; // Corrected imports
import { Object3D } from "three";

/**
 * Hook: useSceneGraph
 * Provides an interface to interact with the SceneGraphSystem.
 * @param threeScene The Three.js Scene instance.
 * @returns Methods to manipulate the scene graph.
 */
export const useSceneGraph = (threeScene: Scene) => {
  useEffect(() => {
    // Initialize the SceneGraphSystem with configuration and Three.js Scene
    SceneGraphSystem.initialize({ debug: true }, threeScene);
    SceneGraphSystem.processEvents();

    // Cleanup on unmount
    return () => {
      SceneGraphSystem.cleanup();
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
      SceneGraphSystem.addObject(id, name, object3D, parentId);
    },
    []
  );

  /**
   * Removes an object from the scene graph.
   * @param id The ID of the node to remove.
   */
  const removeObject = useCallback((id: string) => {
    SceneGraphSystem.removeObject(id);
  }, []);

  /**
   * Moves an object to a new parent within the scene graph.
   * @param childId The ID of the child node.
   * @param newParentId The ID of the new parent node, or undefined to detach.
   */
  const moveObject = useCallback((childId: string, newParentId?: string) => {
    SceneGraphSystem.moveObject(childId, newParentId);
  }, []);

  /**
   * Registers a logic component with the SceneGraphSystem.
   * @param component The logic component to register.
   */
  const registerLogicComponent = useCallback((component: LogicComponent) => {
    SceneGraphSystem.registerLogicComponent(component);
  }, []);

  /**
   * Unregisters a logic component from the SceneGraphSystem.
   * @param id The ID of the logic component to unregister.
   */
  const unregisterLogicComponent = useCallback((id: string) => {
    SceneGraphSystem.unregisterLogicComponent(id);
  }, []);

  /**
   * Emits a game event to be processed by the SceneGraphSystem.
   * @param event The game event to emit.
   */
  const emitEvent = useCallback((event: GameEvent) => {
    // Dispatch the event through EventDispatcher
    // Assuming EventDispatcher is already set up to handle "NEW_GAME_EVENT"
    // and that SceneGraphSystem is subscribed to it
    // Otherwise, you can directly call handleEvent if exposed
    EventDispatcher.dispatch("NEW_GAME_EVENT", event);
  }, []);

  return {
    addObject,
    removeObject,
    moveObject,
    registerLogicComponent,
    unregisterLogicComponent,
    emitEvent,
  };
};