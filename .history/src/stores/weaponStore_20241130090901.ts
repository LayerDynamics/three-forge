// a store for weapon data and methods to update the weapon data and manage the weapon logic for the player and enemies
// src/stores/weaponStore.ts

import { create } from "zustand";
import { Weapon, WeaponState } from "../types/weapons.types";
import { EventDispatcher } from "../utils/EventDispatcher";

export const useWeaponStore = create<WeaponState>((set, get) => ({
  equippedWeaponId: null,
  weapons: {},

  addWeapon: (weapon: Weapon) => {
    set((state) => ({
      weapons: {
        ...state.weapons,
        [weapon.id]: {
          ...weapon,
          lastFired: 0,
        },
      },
    }));
    if ((weapon as any).debug) {
      console.log(`Weapon added: ${weapon.name}`);
    }
  },

  removeWeapon: (id: string) => {
    set((state) => {
      const { [id]: removedWeapon, ...remainingWeapons } = state.weapons;
      return { weapons: remainingWeapons };
    });
    console.log(`Weapon removed: ${id}`);
  },

  equipWeapon: (id: string) => {
    if (get().weapons[id]) {
      set({ equippedWeaponId: id });
      console.log(`Weapon equipped: ${id}`);
      EventDispatcher.dispatch("WEAPON_EQUIPPED", { weaponId: id });
    } else {
      console.warn(`Weapon ${id} does not exist in inventory.`);
    }
  },

  fireWeapon: (target?: Vector3) => {
    const { equippedWeaponId, weapons } = get();
    if (!equippedWeaponId) {
      console.warn("No weapon equipped.");
      return;
    }

    const weapon = weapons[equippedWeaponId];
    if (!weapon) {
      console.warn(`Equipped weapon ${equippedWeaponId} not found.`);
      return;
    }

    if (weapon.type === "ranged") {
      if (weapon.ammo && weapon.ammo > 0) {
        const currentTime = Date.now();
        const elapsed = (currentTime - weapon.lastFired) / 1000; // Convert ms to seconds
        if (elapsed >= 1 / weapon.fireRate) {
          weapon.fire(target);
          set((state) => ({
            weapons: {
              ...state.weapons,
              [equippedWeaponId]: {
                ...weapon,
                ammo: (weapon.ammo ?? 0) - 1,
                lastFired: currentTime,
              },
            },
          }));
          console.log(`Weapon fired: ${weapon.name}`);
          EventDispatcher.dispatch("WEAPON_FIRED", { weaponId: equippedWeaponId, target });
        } else {
          console.warn(`Weapon ${weapon.name} is firing too quickly.`);
        }
      } else {
        console.warn(`Weapon ${weapon.name} is out of ammo.`);
      }
    } else if (weapon.type === "melee") {
      weapon.fire();
      console.log(`Weapon swung: ${weapon.name}`);
      EventDispatcher.dispatch("WEAPON_SWUNG", { weaponId: equippedWeaponId });
    }
  },

  reloadWeapon: (id: string) => {
    const weapon = get().weapons[id];
    if (weapon && weapon.type === "ranged" && weapon.ammo !== null && weapon.maxAmmo !== null) {
      set((state) => ({
        weapons: {
          ...state.weapons,
          [id]: {
            ...weapon,
            ammo: weapon.maxAmmo,
          },
        },
      }));
      console.log(`Weapon reloaded: ${weapon.name}`);
      EventDispatcher.dispatch("WEAPON_RELOADED", { weaponId: id });
    } else {
      console.warn(`Weapon ${id} cannot be reloaded.`);
    }
  },
}));
