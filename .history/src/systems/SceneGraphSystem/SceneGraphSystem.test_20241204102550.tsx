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
import { EventDispatcher } from "../../utils/EventDispatcher";

// Mock EventDispatcher
jest.mock("../../utils/EventDispatcher", () => ({
  EventDispatcher: {
    on: jest.fn(),
    off: jest.fn(), 
    dispatch: jest.fn()
  }
}));

// Create mock store state
let mockState: SceneGraphState;

// Mock sceneGraphStore
jest.mock("../../stores/sceneGraphStore", () => ({
  useSceneGraphStore: jest.fn(() => ({
    getState: () => mockState,
    setState: (fn: (state: SceneGraphState) => Partial<SceneGraphState>) => {
      mockState = { ...mockState, ...fn(mockState) };
    }
  }))
}));

// Mock logicStore 
jest.mock("../../stores/logicStore", () => ({
  useLogicStore: jest.fn(() => ({
    getState: jest.fn(),
    setState: jest.fn()
  }))
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
    mockState = {
      nodes: {},
      addNode: jest.fn((node: SceneGraphStoreNode) => {
        mockState.nodes[node.id] = node;
      }),
      removeNode: jest.fn((id: string) => {
        delete mockState.nodes[id];
      }),
      setParent: jest.fn((childId: string, parentId?: string) => {
        const child = mockState.nodes[childId];
        if (child) {
          child.parentId = parentId;
          if (parentId) {
            const parent = mockState.nodes[parentId];
            if (parent && !parent.childrenIds.includes(childId)) {
              parent.childrenIds.push(childId);
            }
          }
        }
      }),
      getNode: jest.fn((id: string) => mockState.nodes[id]),
      updateNode: jest.fn((id: string, updates: Partial<SceneGraphStoreNode>) => {
        if (mockState.nodes[id]) {
          mockState.nodes[id] = { ...mockState.nodes[id], ...updates };
        }
      })
    };

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
      .mockImplementation(function(this: Object3D, child: Object3D) {
        this.children.push(child);
        return this;
      });

    removeSpy = jest
      .spyOn(Object3D.prototype, "remove") 
      .mockImplementation(function(this: Object3D, child: Object3D) {
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
    // Set up test node
    const node: SceneGraphNode = {
      id: "node1",
      name: "Test Node",
      parentId: undefined,
      childrenIds: [],
      object3D: new Object3D()
    };

    // Add node to system
    SceneGraphSystem.addObject(node.id, node.name, node.object3D);

    // Verify node was added
    expect(mockState.nodes[node.id]).toBeDefined();
    expect(mockThreeScene.children).toContain(node.object3D);

    // Reset system
    SceneGraphSystem.reset();

    // Verify node was removed
    expect(mockState.nodes[node.id]).toBeUndefined();
    expect(mockThreeScene.children).not.toContain(node.object3D);
    expect(mockThreeScene.children.length).toBe(0);
  });

  it("should handle adding multiple objects and resetting correctly", () => {
    const nodes: SceneGraphNode[] = [
      {
        id: "node1",
        name: "Node 1",
        parentId: undefined,
        childrenIds: [],
        object3D: new Object3D()
      },
      {
        id: "node2", 
        name: "Node 2",
        parentId: "node1",
        childrenIds: [],
        object3D: new Object3D()
      }
    ];

    // Add nodes
    nodes.forEach(node => {
      SceneGraphSystem.addObject(node.id, node.name, node.object3D, node.parentId);
    });

    // Verify parent-child relationship
    expect(mockState.nodes["node1"].childrenIds).toContain("node2");
    expect(mockState.nodes["node2"].parentId).toBe("node1");
    
    // Verify scene graph
    expect(mockThreeScene.children).toContain(nodes[0].object3D);
    expect(nodes[0].object3D.children).toContain(nodes[1].object3D);

    // Reset
    SceneGraphSystem.reset();

    // Verify cleanup
    expect(mockState.nodes).toEqual({});
    expect(mockThreeScene.children.length).toBe(0);
  });

  it("should handle adding and moving objects within the SceneGraphSystem", () => {
    // Set up nodes
    const parent: SceneGraphNode = {
      id: "parent1",
      name: "Parent",
      parentId: undefined,
      childrenIds: [],
      object3D: new Object3D()
    };

    const child: SceneGraphNode = {
      id: "child1", 
      name: "Child",
      parentId: "parent1",
      childrenIds: [],
      object3D: new Object3D()
    };

    // Add nodes
    SceneGraphSystem.addObject(parent.id, parent.name, parent.object3D);
    SceneGraphSystem.addObject(child.id, child.name, child.object3D, child.parentId);

    // Verify initial state
    expect(mockState.nodes[parent.id].childrenIds).toContain(child.id);
    expect(mockState.nodes[child.id].parentId).toBe(parent.id);
    expect(parent.object3D.children).toContain(child.object3D);

    // Move child to root
    SceneGraphSystem.moveObject(child.id, undefined);

    // Verify new state
    expect(mockState.nodes[parent.id].childrenIds).not.toContain(child.id);
    expect(mockState.nodes[child.id].parentId).toBeUndefined();
    expect(parent.object3D.children).not.toContain(child.object3D);
    expect(mockThreeScene.children).toContain(child.object3D);

    // Reset
    SceneGraphSystem.reset();

    // Verify cleanup
    expect(mockState.nodes).toEqual({});
    expect(mockThreeScene.children.length).toBe(0);
  });
});