// src/components/InitializationManager.tsx

import React from "react";
import { useThree } from "@react-three/fiber";

/**
 * InitializationManager.tsx
 *
 * This component is responsible for any additional initialization tasks that are not handled
 * by the systems themselves. Since each system initializes itself in its own file, this
 * component does not re-initialize them, preventing multiple initializations.
 *
 * If there are other initialization tasks (e.g., setting up global listeners, configuring services),
 * they can be handled here.
 */
const InitializationManager: React.FC = () => {
  const { scene } = useThree();

  // Since systems initialize themselves, no need to initialize them here.
  // This component can be used for other initialization tasks if needed.

  return null; // This component doesn't render anything
};

export default InitializationManager;
