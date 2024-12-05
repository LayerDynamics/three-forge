// src/components/UI/SceneGraphViewer.tsx

import React from "react";
import { useSceneGraphStore } from "../../stores/sceneGraphStore";
import { SceneGraphNode } from "../../types/sceneGraph.types";
import { shallow } from "zustand/shallow";

/**
 * Recursive component to display a SceneGraphNode and its children.
 * Receives only the nodeId to ensure selector stability.
 */
const SceneGraphNodeItem: React.FC<{ nodeId: string }> = React.memo(({ nodeId }) => {
  // Selector to fetch the current node by ID
  const node = useSceneGraphStore(
    (state) => state.nodes[nodeId],
    shallow
  );

  // If the node doesn't exist, don't render anything
  if (!node) return null;

  // Selector to fetch children nodes of the current node
  const children = useSceneGraphStore(
    (state) =>
      node.childrenIds
        .map((childId: string) => state.nodes[childId])
        .filter((child): child is SceneGraphNode => Boolean(child)),
    shallow
  );

  return (
    <li>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span>{node.name} (ID: {node.id})</span>
      </div>
      {children.length > 0 && (
        <ul style={{ listStyleType: "none", paddingLeft: "20px" }}>
          {children.map((child) => (
            <SceneGraphNodeItem key={child.id} nodeId={child.id} />
          ))}
        </ul>
      )}
    </li>
  );
});

/**
 * Component: SceneGraphViewer
 * Displays the hierarchical structure of the scene graph.
 */
const SceneGraphViewer: React.FC = () => {
  // Selector to retrieve all root nodes (nodes without a parentId)
  const rootNodes = useSceneGraphStore(
    (state) => Object.values(state.nodes).filter((node: SceneGraphNode) => !node.parentId),
    shallow
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
        {rootNodes.map((node: SceneGraphNode) => (
          <SceneGraphNodeItem key={node.id} nodeId={node.id} />
        ))}
      </ul>
    </div>
  );
};

export default SceneGraphViewer;