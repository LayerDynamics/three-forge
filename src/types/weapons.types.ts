// src/types/weapons.types.ts

import {Vector3} from "three";

export interface Weapon {
    id: string; // Unique identifier for the weapon
    name: string; // Name of the weapon
    type: "melee"|"ranged"; // Classification of weapon
    damage: number; // Base damage dealt
    range: number; // Effective range (0 for melee)
    ammo: number|null; // Remaining ammo (null for melee)
    maxAmmo: number|null; // Max ammo capacity (null for melee)
    fireRate: number; // Shots per second
    lastFired: number; // Timestamp of last shot
    reloadTime: number; // Time required to reload
    reload: () => void; // Function to reload the weapon
    fire: (target?: Vector3) => void; // Function to fire the weapon
    projectileId?: string; // Associated projectile for ranged weapons
}

export interface WeaponState {
    equippedWeaponId: string|null; // Currently equipped weapon
    weapons: Record<string,Weapon>; // Inventory of all weapons
    equipWeapon: (id: string) => void; // Function to equip a weapon
    fireWeapon: (target?: Vector3) => void; // Trigger firing
    reloadWeapon: (id: string) => void; // Reload the specified weapon
    addWeapon: (weapon: Weapon) => void; // Add a new weapon to inventory
    removeWeapon: (id: string) => void; // Remove a weapon from inventory
}

export interface WeaponConfig {
    initialWeapons?: Weapon[]; // Optional initial weapons to load
    debug?: boolean; // Enable debug mode for logging
}
