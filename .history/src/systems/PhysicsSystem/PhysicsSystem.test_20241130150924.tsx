// src/systems/PhysicsSystem/PhysicsSystem.test.tsx

import { PhysicsSystemManager, handleCollision } from "./PhysicsSystem";
import { PhysicsBody } from "../../types/physics.types";
import { usePhysicsStore } from "../../stores/physicsStore";
import { Vector3 } from "three";

describe("PhysicsSystemManager", () => {
  let physicsSystem: PhysicsSystemManager;

  beforeEach(() => {
    // Reset the PhysicsStore before each test
    usePhysicsStore.setState({ bodies: {} });
    physicsSystem = PhysicsSystemManager.getInstance();
  });

  afterEach(() => {
    // Reset the physics system after each test to ensure isolation
    physicsSystem.reset();
  });

  it("should be a singleton", () => {
    const instance1 = PhysicsSystemManager.getInstance();
    const instance2 = PhysicsSystemManager.getInstance();
    expect(instance1).toBe(instance2);
  });

  it("should add a physics body", () => {
    const body: PhysicsBody = {
      id: "box1",
      type: "dynamic",
      shape: "box",
      position: new Vector3(0, 0, 0),
      rotation: new Vector3(0, 0, 0),
      args: [1, 1, 1],
      mass: 1,
      onCollide: jest.fn(),
    };

    physicsSystem.addBody(body);
    const storedBody = physicsSystem.getBody("box1");
    expect(storedBody).toBeDefined();
    expect(storedBody?.shape).toBe("box");
    expect(storedBody?.position).toEqual(new Vector3(0, 0, 0));
  });

  it("should handle multiple bodies", () => {
    const bodies: PhysicsBody[] = [
      {
        id: "box1",
        type: "dynamic",
        shape: "box",
        position: new Vector3(0, 0, 0),
        rotation: new Vector3(0, 0, 0),
        args: [1, 1, 1],
        mass: 1,
        onCollide: jest.fn(),
      },
      {
        id: "sphere1",
        type: "dynamic",
        shape: "sphere",
        position: new Vector3(1, 1, 1),
        rotation: new Vector3(0, 0, 0),
        args: [0.5],
        mass: 1,
        onCollide: jest.fn(),
      },
    ];

    bodies.forEach((body) => physicsSystem.addBody(body));
    expect(Object.keys(usePhysicsStore.getState().bodies)).toHaveLength(2);
    expect(physicsSystem.getBody("box1")).toBeDefined();
    expect(physicsSystem.getBody("sphere1")).toBeDefined();
  });

  it("should update body properties", () => {
    const body: PhysicsBody = {
      id: "box1",
      type: "dynamic",
      shape: "box",
      position: new Vector3(0, 0, 0),
      rotation: new Vector3(0, 0, 0),
      args: [1, 1, 1],
      mass: 1,
      onCollide: jest.fn(),
    };

    physicsSystem.addBody(body);
    const newPosition = new Vector3(1, 2, 3);
    physicsSystem.updateBody("box1", { position: newPosition });

    const updatedBody = physicsSystem.getBody("box1");
    expect(updatedBody?.position).toEqual(newPosition);
  });

  it("should reset the physics system", () => {
    const body: PhysicsBody = {
      id: "box1",
      type: "dynamic",
      shape: "box",
      position: new Vector3(0, 0, 0),
      rotation: new Vector3(0, 0, 0),
      args: [1, 1, 1],
      mass: 1,
      onCollide: jest.fn(),
    };

    physicsSystem.addBody(body);
    physicsSystem.reset();
    expect(Object.keys(usePhysicsStore.getState().bodies)).toHaveLength(0);
    expect(physicsSystem.getBody("box1")).toBeUndefined();
  });

  it("should handle collision callbacks for RapierPhysics", () => {
    const onCollideMock = jest.fn();
    const body: PhysicsBody = {
      id: "cylinder1",
      type: "dynamic",
      shape: "cylinder",
      position: new Vector3(0, 0, 0),
      rotation: new Vector3(0, 0, 0),
      args: [1, 2, 3, 32],
      mass: 1,
      onCollide: onCollideMock,
    };

    physicsSystem.addBody(body);

    // Simulate a collision by invoking handleCollision directly
    const otherBodyId = "box2";
    const contactPoint = new Vector3(0, 1, 0);

    handleCollision({ otherBodyId, contactPoint }, body, "rapier");

    expect(onCollideMock).toHaveBeenCalledWith(otherBodyId, contactPoint);
    expect(onCollideMock).toHaveBeenCalledTimes(1);
  });

  it("should handle collision callbacks for CannonPhysics", () => {
    const onCollideMock = jest.fn();
    const body: PhysicsBody = {
      id: "sphere2",
      type: "dynamic",
      shape: "sphere",
      position: new Vector3(2, 2, 2),
      rotation: new Vector3(0, 0, 0),
      args: [0.5],
      mass: 1,
      onCollide: onCollideMock,
    };

    physicsSystem.addBody(body);

    // Simulate a collision by invoking handleCollision directly
    const otherBodyId = "box3";
    const contactPoint = new Vector3(1, 1, 1);

    handleCollision({ otherBodyId, contactPoint }, body, "cannon");

    expect(onCollideMock).toHaveBeenCalledWith(otherBodyId, contactPoint);
    expect(onCollideMock).toHaveBeenCalledTimes(1);
  });
});
