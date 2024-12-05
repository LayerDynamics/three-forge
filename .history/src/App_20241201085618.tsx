// src/App.tsx

import React, { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { AbilitySystem } from "./systems/AbilitySystem/AbilitySystem";
import { WeaponSystem } from "./systems/WeaponSystem/WeaponSystem";
import { PhysicsSystem } from "./systems/PhysicsSystem/PhysicsSystem";
import { AnimationSystem } from "./systems/AnimationSystem/AnimationSystem";
import { AssetLoadingSystem } from "./systems/AssetLoadingSystem/AssetLoadingSystem";
import { useAbility } from "./hooks/useAbility";
import { useWeapon } from "./hooks/useWeapon";
import { usePhysics } from "./hooks/usePhysics";
import { useAnimation } from "./hooks/useAnimation";
import { useAsset } from "./hooks/useAsset";
import { Vector3, Object3D, AnimationClip, AnimationMixer } from "three";
import { Asset } from "./types/asset.types"; // Import the Asset type
import AbilityButton from "./components/UI/AbilityButton";
import WeaponButton from "./components/UI/WeaponButton";
import PhysicsBodyButton from "./components/UI/PhysicsBodyButton";
import AnimationController from "./components/UI/AnimationController";
import AssetLoader from "./components/UI/AssetLoader"; // New component
import "./App.css";

// Component to display a loaded model
const ModelViewer: React.FC<{ assetId: string }> = ({ assetId }) => {
  const { getAsset } = useAsset();
  const model = getAsset(assetId)?.data;

  if (!model) {
    return null; // Model not loaded yet
  }

  return <primitive object={model} />;
};

const App: React.FC = () => {
  const { addAbility } = useAbility();
  const { addWeapon, equipWeapon } = useWeapon();
  const { addBox, addSphere } = usePhysics();
  const { addAnimation, playAnimation, pauseAnimation, stopAnimation } = useAnimation();
  const { loadAsset, assets } = useAsset();

  useEffect(() => {
    // Initialize Abilities
    addAbility({
      id: "heal",
      name: "Heal",
      description: "Restores health over time.",
      cooldown: 10, // 10 seconds cooldown
      lastUsed: 0,
      isAvailable: true,
      activate: () => {
        console.log("Healing activated!");
        // Implement healing logic here
      },
      iconPath: "/assets/icons/heal.png",
      effects: ["heal-over-time"],
    });

    // Initialize Weapons
    addWeapon({
      id: "sword",
      name: "Sword",
      type: "melee",
      damage: 50,
      range: 1,
      ammo: null,
      maxAmmo: null,
      fireRate: 1,
      lastFired: 0,
      reloadTime: 0,
      reload: () => {
        // Melee weapons do not require reloading
        console.log("Melee weapon does not require reloading.");
      },
      fire: () => {
        console.log("Swinging the sword!");
        // Implement melee attack logic here
      },
    });

    addWeapon({
      id: "bow",
      name: "Bow",
      type: "ranged",
      damage: 30,
      range: 15,
      ammo: 10,
      maxAmmo: 10,
      fireRate: 2, // 2 shots per second
      lastFired: 0,
      reloadTime: 3,
      reload: () => {
        console.log("Reloading the bow!");
        // Implement reloading logic here
      },
      fire: (target?: Vector3) => { // Changed THREE.Vector3 to Vector3
        console.log(`Shooting an arrow towards ${target}`);
        // Implement ranged attack logic here
      },
      // projectileId: "arrow", // Assuming you have a projectile system
    });

    // Equip the sword initially
    equipWeapon("sword");

    // Add some physics bodies as a demonstration
    addBox("box1", new Vector3(0, 2, 0), new Vector3(1, 1, 1));
    addSphere("sphere1", new Vector3(2, 5, 0), 1);

    // Load assets
    const modelAsset: Asset = {
      id: "treeModel",
      type: "model",
      url: "/models/tree.gltf",
      loaded: false,
      error: null,
      data: null,
      progress: 0,
    };

    const textureAsset: Asset = {
      id: "groundTexture",
      type: "texture",
      url: "/textures/grass.jpg",
      loaded: false,
      error: null,
      data: null,
      progress: 0,
    };

    const soundAsset: Asset = {
      id: "explosionSound",
      type: "sound",
      url: "/sounds/explosion.mp3",
      loaded: false,
      error: null,
      data: null,
      progress: 0,
    };

    loadAsset(modelAsset);
    loadAsset(textureAsset);
    loadAsset(soundAsset);
  }, [addAbility, addWeapon, equipWeapon, addBox, addSphere, loadAsset]);

  // Initialize systems outside of JSX
  useEffect(() => {
    // Systems are already initialized via singleton instances
    // Ensure AudioListener is added to the scene
    // This can be handled within the AssetLoadingSystem or here as needed
  }, []);

  return (
    <div className="App">
      <Canvas>
        <PhysicsSystem config={{ engine: "cannon", gravity: new Vector3(0, -9.81, 0), debug: true }}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          {/* Example Animated Object */}
          <ModelViewer assetId="treeModel" />
          {/* Example UI Components */}
          <AbilityButton abilityId="heal" />
          <WeaponButton weaponId="sword" />
          <WeaponButton weaponId="bow" />
          <PhysicsBodyButton />
          <AnimationController />
          <AssetLoader /> {/* New component */}
        </PhysicsSystem>
      </Canvas>
    </div>
  );
};

export default App;
