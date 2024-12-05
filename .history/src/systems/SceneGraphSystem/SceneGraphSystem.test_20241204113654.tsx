// src/systems/SceneGraphSystem/SceneGraphSystem.test.tsx

import { Scene, Object3D } from "three";
import { SceneGraphSystemClass } from "./SceneGraphSystem";
import { useSceneGraphStore } from "../../stores/sceneGraphStore";
import { useLogicStore } from "../../stores/logicStore";
import {
  SceneGraphNode,
  SceneGraphStoreNode,
  SceneGraphState,
} from "../../types/sceneGraph.types";
import { LogicComponent } from "../../types/logic.types";

// Mock EventDispatcher
jest.mock("../../utils/EventDispatcher", () => ({
  EventDispatcher: {
    on: jest.fn(),
    off: jest.fn(),
    dispatch: jest.fn(),
  },
}));

// Define mock state interface
interface MockState {
  nodes: Record<string, SceneGraphStoreNode>;
  addNode: jest.Mock<void, [SceneGraphStoreNode]>;
  removeNode: jest.Mock<void, [string]>;
  setParent: jest.Mock<void, [string, string | undefined]>;
  getNode: jest.Mock<SceneGraphStoreNode | undefined, [string]>;
  updateNode: jest.Mock<void, [string, Partial<SceneGraphStoreNode>]>;
}

// Create initial store state with explicit typing
const createMockState = (): MockState => {
  const mockState: MockState = {
    nodes: {},

    addNode: jest.fn<void, [SceneGraphStoreNode]>((node) => {
      mockState.nodes[node.id] = { ...node };
    }),

    removeNode: jest.fn<void, [string]>((id) => {
      delete mockState.nodes[id];
    }),

    setParent: jest.fn<void, [string, string | undefined]>((childId, parentId) => {
      const child = mockState.nodes[childId];
      if (child) {
        const previousParentId = child.parentId;

        // If there was a previous parent, remove the child from its childrenIds
        if (previousParentId && mockState.nodes[previousParentId]) {
          const index = mockState.nodes[previousParentId].childrenIds.indexOf(childId);
          if (index > -1) {
            mockState.nodes[previousParentId].childrenIds.splice(index, 1);
          }
        }

        // Set the new parentId
        child.parentId = parentId;

        // If there's a new parent, add the childId to its childrenIds
        if (parentId && mockState.nodes[parentId]) {
          mockState.nodes[parentId].childrenIds.push(childId);
        }
      }
    }),

    getNode: jest.fn<SceneGraphStoreNode | undefined, [string]>((id) => {
      return mockState.nodes[id];
    }),

    updateNode: jest.fn<void, [string, Partial<SceneGraphStoreNode>]>((id, updates) => {
      if (mockState.nodes[id]) {
        mockState.nodes[id] = { ...mockState.nodes[id], ...updates };
      }
    }),
  };

  return mockState;
};

let mockState: MockState;

// Mock sceneGraphStore
jest.mock("../../stores/sceneGraphStore", () => ({
  useSceneGraphStore: {
    getState: () => mockState,
    setState: jest.fn((fn: (state: SceneGraphState) => Partial<SceneGraphState>) => {
      const updates = fn(mockState);
      Object.assign(mockState, updates);
    }),
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
    // Reset mocks
    jest.clearAllMocks();

    // Initialize mock state
    mockState = createMockState();

    // Set up Three.js mocks
    mockThreeScene = new Scene();
    mockThreeScene.children = [];

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

    // Spy on Object3D methods
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

    // Initialize system
    SceneGraphSystemClass.resetInstance();
    SceneGraphSystem = SceneGraphSystemClass.getInstance({ debug: true }, mockThreeScene);
  });

  afterEach(() => {
    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it("should reset the SceneGraphSystem correctly", () => {
    const node: SceneGraphNode = {
      id: "node1",
      name: "Test Node",
      parentId: undefined,
      childrenIds: [],
      object3D: new Object3D(),
    };

    SceneGraphSystem.addObject(node.id, node.name, node.object3D);

    expect(mockState.nodes[node.id]).toBeDefined();
    expect(mockThreeScene.children).toContain(node.object3D);

    SceneGraphSystem.reset();

    expect(mockState.nodes[node.id]).toBeUndefined();
    expect(mockThreeScene.children).not.toContain(node.object3D);
    expect(mockThreeScene.children.length).toBe(0);
  });

  it("should handle adding multiple objects and resetting correctly", () => {
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

    nodesToAdd.forEach(node => {
      SceneGraphSystem.addObject(node.id, node.name, node.object3D, node.parentId);
    });

    expect(mockState.nodes["node1"]).toBeDefined();
    expect(mockState.nodes["node2"]).toBeDefined();
    expect(mockState.nodes["node1"].childrenIds).toContain("node2");

    const parent = nodesToAdd[0].object3D;
    const child = nodesToAdd[1].object3D;

    expect(mockThreeScene.children).toContain(parent);
    expect(mockThreeScene.children).not.toContain(child);
    expect(parent.children).toContain(child);

    SceneGraphSystem.reset();

    expect(mockState.nodes["node1"]).toBeUndefined();
    expect(mockState.nodes["node2"]).toBeUndefined();
    expect(mockThreeScene.children.length).toBe(0);
  });

  it("should handle adding and moving objects within the SceneGraphSystem", () => {
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

    SceneGraphSystem.addObject(parentNode.id, parentNode.name, parentNode.object3D);
    SceneGraphSystem.addObject(childNode.id, childNode.name, childNode.object3D, childNode.parentId);

    expect(mockState.nodes["parent1"].childrenIds).toContain("child1");
    expect(mockState.nodes["child1"].parentId).toBe("parent1");
    expect(parentNode.object3D.children).toContain(childNode.object3D);

    SceneGraphSystem.moveObject(childNode.id, undefined);

    expect(mockState.nodes["parent1"].childrenIds).not.toContain("child1");
    expect(mockState.nodes["child1"].parentId).toBeUndefined();
    expect(mockThreeScene.children).toContain(childNode.object3D);
    expect(parentNode.object3D.children).not.toContain(childNode.object3D);

    SceneGraphSystem.reset();

    expect(mockState.nodes["parent1"]).toBeUndefined();
    expect(mockState.nodes["child1"]).toBeUndefined();
    expect(mockThreeScene.children.length).toBe(0);
  });
});