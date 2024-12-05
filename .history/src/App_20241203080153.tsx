// src/App.tsx

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { Object3D, Vector3 } from "three";
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
import InitializationManager from "./components/InitializationManager";
import "./App.css";

const App: React.FC = () => {
  const { addAbility } = useAbility();
  const { addWeapon } = useWeapon();
  const { addBox, addSphere } = usePhysics();
  const { loadAsset } = useAsset();
  const { registerLogicComponent } = useLogic();
  const [addObject, setAddObject] = useState<
    (id: string, name: string, object3D: Object3D, parentId?: string) => void
  >();
  const hasInitializedSceneGraph = useRef(false);

  const handleAddObject = useCallback(
    (
      addObj: (
        id: string,
        name: string,
        object3D: Object3D,
        parentId?: string
      ) => void
    ) => {
      if (addObject) {
        console.log("[App] addObject is already set. Skipping update.");
        return;
      }

      if (!addObj) {
        console.warn("[App] Received undefined addObject. Skipping.");
        return;
      }

      console.log("[App] Setting addObject");
      setAddObject(() => addObj);
    },
    [addObject]
  );

  useEffect(() => {
    if (!addObject) {
      console.log("[App] addObject not available yet");
      return;
    }

    if (hasInitializedSceneGraph.current) {
      console.log("[App] Scene Graph already initialized. Skipping initialization.");
      return;
    }

    console.log("[App] Initializing game entities and loading assets");

    // Initialize Abilities
    addAbility("heal");

    // Initialize Weapons
    addWeapon("sword");
    addWeapon("bow");

    // Initialize Physics Bodies
    addBox(
      "box1",
      new Vector3(0, 0, 0),
      new Vector3(1, 1, 1),
      "dynamic"
    );
    addSphere(
      "sphere1",
      new Vector3(2, 0, 0),
      0.5,
      "static"
    );

    // Load Assets
    loadAsset({ id: "heroModel", type: "model", url: "/models/hero.gltf" });
    loadAsset({ id: "backgroundTexture", type: "texture", url: "/textures/bg.jpg" });

    // Register Logic Components
    const gameRulesComponent: LogicComponent = {
      id: "gameRules",
      execute: (event: GameEvent) => {
        // Event handling logic
      },
    };

    registerLogicComponent(gameRulesComponent);

    // Initialize Scene Graph
    addObject("root", "Root Node", new Object3D());
    hasInitializedSceneGraph.current = true;
    console.log("[App] Initialized Scene Graph with root node.");
  }, [addObject, addAbility, addWeapon, addBox, addSphere, loadAsset, registerLogicComponent]);

  return (
    <ErrorBoundary>
      <div className="App">
        <Canvas>
          <InitializationManager />
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
