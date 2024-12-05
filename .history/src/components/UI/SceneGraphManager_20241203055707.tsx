// src/components/SceneGraphManager/SceneGraphManager.tsx

import React, { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { Object3D, Scene } from "three";
import { useSceneGraph } from "../../hooks/useSceneGraph";
import { SceneGraphSystemClass } from "../../systems/SceneGraphSystem/SceneGraphSystem";

interface SceneGraphManagerProps {
  onAddObject: (
    addObject: (
      id: string,
      name: string,
      object3D: Object3D,
      parentId?: string
    ) => void
  ) => void;
}

/**
 * Component: SceneGraphManager
 * Wraps the Canvas and initializes the SceneGraphSystem with the Three.js Scene.
 */
const SceneGraphManager: React.FC<SceneGraphManagerProps> = ({ onAddObject }) => {
  const { scene } = useThree();
  const { addObject } = useSceneGraph(scene);
  const hasInitialized = useRef(false); // To prevent multiple initializations

  useEffect(() => {
    if (hasInitialized.current) {
      console.log("[SceneGraphManager] Already initialized. Skipping.");
      return;
    }

    if (!addObject) {
      console.log("[SceneGraphManager] addObject not ready yet. Skipping.");
      return;
    }

    console.log("[SceneGraphManager] useEffect triggered");

    // Pass the addObject function to the parent component
    onAddObject(addObject);
    console.log("[SceneGraphManager] addObject passed to App");

    // Initialize SceneGraphSystem here with the correct Scene
    const sceneGraphSystem = SceneGraphSystemClass.getInstance(
      { debug: true },
      scene
    );

    console.log("[SceneGraphManager] SceneGraphSystem initialized");

    hasInitialized.current = true; // Mark as initialized

    // Cleanup on unmount
    return () => {
      console.log("[SceneGraphManager] Cleaning up SceneGraphSystem");
      sceneGraphSystem.cleanup(); // Ensure cleanup is called
    };
  }, [onAddObject, addObject, scene]);

  return null; // This component doesn't render anything itself
};

export default SceneGraphManager;
