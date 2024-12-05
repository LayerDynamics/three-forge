// src/components/UI/SceneGraphViewer.tsx

import React, { useMemo, useCallback } from "react";
import { useSceneGraphStore } from "../../stores/sceneGraphStore";
import { SceneGraphNode } from "../../types/sceneGraph.types";
import { shallow } from "zustand/shallow"; // Corrected import

/**
 * Recursive component to display a SceneGraphNode and its children.
 */
const SceneGraphNodeItem: React.FC<{ node: SceneGraphNode }> = React.memo(({ node }) => {
  // Memoize the selector using useCallback to ensure it's stable across renders
  const selectChildren = useCallback(
    (state: any) =>
      node.childrenIds
        .map((childId: string) => state.nodes[childId])
        .filter((child): child is SceneGraphNode => Boolean(child)),
    [node.childrenIds]
  );

  // Use the selector with shallow comparison to prevent unnecessary re-renders
  const children = useSceneGraphStore(selectChildren, shallow);

  return (
    <li>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span>{node.name} (ID: {node.id})</span>
      </div>
      {children.length > 0 && (
        <ul>
          {children.map((child) => (
            <SceneGraphNodeItem key={child.id} node={child} />
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
  // Memoize the selector to prevent it from being recreated on every render
  const selectRootNodes = useMemo(
    () =>
      (state: any) => Object.values(state.nodes).filter((node: SceneGraphNode) => !node.parentId),
    []
  );

  // Use the selector with shallow comparison to prevent unnecessary re-renders
  const rootNodes = useSceneGraphStore(selectRootNodes, shallow);

  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        left: 320, // Adjusted to prevent overlapping with other UI components
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
        {rootNodes.map((node: SceneGraphNode) => (
          <SceneGraphNodeItem key={node.id} node={node} />
        ))}
      </ul>
    </div>
  );
};

export default SceneGraphViewer;