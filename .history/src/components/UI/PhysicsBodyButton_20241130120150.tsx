// src/components/UI/PhysicsBodyButton.tsx

import React from "react";
import { usePhysicsStore } from "../../stores/physicsStore"; // Only if necessary
import { usePhysics } from "../../hooks/usePhysics";
import { Vector3 } from "three";

/**
 * Component: PhysicsBodyButton
 * Provides buttons to add or remove physics bodies dynamically.
 */
const PhysicsBodyButton: React.FC = () => {
  const { addBox, addSphere, removeBody } = usePhysics();

  const handleAddBox = () => {
    const id = `box-${Date.now()}`;
    const position = new Vector3(
      Math.random() * 5 - 2.5,
      5,
      Math.random() * 5 - 2.5
    );
    const size = new Vector3(1, 1, 1);
    addBox(id, position, size, "dynamic");
  };

  const handleAddSphere = () => {
    const id = `sphere-${Date.now()}`;
    const position = new Vector3(
      Math.random() * 5 - 2.5,
      5,
      Math.random() * 5 - 2.5
    );
    const radius = 1;
    addSphere(id, position, radius, "dynamic");
  };

  const handleRemoveLastBox = () => {
    const state = usePhysicsStore.getState();
    const boxIds = Object.keys(state.bodies).filter((id) =>
      id.startsWith("box-")
    );
    if (boxIds.length > 0) {
      const randomBoxId = boxIds[Math.floor(Math.random() * boxIds.length)];
      removeBody(randomBoxId);
    }
  };

  const handleRemoveLastSphere = () => {
    const state = usePhysicsStore.getState();
    const sphereIds = Object.keys(state.bodies).filter((id) =>
      id.startsWith("sphere-")
    );
    if (sphereIds.length > 0) {
      const randomSphereId = sphereIds[Math.floor(Math.random() * sphereIds.length)];
      removeBody(randomSphereId);
    }
  };

  return (
    <div style={{ position: "absolute", top: 10, left: 10 }}>
      <button onClick={handleAddBox} style={{ margin: "5px" }}>
        Add Box
      </button>
      <button onClick={handleAddSphere} style={{ margin: "5px" }}>
        Add Sphere
      </button>
      <button onClick={handleRemoveLastBox} style={{ margin: "5px" }}>
        Remove Box
      </button>
      <button onClick={handleRemoveLastSphere} style={{ margin: "5px" }}>
        Remove Sphere
      </button>
    </div>
  );
};

export default PhysicsBodyButton;
