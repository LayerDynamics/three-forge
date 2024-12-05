// src/systems/SceneGraphSystem/SceneGraphSystem.test.tsx

import { Scene, Object3D } from "three";
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

  beforeEach(() => {
    // Reset the singleton instance before each test
    SceneGraphSystemClass.resetInstance();

    // Initialize the SceneGraphSystem with debug mode enabled for better test output
    SceneGraphSystem = SceneGraphSystemClass.getInstance({ debug: true }, mockThreeScene);

    // Initialize mock store state
    let nodes: Record<string, SceneGraphNode> = {};

    useSceneGraphStore.setState({
      nodes,
      addNode: jest.fn((node: SceneGraphNode) => {
        nodes[node.id] = node;
        mockThreeScene.add(node.object3D);
      }),
      removeNode: jest.fn((id: string) => {
        const node = nodes[id];
        if (node) {
          delete nodes[id];
          mockThreeScene.remove(node.object3D);
        }
      }),
      setParent: jest.fn(),
      getNode: jest.fn((id: string) => nodes[id]),
      updateNode: jest.fn(),
    });

    // Clear all mocks before each test
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
  });

  it("should handle game state transitions based on events", () => {
    const startEvent: GameEvent = { type: "START_GAME" };
    const pauseEvent: GameEvent = { type: "PAUSE_GAME" };
    const endEvent: GameEvent = { type: "END_GAME" };

    // Mock methods
    jest.spyOn(SceneGraphSystem, "addObject");
    jest.spyOn(SceneGraphSystem, "removeObject");
    jest.spyOn(SceneGraphSystem, "moveObject");

    // Register mock logic component
    const mockExecute = jest.fn();
    const component: LogicComponent = {
      id: "testComponent",
      execute: mockExecute,
    };
    SceneGraphSystem.registerLogicComponent(component);

    // Enqueue events
    useLogicStore.getState().enqueueEvent(startEvent);
    useLogicStore.getState().enqueueEvent(pauseEvent);
    useLogicStore.getState().enqueueEvent(endEvent);

    // Simulate event processing
    SceneGraphSystem.handleEvent(startEvent);
    SceneGraphSystem.handleEvent(pauseEvent);
    SceneGraphSystem.handleEvent(endEvent);

    expect(mockExecute).toHaveBeenCalledWith(startEvent);
    expect(mockExecute).toHaveBeenCalledWith(pauseEvent);
    expect(mockExecute).toHaveBeenCalledWith(endEvent);
  });

  it("should execute logic components upon event handling", () => {
    const mockExecute = jest.fn();
    const component: LogicComponent = {
      id: "testComponent",
      execute: mockExecute,
    };

    SceneGraphSystem.registerLogicComponent(component);

    const event: GameEvent = { type: "CUSTOM_EVENT", payload: { data: 123 } };
    SceneGraphSystem.handleEvent(event);

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

    // Ensure node is added by checking if it's in the mockThreeScene
    expect(useSceneGraphStore.getState().addNode).toHaveBeenCalledWith(node);
    expect(mockThreeScene.children).toContain(node.object3D);

    // Reset the system
    SceneGraphSystem.reset();

    // Expect removeNode to have been called with node.id
    expect(useSceneGraphStore.getState().removeNode).toHaveBeenCalledWith(node.id);
    // After reset, the threeScene should have no children
    expect(mockThreeScene.children.length).toBe(0);
  });
});