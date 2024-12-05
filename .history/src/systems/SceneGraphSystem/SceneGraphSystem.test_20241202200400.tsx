// src/systems/SceneGraphSystem/SceneGraphSystem.test.tsx

import { Scene } from "three";
import SceneGraphSystemClass from "./SceneGraphSystem";
import { useSceneGraphStore } from "../../stores/sceneGraphStore";
import { SceneGraphNode } from "../../types/sceneGraph.types";
import { GameEvent, LogicComponent } from "../../types/logic.types";
import { EventDispatcher } from "../../utils/EventDispatcher";

// Mock Three.js Scene
const mockThreeScene = new Scene();

// Mock EventDispatcher methods
jest.mock("../../utils/EventDispatcher", () => ({
  EventDispatcher: {
    on: jest.fn(),
    off: jest.fn(),
    dispatch: jest.fn(),
  },
}));

describe("SceneGraphSystem", () => {
  let SceneGraphSystem: SceneGraphSystemClass;

  beforeAll(() => {
    SceneGraphSystem = SceneGraphSystemClass.getInstance({ debug: false }, mockThreeScene);
  });

  beforeEach(() => {
    // Reset the SceneGraphStore before each test
    useSceneGraphStore.setState({
      nodes: {},
      addNode: jest.fn(),
      removeNode: jest.fn(),
      setParent: jest.fn(),
      getNode: jest.fn(),
    });

    // Clear all mocks
    jest.clearAllMocks();
  });

  it("should add a node to the scene graph", () => {
    const node: SceneGraphNode = {
      id: "node1",
      name: "Test Node",
      parentId: undefined,
      childrenIds: [],
      object3D: new Object3D(),
    };

    // Mock getNode to return undefined initially
    (useSceneGraphStore.getState().getNode as jest.Mock).mockReturnValue(undefined);

    SceneGraphSystem.addObject(node.id, node.name, node.object3D);

    expect(useSceneGraphStore.getState().addNode).toHaveBeenCalledWith(node);
    expect(mockThreeScene.children).toContain(node.object3D);

    if (SceneGraphSystem["config"].debug) {
      expect(console.log).toHaveBeenCalledWith(`SceneGraphSystem: Object added - ${node.id} (${node.name})`);
    }
  });

  it("should handle game state transitions based on events", () => {
    const startEvent: GameEvent = { type: "START_GAME" };
    const pauseEvent: GameEvent = { type: "PAUSE_GAME" };
    const endEvent: GameEvent = { type: "END_GAME" };

    // Mock methods
    jest.spyOn(SceneGraphSystem, "addObject");
    jest.spyOn(SceneGraphSystem, "removeObject");
    jest.spyOn(SceneGraphSystem, "moveObject");

    // Emit events
    SceneGraphSystem["handleEvent"](startEvent);
    SceneGraphSystem["handleEvent"](pauseEvent);
    SceneGraphSystem["handleEvent"](endEvent);

    // Assertions based on your event handling implementation
    // Example:
    // expect(SceneGraphSystem.addObject).toHaveBeenCalledWith(...);
    // Adjust according to actual implementation
  });

  it("should execute logic components upon event handling", () => {
    const mockExecute = jest.fn();
    const component: LogicComponent = {
      id: "testComponent",
      execute: mockExecute,
    };

    SceneGraphSystem.registerLogicComponent(component);

    const event: GameEvent = { type: "CUSTOM_EVENT", payload: { data: 123 } };
    SceneGraphSystem["handleEvent"](event);

    expect(mockExecute).toHaveBeenCalledWith(event);
  });

  it("should reset the SceneGraphSystem correctly", () => {
    const node: SceneGraphNode = {
      id: "node1",
      name: "Test Node",
      parentId: undefined,
      childrenIds: [],
      object3D: new Object3D(),
    };

    // Add a node
    SceneGraphSystem.addObject(node.id, node.name, node.object3D);

    // Ensure node is added
    expect(useSceneGraphStore.getState().removeNode).not.toHaveBeenCalled();

    // Reset the system
    SceneGraphSystem.reset();

    expect(useSceneGraphStore.getState().removeNode).toHaveBeenCalledWith(node.id);
    expect(mockThreeScene.children.length).toBe(0);
  });
});