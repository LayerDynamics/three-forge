// PhysicsSystem.ts: Interfaces with @react-three/cannon to simulate physics.
// src/systems/PhysicsSystem/PhysicsSystem.ts

import { PhysicsBody, PhysicsConfig, CollisionEvent } from "../../types/physics.types";
import { usePhysicsStore } from "../../stores/physicsStore";
import { EventDispatcher } from "../../utils/EventDispatcher";
import * as CANNON from "cannon-es";
import { Vector3, Quaternion } from "three";

export class PhysicsSystem {
  private static instance: PhysicsSystem | null = null;

  private world: CANNON.World;
  private config: PhysicsConfig;

  private constructor(config: PhysicsConfig = {}) {
    this.config = config;
    this.world = new CANNON.World();
    this.world.gravity.set(
      config.gravity ? config.gravity.x : 0,
      config.gravity ? config.gravity.y : -9.82,
      config.gravity ? config.gravity.z : 0
    );
    this.world.broadphase = new CANNON.NaiveBroadphase();
    this.world.solver.iterations = 10;

    if (config.debug) {
      console.log("PhysicsWorld initialized with gravity:", this.world.gravity);
    }

    // Listen for collision events
    this.world.addEventListener("postStep", this.handleCollisions.bind(this));
  }

  // Initialize the PhysicsSystem with configuration
  public initialize(config: PhysicsConfig = {}): void {
    if (this.world) {
      console.warn("PhysicsSystem is already initialized.");
      return;
    }
    this.config = config;
    this.world.gravity.set(
      config.gravity ? config.gravity.x : 0,
      config.gravity ? config.gravity.y : -9.82,
      config.gravity ? config.gravity.z : 0
    );

    if (config.debug) {
      console.log("PhysicsSystem initialized with config:", config);
    }

    // Subscribe to global events if necessary
    EventDispatcher.on("RESET_GAME", () => this.reset());
  }

  // Get the singleton instance
  public static getInstance(): PhysicsSystem {
    if (!PhysicsSystem.instance) {
      PhysicsSystem.instance = new PhysicsSystem();
    }
    return PhysicsSystem.instance;
  }

  // Public API Methods
  public addBody(body: PhysicsBody): void {
    const shape = this.createShape(body.collider);
    const material = new CANNON.Material();
    const bodyCannon = new CANNON.Body({
      mass: body.isDynamic ? body.mass : 0,
      position: new CANNON.Vec3(body.position.x, body.position.y, body.position.z),
      quaternion: new CANNON.Quaternion(body.rotation.x, body.rotation.y, body.rotation.z, body.rotation.w),
      shape: shape,
      material: material,
    });

    this.world.addBody(bodyCannon);

    // Store in the physics store
    usePhysicsStore.getState().addBody({
      ...body,
      velocity: body.velocity.clone(),
      position: body.position.clone(),
      rotation: body.rotation.clone(),
    });

    // Map Cannon body ID to game body ID if necessary
    (bodyCannon as any).gameBodyId = body.id;

    if (this.config.debug) {
      console.log(`PhysicsBody added to world: ${body.id}`);
    }
  }

  public removeBody(id: string): void {
    const bodies = this.world.bodies;
    const bodyToRemove = bodies.find((b) => (b as any).gameBodyId === id);
    if (bodyToRemove) {
      this.world.removeBody(bodyToRemove);
      usePhysicsStore.getState().removeBody(id);
      if (this.config.debug) {
        console.log(`PhysicsBody removed from world: ${id}`);
      }
    } else {
      console.warn(`PhysicsBody with ID ${id} not found in the physics world.`);
    }
  }

  public update(deltaTime: number): void {
    this.world.step(deltaTime);

    // Update physics store with new positions and velocities
    this.world.bodies.forEach((body) => {
      const gameBodyId = (body as any).gameBodyId;
      if (gameBodyId) {
        usePhysicsStore.getState().updateBody(gameBodyId, {
          position: new Vector3(body.position.x, body.position.y, body.position.z),
          rotation: new Quaternion(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w),
          velocity: new Vector3(body.velocity.x, body.velocity.y, body.velocity.z),
        });
      }
    });
  }

  // Handle collision events after each physics step
  private handleCollisions(): void {
    const contacts = this.world.contacts;

    contacts.forEach((contact) => {
      const bodyA = contact.bi;
      const bodyB = contact.bj;
      const event: CollisionEvent = {
        bodyA: (bodyA as any).gameBodyId,
        bodyB: (bodyB as any).gameBodyId,
        impactForce: contact.getImpactVelocityAlongNormal(),
      };
      usePhysicsStore.getState().handleCollision(event);
      EventDispatcher.dispatch("COLLISION_EVENT", event);
    });
  }

  // Create a Cannon.js shape based on collider type
  private createShape(collider: ColliderType): CANNON.Shape {
    switch (collider) {
      case "box":
        return new CANNON.Box(new CANNON.Vec3(1, 1, 1));
      case "sphere":
        return new CANNON.Sphere(1);
      case "mesh":
        // For mesh colliders, use Trimesh or other suitable shapes
        // Placeholder: using sphere as a default
        return new CANNON.Sphere(1);
      default:
        throw new Error(`Unsupported collider type: ${collider}`);
    }
  }

  // Reset the PhysicsSystem
  public reset(): void {
    // Remove all bodies from the world
    this.world.bodies.slice(0).forEach((body) => this.world.removeBody(body));
    // Reset the physics store
    usePhysicsStore.getState().reset();
    if (this.config.debug) {
      console.log("PhysicsSystem has been reset.");
    }
  }

  // Serialize and Deserialize State (Optional)
  public serializeState(): PhysicsState {
    return usePhysicsStore.getState();
  }

  public deserializeState(state: PhysicsState): void {
    this.reset();
    Object.values(state.bodies).forEach((body) => this.addBody(body));
  }
}

// Initialize the PhysicsSystem with default configuration
const physicsConfig: PhysicsConfig = {
  gravity: new Vector3(0, -9.82, 0),
  debug: true, // Enable debug logs
};

PhysicsSystem.getInstance().initialize(physicsConfig);
