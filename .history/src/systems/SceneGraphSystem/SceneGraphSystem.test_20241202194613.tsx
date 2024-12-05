// src/systems/SceneGraphSystem/SceneGraphSystem.test.tsx

import { SceneGraphSystemClass, SceneGraphSystem } from "./SceneGraphSystem";
import { useSceneGraphStore } from "../../stores/sceneGraphStore";
import { Scene, Object3D } from "three";
import { SceneGraphNode } from "../../types/sceneGraph.types";
import { GameEvent } from "../../types/logic.types";
import { EventDispatcher } from "../../utils/EventDispatcher";

jest.mock("three", () => {
  const actualThree = jest.requireActual("three");
  return {
    ...actualThree,
    Scene: jest.fn().mockImplementation(() => ({
      add: jest.fn(),
      remove: jest.fn(),
    })),
    Object3D: jest.fn().mockImplementation(() => ({
      add: jest.fn(),
      remove: jest.fn(),
    })),
  };
});

describe("SceneGraphSystem", () => {
  let threeScene: Scene;

  beforeEach(() => {
    // Reset the SceneGraphStore before each test
    useSceneGraphStore.setState({
      nodes: {},
      addNode: jest.fn(),
      removeNode: jest.fn(),
      updateNode: jest.fn(),
      getNode: jest.fn(),
      setParent: jest.fn(),
    });
    // Clear all events
    (EventDispatcher as any).events = {};
    // Create a mock Three.js Scene
    threeScene = new Scene();
    (threeScene.add as jest.Mock).mockClear();
    (threeScene.remove as jest.Mock).mockClear();
    // Reset the singleton instance
    (SceneGraphSystemClass as any).instance = null;
    // Initialize the SceneGraphSystem
    SceneGraphSystem.initialize({ debug: true }, threeScene);
    SceneGraphSystem.processEvents();
  });

  it("should add an object to the scene graph", () => {
    const mockObject = new Object3D();
    const id = "node1";
    const name = "Test Node";

    SceneGraphSystem.addObject(id, name, mockObject);

    // Verify that the node was added to the store
    expect(useSceneGraphStore.getState().addNode).toHaveBeenCalledWith({
      id,
      name,
      parentId: undefined,
      childrenIds: [],
      object3D: mockObject,
    });

    // Verify that the object was added to the Three.js Scene
    expect(threeScene.add).toHaveBeenCalledWith(mockObject);
  });

  it("should add an object with a parent to the scene graph", () => {
    const parentObject = new Object3D();
    const childObject = new Object3D();
    const parentId = "parent1";
    const childId = "child1";
    const parentName = "Parent Node";
    const childName = "Child Node";

    // Add parent node
    SceneGraphSystem.addObject(parentId, parentName, parentObject);

    // Mock the getNode to return the parent node
    (useSceneGraphStore.getState().getNode as jest.Mock).mockImplementation((id: string) => {
      if (id === parentId) {
        return {
          id: parentId,
          name: parentName,
          parentId: undefined,
          childrenIds: [childId],
          object3D: parentObject,
        };
      }
      return undefined;
    });

    // Add child node with parentId
    SceneGraphSystem.addObject(childId, childName, childObject, parentId);

    // Verify that the child node was added to the store
    expect(useSceneGraphStore.getState().addNode).toHaveBeenCalledWith({
      id: childId,
      name: childName,
      parentId: parentId,
      childrenIds: [],
      object3D: childObject,
    });

    // Verify that the child object was added to the parent Object3D
    expect(parentObject.add).toHaveBeenCalledWith(childObject);
  });

  it("should remove an object from the scene graph", () => {
    const mockObject = new Object3D();
    const id = "node2";
    const name = "Removable Node";

    // Add the node first
    SceneGraphSystem.addObject(id, name, mockObject);

    // Mock the getNode to return the node
    (useSceneGraphStore.getState().getNode as jest.Mock).mockImplementation((id: string) => {
      if (id === "node2") {
        return {
          id: "node2",
          name: "Removable Node",
          parentId: undefined,
          childrenIds: [],
          object3D: mockObject,
        };
      }
      return undefined;
    });

    // Remove the node
    SceneGraphSystem.removeObject(id);

    // Verify that the node was removed from the store
    expect(useSceneGraphStore.getState().removeNode).toHaveBeenCalledWith(id);

    // Verify that the object was removed from the Three.js Scene
    expect(threeScene.remove).toHaveBeenCalledWith(mockObject);
  });

  it("should move an object to a new parent", () => {
    const parent1 = new Object3D();
    const parent2 = new Object3D();
    const child = new Object3D();
    const parentId1 = "parent1";
    const parentId2 = "parent2";
    const childId = "child1";
    const parentName1 = "Parent One";
    const parentName2 = "Parent Two";
    const childName = "Child Node";

    // Add two parent nodes
    SceneGraphSystem.addObject(parentId1, parentName1, parent1);
    SceneGraphSystem.addObject(parentId2, parentName2, parent2);

    // Mock the getNode to return the parent nodes
    (useSceneGraphStore.getState().getNode as jest.Mock).mockImplementation((id: string) => {
      if (id === parentId1) {
        return {
          id: parentId1,
          name: parentName1,
          parentId: undefined,
          childrenIds: [childId],
          object3D: parent1,
        };
      }
      if (id === parentId2) {
        return {
          id: parentId2,
          name: parentName2,
          parentId: undefined,
          childrenIds: [],
          object3D: parent2,
        };
      }
      return undefined;
    });

    // Add child node under parent1
    SceneGraphSystem.addObject(childId, childName, child, parentId1);

    // Move child node to parent2
    SceneGraphSystem.moveObject(childId, parentId2);

    // Verify that the child was removed from parent1 and added to parent2
    expect(parent1.remove).toHaveBeenCalledWith(child);
    expect(parent2.add).toHaveBeenCalledWith(child);
    expect(useSceneGraphStore.getState().setParent).toHaveBeenCalledWith(childId, parentId2);
  });

  it("should handle scene reset", () => {
    const mockObject1 = new Object3D();
    const mockObject2 = new Object3D();
    const id1 = "node3";
    const id2 = "node4";
    const name1 = "Node Three";
    const name2 = "Node Four";

    // Add two nodes
    SceneGraphSystem.addObject(id1, name1, mockObject1);
    SceneGraphSystem.addObject(id2, name2, mockObject2);

    // Reset the scene graph
    SceneGraphSystem.reset();

    // Verify that both nodes were removed
    expect(useSceneGraphStore.getState().removeNode).toHaveBeenCalledWith(id1);
    expect(useSceneGraphStore.getState().removeNode).toHaveBeenCalledWith(id2);

    // Verify that objects were removed from the Three.js Scene
    expect(threeScene.remove).toHaveBeenCalledWith(mockObject1);
    expect(threeScene.remove).toHaveBeenCalledWith(mockObject2);
  });

  it("should handle events to spawn and remove objects", () => {
    const spawnEvent: GameEvent = {
      type: "SPAWN_OBJECT",
      payload: {
        id: "spawn1",
        name: "Spawned Node",
        object3D: new Object3D(),
        parentId: undefined,
      },
    };

    const removeEvent: GameEvent = {
      type: "REMOVE_OBJECT",
      payload: {
        id: "spawn1",
      },
    };

    // Listen for debug logs or specific calls if necessary

    // Dispatch spawn event
    EventDispatcher.dispatch("NEW_GAME_EVENT", spawnEvent);

    // Verify that the object was added
    expect(useSceneGraphStore.getState().addNode).toHaveBeenCalledWith({
      id: "spawn1",
      name: "Spawned Node",
      parentId: undefined,
      childrenIds: [],
      object3D: spawnEvent.payload.object3D,
    });

    // Dispatch remove event
    EventDispatcher.dispatch("NEW_GAME_EVENT", removeEvent);

    // Verify that the object was removed
    expect(useSceneGraphStore.getState().removeNode).toHaveBeenCalledWith("spawn1");
    expect(threeScene.remove).toHaveBeenCalledWith(spawnEvent.payload.object3D);
  });
});
