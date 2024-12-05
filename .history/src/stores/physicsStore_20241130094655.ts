// src/stores/physicsStore.ts

import { create } from "zustand";
import { PhysicsBody, PhysicsState, CollisionEvent } from "../types/physics.types";

export const usePhysicsStore = create<PhysicsState>((set, get) => ({
  bodies: {},

  addBody: (body: PhysicsBody) => {
    set((state) => ({
      bodies: {
        ...state.bodies,
        [body.id]: body,
      },
    }));
    console.log(`PhysicsBody added: ${body.id}`);
  },

  removeBody: (id: string) => {
    set((state) => {
      const { [id]: removedBody, ...remainingBodies } = state.bodies;
      return { bodies: remainingBodies };
    });
    console.log(`PhysicsBody removed: ${id}`);
  },

  updateBody: (id: string, updates: Partial<PhysicsBody>) => {
    set((state) => ({
      bodies: {
        ...state.bodies,
        [id]: {
          ...state.bodies[id],
          ...updates,
        },
      },
    }));
    console.log(`PhysicsBody updated: ${id}`);
  },

  handleCollision: (event: CollisionEvent) => {
    console.log(`Collision detected between ${event.bodyA} and ${event.bodyB} with force ${event.impactForce}`);
    // Additional collision handling logic can be added here
  },
}));
