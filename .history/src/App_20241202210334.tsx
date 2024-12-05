// src/App.tsx

import React, { useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { AbilitySystem } from "./systems/AbilitySystem/AbilitySystem";
import { WeaponSystem } from "./systems/WeaponSystem/WeaponSystem";
import { PhysicsSystem } from "./systems/PhysicsSystem/PhysicsSystem"; // Imported as a component
import { AnimationSystem } from "./systems/AnimationSystem/AnimationSystem"; // Imported as a component
import { AssetLoadingSystem } from "./systems/AssetLoadingSystem/AssetLoadingSystem"; // Imported as a component
import { LogicEngine } from "./systems/LogicEngine/LogicEngine"; // Imported as a component
import { SceneGraphSystemClass } from "./systems/SceneGraphSystem/SceneGraphSystem";
import { useAbility } from "./hooks/useAbility";
import { useWeapon } from "./hooks/useWeapon";
import { usePhysics } from "./hooks/usePhysics";
import { useAnimation } from "./hooks/useAnimation";
import { useAsset } from "./hooks/useAsset";
import { useLogic } from "./hooks/useLogic";
import { useSceneGraph } from "./hooks/useSceneGraph";
import {
  Vector3,
  Object3D,
  AnimationClip,
  AnimationMixer,
  Mesh,
  BoxGeometry,
  MeshStandardMaterial,
  Scene
} from "three";
import { LogicComponent, GameEvent } from "./types/logic.types"; // Removed 'Asset' from import
import { Asset } from "./types/asset.types"; // Imported 'Asset' from the correct path
import { EventDispatcher } from "./utils/EventDispatcher";
import AbilityButton from "./components/UI/AbilityButton";
import WeaponButton from "./components/UI/WeaponButton";
import PhysicsBodyButton from "./components/UI/PhysicsBodyButton";
import AnimationController from "./components/UI/AnimationController";
import AssetLoader from "./components/UI/AssetLoader";
import LogicController from "./components/UI/LogicController";
import SceneGraphViewer from "./components/UI/SceneGraphViewer"; // New component
import "./App.css";

/**
 * Component: SceneGraphManager
 * Wraps the Canvas and initializes the SceneGraphSystem with the Three.js Scene.
 */
const SceneGraphManager: React.FC<{ onAddObject: (id: string, name: string, object3D: Object3D, parentId?: string) => void }> = ({ onAddObject }) => {
  const { scene } = useThree();
  const { addObject } = useSceneGraph(scene);

  useEffect(() => {
    // Initialize SceneGraphSystem with the Three.js Scene
    // This is handled by the useSceneGraph hook

    // Pass addObject to the parent component
    onAddObject(addObject);
  }, [addObject, onAddObject]);

  return null; // This component doesn't render anything itself
};

/**
 * Component: ModelViewer
 * Renders a 3D model from the loaded assets.
 * @param assetId The ID of the asset to display.
 */
const ModelViewer: React.FC<{ assetId: string }> = ({ assetId }) => {
  const { getAsset } = useAsset();
  const model = getAsset(assetId)?.data;

  if (!model) {
    return null; // Model not loaded yet
  }

  return <primitive object={model} />;
};

/**
 * Component: App
 * Main application component that sets up systems and renders the scene.
 */
const App: React.FC = () => {
  const { addAbility } = useAbility();
  const { addWeapon, equipWeapon } = useWeapon();
  const { addBox, addSphere } = usePhysics();
  const { addAnimation, playAnimation, pauseAnimation, stopAnimation } = useAnimation();
  const { loadAsset, assets } = useAsset();
  const { enqueueEvent, registerLogicComponent } = useLogic();
  const sceneGraphRef = useRef<Scene | null>(null);
  const addObjectRef = useRef<(id: string, name: string, object3D: Object3D, parentId?: string) => void>();

  /**
   * Initialize all systems when the component mounts.
   */
  useEffect(() => {
    // Instantiate Systems
    const abilitySystem = AbilitySystem.getInstance();
    const weaponSystem = WeaponSystem.getInstance();
    // PhysicsSystem is a React component, no need to instantiate here
    // Similarly, other systems are React components

    // Instantiate SceneGraphSystem if not already instantiated
    if (sceneGraphRef.current) {
      const sceneGraphSystem = SceneGraphSystemClass.getInstance({ debug: true }, sceneGraphRef.current);
      // No additional setup needed here as useSceneGraph handles processing events
    }

    // Cleanup Systems on Unmount
    return () => {
      // If any class-based systems require cleanup, handle here
      // Example:
      // abilitySystem.reset();
      // weaponSystem.reset();
      // SceneGraphSystemClass.getInstance().reset();
      // Note: React component-based systems should handle their own cleanup
    };
  }, []);

  /**
   * Initialize game entities, load assets, and register logic components.
   */
  useEffect(() => {
    if (!addObjectRef.current) return;

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
      fire: (target?: Vector3) => {
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
    const modelAsset: Asset = {
      id: "treeModel",
      type: "model",
      url: "/models/tree.gltf",
      loaded: false,
      error: null,
      data: null,
    };

    const textureAsset: Asset = {
      id: "groundTexture",
      type: "texture",
      url: "/textures/grass.jpg",
      loaded: false,
      error: null,
      data: null,
    };

    const soundAsset: Asset = {
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
    registerLogicComponent
  ]);

  /**
   * Handler to receive the addObject function from SceneGraphManager
   */
  const handleAddObject = (addObj: (id: string, name: string, object3D: Object3D, parentId?: string) => void) => {
    addObjectRef.current = addObj;
  };

  return (
    <div className="App">
      <Canvas>
        <SceneGraphManager onAddObject={handleAddObject} /> {/* Manages the SceneGraphSystem */}
        {/* Systems are now instantiated via useEffect, not as JSX components */}
        {/* PhysicsSystem and other React-based systems */}
        <PhysicsSystem /> {/* Included as a React component */}
        <AnimationSystem /> {/* Included as a React component */}
        <AssetLoadingSystem /> {/* Included as a React component */}
        <LogicEngine /> {/* Included as a React component */}
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
      </Canvas>
    </div>
  );
};

export default App;