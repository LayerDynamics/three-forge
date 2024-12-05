// src/systems/SceneGraphSystem/SceneGraphSystem.test.tsx

import { Scene, Object3D, BufferGeometry, Material } from "three";
import { SceneGraphSystemClass } from "./SceneGraphSystem"; // Named import
import { useSceneGraphStore } from "../../stores/sceneGraphStore";
import { useLogicStore } from "../../stores/logicStore";
import { SceneGraphNode, SceneGraphStoreNode, SceneGraphState } from "../../types/sceneGraph.types";
import { GameEvent, LogicComponent } from "../../types/logic.types";
import { EventDispatcher } from "../../utils/EventDispatcher";

// Import testing utilities
import { act } from "react-dom/test-utils";

// Mock EventDispatcher methods
jest.mock("../../utils/EventDispatcher", () => ({
  EventDispatcher: {
    on: jest.fn(),
    off: jest.fn(),
    dispatch: jest.fn(),
  },
}));

// Mock the useSceneGraphStore
jest.mock('../../stores/sceneGraphStore', () => ({
  useSceneGraphStore: {
    getState: jest.fn(),
    setState: jest.fn(),
  },
}));

// Mock the useLogicStore
jest.mock('../../stores/logicStore', () => ({
  useLogicStore: {
    getState: jest.fn(),
    setState: jest.fn(),
  },
}));

describe("SceneGraphSystem", () => {
  let SceneGraphSystem: SceneGraphSystemClass;
  let mockThreeScene: Scene;
  let mockAdd: jest.Mock;
  let mockRemove: jest.Mock;
  let nodes: Record<string, SceneGraphStoreNode>;
  let logicComponents: Record<string, LogicComponent>;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.resetAllMocks();

    // Create a mock Three.js Scene
    mockThreeScene = new Scene();
    mockThreeScene.children = [];

    // Mock the add and remove methods of the Scene
    mockAdd = jest.fn((object: Object3D) => {
      mockThreeScene.children.push(object);
      return mockThreeScene;
    });
    mockRemove = jest.fn((object: Object3D) => {
      const index = mockThreeScene.children.indexOf(object);
      if (index > -1) {
        mockThreeScene.children.splice(index, 1);
      }
      return mockThreeScene;
    });
    mockThreeScene.add = mockAdd;
    mockThreeScene.remove = mockRemove;

    // Initialize nodes and logicComponents
    nodes = {};
    logicComponents = {};

    // Mock the sceneGraphStore.getState and its methods
    (useSceneGraphStore.getState as jest.Mock).mockReturnValue({
      nodes: nodes,
      addNode: jest.fn((node: SceneGraphStoreNode) => {
        nodes[node.id] = node;
      }),
      removeNode: jest.fn((id: string) => {
        if (nodes[id]) {
          delete nodes[id];
        }
      }),
      setParent: jest.fn(),
      getNode: jest.fn((id: string) => nodes[id]),
      updateNode: jest.fn(),
    });

    // Mock the sceneGraphStore.setState if needed
    (useSceneGraphStore.setState as jest.Mock).mockImplementation((partialState: Partial<SceneGraphState>) => {
      if (partialState.nodes) {
        nodes = { ...nodes, ...partialState.nodes };
      }
      // Add more state handling if necessary
    });

    // Mock the logicStore.getState and its methods
    (useLogicStore.getState as jest.Mock).mockReturnValue({
      gameState: "menu",
      eventsQueue: [],
      logicComponents: logicComponents,
      setGameState: jest.fn(),
      enqueueEvent: jest.fn(),
      dequeueEvent: jest.fn(),
      registerLogicComponent: jest.fn((component: LogicComponent) => {
        logicComponents[component.id] = component;
      }),
      unregisterLogicComponent: jest.fn((id: string) => {
        delete logicComponents[id];
      }),
    });

    // Mock the logicStore.setState if needed
    (useLogicStore.setState as jest.Mock).mockImplementation((partialState: any) => {
      Object.assign(logicComponents, partialState.logicComponents);
      // Add more state handling if necessary
    });

    // Initialize the SceneGraphSystem singleton
    SceneGraphSystemClass.resetInstance();
    SceneGraphSystem = SceneGraphSystemClass.getInstance({ debug: true }, mockThreeScene);
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

    // Spy on addNode and removeNode methods
    const addNodeSpy = jest.spyOn(useSceneGraphStore.getState(), 'addNode');
    const removeNodeSpy = jest.spyOn(useSceneGraphStore.getState(), 'removeNode');

    // Act: Add the object to the SceneGraphSystem
    SceneGraphSystem.addObject(node.id, node.name, node.object3D);

    // Assert: addNode was called with storeNode
    expect(addNodeSpy).toHaveBeenCalledWith(storeNode);

    // Assert: mockThreeScene.add was called with node.object3D
    expect(mockAdd).toHaveBeenCalledWith(node.object3D);

    // Assert: node.object3D is in mockThreeScene.children
    expect(mockThreeScene.children).toContain(node.object3D);

    // Act: Reset the SceneGraphSystem
    SceneGraphSystem.reset();

    // Assert: removeNode was called with node.id
    expect(removeNodeSpy).toHaveBeenCalledWith(node.id);

    // Assert: mockThreeScene.remove was called with node.object3D
    expect(mockRemove).toHaveBeenCalledWith(node.object3D);

    // Assert: mockThreeScene.children is empty after reset
    expect(mockThreeScene.children.length).toBe(0);
  });

  it("should handle adding multiple objects and resetting correctly", () => {
    // Define multiple SceneGraphNodes
    const nodesToAdd: SceneGraphNode[] = [
      {
        id: "node1",
        name: "Node 1",
        parentId: undefined,
        childrenIds: [],
        object3D: new Object3D(),
      },
      {
        id: "node2",
        name: "Node 2",
        parentId: "node1",
        childrenIds: [],
        object3D: new Object3D(),
      },
    ];

    const storeNodes: SceneGraphStoreNode[] = nodesToAdd.map(node => ({
      id: node.id,
      name: node.name,
      parentId: node.parentId,
      childrenIds: node.childrenIds,
    }));

    // Spy on addNode and removeNode methods
    const addNodeSpy = jest.spyOn(useSceneGraphStore.getState(), 'addNode');
    const removeNodeSpy = jest.spyOn(useSceneGraphStore.getState(), 'removeNode');

    // Act: Add all objects to the SceneGraphSystem
    nodesToAdd.forEach(node => {
      SceneGraphSystem.addObject(node.id, node.name, node.object3D, node.parentId);
    });

    // Assert: addNode was called with each storeNode
    storeNodes.forEach(storeNode => {
      expect(addNodeSpy).toHaveBeenCalledWith(storeNode);
    });

    // Assert: mockThreeScene.add was called with each object3D
    nodesToAdd.forEach(node => {
      expect(mockAdd).toHaveBeenCalledWith(node.object3D);
      expect(mockThreeScene.children).toContain(node.object3D);
    });

    // Act: Reset the SceneGraphSystem
    SceneGraphSystem.reset();

    // Assert: removeNode was called with each node.id
    nodesToAdd.forEach(node => {
      expect(removeNodeSpy).toHaveBeenCalledWith(node.id);
      expect(mockRemove).toHaveBeenCalledWith(node.object3D);
    });

    // Assert: mockThreeScene.children is empty after reset
    expect(mockThreeScene.children.length).toBe(0);
  });

  it("should handle adding and moving objects within the SceneGraphSystem", () => {
    // Define parent and child SceneGraphNodes
    const parentNode: SceneGraphNode = {
      id: "parent1",
      name: "Parent Node",
      parentId: undefined,
      childrenIds: [],
      object3D: new Object3D(),
    };

    const childNode: SceneGraphNode = {
      id: "child1",
      name: "Child Node",
      parentId: "parent1",
      childrenIds: [],
      object3D: new Object3D(),
    };

    const parentStoreNode: SceneGraphStoreNode = {
      id: parentNode.id,
      name: parentNode.name,
      parentId: parentNode.parentId,
      childrenIds: parentNode.childrenIds,
    };

    const childStoreNode: SceneGraphStoreNode = {
      id: childNode.id,
      name: childNode.name,
      parentId: childNode.parentId,
      childrenIds: childNode.childrenIds,
    };

    // Spy on addNode and setParent methods
    const addNodeSpy = jest.spyOn(useSceneGraphStore.getState(), 'addNode');
    const setParentSpy = jest.spyOn(useSceneGraphStore.getState(), 'setParent');

    // Act: Add parent and child objects
    SceneGraphSystem.addObject(parentNode.id, parentNode.name, parentNode.object3D);
    SceneGraphSystem.addObject(childNode.id, childNode.name, childNode.object3D, childNode.parentId);

    // Assert: addNode was called with parentStoreNode and childStoreNode
    expect(addNodeSpy).toHaveBeenCalledWith(parentStoreNode);
    expect(addNodeSpy).toHaveBeenCalledWith(childStoreNode);

    // Assert: setParent was called correctly
    expect(setParentSpy).toHaveBeenCalledWith(childNode.id, parentNode.id);

    // Assert: mockThreeScene.add was called with both object3Ds
    expect(mockAdd).toHaveBeenCalledWith(parentNode.object3D);
    expect(mockAdd).toHaveBeenCalledWith(childNode.object3D);

    // Assert: child.object3D is a child of parent.object3D in Three.js scene
    expect(parentNode.object3D.children).toContain(childNode.object3D);
    expect(mockThreeScene.children).toContain(parentNode.object3D);
    expect(mockThreeScene.children).not.toContain(childNode.object3D);

    // Act: Reset the SceneGraphSystem
    SceneGraphSystem.reset();

    // Assert: removeNode was called with both node IDs
    expect(useSceneGraphStore.getState().removeNode).toHaveBeenCalledWith(parentNode.id);
    expect(useSceneGraphStore.getState().removeNode).toHaveBeenCalledWith(childNode.id);

    // Assert: mockThreeScene.remove was called with both object3Ds
    expect(mockRemove).toHaveBeenCalledWith(parentNode.object3D);
    expect(mockRemove).toHaveBeenCalledWith(childNode.object3D);

    // Assert: mockThreeScene.children is empty after reset
    expect(mockThreeScene.children.length).toBe(0);
  });
});