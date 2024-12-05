// src/App.tsx

import React, { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { AbilitySystem } from "./systems/AbilitySystem/AbilitySystem";
import { useAbility } from "./hooks/useAbility";
import AbilityButton from "./components/UI/AbilityButton";

const App: React.FC = () => {
  const { addAbility } = useAbility();

  useEffect(() => {
    // Example: Add an initial ability
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

    // Add more abilities as needed
  }, [addAbility]);

  // Game loop integration
  useEffect(() => {
    const gameLoop = (time: number) => {
      // Update AbilitySystem
      AbilitySystem.getInstance().update(time);
      // Update other systems as needed

      requestAnimationFrame(gameLoop);
    };

    requestAnimationFrame(gameLoop);

    return () => {
      // Cleanup if necessary
    };
  }, []);

  return (
    <>
      <Canvas>
        {/* Include at least an empty fragment or your 3D scene components */}
        <></>
      </Canvas>
      {/* Example UI Component */}
      <AbilityButton abilityId="heal" />
    </>
  );
};

export default App;
