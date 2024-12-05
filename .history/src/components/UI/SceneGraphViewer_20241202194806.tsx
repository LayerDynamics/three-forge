// src/App.tsx

import React, { useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { AbilitySystem } from "../../systems/AbilitySystem/AbilitySystem";
import { WeaponSystem } from "../../systems/WeaponSystem/WeaponSystem";
import { PhysicsSystem } from "../../systems/PhysicsSystem/PhysicsSystem";
import { AnimationSystem } from "./systems/AnimationSystem/AnimationSystem";
import { AssetLoadingSystem } from "./systems/AssetLoadingSystem/AssetLoadingSystem";
import { LogicEngine } from "./systems/LogicEngine/LogicEngine";
import { SceneGraphSystem } from "./systems/SceneGraphSystem/SceneGraphSystem";
import { useAbility } from "./hooks/useAbility";
import { useWeapon } from "./hooks/useWeapon";
import { usePhysics } from "./hooks/usePhysics";
import { useAnimation } from "./hooks/useAnimation";
import { useAsset } from "./hooks/useAsset";
import { useLogic } from "./hooks/useLogic";
import { useSceneGraph } from "./hooks/useSceneGraph";
import { Vector3, Object3D, AnimationClip, AnimationMixer, Mesh, BoxGeometry, MeshStandardMaterial } from "three";
import { EventDispatcher } from "./utils/EventDispatcher";
import AbilityButton from "./AbilityButton";
import WeaponButton from "./WeaponButton";
import PhysicsBodyButton from "./PhysicsBodyButton";
import AnimationController from "./AnimationController";
import AssetLoader from "./AssetLoader";
import LogicController from "./LogicController";
import SceneGraphViewer from "./SceneGraphViewer"; // New component
import "./App.css";

/**
 * Component: SceneGraphManager
 * Wraps the Canvas and initializes the SceneGraphSystem with the Three.js Scene.
 */
const SceneGraphManager: React.FC = () => {
  const { scene } = useThree();
  const { addObject } = useSceneGraph(scene);

  useEffect(() => {
    // Initialize SceneGraphSystem with the Three.js Scene
    // This is handled by the useSceneGraph hook
  }, [addObject]);

  return null; // This component doesn't render anything itself
};

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
  const { enqueueEvent, registerLogicComponent } = useLogic();
  const sceneGraphRef = useRef<Scene>();

  const { addObject } = useSceneGraph(sceneGraphRef.current as unknown as Scene); // Initial scene is undefined, will be set later

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
        enqueueEvent({ type: "HEAL_ACTIVATED", payload: { amount: 50 } });
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
        enqueueEvent({ type: "ATTACK_SWUNG", payload: { weaponId: "sword" } });
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
        enqueueEvent({ type: "BOW_RELOADED", payload: { weaponId: "bow" } });
      },
      fire: (target?: THREE.Vector3) => {
        console.log(`Shooting an arrow towards ${target}`);
        // Implement ranged attack logic here
        enqueueEvent({ type: "ARROW_SHOT", payload: { weaponId: "bow", target } });
      },
      projectileId: "arrow", // Assuming you have a projectile system
    });

    // Equip the sword initially
    equipWeapon("sword");

    // Add some physics bodies as a demonstration
    addBox("box1", new Vector3(0, 2, 0), new Vector3(1, 1, 1));
    addSphere("sphere1", new Vector3(2, 5, 0), 1);

    // Load assets
    const modelAsset = {
      id: "treeModel",
      type: "model",
      url: "/models/tree.gltf",
      loaded: false,
      error: null,
      data: null,
    };

    const textureAsset = {
      id: "groundTexture",
      type: "texture",
      url: "/textures/grass.jpg",
      loaded: false,
      error: null,
      data: null,
    };

    const soundAsset = {
      id: "explosionSound",
      type: "sound",
      url: "/sounds/explosion.mp3",
      loaded: false,
      error: null,
      data: null,
    };

    loadAsset(modelAsset);
    loadAsset(textureAsset);
    loadAsset(soundAsset);

    // Register logic components (e.g., game rules)
    const gameRulesComponent: LogicComponent = {
      id: "gameRules",
      execute: (event: GameEvent) => {
        switch (event.type) {
          case "HEAL_ACTIVATED":
            console.log(`Player healed by ${event.payload.amount} points.`);
            // Implement healing logic (e.g., increase player health)
            break;
          case "ATTACK_SWUNG":
            console.log(`Player swung weapon: ${event.payload.weaponId}`);
            // Implement attack logic (e.g., detect hits)
            break;
          case "ARROW_SHOT":
            console.log(`Player shot an arrow towards ${event.payload.target}`);
            // Implement projectile logic
            break;
          case "BOW_RELOADED":
            console.log(`Player reloaded bow: ${event.payload.weaponId}`);
            // Implement reload logic
            break;
          default:
            break;
        }
      },
    };

    registerLogicComponent(gameRulesComponent);
  }, [
    addAbility,
    addWeapon,
    equipWeapon,
    addBox,
    addSphere,
    loadAsset,
    enqueueEvent,
    registerLogicComponent,
    addObject,
  ]);

  return (
    <div className="App">
      <Canvas>
        <SceneGraphManager /> {/* Manages the SceneGraphSystem */}
        <PhysicsSystem config={{ engine: "cannon", gravity: new Vector3(0, -9.81, 0), debug: true }}>
          <AnimationSystem />
          <AssetLoadingSystem />
          <LogicEngine />
          <SceneGraphSystem />
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
          <AssetLoader />
          <LogicController />
          <SceneGraphViewer /> {/* New component */}
        </PhysicsSystem>
      </Canvas>
    </div>
  );
};

export default App;
