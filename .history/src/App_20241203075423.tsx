// src/App.tsx

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { Object3D, Vector3 } from "three"; // Import Vector3
import { Html } from "@react-three/drei";
import { useAbility } from "./hooks/useAbility";
import { useWeapon } from "./hooks/useWeapon";
import { usePhysics } from "./hooks/usePhysics";
import { useAsset } from "./hooks/useAsset";
import { useLogic } from "./hooks/useLogic";
import { LogicComponent, GameEvent } from "./types/logic.types";
import AbilityButton from "./components/UI/AbilityButton";
import WeaponButton from "./components/UI/WeaponButton";
import PhysicsBodyButton from "./components/UI/PhysicsBodyButton";
import AnimationController from "./components/UI/AnimationController";
import AssetLoader from "./components/UI/AssetLoader";
import LogicController from "./components/UI/LogicController";
import SceneGraphViewer from "./components/UI/SceneGraphViewer";
import SceneGraphManager from "./components/UI/SceneGraphManager";
import ErrorBoundary from "./components/ErrorBoundary";
import AudioInitializer from "./components/UI/AudioInitializer";
import InitializationManager from "./components/InitializationManager"; // Updated component
import "./App.css";

/**
 * Component: ModelViewer
 * Renders a 3D model from the loaded assets with error handling.
 */
const ModelViewer: React.FC<{ assetId: string }> = ({ assetId }) => {
  const { getAsset } = useAsset();
  const asset = getAsset(assetId);

  useEffect(() => {
    if (!asset) {
      console.warn(`[ModelViewer] Asset with ID "${assetId}" not found.`);
    } else if (asset.loaded) {
      console.log(`[ModelViewer] Asset "${assetId}" is loaded.`);
    }
  }, [asset, assetId]);

  if (!asset) {
    return (
      <Html center>
        <div
          style={{
            color: "red",
            background: "white",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          <p>Asset "{assetId}" not found.</p>
        </div>
      </Html>
    );
  }

  if (!asset.loaded) {
    if (asset.error) {
      return (
        <Html center>
          <div
            style={{
              color: "red",
              background: "white",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            <p>Error loading model: {assetId}</p>
            <p>{asset.error}</p>
          </div>
        </Html>
      );
    }

    return (
      <Html center>
        <div
          style={{
            color: "black",
            background: "rgba(255, 255, 255, 0.8)",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          <p>Loading model: {assetId}</p>
        </div>
      </Html>
    );
  }

  return <primitive object={asset.data.scene} />;
};

const App: React.FC = () => {
  const { addAbility } = useAbility();
  const { addWeapon, equipWeapon } = useWeapon();
  const { addBox, addSphere } = usePhysics();
  const { loadAsset } = useAsset();
  const { enqueueEvent, registerLogicComponent } = useLogic();
  const [addObject, setAddObject] = useState<
    (id: string, name: string, object3D: Object3D, parentId?: string) => void
  >();
  const hasSetAddObject = useRef(false);
  const hasInitializedSceneGraph = useRef(false); // New ref to prevent multiple root node additions

  // Memoize the handleAddObject function to prevent unnecessary re-creations
  const handleAddObject = useCallback(
    (
      addObj: (
        id: string,
        name: string,
        object3D: Object3D,
        parentId?: string
      ) => void
    ) => {
      if (hasSetAddObject.current) {
        console.log("[App] addObject is already set. Skipping update.");
        return;
      }

      if (!addObj) {
        console.warn("[App] Received undefined addObject. Skipping.");
        return;
      }

      console.log("[App] Setting addObject");
      setAddObject(() => addObj);
      hasSetAddObject.current = true;
    },
    []
  );

  /**
   * Removed the useEffect that was logging "[App] Initializing class-based systems"
   * as systems now initialize themselves upon import.
   */

  /**
   * Initialize game entities and register logic components once addObject is set
   */
  useEffect(() => {
    if (!addObject) {
      console.log("[App] addObject not available yet");
      return;
    }

    if (hasSetAddObject.current && hasInitializedSceneGraph.current) {
      console.log("[App] addObject already set and Scene Graph initialized. Skipping initialization.");
      return;
    }

    console.log("[App] Initializing game entities and loading assets");

    hasSetAddObject.current = true;

    // Initialize Abilities, Weapons, Physics, etc.
    addAbility("heal");
    addWeapon("sword");
    addWeapon("bow");

    // Correctly initialize boxes and spheres with required parameters
    // Example:
    // Add a dynamic box
    addBox(
      "box1",
      new Vector3(0, 0, 0), // position
      new Vector3(1, 1, 1), // size
      "dynamic" // type
    );

    // Add a static sphere
    addSphere(
      "sphere1",
      new Vector3(2, 0, 0), // position
      0.5, // radius
      "static" // type
    );

    // Load Assets (assuming assets are fetched dynamically elsewhere)
    // Example:
    loadAsset({ id: "heroModel", type: "model", url: "/models/hero.gltf" });
    loadAsset({ id: "backgroundTexture", type: "texture", url: "/textures/bg.jpg" });
    // ...

    // Register Logic Components
    const gameRulesComponent: LogicComponent = {
      id: "gameRules",
      execute: (event: GameEvent) => {
        switch (event.type) {
          case "HEAL_ACTIVATED":
            console.log(`Player healed by ${event.payload.amount} points.`);
            break;
          case "ATTACK_SWUNG":
            console.log(`Player swung weapon: ${event.payload.weaponId}`);
            break;
          case "ARROW_SHOT":
            console.log(`Player shot an arrow towards ${event.payload.target}`);
            break;
          case "BOW_RELOADED":
            console.log(`Player reloaded bow: ${event.payload.weaponId}`);
            break;
          default:
            console.warn(`Unhandled game event type: ${event.type}`);
            break;
        }
      },
    };

    registerLogicComponent(gameRulesComponent);

    // Initialize the Scene Graph with a root node to prevent SceneGraphViewer from unmounting
    if (!hasInitializedSceneGraph.current) {
      addObject("root", "Root Node", new Object3D());
      hasInitializedSceneGraph.current = true;
      console.log("[App] Initialized Scene Graph with root node.");
    }
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
    <ErrorBoundary>
      <div className="App">
        <Canvas>
          <InitializationManager /> {/* Updated component */}
          <SceneGraphManager onAddObject={handleAddObject} />
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          {/* Model Viewer */}
          {/* <ModelViewer assetId={dynamicAssetId} /> */}
          {/* Animation Controller */}
          <AnimationController />
        </Canvas>

        {/* Audio Initializer */}
        <AudioInitializer />

        {/* UI Components */}
        <div className="ui-container">
          {/* <AbilityButton abilityId={dynamicAbilityId} /> */}
          {/* <WeaponButton weaponId={dynamicWeaponId} /> */}
          <PhysicsBodyButton />
          <AssetLoader />
          <LogicController />
          <SceneGraphViewer />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;
