// src/systems/PhysicsSystem/PhysicsSystem.test.tsx

import {PhysicsSystem} from "./PhysicsSystem";
import {PhysicsBody,PhysicsConfig} from "../../types/physics.types";
import {usePhysicsStore} from "../../stores/physicsStore";
import {EventDispatcher} from "../../utils/EventDispatcher";
import {Vector3} from "three";

describe("PhysicsSystem",() => {
	const physicsSystem=PhysicsSystem.getInstance();

	beforeEach(() => {
		// Reset the PhysicsStore before each test
		usePhysicsStore.setState({bodies: {}});
		// Clear all events
		(EventDispatcher as any).events={};
	});

	it("should add a physics body",() => {
		const body: PhysicsBody={
			id: "box1",
			type: "dynamic",
			shape: "box",
			position: new Vector3(0,0,0),
			rotation: new Vector3(0,0,0),
			args: [1,1,1],
			mass: 1,
			onCollide: jest.fn(),
		};

		physicsSystem.addBody(body);
		const storedBody=usePhysicsStore.getState().bodies["box1"];
		expect(storedBody).toBeDefined();
		expect(storedBody?.shape).toBe("box");
	});

	it("should remove a physics body",() => {
		const body: PhysicsBody={
			id: "sphere1",
			type: "static",
			shape: "sphere",
			position: new Vector3(1,2,3),
			rotation: new Vector3(0,0,0),
			args: [1],
			onCollide: jest.fn(),
		};

		physicsSystem.addBody(body);
		expect(usePhysicsStore.getState().bodies["sphere1"]).toBeDefined();

		physicsSystem.removeBody("sphere1");
		expect(usePhysicsStore.getState().bodies["sphere1"]).toBeUndefined();
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
