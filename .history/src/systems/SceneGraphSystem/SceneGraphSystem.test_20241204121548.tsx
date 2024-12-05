// src/systems/SceneGraphSystem/SceneGraphSystem.test.tsx

import { Scene, Object3D } from "three";
import { SceneGraphSystemClass } from "./SceneGraphSystem";
import { useSceneGraphStore } from "../../stores/sceneGraphStore";
import { useLogicStore } from "../../stores/logicStore";
import {
  SceneGraphStoreNode as OriginalSceneGraphStoreNode,
  SceneGraphState,
} from "../../types/sceneGraph.types";
import { LogicComponent } from "../../types/logic.types";

// Module augmentation to extend SceneGraphStoreNode with object3D
declare module "../../types/sceneGraph.types" {
  interface SceneGraphStoreNode {
    object3D: Object3D;
  }
}

// Mock EventDispatcher
jest.mock("../../utils/EventDispatcher", () => ({
  EventDispatcher: {
    on: jest.fn(),
    off: jest.fn(),
    dispatch: jest.fn(),
  },
}));

// Define MockState interface extending SceneGraphState
interface MockState extends SceneGraphState {
  nodes: Record<string, OriginalSceneGraphStoreNode>;
  addNode: jest.Mock<void, [OriginalSceneGraphStoreNode]>;
  removeNode: jest.Mock<void, [string]>;
  setParent: jest.Mock<void, [string, string | undefined]>;
  getNode: jest.Mock<OriginalSceneGraphStoreNode | undefined, [string]>;
  updateNode: jest.Mock<void, [string, Partial<OriginalSceneGraphStoreNode>]>;
}

// Create initial mock state with proper typing
const createMockState = (mockThreeScene: Scene): MockState => {
  const mockState: MockState = {
    nodes: {},

    addNode: jest.fn<void, [OriginalSceneGraphStoreNode]>((node) => {
      mockState.nodes[node.id] = { ...node };
    }),

    removeNode: jest.fn<void, [string]>((id: string) => {
      delete mockState.nodes[id];
    }),

    setParent: jest.fn<void, [string, string | undefined]>((childId: string, parentId: string | undefined) => {
      const child = mockState.nodes[childId];
      if (child) {
        const previousParentId = child.parentId;

        // If there was a previous parent, remove the child from its childrenIds and Object3D
        if (previousParentId && mockState.nodes[previousParentId]) {
          mockState.nodes[previousParentId].childrenIds = mockState.nodes[previousParentId].childrenIds.filter(
            (id: string) => id !== childId
          );
          mockState.nodes[previousParentId].object3D.remove(child.object3D);
        }

        // Set the new parentId
        child.parentId = parentId;

        // If there's a new parent, add the childId to its childrenIds and to its Object3D
        if (parentId && mockState.nodes[parentId]) {
          mockState.nodes[parentId].childrenIds.push(childId);
          mockState.nodes[parentId].object3D.add(child.object3D);
        } else {
          // If no new parent, add the child to the root scene
          mockThreeScene.add(child.object3D);
        }
      }
    }),

    getNode: jest.fn<OriginalSceneGraphStoreNode | undefined, [string]>((id: string) => {
      return mockState.nodes[id];
    }),

    updateNode: jest.fn<void, [string, Partial<OriginalSceneGraphStoreNode>]>(
      (id: string, updates: Partial<OriginalSceneGraphStoreNode>) => {
        if (mockState.nodes[id]) {
          mockState.nodes[id] = { ...mockState.nodes[id], ...updates };
        }
      }
    ),
  };

  return mockState;
};

let mockState: MockState;

// Mock sceneGraphStore
jest.mock("../../stores/sceneGraphStore", () => ({
  useSceneGraphStore: {
    getState: () => mockState as unknown as SceneGraphState,
    setState: jest.fn(
      (fn: (state: SceneGraphState) => Partial<SceneGraphState>) => {
        const updates = fn(mockState as unknown as SceneGraphState);
        Object.assign(mockState, updates);
      }
    ),
  },
}));

// Mock logicStore
jest.mock("../../stores/logicStore", () => ({
  useLogicStore: {
    getState: jest.fn(() => ({
      gameState: "menu",
      eventsQueue: [],
      logicComponents: {},
    })),
    setState: jest.fn(),
  },
}));

describe("SceneGraphSystem", () => {
  let SceneGraphSystem: SceneGraphSystemClass;
  let mockThreeScene: Scene;
  let mockAdd: jest.Mock;
  let mockRemove: jest.Mock;
  let addSpy: jest.SpyInstance;
  let removeSpy: jest.SpyInstance;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Initialize a new Three.js scene
    mockThreeScene = new Scene();
    mockThreeScene.children = [];

    // Mock the add method of the scene
    mockAdd = jest.fn((object: Object3D) => {
      mockThreeScene.children.push(object);
      return mockThreeScene;
    });

    // Mock the remove method of the scene
    mockRemove = jest.fn((object: Object3D) => {
      const index = mockThreeScene.children.indexOf(object);
      if (index > -1) {
        mockThreeScene.children.splice(index, 1);
      }
      return mockThreeScene;
    });

    mockThreeScene.add = mockAdd;
    mockThreeScene.remove = mockRemove;

    // Initialize mock state with access to mockThreeScene
    mockState = createMockState(mockThreeScene);

    // Spy on Object3D.prototype.add and remove
    addSpy = jest
      .spyOn(Object3D.prototype, "add")
      .mockImplementation(function (this: Object3D, child: Object3D) {
        this.children.push(child);
        return this;
      });

    removeSpy = jest
      .spyOn(Object3D.prototype, "remove")
      .mockImplementation(function (this: Object3D, child: Object3D) {
        const index = this.children.indexOf(child);
        if (index > -1) {
          this.children.splice(index, 1);
        }
        return this;
      });

    // Initialize SceneGraphSystem
    SceneGraphSystemClass.resetInstance();
    SceneGraphSystem = SceneGraphSystemClass.getInstance(
      { debug: true },
      mockThreeScene
    );
  });

  afterEach(() => {
    // Restore the original implementations of the spied methods
    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it("should reset the SceneGraphSystem correctly", () => {
    const node: OriginalSceneGraphStoreNode = {
      id: "node1",
      name: "Test Node",
      parentId: undefined,
      childrenIds: [],
      object3D: new Object3D(),
    };

    // Add the object
    SceneGraphSystem.addObject(node.id, node.name, node.object3D);

    // Assertions after addition
    expect(mockState.nodes[node.id]).toBeDefined();
    expect(mockThreeScene.children).toContain(node.object3D);

    // Reset the system
    SceneGraphSystem.reset();

    // Assertions after reset
    expect(mockState.nodes[node.id]).toBeUndefined();
    expect(mockThreeScene.children).not.toContain(node.object3D);
    expect(mockThreeScene.children.length).toBe(0);
  });

  it("should handle adding multiple objects and resetting correctly", () => {
    // Define parent and child nodes
    const parentNode: OriginalSceneGraphStoreNode = {
      id: "node1",
      name: "Node 1",
      parentId: undefined,
      childrenIds: [],
      object3D: new Object3D(),
    };

    const childNode: OriginalSceneGraphStoreNode = {
      id: "node2",
      name: "Node 2",
      parentId: "node1",
      childrenIds: [],
      object3D: new Object3D(),
    };

    // Add parent node first
    SceneGraphSystem.addObject(parentNode.id, parentNode.name, parentNode.object3D);
    expect(mockState.nodes[parentNode.id]).toBeDefined();

    // Add child node
    SceneGraphSystem.addObject(childNode.id, childNode.name, childNode.object3D, childNode.parentId);
    expect(mockState.nodes[childNode.id]).toBeDefined();

    // Verify parent-child relationship
    expect(mockState.nodes[parentNode.id].childrenIds).toContain(childNode.id);
    expect(parentNode.object3D.children).toContain(childNode.object3D);

    // Ensure child is not directly in the root scene
    expect(mockThreeScene.children).toContain(parentNode.object3D);
    expect(mockThreeScene.children).not.toContain(childNode.object3D);

    // Reset the system
    SceneGraphSystem.reset();

    // Assertions after reset
    expect(mockState.nodes[parentNode.id]).toBeUndefined();
    expect(mockState.nodes[childNode.id]).toBeUndefined();
    expect(mockThreeScene.children.length).toBe(0);
  });

  it("should handle adding and moving objects within the SceneGraphSystem", () => {
    // Define parent and child nodes
    const parentNode: OriginalSceneGraphStoreNode = {
      id: "parent1",
      name: "Parent Node",
      parentId: undefined,
      childrenIds: [],
      object3D: new Object3D(),
    };

    const childNode: OriginalSceneGraphStoreNode = {
      id: "child1",
      name: "Child Node",
      parentId: "parent1",
      childrenIds: [],
      object3D: new Object3D(),
    };

    // Add parent node first
    SceneGraphSystem.addObject(parentNode.id, parentNode.name, parentNode.object3D);
    expect(mockState.nodes[parentNode.id]).toBeDefined();

    // Add child node with parentId
    SceneGraphSystem.addObject(childNode.id, childNode.name, childNode.object3D, childNode.parentId);
    expect(mockState.nodes[childNode.id]).toBeDefined();

    // Verify initial parent-child relationship
    expect(mockState.nodes[parentNode.id].childrenIds).toContain(childNode.id);
    expect(mockState.nodes[childNode.id].parentId).toBe(parentNode.id);
    expect(parentNode.object3D.children).toContain(childNode.object3D);

    // Move child to root (no parent)
    SceneGraphSystem.moveObject(childNode.id, undefined);

    // Assertions after moving
    expect(mockState.nodes[parentNode.id].childrenIds).not.toContain(childNode.id);
    expect(mockState.nodes[childNode.id].parentId).toBeUndefined();
    expect(mockThreeScene.children).toContain(childNode.object3D);
    expect(parentNode.object3D.children).not.toContain(childNode.object3D);

    // Ensure parent is still in the root scene
    expect(mockThreeScene.children).toContain(parentNode.object3D);

    // Reset the system
    SceneGraphSystem.reset();

    // Assertions after reset
    expect(mockState.nodes[parentNode.id]).toBeUndefined();
    expect(mockState.nodes[childNode.id]).toBeUndefined();
    expect(mockThreeScene.children.length).toBe(0);
  });
});