// src/tools/SceneInspector/components/ObjectTree.tsx

import React, { useState, useEffect } from "react";
import { useSceneGraphStore } from "../../../stores/sceneGraphStore";
import { SceneGraphNode } from "../../../types/sceneGraph.types";
import { shallow } from "zustand/shallow";

/**
 * TreeNode Component
 * Represents a single node in the Scene Graph tree.
 */
const TreeNode: React.FC<{ nodeId: string; depth?: number; visited?: Set<string> }> = ({
  nodeId,
  depth = 0,
  visited = new Set(),
}) => {
  // State to manage the expansion of child nodes
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch the node data from the store
  const node: SceneGraphNode | undefined = useSceneGraphStore(
    (state) => state.nodes[nodeId],
    shallow
  );

  useEffect(() => {
    console.log(`[TreeNode] Rendering nodeId: ${nodeId} at depth: ${depth}`);
  }, [nodeId, depth]);

  if (depth > 10) {
    console.warn(`[TreeNode] Max depth exceeded for nodeId: ${nodeId}`);
    return null;
  }

  if (visited.has(nodeId)) {
    console.error(`[TreeNode] Detected cycle at nodeId: ${nodeId}`);
    return null;
  }

  if (!node) {
    console.error(`[TreeNode] Node not found: ${nodeId}`);
    return null;
  }

  const childrenIds = node.childrenIds;

  // Update the visited set to include the current node
  const newVisited = new Set(visited);
  newVisited.add(nodeId);

  return (
    <li>
      <div style={{ display: "flex", alignItems: "center" }}>
        {childrenIds.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              marginRight: "5px",
              cursor: "pointer",
              background: "none",
              border: "none",
              padding: 0,
              fontSize: "16px",
            }}
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? "▼" : "▶"}
          </button>
        )}
        <span>
          {node.name} (ID: {node.id})
        </span>
      </div>
      {isExpanded && childrenIds.length > 0 && (
        <ul style={{ listStyleType: "none", paddingLeft: "20px" }}>
          {childrenIds.map((childId) => (
            <TreeNode key={childId} nodeId={childId} depth={depth + 1} visited={newVisited} />
          ))}
        </ul>
      )}
    </li>
  );
};

/**
 * ObjectTree Component
 * Displays the hierarchical structure of the scene graph.
 */
const ObjectTree: React.FC = () => {
  const rootNodeIds = useSceneGraphStore(
    (state) =>
      Object.keys(state.nodes).filter((id) => !state.nodes[id].parentId),
    shallow
  );

  useEffect(() => {
    console.log(`[ObjectTree] Root nodes updated: ${rootNodeIds.join(", ")}`);
  }, [rootNodeIds]);

  return (
    <div>
      <h3>Scene Graph</h3>
      {rootNodeIds.length === 0 ? (
        <p>No objects in the scene.</p>
      ) : (
        <ul style={{ listStyleType: "none", paddingLeft: "20px" }}>
          {rootNodeIds.map((id) => (
            <TreeNode key={id} nodeId={id} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default ObjectTree;