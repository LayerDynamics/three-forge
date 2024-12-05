// src/systems/PhysicsSystem/PhysicsSystem.test.tsx

import { PhysicsSystemManager } from "./PhysicsSystem";
import { PhysicsBody } from "../../types/physics.types";
// src/systems/PhysicsSystem/PhysicsSystem.test.tsx

import { PhysicsSystemManager } from "./PhysicsSystem";
import { PhysicsBody } from "../../types/physics.types";
import { usePhysicsStore } from "../../stores/physicsStore";
import { Vector3 } from "three";

describe("PhysicsSystemManager", () => {
	let physicsSystem: PhysicsSystemManager;

	beforeEach(() => {
		// Reset the store and get a fresh instance
		usePhysicsStore.setState({ bodies: {} });
		physicsSystem = PhysicsSystemManager.getInstance();
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
			onCollide: jest.fn()
		};

		physicsSystem.addBody(body);
		const storedBody = physicsSystem.getBody("box1");
		expect(storedBody).toBeDefined();
		expect(storedBody?.shape).toBe("box");
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
				mass: 1
			},
			{
			id: "sphere1",
				type: "dynamic",
			shape: "sphere",
				position: new Vector3(1, 1, 1),
				rotation: new Vector3(0, 0, 0),
				args: [0.5],
				mass: 1
			}
		];

		bodies.forEach(body => physicsSystem.addBody(body));
		expect(Object.keys(usePhysicsStore.getState().bodies)).toHaveLength(2);
	});

	it("should update body properties", () => {
		const body: PhysicsBody = {
			id: "box1",
			type: "dynamic",
			shape: "box",
			position: new Vector3(0, 0, 0),
			rotation: new Vector3(0, 0, 0),
			args: [1, 1, 1],
			mass: 1
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
			args: [1, 1, 1]
		};

		physicsSystem.addBody(body);
		physicsSystem.reset();
		expect(Object.keys(usePhysicsStore.getState().bodies)).toHaveLength(0);
	});

	it("should handle collision callbacks", () => {
		const onCollide = jest.fn();
		const body: PhysicsBody = {
			id: "box1",
			type: "dynamic",
			shape: "box",
			position: new Vector3(0, 0, 0),
			rotation: new Vector3(0, 0, 0),
			args: [1, 1, 1],
			onCollide
		};

		physicsSystem.addBody(body);
		const contactPoint = new Vector3(0, 1, 0);
		body.onCollide?.("box2", contactPoint);

		expect(onCollide).toHaveBeenCalledWith("box2", contactPoint);
		expect(onCollide).toHaveBeenCalledTimes(1);
	});


	it("should update a physics body",() => {
		const body: PhysicsBody={
			id: "capsule1",
			type: "dynamic",
			shape: "capsule",
			position: new Vector3(0,0,0),
			rotation: new Vector3(0,0,0),
			args: [0.5,2],
			mass: 1,
			onCollide: jest.fn(),
		};

		physicsSystem.addBody(body);
		const initialBody=usePhysicsStore.getState().bodies["capsule1"];
		expect(initialBody?.args).toEqual([0.5,2]);

		physicsSystem.updateBody("capsule1",{mass: 2});
		const updatedBody=usePhysicsStore.getState().bodies["capsule1"];
		expect(updatedBody?.mass).toBe(2);
	});

	it("should trigger onCollide callback",() => {
		const onCollideMock=jest.fn();

		const body: PhysicsBody={
			id: "cylinder1",
			type: "dynamic",
			shape: "cylinder",
			position: new Vector3(0,0,0),
			rotation: new Vector3(0,0,0),
			args: [1,2,1],
			onCollide: onCollideMock,
		};

		physicsSystem.addBody(body);

		// Simulate a collision by manually invoking the callback
		const contactPoint=new Vector3(0,1,0);
		body.onCollide&&body.onCollide("box2",contactPoint);

		expect(onCollideMock).toHaveBeenCalledWith("box2",contactPoint);
	});
});
