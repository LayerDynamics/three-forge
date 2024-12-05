// useWeapon: a custom hook that returns the weapon object and its methods
// It is used to manage the weapon logic for the player and enemies.
// It provides functions for creating, updating, and destroying weapons, as well as handling collision detection.
// It is used to separate the weapon logic from the rendering and input handling code.
// useWeapon.ts

// Purpose: Manages weapon logic and provides firing/reloading methods.
// Depends On: WeaponSystem.
// Interacts With: LogicEngine,PhysicsSystem.
// src/hooks/useWeapon.ts

import {useEffect,useCallback} from "react";
import {WeaponSystem} from "../systems/WeaponSystem/WeaponSystem";
import {useWeaponStore} from "../stores/weaponStore";
import {Weapon} from "../types/weapons.types";
import {Vector3} from "three";
import {EventDispatcher} from "../utils/EventDispatcher";

/**
 * Hook: useWeapon
 * Provides an interface to interact with the WeaponSystem.
 */
export const useWeapon=() => {
    // Access the singleton instance of the WeaponSystem
    const system=WeaponSystem.getInstance();

    // Access Zustand store state selectively
    const equippedWeaponId=useWeaponStore((state) => state.equippedWeaponId);
    const weapons=useWeaponStore((state) => state.weapons);

    // Wrap system methods with React-friendly callbacks
    const addWeapon=useCallback(
        (weapon: Weapon) => {
            system.addWeapon(weapon);
        },
        [system]
    );

    const removeWeapon=useCallback(
        (id: string) => {
            system.removeWeapon(id);
        },
        [system]
    );

    const equipWeapon=useCallback(
        (id: string) => {
            system.equipWeapon(id);
        },
        [system]
    );

    const fireWeapon=useCallback(
        (target?: Vector3) => {
            system.fireWeapon(target);
        },
        [system]
    );

    const reloadWeapon=useCallback(
        (id: string) => {
            system.reloadWeapon(id);
        },
        [system]
    );

    // Update method if needed (e.g., for per-frame updates)
    useEffect(() => {
        // If WeaponSystem requires per-frame updates, integrate here
        // Currently, WeaponSystem does not require per-frame updates
        // Placeholder for future enhancements
    },[system]);

    // Optionally, subscribe to events
    useEffect(() => {
        const handleWeaponFired=(data: any) => {
            console.log("Weapon fired event received:",data);
            // Handle event (e.g., trigger UI updates)
        };

        const handleWeaponEquipped=(data: any) => {
            console.log("Weapon equipped event received:",data);
            // Handle event (e.g., update UI to show equipped weapon)
        };

        const handleWeaponReloaded=(data: any) => {
            console.log("Weapon reloaded event received:",data);
            // Handle event (e.g., update UI to show ammo count)
        };

        EventDispatcher.on("WEAPON_FIRED",handleWeaponFired);
        EventDispatcher.on("WEAPON_EQUIPPED",handleWeaponEquipped);
        EventDispatcher.on("WEAPON_RELOADED",handleWeaponReloaded);

        return () => {
            EventDispatcher.off("WEAPON_FIRED",handleWeaponFired);
            EventDispatcher.off("WEAPON_EQUIPPED",handleWeaponEquipped);
            EventDispatcher.off("WEAPON_RELOADED",handleWeaponReloaded);
        };
    },[]);

    // Return the API and state
    return {
        equippedWeaponId,
        weapons,
        addWeapon,
        removeWeapon,
        equipWeapon,
        fireWeapon,
        reloadWeapon,
        getWeapon: (id: string) => system.getWeapon(id),
    };
};
