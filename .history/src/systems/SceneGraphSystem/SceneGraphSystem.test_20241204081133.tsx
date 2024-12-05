// src/systems/SceneGraphSystem/SceneGraphSystem.test.tsx

import { Scene, Object3D, BufferGeometry, Material } from "three";
import { SceneGraphSystemClass } from "./SceneGraphSystem"; // Named import
import { useSceneGraphStore } from "../../stores/sceneGraphStore";
import { useLogicStore } from "../../stores/logicStore";
import { SceneGraphNode, SceneGraphStoreNode, SceneGraphState } from "../../types/sceneGraph.types";
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

// Define object3DMap to track Object3D instances by node ID
let object3DMap: Record<string, Object3D> = {};

// Mock the sceneGraphStore methods
jest.mock('../../stores/sceneGraphStore', () => ({
  useSceneGraphStore: () => ({
    nodes: {},
    addNode: jest.fn((node: SceneGraphStoreNode) => {
      // Store the node without object3D
      nodes[node.id] = node;
      // Add the corresponding Object3D from object3DMap
      const object3D = object3DMap[node.id];
      if (object3D) {
        mockThreeScene.add(object3D);
      }
    }),
    removeNode: jest.fn((id: string) => {
      const node = nodes[id];
      if (node) {
        delete nodes[id];
        const object3D = object3DMap[id];
        if (object3D) {
          mockThreeScene.remove(object3D);
        }
      }
    }),
    setParent: jest.fn(),
    getNode: jest.fn((id: string) => nodes[id]),
    updateNode: jest.fn(),
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
    let nodes: Record<string, SceneGraphStoreNode> = {};

    // Initialize mock logicStore state
    let logicComponents: Record<string, LogicComponent> = {};

    useSceneGraphStore.setState({
      nodes,
      addNode: jest.fn((node: SceneGraphStoreNode) => {
        nodes[node.id] = node;
        const object3D = object3DMap[node.id];
        if (object3D) {
          mockThreeScene.add(object3D);
        }
      }),
      removeNode: jest.fn((id: string) => {
        const node = nodes[id];
        if (node) {
          delete nodes[id];
          const object3D = object3DMap[id];
          if (object3D) {
            mockThreeScene.remove(object3D);
          }
        }
      }),
      setParent: jest.fn(),
      getNode: jest.fn((id: string) => nodes[id]),
      updateNode: jest.fn(),
    });

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

    // Reset object3DMap
    object3DMap = {};
  });

  it("should reset the SceneGraphSystem correctly", () => {
    // Define a SceneGraphNode with object3D
    const node: SceneGraphNode = {
      id: "node1",
      name: "Test Node",
      parentId: undefined,
      childrenIds: [],
      object3D: new Object3D(),
    };

    // Convert to SceneGraphStoreNode for the store
    const storeNode: SceneGraphStoreNode = {
      id: node.id,
      name: node.name,
      parentId: node.parentId,
      childrenIds: node.childrenIds,
    };

    // Map the node ID to its Object3D
    object3DMap[node.id] = node.object3D;

    // Add a node
    SceneGraphSystem.addObject(node.id, node.name, node.object3D);
    
    // Ensure node is added by checking if addNode was called with storeNode
    expect(useSceneGraphStore.getState().addNode).toHaveBeenCalledWith(storeNode);
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