// usePhysics.ts

// Purpose: Connects components to the physics simulation.
// Depends On: PhysicsSystem.
// Interacts With: GameObject,WeaponSystem.
// src/hooks/usePhysics.ts

import { useEffect, useCallback } from "react";
import { PhysicsSystem } from "../systems/PhysicsSystem/PhysicsSystem";
import { usePhysicsStore } from "../stores/physicsStore";
import { PhysicsBody, CollisionEvent } from "../types/physics.types";
import { EventDispatcher } from "../utils/EventDispatcher";

/**
 * Hook: usePhysics
 * Provides an interface to interact with the PhysicsSystem.
 */
export const usePhysics = () => {
  // Access the singleton instance of the PhysicsSystem
  const system = PhysicsSystem.getInstance();

  // Access Zustand store state selectively
  const bodies = usePhysicsStore((state) => state.bodies);

  // Wrap system methods with React-friendly callbacks
  const addBody = useCallback(
    (body: PhysicsBody) => {
      system.addBody(body);
    },
    [system]
  );

  const removeBody = useCallback(
    (id: string) => {
      system.removeBody(id);
    },
    [system]
  );

  const updateBody = useCallback(
    (id: string, updates: Partial<PhysicsBody>) => {
      usePhysicsStore.getState().updateBody(id, updates);
      // Optionally, update the Cannon.js body directly if needed
      // This requires mapping game body IDs to Cannon.js bodies
    },
    []
  );

  // Update physics simulation every frame
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const gameLoop = (time: number) => {
      const deltaTime = (time - lastTime) / 1000; // Convert ms to seconds
      lastTime = time;
      system.update(deltaTime);
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [system]);

  // Subscribe to collision events
  useEffect(() => {
    const handleCollision = (event: CollisionEvent) => {
      console.log("Collision detected:", event);
      // Handle collision event (e.g., apply damage)
    };

    EventDispatcher.on("COLLISION_EVENT", handleCollision);

    return () => {
      EventDispatcher.off("COLLISION_EVENT", handleCollision);
    };
  }, []);

  // Return the API and state
  return {
    bodies, // All physics bodies
    addBody,
    removeBody,
    updateBody,
    // Additional methods as needed
  };
};
