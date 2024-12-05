// src/App.tsx

import React, { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { PhysicsSystem } from "./systems/PhysicsSystem/PhysicsSystem";
import { useAbility } from "./hooks/useAbility";
import { useWeapon } from "./hooks/useWeapon";
import { usePhysics } from "./hooks/usePhysics";
import { Vector3 } from "three";
import AbilityButton from "./components/UI/AbilityButton";
import WeaponButton from "./components/UI/WeaponButton";
import PhysicsBodyButton from "./components/UI/PhysicsBodyButton";
import "./App.css";

const App: React.FC = () => {
  const { addAbility } = useAbility();
  const { addWeapon, equipWeapon } = useWeapon();
  const { addBox, addSphere } = usePhysics();

  useEffect(() => {
    // Initialize Abilities
    addAbility({
      id: "heal",
      name: "Heal",
      description: "Restores health over time.",
      cooldown: 10,
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
      fireRate: 2,
      lastFired: 0,
      reloadTime: 3,
      reload: () => {
        console.log("Reloading the bow!");
        // Implement reloading logic here
      },
      fire: (target?: Vector3) => {
        console.log(`Shooting an arrow towards ${target}`);
        // Implement ranged attack logic here
      },
      projectileId: "arrow",
    });

    // Equip the sword initially
    equipWeapon("sword");

    // Add some physics bodies as a demonstration
    addBox("box1", new Vector3(0, 2, 0), new Vector3(1, 1, 1), "dynamic");
    addSphere("sphere1", new Vector3(2, 5, 0), 1, "dynamic");
  }, [addAbility, addWeapon, equipWeapon, addBox, addSphere]);

  return (
    <div className="App">
      {/* UI Components */}
      <div className="ui-buttons">
        <AbilityButton abilityId="heal" />
        <WeaponButton weaponId="sword" />
        <WeaponButton weaponId="bow" />
        <PhysicsBodyButton />
      </div>
      <Canvas>
        <PhysicsSystem
          config={{ engine: "cannon", gravity: new Vector3(0, -9.81, 0), debug: false }}
        >
          {/* 3D Components or Actual Children */}
          {/* Example: <mesh> or other 3D objects */}
          <></> {/* Passing an empty fragment as children */}
        </PhysicsSystem>
      </Canvas>
    </div>
  );
};

export default App;