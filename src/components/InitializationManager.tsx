// src/components/InitializationManager.tsx

import React, { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";

/**
 * InitializationManager.tsx
 *
 * Responsible for any additional global initialization tasks that are not handled
 * by individual systems. Ensures initialization runs only once.
 */
const InitializationManager: React.FC = () => {
  const { scene } = useThree();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) {
      console.log("[InitializationManager] Already initialized. Skipping.");
      return;
    }

    console.log("[InitializationManager] Running Initialization tasks");

    // Add any additional initialization logic here
    // Example: Setting up global event listeners, configuring services, etc.

    hasInitialized.current = true;

    return () => {
      console.log("[InitializationManager] Cleaning up Initialization tasks");
      // Add any cleanup logic here if necessary
    };
  }, []);

  return null; // This component doesn't render anything
};

export default InitializationManager;
