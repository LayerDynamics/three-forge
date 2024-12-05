// src/systems/SceneGraphSystem/SceneGraphSystem.test.tsx

import { Scene, Object3D } from "three";
import { SceneGraphSystemClass } from "./SceneGraphSystem"; // Named import
import { useSceneGraphStore } from "../../stores/sceneGraphStore";
import { useLogicStore } from "../../stores/logicStore";
import { SceneGraphNode, SceneGraphStoreNode } from "../../types/sceneGraph.types";
import { GameEvent, LogicComponent } from "../../types/logic.types";
import { EventDispatcher } from "../../utils/EventDispatcher";

// Mock Three.js Scene with proper add and remove functionality
const mockThreeScene = new Scene();

// Initialize the children array
mockThreeScene.children = [];

// Mock the add method to add objects to the children array and return the scene
mockThreeScene.add = jest.fn((object: Object3D) => {
  mockThreeScene.children.push(object);
  return mockThreeScene;
});

// Mock the remove method to remove objects from the children array and return the scene
mockThreeScene.remove = jest.fn((object: Object3D) => {
  const index = mockThreeScene.children.indexOf(object);
  if (index > -1) {
    mockThreeScene.children.splice(index, 1);
  }
  return mockThreeScene;
});

// Mock EventDispatcher methods
jest.mock("../../utils/EventDispatcher", () => ({
  EventDispatcher: {
    on: jest.fn(),
    off: jest.fn(),
    dispatch: jest.fn(),
  },
}));

jest.mock('../../stores/sceneGraphStore', () => ({
  useSceneGraphStore: () => ({
    addNode: jest.fn((node: SceneGraphStoreNode) => {
      // Mock implementation
    }),
    removeNode: jest.fn(),
    setParent: jest.fn(),
    getNode: jest.fn(),
  }),
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

    // Initialize mock logicStore state
    let logicComponents: Record<string, LogicComponent> = {};

    useLogicStore.setState({
      gameState: "menu",
      eventsQueue: [],
      logicComponents,
      setGameState: jest.fn(),
      enqueueEvent: jest.fn((event: GameEvent) => {
        useLogicStore.setState({
          eventsQueue: [...useLogicStore.getState().eventsQueue, event],
        });
      }),
      dequeueEvent: jest.fn(() => {
        const [nextEvent, ...remaining] = useLogicStore.getState().eventsQueue;
        useLogicStore.setState({ eventsQueue: remaining });
        return nextEvent;
      }),
      registerLogicComponent: jest.fn((component: LogicComponent) => {
        logicComponents[component.id] = component;
      }),
      unregisterLogicComponent: jest.fn((id: string) => {
        delete logicComponents[id];
      }),
    });

    // Clear all mocks before each test
    jest.clearAllMocks();
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
    expect(mockThreeScene.add).toHaveBeenCalledWith(node.object3D);
    expect(mockThreeScene.children).toContain(node.object3D);

    // Reset the system
    SceneGraphSystem.reset();

    // Expect removeNode to have been called with node.id
    expect(useSceneGraphStore.getState().removeNode).toHaveBeenCalledWith(node.id);
    expect(mockThreeScene.remove).toHaveBeenCalledWith(node.object3D);

    // After reset, the threeScene should have no children
    expect(mockThreeScene.children.length).toBe(0);
  });
});
