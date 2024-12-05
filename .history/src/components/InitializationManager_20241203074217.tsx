// src/components/InitializationManager.tsx

import React from "react";
import { useThree } from "@react-three/fiber";

const InitializationManager: React.FC = () => {
  const { scene } = useThree();

  // Systems initialize themselves. No need to initialize them here.
  // This component can handle other initialization tasks if necessary.

  return null; // This component doesn't render anything
};

export default InitializationManager;
