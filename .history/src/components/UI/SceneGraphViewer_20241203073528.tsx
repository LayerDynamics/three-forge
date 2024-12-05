// src/components/UI/SceneGraphViewer.tsx

import React, { useEffect } from "react";
import { useSceneGraphStore } from "../../stores/sceneGraphStore";
import { SceneGraphState } from "../../types/sceneGraph.types";
import memoizeOne from "memoize-one";
import {shallow} from "zustand/shallow"; // Ensure shallow is imported

/**
 * Maximum depth to prevent excessively deep trees.
 */
const MAX_DEPTH = 10;

/**
 * Memoized selector function to retrieve root node IDs.
 */
const selectRootNodeIds = memoizeOne((state: SceneGraphState): string[] =>
  Object.keys(state.nodes).filter((id: string) => !state.nodes[id].parentId)
);

/**
 * Recursive component to display a SceneGraphNode and its children.
 * Uses React.memo to prevent unnecessary re-renders.
 */
const SceneGraphNodeItem: React.FC<{ nodeId: string; depth?: number; visited?: Set<string> }> = React.memo(
  ({ nodeId, depth = 0, visited = new Set() }) => {
    useEffect(() => {
      console.log(`[SceneGraphNodeItem] Rendering nodeId: ${nodeId} at depth: ${depth}`);
    }, [nodeId, depth]);

    if (depth > MAX_DEPTH) {
      console.warn(`[SceneGraphNodeItem] Max depth of ${MAX_DEPTH} reached for nodeId: ${nodeId}`);
      return null;
    }

    if (visited.has(nodeId)) {
      console.error(`[SceneGraphNodeItem] Detected cycle at nodeId: ${nodeId}`);
      return null;
    }

    // Selector to fetch the current node by ID
    const node = useSceneGraphStore(
      (state) => state.nodes[nodeId],
      shallow
    );

    if (!node) {
      console.error(`[SceneGraphNodeItem] Node not found: ${nodeId}`);
      return null;
    }

    const childrenIds = node.childrenIds;

    // Create a new Set for visited nodes
    const newVisited = new Set(visited);
    newVisited.add(nodeId);

    return (
      <li>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span>{node.name} (ID: {node.id})</span>
        </div>
        {childrenIds.length > 0 && (
          <ul style={{ listStyleType: "none", paddingLeft: "20px" }}>
            {childrenIds.map((childId) => (
              <SceneGraphNodeItem key={childId} nodeId={childId} depth={depth + 1} visited={newVisited} />
            ))}
          </ul>
        )}
      </li>
    );
  },
  (prevProps, nextProps) =>
    prevProps.nodeId === nextProps.nodeId && prevProps.depth === nextProps.depth
);

/**
 * Component: SceneGraphViewer
 * Displays the hierarchical structure of the scene graph.
 */
const SceneGraphViewer: React.FC = () => {
  useEffect(() => {
    console.log("[SceneGraphViewer] Mounted");
    return () => {
      console.log("[SceneGraphViewer] Unmounted");
    };
  }, []);

  const rootNodeIds = useSceneGraphStore(selectRootNodeIds, shallow);

  useEffect(() => {
    console.log(`[SceneGraphViewer] Root nodes updated: ${rootNodeIds.join(", ")}`);
  }, [rootNodeIds]);

  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        left: 320, // Adjust as needed
        width: "300px",
        maxHeight: "90vh",
        overflowY: "auto",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        padding: "10px",
        borderRadius: "5px",
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        zIndex: 1000, // Ensure it's on top
      }}
    >
      <h3>Scene Graph</h3>
      {rootNodeIds.length === 0 ? (
        <p>No objects in the scene.</p>
      ) : (
        <ul style={{ listStyleType: "none", paddingLeft: "20px" }}>
          {rootNodeIds.map((id) => (
            <SceneGraphNodeItem key={id} nodeId={id} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default SceneGraphViewer;
