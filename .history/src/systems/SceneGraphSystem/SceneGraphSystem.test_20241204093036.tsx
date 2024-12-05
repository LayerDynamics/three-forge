// src/systems/SceneGraphSystem/SceneGraphSystem.test.tsx

import { SceneGraphSystemClass, SceneGraphSystem } from './SceneGraphSystem';
import { Scene, Object3D } from 'three';
import { useSceneGraphStore } from '../../stores/sceneGraphStore';
import { LogicComponent } from '../../types/logic.types';
import { EventDispatcher } from '../../utils/EventDispatcher';

jest.mock('../../stores/sceneGraphStore', () => ({
  useSceneGraphStore: {
    getState: jest.fn(),
  },
}));

describe('SceneGraphSystem', () => {
  let mockAddNode: jest.Mock;
  let mockUpdateNode: jest.Mock;
  let mockRemoveNode: jest.Mock;
  let mockSetParent: jest.Mock;
  let mockGetNode: jest.Mock;
  let mockThreeScene: Scene;
  let mockAdd: jest.Mock;
  let mockRemove: jest.Mock;
  let nodes: Record<string, any>;
  let logicComponents: Record<string, LogicComponent>;

  beforeEach(() => {
    // Reset the singleton instance
    SceneGraphSystemClass.resetInstance();

    // Reset mocks
    mockAddNode = jest.fn();
    mockUpdateNode = jest.fn();
    mockRemoveNode = jest.fn();
    mockSetParent = jest.fn();
    mockGetNode = jest.fn();

    (useSceneGraphStore.getState as jest.Mock).mockReturnValue({
      addNode: mockAddNode,
      updateNode: mockUpdateNode,
      removeNode: mockRemoveNode,
      setParent: mockSetParent,
      getNode: mockGetNode,
      nodes: {},
    });

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
  });

  afterEach(() => {
    SceneGraphSystem.cleanup();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should reset the SceneGraphSystem correctly', () => {
    // Implement your reset test
    // ...
    expect(true).toBe(true); // Placeholder
  });

  it('should handle adding multiple objects and resetting correctly', () => {
    const system = SceneGraphSystemClass.getInstance({}, mockThreeScene);

    // Define storeNodes
    const storeNodes = [
      {
        id: 'node1',
        name: 'Node 1',
        childrenIds: [],
        parentId: undefined,
      },
      {
        id: 'node2',
        name: 'Node 2',
        childrenIds: [],
        parentId: 'node1',
      },
    ];

    // Mock getNode responses
    mockGetNode.mockImplementation((id: string) => {
      return nodes[id];
    });

    // Add parent node
    system.addObject('node1', 'Node 1', new Object3D());
    nodes['node1'] = storeNodes[0];
    expect(mockAddNode).toHaveBeenNthCalledWith(1, storeNodes[0]);

    // Add child node with parentId 'node1'
    system.addObject('node2', 'Node 2', new Object3D(), 'node1');
    nodes['node2'] = storeNodes[1];
    expect(mockAddNode).toHaveBeenNthCalledWith(2, storeNodes[1]);

    // Update parent node's childrenIds
    storeNodes[0].childrenIds.push('node2');
    system.moveObject('node2', 'node1');
    expect(mockUpdateNode).toHaveBeenCalledWith('node1', {
      childrenIds: ['node2'],
    });

    // Now, reset the system
    system.reset();

    // Ensure all nodes are removed
    expect(mockRemoveNode).toHaveBeenCalledWith('node1');
    expect(mockRemoveNode).toHaveBeenCalledWith('node2');

    // Ensure Three.js scene is cleared
    expect(mockRemove).toHaveBeenCalledTimes(2);
  });

  it('should handle adding and moving objects within the SceneGraphSystem', () => {
    const system = SceneGraphSystemClass.getInstance({}, mockThreeScene);

    // Define storeNodes
    const parentStoreNode = {
      id: 'parent1',
      name: 'Parent Node',
      childrenIds: [],
      parentId: undefined,
    };

    const childStoreNode = {
      id: 'child1',
      name: 'Child Node',
      childrenIds: [],
      parentId: 'parent1',
    };

    // Mock getNode responses
    mockGetNode.mockImplementation((id: string) => {
      return nodes[id];
    });

    // Add parent node
    system.addObject('parent1', 'Parent Node', new Object3D());
    nodes['parent1'] = parentStoreNode;
    expect(mockAddNode).toHaveBeenNthCalledWith(1, parentStoreNode);

    // Add child node with parentId 'parent1'
    system.addObject('child1', 'Child Node', new Object3D(), 'parent1');
    nodes['child1'] = childStoreNode;
    expect(mockAddNode).toHaveBeenNthCalledWith(2, childStoreNode);

    // Update parent node's childrenIds
    parentStoreNode.childrenIds.push('child1');
    system.moveObject('child1', 'parent1');
    expect(mockUpdateNode).toHaveBeenCalledWith('parent1', {
      childrenIds: ['child1'],
    });

    // Ensure Three.js scene is updated
    expect(mockAdd).toHaveBeenCalledWith(expect.any(Object3D));
    expect(mockRemove).toHaveBeenCalledWith(expect.any(Object3D));
  });
});