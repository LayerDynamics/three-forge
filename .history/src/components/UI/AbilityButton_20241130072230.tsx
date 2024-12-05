// src/components/UI/AbilityButton.tsx

import React from "react";
import { useAbility } from "../../hooks/useAbility";

interface AbilityButtonProps {
  abilityId: string;
}

const AbilityButton: React.FC<AbilityButtonProps> = ({ abilityId }) => {
  const { abilities, getAbility } = useAbility();

  const ability = getAbility(abilityId);

  if (!ability) {
    return <button disabled>Ability Not Found</button>;
  }

  // Calculate remaining cooldown
  const remainingCooldown = ability.isAvailable
    ? 0
    : Math.ceil((ability.cooldown - (Date.now() - ability.lastUsed) / 1000));

  const handleClick = () => {
    if (ability.isAvailable) {
      useAbility(abilityId);
    }
  };

  return (
    <button onClick={handleClick} disabled={!ability.isAvailable}>
      {ability.name}{" "}
      {!ability.isAvailable && `(Cooldown: ${remainingCooldown}s)`}
    </button>
  );
};

export default AbilityButton;
