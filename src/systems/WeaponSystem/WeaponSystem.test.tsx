// src/systems/WeaponSystem/WeaponSystem.test.tsx

import { WeaponSystem } from "./WeaponSystem";
import { Weapon } from "../../types/weapons.types";
import { EventDispatcher } from "../../utils/EventDispatcher";
import { Vector3 } from "three";
import { useWeaponStore } from "../../stores/weaponStore";
describe("WeaponSystem", () => {
  const weaponSystem = WeaponSystem.getInstance();

  beforeEach(() => {
    // Reset the WeaponStore before each test
    weaponSystem.reset();
    // Clear all events
    (EventDispatcher as any).events = {};
  });

  it("should add a weapon", () => {
    const weapon: Weapon = {
      id: "sword",
      name: "Sword",
      type: "melee",
      damage: 50,
      range: 1,
      ammo: null,
      maxAmmo: null,
      fireRate: 1,
      lastFired: 0,
      reloadTime: 0,
      reload: jest.fn(),
      fire: jest.fn(),
    };

    weaponSystem.addWeapon(weapon);
    const storedWeapon = weaponSystem.getWeapon("sword");
    expect(storedWeapon).toBeDefined();
    expect(storedWeapon?.name).toBe("Sword");
  });

  it("should equip a weapon", () => {
    const weapon: Weapon = {
      id: "bow",
      name: "Bow",
      type: "ranged",
      damage: 30,
      range: 15,
      ammo: 10,
      maxAmmo: 10,
      fireRate: 2,
      lastFired: 0,
      reloadTime: 3,
      reload: jest.fn(),
      fire: jest.fn(),
    };

    weaponSystem.addWeapon(weapon);
    weaponSystem.equipWeapon("bow");
    const state = useWeaponStore.getState();
    expect(state.equippedWeaponId).toBe("bow");
  });

  it("should fire a melee weapon", () => {
    const fireMock = jest.fn();
    const weapon: Weapon = {
      id: "axe",
      name: "Axe",
      type: "melee",
      damage: 60,
      range: 1.5,
      ammo: null,
      maxAmmo: null,
      fireRate: 1,
      lastFired: 0,
      reloadTime: 0,
      reload: jest.fn(),
      fire: fireMock,
    };

    weaponSystem.addWeapon(weapon);
    weaponSystem.equipWeapon("axe");
    weaponSystem.fireWeapon();

    expect(fireMock).toHaveBeenCalled();
    const updatedWeapon = weaponSystem.getWeapon("axe");
    expect(updatedWeapon?.lastFired).toBeGreaterThan(0);
  });

  it("should fire a ranged weapon and decrement ammo", () => {
    const fireMock = jest.fn();
    const weapon: Weapon = {
      id: "gun",
      name: "Gun",
      type: "ranged",
      damage: 25,
      range: 20,
      ammo: 5,
      maxAmmo: 10,
      fireRate: 1,
      lastFired: 0,
      reloadTime: 2,
      reload: jest.fn(),
      fire: fireMock,
    };

    weaponSystem.addWeapon(weapon);
    weaponSystem.equipWeapon("gun");
    weaponSystem.fireWeapon(new Vector3(10, 0, 0));

    expect(fireMock).toHaveBeenCalledWith(new Vector3(10, 0, 0));
    const updatedWeapon = weaponSystem.getWeapon("gun");
    expect(updatedWeapon?.ammo).toBe(4);
    expect(updatedWeapon?.lastFired).toBeGreaterThan(0);
  });

  it("should not fire a ranged weapon if out of ammo", () => {
    const fireMock = jest.fn();
    const weapon: Weapon = {
      id: "crossbow",
      name: "Crossbow",
      type: "ranged",
      damage: 40,
      range: 25,
      ammo: 0,
      maxAmmo: 5,
      fireRate: 1,
      lastFired: 0,
      reloadTime: 3,
      reload: jest.fn(),
      fire: fireMock,
    };

    weaponSystem.addWeapon(weapon);
    weaponSystem.equipWeapon("crossbow");
    weaponSystem.fireWeapon(new Vector3(15, 0, 0));

    expect(fireMock).not.toHaveBeenCalled();
    const updatedWeapon = weaponSystem.getWeapon("crossbow");
    expect(updatedWeapon?.ammo).toBe(0);
  });

  it("should reload a ranged weapon", () => {
    const weapon: Weapon = {
      id: "rifle",
      name: "Rifle",
      type: "ranged",
      damage: 35,
      range: 30,
      ammo: 2,
      maxAmmo: 5,
      fireRate: 1,
      lastFired: 0,
      reloadTime: 4,
      reload: jest.fn(),
      fire: jest.fn(),
    };

    weaponSystem.addWeapon(weapon);
    weaponSystem.reloadWeapon("rifle");
    const updatedWeapon = weaponSystem.getWeapon("rifle");
    expect(updatedWeapon?.ammo).toBe(5);
    expect(weapon.reload).not.toHaveBeenCalled(); // Reload logic is handled in the store
  });

  it("should handle firing rate restrictions", () => {
	// Setup fake timers and mock Date.now
	jest.useFakeTimers();
	const startTime = 1000000;
	jest.spyOn(Date, 'now').mockImplementation(() => startTime);

	const fireMock = jest.fn();
	const weapon: Weapon = {
		id: "pistol",
		name: "Pistol",
		type: "ranged",
		damage: 20,
		range: 10,
		ammo: 5,
		maxAmmo: 10,
		fireRate: 2, // 2 shots per second = 500ms between shots
		lastFired: 0, // Start with no cooldown
		reloadTime: 2,
		reload: jest.fn(),
		fire: fireMock,
	};

	weaponSystem.addWeapon(weapon);
	weaponSystem.equipWeapon("pistol");

	// First shot should work
	weaponSystem.fireWeapon(new Vector3(5, 0, 0));
	expect(fireMock).toHaveBeenCalledTimes(1);

	// Reset mock for next test
	fireMock.mockClear();

	// Try to fire again immediately
	jest.spyOn(Date, 'now').mockImplementation(() => startTime + 100); // Only 100ms later
	weaponSystem.fireWeapon(new Vector3(5, 0, 0));
	expect(fireMock).not.toHaveBeenCalled();

	// Advance time past cooldown
	jest.spyOn(Date, 'now').mockImplementation(() => startTime + 600); // 600ms later
	weaponSystem.fireWeapon(new Vector3(5, 0, 0));
	expect(fireMock).toHaveBeenCalledTimes(1);

	// Cleanup
	jest.useRealTimers();
	jest.restoreAllMocks();
	});
});
