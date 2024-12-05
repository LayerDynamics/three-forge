// src/systems/SceneGraphSystem/SceneGraphSystem.tsx

import { Object3D, Scene } from "three";
import {
  SceneGraphConfig,
  SceneGraphStoreNode,
  SceneGraphState,
} from "../../types/sceneGraph.types";
import { GameEvent, LogicComponent } from "../../types/logic.types";
import { useSceneGraphStore } from "../../stores/sceneGraphStore";
import { useLogicStore } from "../../stores/logicStore";
import { EventDispatcher } from "../../utils/EventDispatcher";

/**
 * Singleton Class: SceneGraphSystemClass
 * Manages the Scene Graph, providing methods to manipulate the hierarchy of objects.
 * Note: `object3D` is managed separately to prevent store mutations.
 */
export class SceneGraphSystemClass {
  private static instance: SceneGraphSystemClass | null = null;
  private config: SceneGraphConfig;
  private threeScene: Scene; // Reference to the Three.js Scene
  private logicComponents: Record<string, LogicComponent> = {};
  private eventInterval: NodeJS.Timeout | null = null;
  private resetGameListener: (() => void) | null = null;

  // Separate map to manage Object3D instances outside of the Zustand store
  private object3DMap: Record<string, Object3D> = {};

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

    // Define the reset listener as a named function
    this.resetGameListener = () => this.reset();

    // Subscribe to global events if necessary
    EventDispatcher.on("RESET_GAME", this.resetGameListener);

    this.processEvents(); // Start processing events
  }

  /**
   * Retrieves the singleton instance of SceneGraphSystemClass.
   * @param config Configuration options.
   * @param threeScene The Three.js Scene instance.
   * @returns The singleton instance.
   */
  public static getInstance(
    config: SceneGraphConfig = {},
    threeScene: Scene
  ): SceneGraphSystemClass {
    if (!this.instance) {
      this.instance = new SceneGraphSystemClass(config, threeScene);
    }
    return this.instance;
  }

  /**
   * Resets the singleton instance. Useful for testing purposes.
   */
  public static resetInstance(): void {
    this.instance = null;
  }

  /**
   * Adds an object to the scene graph.
   * @param id Unique identifier for the node.
   * @param name Human-readable name for the node.
   * @param object3D The Three.js Object3D instance.
   * @param parentId The ID of the parent node, if any.
   */
  public addObject(
    id: string,
    name: string,
    object3D: Object3D,
    parentId?: string
  ): void {
    // Store object3D separately
    this.object3DMap[id] = object3D;

    const node: SceneGraphStoreNode = {
      id,
      name,
      childrenIds: [],
      parentId,
    };
    useSceneGraphStore.getState().addNode(node); // Using addNode with SceneGraphStoreNode

    if (parentId) {
      useSceneGraphStore.getState().setParent(id, parentId);
      const parentNode = useSceneGraphStore.getState().getNode(parentId);
      if (parentNode) {
        // Attach to parent in Three.js scene
        const parentObject3D = this.object3DMap[parentId];
        if (parentObject3D) {
          parentObject3D.add(object3D);
        } else {
          console.warn(
            `SceneGraphSystem: Parent Object3D for ${parentId} not found. Adding to root scene.`
          );
          this.threeScene.add(object3D);
        }
      } else {
        console.warn(
          `SceneGraphSystem: Parent node ${parentId} not found for object ${id}. Adding to root scene.`
        );
        this.threeScene.add(object3D);
      }
    } else {
      // Add to root scene
      this.threeScene.add(object3D);
    }

    if (this.config.debug) {
      console.log(`SceneGraphSystem: Object added - ${id} (${name})`);
    }
  }

  /**
   * Removes an object from the scene graph.
   * @param id Unique identifier for the node to remove.
   */
  public removeObject(id: string): void {
    const node = useSceneGraphStore.getState().getNode(id);
    if (node) {
      useSceneGraphStore.getState().removeNode(id);
      const object3D = this.object3DMap[id];
      if (object3D) {
        this.threeScene.remove(object3D);
        // Remove from parent if exists
        if (node.parentId) {
          const parentObject3D = this.object3DMap[node.parentId];
          if (parentObject3D) {
            parentObject3D.remove(object3D);
          }
        }
        delete this.object3DMap[id];
      }

      if (this.config.debug) {
        console.log(`SceneGraphSystem: Object removed - ${id} (${node.name})`);
      }
    } else if (this.config.debug) {
      console.warn(`SceneGraphSystem: Attempted to remove non-existent node - ${id}`);
    }
  }

  /**
   * Moves an object within the scene graph by changing its parent.
   * @param childId The ID of the child node.
   * @param newParentId The ID of the new parent node.
   */
  public moveObject(childId: string, newParentId: string): void {
    useSceneGraphStore.getState().setParent(childId, newParentId);

    const childNode = useSceneGraphStore.getState().getNode(childId);
    const newParentNode = useSceneGraphStore.getState().getNode(newParentId);

    const childObject3D = this.object3DMap[childId];
    const newParentObject3D = this.object3DMap[newParentId];

    if (
      childNode &&
      newParentNode &&
      childObject3D &&
      newParentObject3D
    ) {
      // Remove from old parent in Three.js
      if (childNode.parentId) {
        const oldParentObject3D = this.object3DMap[childNode.parentId];
        if (oldParentObject3D) {
          oldParentObject3D.remove(childObject3D);
        }
      } else {
        this.threeScene.remove(childObject3D);
      }

      // Add to new parent in Three.js
      newParentObject3D.add(childObject3D);

      if (this.config.debug) {
        console.log(
          `SceneGraphSystem: Moved object ${childId} under parent ${newParentId}`
        );
      }
    } else if (this.config.debug) {
      console.warn(
        `SceneGraphSystem: Failed to move object ${childId} to parent ${newParentId}`
      );
    }
  }

  /**
   * Handles incoming game events by executing registered logic components.
   * @param event The game event to handle.
   */
  public handleEvent(event: GameEvent): void {
    Object.values(this.logicComponents).forEach((component) => {
      component.execute(event);
    });
  }

  /**
   * Registers a logic component to respond to game events.
   * @param component The logic component to register.
   */
  public registerLogicComponent(component: LogicComponent): void {
    this.logicComponents[component.id] = component;
    useLogicStore.getState().registerLogicComponent(component);

    if (this.config.debug) {
      console.log(
        `SceneGraphSystem: LogicComponent registered - ${component.id}`
      );
    }
  }

  /**
   * Unregisters a logic component.
   * @param id The ID of the logic component to unregister.
   */
  public unregisterLogicComponent(id: string): void {
    delete this.logicComponents[id];
    useLogicStore.getState().unregisterLogicComponent(id);

    if (this.config.debug) {
      console.log(
        `SceneGraphSystem: LogicComponent unregistered - ${id}`
      );
    }
  }

  /**
   * Processes queued game events.
   */
  private processEvents(): void {
    this.eventInterval = setInterval(() => {
      const event = useLogicStore.getState().dequeueEvent();
      if (event) {
        this.handleEvent(event);
      }
    }, 100); // Adjust the interval as needed
  }

  /**
   * Serializes the current SceneGraphState.
   * @returns The serialized SceneGraphState.
   */
  public serializeState(): SceneGraphState {
    return useSceneGraphStore.getState();
  }

  /**
   * Deserializes and applies a given SceneGraphState.
   * @param state The SceneGraphState to apply.
   */
  public deserializeState(state: SceneGraphState): void {
    useSceneGraphStore.setState(state);
  }

  /**
   * Resets the SceneGraphSystem by removing all nodes from the store and the Three.js scene.
   */
  public reset(): void {
    const nodes = { ...useSceneGraphStore.getState().nodes };

    Object.keys(nodes).forEach((nodeId) => {
      this.removeObject(nodeId);
    });

    if (this.config.debug) {
      console.log("SceneGraphSystem: Reset complete.");
    }
  }

  /**
   * Cleans up the SceneGraphSystem by clearing intervals and removing event listeners.
   */
  public cleanup(): void {
    if (this.eventInterval) {
      clearInterval(this.eventInterval);
      this.eventInterval = null;
      if (this.config.debug) {
        console.log("SceneGraphSystem: Event processing interval cleared.");
      }
    }

    // Remove global event listeners using the named function
    if (this.resetGameListener) {
      EventDispatcher.off("RESET_GAME", this.resetGameListener);
      this.resetGameListener = null;
    }

    if (this.config.debug) {
      console.log("SceneGraphSystem: Cleanup complete.");
    }
  }
}
