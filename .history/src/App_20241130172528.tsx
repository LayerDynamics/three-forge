// src/App.tsx

import React, { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { AnimationSystem } from "./systems/AnimationSystem/AnimationSystem";
import { AbilitySystem } from "./systems/AbilitySystem/AbilitySystem";
import { WeaponSystem } from "./systems/WeaponSystem/WeaponSystem";
import { PhysicsSystem } from "./systems/PhysicsSystem/PhysicsSystem";
import { useAbility } from "./hooks/useAbility";
import { useWeapon } from "./hooks/useWeapon";
import { usePhysics } from "./hooks/usePhysics";
import { useAnimation } from "./hooks/useAnimation";
import { Vector3, Object3D, AnimationClip, AnimationMixer } from "three";
import { EventDispatcher } from "./utils/EventDispatcher";
import AbilityButton from "./components/UI/AbilityButton";
import WeaponButton from "./components/UI/WeaponButton";
import PhysicsBodyButton from "./components/UI/PhysicsBodyButton";
import AnimationController from "./components/UI/AnimationController"; // New component
import "./App.css";

const AnimatedBox: React.FC = () => {
  const meshRef = useRef<Object3D>(null);
  const { addAnimation, playAnimation, pauseAnimation, stopAnimation } = useAnimation();

  useEffect(() => {
    if (meshRef.current) {
      // Create a simple rotation animation
      const times = [0, 1, 2]; // in seconds
      const values = [0, Math.PI, 0]; // rotation around Y-axis

      const track = new THREE.NumberKeyframeTrack(
        ".rotation[y]",
        times,
        values
      );
      const clip = new AnimationClip("rotateY", -1, [track]);

      // Create AnimationMixer
      const mixer = new AnimationMixer(meshRef.current);
      const action = mixer.clipAction(clip);
      action.setLoop(THREE.LoopRepeat, Infinity);

      // Add animation to the system
      addAnimation("rotateBox", clip, meshRef.current);

      // Play the animation
      playAnimation("rotateBox");
    }
  }, [addAnimation, playAnimation]);

  return (
    <mesh ref={meshRef} position={[0, 1, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
};

const App: React.FC = () => {
  const { addAbility } = useAbility();
  const { addWeapon, equipWeapon } = useWeapon();
  const { addBox, addSphere } = usePhysics();
  const { addAnimation, playAnimation, pauseAnimation, stopAnimation } = useAnimation();

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
      fire: (target?: THREE.Vector3) => {
        console.log(`Shooting an arrow towards ${target}`);
        // Implement ranged attack logic here
      },
      projectileId: "arrow", // Assuming you have a projectile system
    });

    // Equip the sword initially
    equipWeapon("sword");

    // Add some physics bodies as a demonstration
    addBox("box1", new Vector3(0, 2, 0), new Vector3(1, 1, 1));
    addSphere("sphere1", new Vector3(2, 5, 0), 1);
  }, [addAbility, addWeapon, equipWeapon, addBox, addSphere]);

  return (
    <div className="App">
      <Canvas>
        <PhysicsSystem config={{ engine: "cannon", gravity: new Vector3(0, -9.81, 0), debug: true }}>
          <AnimationSystem />
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          {/* Example Animated Object */}
          <AnimatedBox />
          {/* Example UI Components */}
          <AbilityButton abilityId="heal" />
          <WeaponButton weaponId="sword" />
          <WeaponButton weaponId="bow" />
          <PhysicsBodyButton />
          <AnimationController /> {/* New component */}
        </PhysicsSystem>
      </Canvas>
    </div>
  );
};

export default App;
