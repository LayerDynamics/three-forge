// SceneGraphSystem.ts: Manages the hierarchical structure of scene objects and their transformations.
// src/systems/SceneGraphSystem/SceneGraphSystem.tsx

import { Object3D, Scene } from "three";
import { SceneGraphConfig, SceneGraphNode } from "../../types/sceneGraph.types";
import { GameEvent, LogicComponent, LogicState } from "../../types/logic.types"; // Added LogicState
import { useSceneGraphStore } from "../../stores/sceneGraphStore";
import { EventDispatcher } from "../../utils/EventDispatcher";

/**
 * Singleton Class: SceneGraphSystemClass
 * Manages the Scene Graph, providing methods to manipulate the hierarchy of objects.
 */
export class SceneGraphSystemClass {
  private static instance: SceneGraphSystemClass | null = null;
  private config: SceneGraphConfig;
  private threeScene: Scene; // Reference to the Three.js Scene

  /**
   * Private constructor to enforce singleton pattern.
   * @param config Configuration options.
   * @param threeScene The Three.js Scene instance.
   */
  private constructor(config: SceneGraphConfig = {}, threeScene: Scene) {
    this.config = config;
    this.threeScene = threeScene;

    if (this.config.debug) {
      console.log("SceneGraphSystem initialized with config:", config);
    }

    // Subscribe to global events if necessary
    EventDispatcher.on("RESET_GAME", () => this.reset());
    this.processEvents(); // Start processing events
  }

  /**
   * Gets the singleton instance of the SceneGraphSystemClass.
   * Initializes the instance if it doesn't exist.
   * @param config Configuration options.
   * @param threeScene The Three.js Scene instance.
   * @returns The singleton instance.
   */
  public static getInstance(config: SceneGraphConfig = {}, threeScene: Scene): SceneGraphSystemClass {
    if (!SceneGraphSystemClass.instance) {
      if (!threeScene) {
        throw new Error("Three.js Scene instance is required to create SceneGraphSystemClass.");
      }
      SceneGraphSystemClass.instance = new SceneGraphSystemClass(config, threeScene);
    }
    return SceneGraphSystemClass.instance;
  }

  /**
   * Adds a new object to the scene graph.
   * @param id Unique identifier for the node.
   * @param name Human-readable name for the node.
   * @param object3D The Three.js Object3D instance.
   * @param parentId The ID of the parent node, if any.
   */
  public addObject(id: string, name: string, object3D: Object3D, parentId?: string): void {
    // Create the SceneGraphNode
    const node: SceneGraphNode = {
      id,
      name,
      parentId,
      childrenIds: [],
      object3D,
    };

    // Add the node to the store
    useSceneGraphStore.getState().addNode(node);

    // Attach to parent if applicable
    if (parentId) {
      useSceneGraphStore.getState().setParent(id, parentId);
      const parentNode = useSceneGraphStore.getState().getNode(parentId);
      if (parentNode) {
        parentNode.object3D.add(object3D);
      } else {
        console.warn(`SceneGraphSystem: Parent node ${parentId} not found.`);
        this.threeScene.add(object3D); // Add to root if parent not found
        useSceneGraphStore.getState().setParent(id, undefined);
      }
    } else {
      // Add to root of the Three.js Scene
      this.threeScene.add(object3D);
    }

    if (this.config.debug) {
      console.log(`SceneGraphSystem: Object added - ${id} (${name})`);
    }
  }

  /**
   * Removes an object from the scene graph.
   * @param id The ID of the node to remove.
   */
  public removeObject(id: string): void {
    const node = useSceneGraphStore.getState().getNode(id);
    if (!node) {
      console.warn(`SceneGraphSystem: Node ${id} not found.`);
      return;
    }

    // Remove from Three.js Scene
    if (node.parentId) {
      const parentNode = useSceneGraphStore.getState().getNode(node.parentId);
      if (parentNode) {
        parentNode.object3D.remove(node.object3D);
      } else {
        this.threeScene.remove(node.object3D);
      }
    } else {
      this.threeScene.remove(node.object3D);
    }

    // Remove from SceneGraphStore
    useSceneGraphStore.getState().removeNode(id);

    if (this.config.debug) {
      console.log(`SceneGraphSystem: Object removed - ${id}`);
    }
  }

  /**
   * Updates the parent of a node, effectively moving it within the scene graph.
   * @param childId The ID of the child node.
   * @param newParentId The ID of the new parent node, or undefined to detach.
   */
  public moveObject(childId: string, newParentId?: string): void {
    const childNode = useSceneGraphStore.getState().getNode(childId);
    if (!childNode) {
      console.warn(`SceneGraphSystem: Child node ${childId} not found.`);
      return;
    }

    const currentParentId = childNode.parentId;

    if (currentParentId === newParentId) {
      // No change in parent
      return;
    }

    // Detach from current parent
    if (currentParentId) {
      const currentParentNode = useSceneGraphStore.getState().getNode(currentParentId);
      if (currentParentNode) {
        currentParentNode.object3D.remove(childNode.object3D);
      } else {
        this.threeScene.remove(childNode.object3D);
      }
    }

    // Attach to new parent
    if (newParentId) {
      const newParentNode = useSceneGraphStore.getState().getNode(newParentId);
      if (newParentNode) {
        newParentNode.object3D.add(childNode.object3D);
        useSceneGraphStore.getState().setParent(childId, newParentId);
      } else {
        console.warn(`SceneGraphSystem: New parent node ${newParentId} not found.`);
        this.threeScene.add(childNode.object3D);
        useSceneGraphStore.getState().setParent(childId, undefined);
      }
    } else {
      // Attach to root of the scene
      this.threeScene.add(childNode.object3D);
      useSceneGraphStore.getState().setParent(childId, undefined);
    }

    if (this.config.debug) {
      console.log(`SceneGraphSystem: Object ${childId} moved to parent ${newParentId}`);
    }
  }

  /**
   * Registers a logic component.
   * @param component The logic component to register.
   */
  public registerLogicComponent(component: LogicComponent): void {
    // Implementation for registering a logic component
    // This could involve adding the component to a separate store or system
    // For example:
    // LogicEngine.registerLogicComponent(component);
    console.log(`SceneGraphSystem: Logic component registered - ${component.id}`);
  }

  /**
   * Unregisters a logic component by ID.
   * @param id The ID of the logic component to unregister.
   */
  public unregisterLogicComponent(id: string): void {
    // Implementation for unregistering a logic component
    // For example:
    // LogicEngine.unregisterLogicComponent(id);
    console.log(`SceneGraphSystem: Logic component unregistered - ${id}`);
  }

  /**
   * Resets the SceneGraphSystem by removing all nodes and clearing the Three.js Scene.
   */
  public reset(): void {
    const nodes = useSceneGraphStore.getState().nodes;
    Object.keys(nodes).forEach((id) => {
      this.removeObject(id);
    });
    if (this.config.debug) {
      console.log("SceneGraphSystem: Reset all objects.");
    }
  }

  /**
   * Handles global game events if necessary.
   * @param event The game event to handle.
   */
  private handleEvent(event: GameEvent): void {
    // Implement any scene graph-related event handling here
    // For example, spawning objects, deleting objects based on events, etc.
    if (this.config.debug) {
      console.log(`SceneGraphSystem: Handling event ${event.type}`);
    }

    switch (event.type) {
      case "SPAWN_OBJECT":
        // Example: Spawn a new object
        const { id, name, object3D, parentId } = event.payload;
        this.addObject(id, name, object3D, parentId);
        break;
      case "REMOVE_OBJECT":
        // Example: Remove an existing object
        this.removeObject(event.payload.id);
        break;
      case "MOVE_OBJECT":
        // Example: Move an object to a new parent
        this.moveObject(event.payload.childId, event.payload.newParentId);
        break;
      default:
        break;
    }
  }

  /**
   * Processes game events by subscribing to the EventDispatcher.
   */
  public processEvents(): void {
    EventDispatcher.on("NEW_GAME_EVENT", (event: GameEvent) => this.handleEvent(event));
  }

  /**
   * Unsubscribes from all events and performs cleanup.
   */
  public cleanup(): void {
    EventDispatcher.off("NEW_GAME_EVENT", (event: GameEvent) => this.handleEvent(event));
  }

  /**
   * Serializes the current state of the SceneGraphSystem.
   * @returns The serialized LogicState.
   */
  public serializeState(): LogicState {
    return useSceneGraphStore.getState();
  }

  /**
   * Deserializes and restores the state of the SceneGraphSystem.
   * @param state The LogicState to restore.
   */
  public deserializeState(state: LogicState): void {
    useSceneGraphStore.setState(state);
  }
}

/**
 * Note:
 * - Ensure that `threeSceneInstance` is properly initialized in your main application
 *   before attempting to get the singleton instance of SceneGraphSystemClass.
 * - Avoid exporting the singleton instance directly here to prevent initialization
 *   issues. Instead, initialize it in your main application file (e.g., App.tsx).
 */

// Export the SceneGraphSystemClass for external use
export default SceneGraphSystemClass;