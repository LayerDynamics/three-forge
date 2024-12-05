// WeaponsSystem: A system that handles the weapon logic for the player and enemies.
// It is responsible for creating, updating, and destroying weapons in the game.
// It also handles collision detection between weapons and entities.
// src/systems/WeaponSystem/WeaponSystem.tsx

import { Weapon, WeaponConfig } from "../../types/weapons.types";
import { useWeaponStore } from "../../stores/weaponStore";
import { EventDispatcher } from "../../utils/EventDispatcher";

// Singleton Class
export class WeaponSystem {
  private static instance: WeaponSystem | null = null;

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  // Initialize with optional configuration
  public initialize(config: WeaponConfig = {}): void {
    const { initialWeapons = [], debug = false } = config;

    if (initialWeapons.length > 0) {
      initialWeapons.forEach((weapon) => {
        this.addWeapon(weapon);
      });
    }

    if (debug) {
      console.log("WeaponSystem initialized with config:", config);
    }

    // Subscribe to global events if necessary
    EventDispatcher.on("RESET_GAME", () => this.reset());
  }

  // Get the singleton instance
  public static getInstance(): WeaponSystem {
    if (!WeaponSystem.instance) {
      WeaponSystem.instance = new WeaponSystem();
    }
    return WeaponSystem.instance;
  }

  // Public API Methods
  public addWeapon(weapon: Weapon): void {
    useWeaponStore.getState().addWeapon(weapon);
  }

  public removeWeapon(id: string): void {
    useWeaponStore.getState().removeWeapon(id);
  }

  public equipWeapon(id: string): void {
    useWeaponStore.getState().equipWeapon(id);
  }

  public fireWeapon(target?: THREE.Vector3): void {
    useWeaponStore.getState().fireWeapon(target);
  }

  public reloadWeapon(id: string): void {
    useWeaponStore.getState().reloadWeapon(id);
  }

  public getWeapon(id: string): Weapon | undefined {
    return useWeaponStore.getState().weapons[id];
  }

  public update(currentTime: number): void {
    // WeaponSystem might not need per-frame updates unless implementing features like automatic reloading
    // Placeholder for future enhancements
  }

  public serializeState(): WeaponState {
  return useWeaponStore.getState();
}

public deserializeState(state: WeaponState): void {
  useWeaponStore.setState(state);
}

  public reset(): void {
    // Implement reset logic if necessary
    console.log("WeaponSystem reset.");
    useWeaponStore.setState({ equippedWeaponId: null, weapons: {} });
  }
}

// Configuration for the WeaponSystem (can be customized)
const config: WeaponConfig = {
  initialWeapons: [], // Define any initial weapons here
  debug: true, // Enable debug logs
};

// Initialize the WeaponSystem (typically done in a central initialization file)
WeaponSystem.getInstance().initialize(config);
