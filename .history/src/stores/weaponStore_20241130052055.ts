// a store for weapon data and methods to update the weapon data and manage the weapon logic for the player and enemies
import { writable } from "svelte/store";
import { Weapon } from "../types/Weapon";

export const weapon = writable<Weapon>({
  name: "Sword",
  damage: 10,
  speed: 1,
  range: 1,
  cooldown: 1,
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  xpToNextLevelMultiplier: 1.5,
  xpToNextLevelMultiplierIncrement: 0.1,
  xpToNextLevelIncrement: 100,
  xpToNextLevelIncrementMultiplier: 1.5,
  xpToNextLevelIncrementMultiplierIncrement: 0.1,
  levelUp: () => {
    weapon.update((weapon) => {
      weapon.level++;
      weapon.damage += 10;
      weapon.speed += 1;
      weapon.range += 1;
      weapon.cooldown += 1;
      weapon.xp = 0;
      weapon.xpToNextLevel = Math.floor(
        weapon.xpToNextLevel * weapon.xpToNextLevelMultiplier
      );
      weapon.xpToNextLevelMultiplier += weapon.xpToNextLevelMultiplierIncrement;
      weapon.xpToNextLevelIncrement = Math.floor(
        weapon.xpToNextLevelIncrement * weapon.xpToNextLevelIncrementMultiplier
      );
      weapon.xpToNextLevelIncrementMultiplier +=
        weapon.xpToNextLevelIncrementMultiplierIncrement;
      return weapon;
    });
  },
  addXp: (xp: number) => {
    weapon.update((weapon) => {
      weapon.xp += xp;
      if (weapon.xp >= weapon.xpToNextLevel) {
        weapon.levelUp();
      }
      return weapon;
    });
  },
});
