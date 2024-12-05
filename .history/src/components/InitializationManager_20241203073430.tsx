// src/components/InitializationManager.tsx

import React, { useEffect } from "react";
import { AbilitySystem } from "../systems/AbilitySystem/AbilitySystem";
import { WeaponSystem } from "../systems/WeaponSystem/WeaponSystem";
import { AssetLoadingSystem } from "../systems/AssetLoadingSystem/AssetLoadingSystem";
import { AnimationSystem } from "../systems/AnimationSystem/AnimationSystem";
import { SceneGraphSystemClass } from "../systems/SceneGraphSystem/SceneGraphSystem";
import { Scene } from "three";
import { useThree } from "@react-three/fiber";

const InitializationManager: React.FC = () => {
  const { scene } = useThree();

  useEffect(() => {
    console.log("[InitializationManager] Initializing systems");

    // Initialize systems
    AbilitySystem.initialize({ initialAbilities: [], debug: true });
    WeaponSystem.initialize({ initialWeapons: [], debug: true });
    AssetLoadingSystem.initialize({ debug: true });
    AnimationSystem.initialize({ debug: false }); // Debug logs disabled

    SceneGraphSystemClass.getInstance({ debug: true }, scene);

    return () => {
      console.log("[InitializationManager] Cleaning up systems");

      // Cleanup systems
      AbilitySystem.cleanup();
      WeaponSystem.cleanup();
      AssetLoadingSystem.cleanup();
      AnimationSystem.cleanup();
      SceneGraphSystemClass.getInstance().cleanup();
    };
  }, [scene]);

  return null; // This component doesn't render anything
};

export default InitializationManager;
