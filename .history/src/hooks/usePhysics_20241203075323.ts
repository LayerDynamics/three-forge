// src/hooks/usePhysics.ts

import { useCallback } from "react";
import { usePhysicsStore } from "../stores/physicsStore";
import { PhysicsBody } from "../types/physics.types";
import { Vector3 } from "three";

/**
 * Hook: usePhysics
 * Provides an interface to interact with the PhysicsSystem.
 */
export const usePhysics = () => {
  const { addBody, removeBody, updateBody } = usePhysicsStore();

  // Function to create and add a physics body
  const createBody = useCallback(
    (body: PhysicsBody) => {
      // Validate required properties
      if (
        !body.id ||
        !body.shape ||
        !body.position ||
        !body.rotation ||
        !body.args
      ) {
        console.error(
          `[usePhysics] Invalid PhysicsBody provided:`,
          body
        );
        return;
      }

      addBody(body);
    },
    [addBody]
  );

  // Function to remove a physics body by ID
  const deleteBody = useCallback(
    (id: string) => {
      removeBody(id);
    },
    [removeBody]
  );

  // Function to update a physics body
  const modifyBody = useCallback(
    (id: string, updatedBody: Partial<PhysicsBody>) => {
      updateBody(id, updatedBody);
    },
    [updateBody]
  );

  // Function to reset physics
  const resetPhysics = useCallback(() => {
    // Implement reset logic, e.g., clearing all bodies
    Object.keys(usePhysicsStore.getState().bodies).forEach((id) => {
      removeBody(id);
    });
    console.log("Physics system reset.");
  }, [removeBody]);

  // Example function to add a box
  const addBox = useCallback(
    (
      id: string,
      position: Vector3,
      size: Vector3,
      type: "dynamic" | "static" = "dynamic"
    ) => {
      if (!id || !position || !size) {
        console.error("[usePhysics] Missing parameters for addBox.");
        return;
      }

      createBody({
        id,
        type,
        shape: "box",
        position,
        rotation: new Vector3(0, 0, 0),
        args: [size.x, size.y, size.z],
        mass: type === "dynamic" ? 1 : 0,
        onCollide: (otherId, contactPoint) => {
          if (!contactPoint) {
            console.warn(
              `[usePhysics] Collision detected for Box ${id}, but contactPoint is undefined.`
            );
            return;
          }
          console.log(
            `Box ${id} collided with ${otherId} at ${contactPoint.toArray()}`
          );
        },
      });
    },
    [createBody]
  );

  // Example function to add a sphere
  const addSphere = useCallback(
    (
      id: string,
      position: Vector3,
      radius: number,
      type: "dynamic" | "static" = "dynamic"
    ) => {
      if (!id || !position || radius === undefined) {
        console.error("[usePhysics] Missing parameters for addSphere.");
        return;
      }

      createBody({
        id,
        type,
        shape: "sphere",
        position,
        rotation: new Vector3(0, 0, 0),
        args: [radius],
        mass: type === "dynamic" ? 1 : 0,
        onCollide: (otherId, contactPoint) => {
          if (!contactPoint) {
            console.warn(
              `[usePhysics] Collision detected for Sphere ${id}, but contactPoint is undefined.`
            );
            return;
          }
          console.log(
            `Sphere ${id} collided with ${otherId} at ${contactPoint.toArray()}`
          );
        },
      });
    },
    [createBody]
  );

  // Similarly, functions to add other shapes can be added

  return {
    addBody: createBody,
    removeBody: deleteBody,
    updateBody: modifyBody,
    resetPhysics,
    addBox,
    addSphere,
    // Add more helper functions as needed
  };
};
