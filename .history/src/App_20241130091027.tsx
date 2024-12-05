// src/App.tsx

import React, { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { AbilitySystem } from "./systems/AbilitySystem/AbilitySystem";
import { WeaponSystem } from "./systems/WeaponSystem/WeaponSystem";
import { useAbility } from "./hooks/useAbility";
import { useWeapon } from "./hooks/useWeapon";
import { EventDispatcher } from "./utils/EventDispatcher";
import AbilityButton from "./components/UI/AbilityButton";
import WeaponButton from "./components/UI/WeaponButton"; // New component
import "./App.css";

const App: React.FC = () => {
  const { addAbility } = useAbility();
  const { addWeapon, equipWeapon } = useWeapon();

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

    // Add more abilities and weapons as needed
  }, [addAbility, addWeapon, equipWeapon]);

  // Game loop integration (if needed)
  useEffect(() => {
    const gameLoop = (time: number) => {
      // Update AbilitySystem
      AbilitySystem.getInstance().update(time);
      // Update WeaponSystem (if WeaponSystem requires updates)
      WeaponSystem.getInstance().update(time);
      // Update other systems as needed

      requestAnimationFrame(gameLoop);
    };

    requestAnimationFrame(gameLoop);

    return () => {
      // Cleanup if necessary
    };
  }, []);

  return (
    <div className="App">
      <Canvas>
        {/* Your 3D scene components go here */}
        {/* Example UI Components */}
        <AbilityButton abilityId="heal" />
        <WeaponButton weaponId="sword" />
        <WeaponButton weaponId="bow" />
      </Canvas>
    </div>
  );
};

export default App;
