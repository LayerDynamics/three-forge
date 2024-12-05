// src/components/UI/SceneGraphViewer.tsx

import React, { useMemo } from "react";
import { useSceneGraphStore } from "../../stores/sceneGraphStore";
import { SceneGraphNode } from "../../types/sceneGraph.types";
import shallow from "zustand/shallow";

/**
 * Recursive component to display a SceneGraphNode and its children.
 */
const SceneGraphNodeItem: React.FC<{ node: SceneGraphNode }> = ({ node }) => {
  const children = useSceneGraphStore(
    (state) =>
      node.childrenIds
        .map((childId) => state.nodes[childId])
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
            <SceneGraphNodeItem key={child.id} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
};

/**
 * Component: SceneGraphViewer
 * Displays the hierarchical structure of the scene graph.
 */
const SceneGraphViewer: React.FC = () => {
  // Select all nodes once and useMemo to derive root nodes
  const nodes = useSceneGraphStore((state) => state.nodes, shallow);

  const rootNodes = useMemo(
    () => Object.values(nodes).filter((node) => !node.parentId),
    [nodes]
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        width: "300px",
        maxHeight: "90vh",
        overflowY: "auto",
        backgroundColor: "rgba(255,255,255,0.8)",
        padding: "10px",
        borderRadius: "5px",
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
      }}
    >
      <h3>Scene Graph</h3>
      <ul style={{ listStyleType: "none", paddingLeft: "20px" }}>
        {rootNodes.map((node) => (
          <SceneGraphNodeItem key={node.id} node={node} />
        ))}
      </ul>
    </div>
  );
};

export default SceneGraphViewer;
