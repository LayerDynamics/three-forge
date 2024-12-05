// src/components/UI/SceneGraphViewer.tsx

import React, { useMemo } from "react";
import { useSceneGraphStore } from "../../stores/sceneGraphStore";
import { SceneGraphNode } from "../../types/sceneGraph.types";
import { shallow } from "zustand/shallow";

/**
 * Maximum depth to prevent infinite recursion.
 */
const MAX_DEPTH = 10;

/**
 * Recursive component to display a SceneGraphNode and its children.
 * Receives only the nodeId to ensure selector stability.
 */
const SceneGraphNodeItem: React.FC<{ nodeId: string; depth?: number }> = React.memo(
  ({ nodeId, depth = 0 }) => {
    if (depth > MAX_DEPTH) {
      console.warn(`Max depth of ${MAX_DEPTH} reached for nodeId: ${nodeId}`);
      return null;
    }

    // Selector to fetch the current node by ID
    const node = useSceneGraphStore(
      (state) => state.nodes[nodeId],
      shallow
    );

    // If the node doesn't exist, don't render anything
    if (!node) return null;

    // Prevent cyclic dependencies by ensuring a node isn't its own descendant
    if (node.childrenIds.includes(nodeId)) {
      console.error(`Cyclic dependency detected for nodeId: ${nodeId}`);
      return null;
    }

    // Selector to fetch children node IDs
    const childrenIds = node.childrenIds;

    return (
      <li>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span>{node.name} (ID: {node.id})</span>
        </div>
        {childrenIds.length > 0 && (
          <ul style={{ listStyleType: "none", paddingLeft: "20px" }}>
            {childrenIds.map((childId) => (
              <SceneGraphNodeItem key={childId} nodeId={childId} depth={depth + 1} />
            ))}
          </ul>
        )}
      </li>
    );
  }
);

/**
 * Custom equality function to compare arrays of strings (node IDs)
 */
const arrayEqual = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

/**
 * Component: SceneGraphViewer
 * Displays the hierarchical structure of the scene graph.
 */
const SceneGraphViewer: React.FC = () => {
  // Memoize the rootNodeIds to ensure the same reference is returned unless nodes change
  const rootNodeIds = useSceneGraphStore(
    useMemo(
      () => (state: any) => Object.keys(state.nodes).filter((id: string) => !state.nodes[id].parentId),
      []
    ),
    arrayEqual // Use custom equality function
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        left: 320, // Adjusted to prevent overlapping with other UI components
        width: "300px",
        maxHeight: "90vh",
        overflowY: "auto",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        padding: "10px",
        borderRadius: "5px",
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
      }}
    >
      <h3>Scene Graph</h3>
      <ul style={{ listStyleType: "none", paddingLeft: "20px" }}>
        {rootNodeIds.map((id) => (
          <SceneGraphNodeItem key={id} nodeId={id} />
        ))}
      </ul>
    </div>
  );
};

export default SceneGraphViewer;
