// src/systems/AbilitySystem/AbilitySystem.test.ts

import {AbilitySystem} from "./AbilitySystem";
import {Ability} from "../../types/ability.types";

describe("AbilitySystem",() => {
	const abilitySystem=AbilitySystem.getInstance();

	beforeEach(() => {
		// Reset the AbilityStore before each test
		abilitySystem.reset();
	});

	it("should add an ability",() => {
		const ability: Ability={
			id: "test-ability",
			name: "Test Ability",
			description: "A test ability.",
			cooldown: 5,
			lastUsed: 0,
			isAvailable: true,
			activate: jest.fn(),
		};

		abilitySystem.addAbility(ability);
		const storedAbility=abilitySystem.getAbility("test-ability");
		expect(storedAbility).toBeDefined();
		expect(storedAbility?.name).toBe("Test Ability");
	});

	it("should use an ability if available",() => {
		const activateMock=jest.fn();
		const ability: Ability={
			id: "test-ability",
			name: "Test Ability",
			description: "A test ability.",
			cooldown: 5,
			lastUsed: 0,
			isAvailable: true,
			activate: activateMock,
		};

		abilitySystem.addAbility(ability);
		abilitySystem.useAbility("test-ability");
		expect(activateMock).toHaveBeenCalled();
	});


	it("should not use an ability if on cooldown",() => {
		const activateMock=jest.fn();
		const currentTime=Date.now();

		const ability: Ability={
			id: "test-ability",
			name: "Test Ability",
			description: "A test ability.",
			cooldown: 5,
			lastUsed: currentTime-1000, // Set to 1 second ago
			isAvailable: false,
			activate: activateMock,
		};

		// Mock Date.now() to return a consistent timestamp
		jest.spyOn(Date,'now').mockImplementation(() => currentTime);

		abilitySystem.addAbility(ability);
		abilitySystem.useAbility("test-ability");

		expect(activateMock).not.toHaveBeenCalled();

		// Cleanup
		jest.restoreAllMocks();
	});

	it("should update cooldowns and make abilities available",() => {
		const ability: Ability={
			id: "test-ability",
			name: "Test Ability",
			description: "A test ability.",
			cooldown: 5,
			lastUsed: Date.now()-6000, // 6 seconds ago
			isAvailable: false,
			activate: jest.fn(),
		};

		abilitySystem.addAbility(ability);
		abilitySystem.update(Date.now());

		const storedAbility=abilitySystem.getAbility("test-ability");
		expect(storedAbility?.isAvailable).toBe(true);
	});
});
