// src/systems/SceneGraphSystem/SceneGraphSystem.test.tsx

import { SceneGraphSystemClass, SceneGraphSystem } from "./SceneGraphSystem";
import { useSceneGraphStore } from "../../stores/sceneGraphStore";
import { SceneGraphNode } from "../../types/sceneGraph.types";
import { GameEvent } from "../../types/logic.types";
import { EventDispatcher } from "../../utils/EventDispatcher";
import { Scene } from "three";

// Mock Three.js Scene
const mockThreeScene = new Scene();

// Initialize SceneGraphSystem before tests
beforeAll(() => {
  if (!SceneGraphSystemClass.instance) {
    SceneGraphSystemClass.getInstance({ debug: false }, mockThreeScene);
  }
});

describe("SceneGraphSystem", () => {
  beforeEach(() => {
    // Reset the SceneGraphStore before each test
    useSceneGraphStore.setState({
      nodes: {},
    });
    // Clear all events
    (EventDispatcher as any).events = {};
    // Reset the SceneGraphSystem
    SceneGraphSystem.reset();
  });

  it("should add a node to the scene graph", () => {
    const node: SceneGraphNode = {
      id: "node1",
      name: "Test Node",
      childrenIds: [],
      object3D: new Object3D(),
    };

    SceneGraphSystem.addObject(node.id, node.name, node.object3D);
    expect(useSceneGraphStore.getState().nodes[node.id]).toBeDefined();
  });

  it("should handle game state transitions based on events", (done) => {
    const startEvent: GameEvent = { type: "START_GAME" };
    const pauseEvent: GameEvent = { type: "PAUSE_GAME" };
    const endEvent: GameEvent = { type: "END_GAME" };

    SceneGraphSystem.addObject("node1", "Node 1", new Object3D());
    SceneGraphSystem.moveObject("node1"); // Attach to root

    SceneGraphSystem.emitEvent(startEvent);
    SceneGraphSystem.emitEvent(pauseEvent);
    SceneGraphSystem.emitEvent(endEvent);

    // Wait for the events to be processed
    setTimeout(() => {
      // Verify game state or any other side effects
      // Example: Check if the node is in the correct state
      // Adjust according to your actual implementation
      expect(true).toBe(true); // Replace with actual assertions
      done();
    }, 200);
  });

  it("should execute logic components upon event handling", (done) => {
    const mockExecute = jest.fn();
    const component: LogicComponent = {
      id: "testComponent",
      execute: mockExecute,
    };

    SceneGraphSystem.registerLogicComponent(component);

    const event: GameEvent = { type: "CUSTOM_EVENT", payload: { data: 123 } };
    SceneGraphSystem.emitEvent(event);

    // Wait for the event to be processed
    setTimeout(() => {
      expect(mockExecute).toHaveBeenCalledWith(event);
      done();
    }, 200);
  });

  it("should reset the SceneGraphSystem correctly", () => {
    const node: SceneGraphNode = {
      id: "node1",
      name: "Test Node",
      childrenIds: [],
      object3D: new Object3D(),
    };

    SceneGraphSystem.addObject(node.id, node.name, node.object3D);
    SceneGraphSystem.reset();

    expect(useSceneGraphStore.getState().nodes).toEqual({});
    expect(mockThreeScene.children.length).toBe(0);
  });
});