// src/components/UI/WeaponButton.tsx

import React, { useState, useEffect } from "react";
import { useWeapon } from "../../hooks/useWeapon";
import { Weapon } from "../../types/weapons.types";

interface WeaponButtonProps {
  weaponId: string;
}

const WeaponButton: React.FC<WeaponButtonProps> = ({ weaponId }) => {
  const { weapons, equipWeapon, fireWeapon, reloadWeapon, getWeapon } = useWeapon();
  const weapon = getWeapon(weaponId);

  const [remainingCooldown, setRemainingCooldown] = useState<number>(0);
  const [isReloading, setIsReloading] = useState<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const updateCooldown = () => {
      if (weapon && weapon.type === "ranged" && !weapon.isAvailable) {
        const elapsed = (Date.now() - weapon.lastFired) / 1000; // seconds
        const cooldownLeft = weapon.fireRate > 0 ? Math.max(0, (1 / weapon.fireRate) - elapsed) : 0;
        setRemainingCooldown(Math.ceil(cooldownLeft));
      } else {
        setRemainingCooldown(0);
      }
    };

    if (weapon && weapon.type === "ranged") {
      interval = setInterval(updateCooldown, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [weapon]);

  const handleEquip = () => {
    equipWeapon(weaponId);
  };

  const handleFire = () => {
    if (weapon?.type === "ranged") {
      // Example target position; in a real game, this would be dynamic
      const target = new THREE.Vector3(10, 0, 0);
      fireWeapon(target);
    } else {
      fireWeapon();
    }
  };

  const handleReload = () => {
    if (weapon?.type === "ranged") {
      setIsReloading(true);
      // Simulate reload time
      setTimeout(() => {
        reloadWeapon(weaponId);
        setIsReloading(false);
      }, weapon.reloadTime * 1000);
    }
  };

  if (!weapon) {
    return <button disabled>Weapon Not Found</button>;
  }

  const isEquipped = weaponId === weapons[equippedWeaponId]?.id;

  return (
    <div style={{ margin: "10px" }}>
      <button onClick={handleEquip} disabled={isEquipped}>
        {isEquipped ? `${weapon.name} (Equipped)` : `Equip ${weapon.name}`}
      </button>
      <button onClick={handleFire} disabled={!isEquipped || (weapon.type === "ranged" && weapon.ammo === 0)}>
        {weapon.type === "ranged" ? "Fire" : "Swing"}
      </button>
      {weapon.type === "ranged" && (
        <button onClick={handleReload} disabled={isReloading || weapon.ammo === weapon.maxAmmo}>
          {isReloading ? "Reloading..." : "Reload"}
        </button>
      )}
      {weapon.type === "ranged" && (
        <div>
          Ammo: {weapon.ammo} / {weapon.maxAmmo}
        </div>
      )}
      {remainingCooldown > 0 && (
        <div style={{ color: "red" }}>Cooldown: {remainingCooldown}s</div>
      )}
    </div>
  );
};

export default WeaponButton;
