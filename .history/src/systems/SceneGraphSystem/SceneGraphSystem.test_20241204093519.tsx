// src/systems/SceneGraphSystem/SceneGraphSystem.test.tsx

import { Scene, Object3D, Mesh } from "three";
import { SceneGraphSystemClass } from "./SceneGraphSystem"; // Named import
import { useSceneGraphStore } from "../../stores/sceneGraphStore";
import { useLogicStore } from "../../stores/logicStore";
import {
  SceneGraphNode,
  SceneGraphStoreNode,
  SceneGraphState,
} from "../../types/sceneGraph.types";
import { LogicComponent } from "../../types/logic.types";
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

// Define mock functions for sceneGraphStore
let mockAddNode: jest.Mock;
let mockRemoveNode: jest.Mock;
let mockSetParent: jest.Mock;
let mockGetNode: jest.Mock;
let mockUpdateNode: jest.Mock;

// Mock the useSceneGraphStore
jest.mock("../../stores/sceneGraphStore", () => ({
  useSceneGraphStore: {
    getState: jest.fn(),
    setState: jest.fn(),
  },
}));

// Define mock functions for logicStore
let mockRegisterLogicComponent: jest.Mock;
let mockUnregisterLogicComponent: jest.Mock;
let mockDequeueEvent: jest.Mock;

// Mock the useLogicStore
jest.mock("../../stores/logicStore", () => ({
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
  let addSpy: jest.SpyInstance<Object3D<any>, [object: Object3D<any>]>;
  let removeSpy: jest.SpyInstance<Object3D<any>, [object: Object3D<any>]>;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.resetAllMocks();

    // Spy on Object3D.prototype.add and remove with correct return type
    addSpy = jest
      .spyOn(Object3D.prototype, "add")
      .mockImplementation(
        function (this: Object3D<any>, child: Object3D<any>): Object3D<any> {
          this.children.push(child);
          return this;
        }
      ) as jest.SpyInstance<Object3D<any>, [object: Object3D<any>]>;

    removeSpy = jest
      .spyOn(Object3D.prototype, "remove")
      .mockImplementation(
        function (this: Object3D<any>, child: Object3D<any>): Object3D<any> {
          const index = this.children.indexOf(child);
          if (index > -1) {
            this.children.splice(index, 1);
          }
          return this;
        }
      ) as jest.SpyInstance<Object3D<any>, [object: Object3D<any>]>;

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

    // Initialize mock functions for sceneGraphStore
    mockAddNode = jest.fn((node: SceneGraphStoreNode) => {
      nodes[node.id] = node;
    });
    mockRemoveNode = jest.fn((id: string) => {
      if (nodes[id]) {
        delete nodes[id];
      }
    });
    mockSetParent = jest.fn((childId: string, parentId?: string) => {
      const child = nodes[childId];
      if (child) {
        child.parentId = parentId;
        if (parentId) {
          const parent = nodes[parentId];
          if (parent && !parent.childrenIds.includes(childId)) {
            parent.childrenIds.push(childId);
          }
        }
      }
    });
    mockGetNode = jest.fn((id: string) => nodes[id]);
    mockUpdateNode = jest.fn((id: string, updatedFields: Partial<SceneGraphStoreNode>) => {
      if (nodes[id]) {
        nodes[id] = { ...nodes[id], ...updatedFields };
      }
    });

    // Mock the sceneGraphStore.getState and its methods
    (useSceneGraphStore.getState as jest.Mock).mockReturnValue({
      nodes: nodes,
      addNode: mockAddNode,
      removeNode: mockRemoveNode,
      setParent: mockSetParent,
      getNode: mockGetNode,
      updateNode: mockUpdateNode,
    });

    // Mock the sceneGraphStore.setState if needed
    (useSceneGraphStore.setState as jest.Mock).mockImplementation(
      (partialState: Partial<SceneGraphState>) => {
        if (partialState.nodes) {
          nodes = { ...nodes, ...partialState.nodes };
        }
        // Add more state handling if necessary
      }
    );

    // Initialize mock functions for logicStore
    mockRegisterLogicComponent = jest.fn((component: LogicComponent) => {
      logicComponents[component.id] = component;
    });
    mockUnregisterLogicComponent = jest.fn((id: string) => {
      delete logicComponents[id];
    });
    mockDequeueEvent = jest.fn();

    // Mock the logicStore.getState and its methods
    (useLogicStore.getState as jest.Mock).mockReturnValue({
      gameState: "menu",
      eventsQueue: [],
      logicComponents: logicComponents,
      setGameState: jest.fn(),
      enqueueEvent: jest.fn(),
      dequeueEvent: mockDequeueEvent,
      registerLogicComponent: mockRegisterLogicComponent,
      unregisterLogicComponent: mockUnregisterLogicComponent,
    });

    // Mock the logicStore.setState if needed
    (useLogicStore.setState as jest.Mock).mockImplementation((partialState: any) => {
      if (partialState.logicComponents) {
        Object.assign(logicComponents, partialState.logicComponents);
      }
      // Add more state handling if necessary
    });

    // Initialize the SceneGraphSystem singleton
    SceneGraphSystemClass.resetInstance();
    SceneGraphSystem = SceneGraphSystemClass.getInstance(
      { debug: true },
      mockThreeScene
    );
  });

  afterEach(() => {
    // Restore the original implementations
    addSpy.mockRestore();
    removeSpy.mockRestore();
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

    // Act: Add the object to the SceneGraphSystem
    SceneGraphSystem.addObject(node.id, node.name, node.object3D);

    // Assert: addNode was called with storeNode
    expect(mockAddNode).toHaveBeenCalledWith(storeNode);

    // Assert: mockThreeScene.add was called with node.object3D
    expect(mockAdd).toHaveBeenCalledWith(node.object3D);

    // Assert: node.object3D is in mockThreeScene.children
    expect(mockThreeScene.children).toContain(node.object3D);

    // Act: Reset the SceneGraphSystem
    SceneGraphSystem.reset();

    // Assert: removeNode was called with node.id
    expect(mockRemoveNode).toHaveBeenCalledWith(node.id);

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

    const storeNodes: SceneGraphStoreNode[] = nodesToAdd.map((node) => ({
      id: node.id,
      name: node.name,
      parentId: node.parentId,
      childrenIds: node.childrenIds,
    }));

    // Act: Add all objects to the SceneGraphSystem
    nodesToAdd.forEach((node) => {
      SceneGraphSystem.addObject(node.id, node.name, node.object3D, node.parentId);
    });

    // Assert: addNode was called with each storeNode in the correct order
    expect(mockAddNode).toHaveBeenNthCalledWith(1, storeNodes[0]);
    expect(mockAddNode).toHaveBeenNthCalledWith(2, storeNodes[1]);

    // Assert: mockThreeScene.add was called only with root objects
    const rootNodes = nodesToAdd.filter((node) => !node.parentId);
    rootNodes.forEach((node) => {
      expect(mockAdd).toHaveBeenCalledWith(node.object3D);
      expect(mockThreeScene.children).toContain(node.object3D);
    });

    // Assert: child objects are added to their parent Object3D
    const childNodes = nodesToAdd.filter((node) => node.parentId);
    childNodes.forEach((child) => {
      const parent = nodesToAdd.find((node) => node.id === child.parentId);
      expect(addSpy).toHaveBeenCalledWith(child.object3D);
      expect(parent?.object3D.children).toContain(child.object3D);
    });

    // Assert: updateNode was called to update parent node's childrenIds
    expect(mockUpdateNode).toHaveBeenCalledWith("node1", {
      childrenIds: ["node2"],
    });

    // Act: Reset the SceneGraphSystem
    SceneGraphSystem.reset();

    // Assert: removeNode was called with each node.id in order
    expect(mockRemoveNode).toHaveBeenNthCalledWith(1, "node1");
    expect(mockRemoveNode).toHaveBeenNthCalledWith(2, "node2");

    // Assert: mockThreeScene.remove was called only with root objects
    rootNodes.forEach((node) => {
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

    // Act: Add parent and child objects
    SceneGraphSystem.addObject(parentNode.id, parentNode.name, parentNode.object3D);
    SceneGraphSystem.addObject(childNode.id, childNode.name, childNode.object3D, childNode.parentId);

    // Assert: addNode was called with parentStoreNode and childStoreNode in order
    expect(mockAddNode).toHaveBeenNthCalledWith(1, parentStoreNode);
    expect(mockAddNode).toHaveBeenNthCalledWith(2, childStoreNode);

    // Assert: setParent was called correctly
    expect(mockSetParent).toHaveBeenCalledWith(childNode.id, parentNode.id);

    // Assert: mockThreeScene.add was called only with parent object's Object3D
    expect(mockAdd).toHaveBeenCalledWith(parentNode.object3D);
    expect(mockAdd).not.toHaveBeenCalledWith(childNode.object3D);

    // Assert: child object was added to parentObject3D
    expect(addSpy).toHaveBeenCalledWith(childNode.object3D);
    expect(parentNode.object3D.children).toContain(childNode.object3D);
    expect(mockThreeScene.children).toContain(parentNode.object3D);
    expect(mockThreeScene.children).not.toContain(childNode.object3D);

    // Assert: updateNode was called to update parent node's childrenIds
    expect(mockUpdateNode).toHaveBeenCalledWith("parent1", {
      childrenIds: ["child1"],
    });

    // Act: Move child1 to have no parent (detach)
    SceneGraphSystem.moveObject(childNode.id, undefined);

    // Assert: setParent was called correctly to detach
    expect(mockSetParent).toHaveBeenCalledWith(childNode.id, undefined);

    // Assert: updateNode was called to update child node's parentId
    expect(mockUpdateNode).toHaveBeenCalledWith("child1", {
      parentId: undefined,
    });

    // Assert: updateNode was called to remove child from previous parent
    expect(mockUpdateNode).toHaveBeenCalledWith("parent1", {
      childrenIds: [],
    });

    // Act: Reset the SceneGraphSystem
    SceneGraphSystem.reset();

    // Assert: removeNode was called with both node IDs in order
    expect(mockRemoveNode).toHaveBeenNthCalledWith(1, "parent1");
    expect(mockRemoveNode).toHaveBeenNthCalledWith(2, "child1");

    // Assert: mockThreeScene.remove was called only with parent object's Object3D
    expect(mockRemove).toHaveBeenCalledWith(parentNode.object3D);
    expect(mockRemove).toHaveBeenCalledWith(childNode.object3D);

    // Assert: mockThreeScene.children is empty after reset
    expect(mockThreeScene.children.length).toBe(0);
  });
});