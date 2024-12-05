### **Testing Workflows and Standards**

To ensure the game engine is robust, reliable, and scalable, we will define standards for **unit tests**, **integration tests**, **component tests**, and **end-to-end (E2E) tests**. Each type of test serves a distinct purpose, ensuring all layers of the application are thoroughly validated.

---

### **1. Unit Tests**

#### **Purpose**
Unit tests focus on individual functions, methods, or small modules in isolation. They validate that a single unit of logic behaves as expected.

#### **Standards**
- **Scope**:
  - Test pure functions, system methods, and isolated logic.
  - Avoid external dependencies (e.g., APIs, databases).
- **Tools**: Use **Jest**.
- **Coverage**:
  - Achieve at least **90% coverage** for utility functions and **80% for system logic**.
- **Naming Convention**:
  - Follow `describe()` blocks for the module name and `it()` blocks for specific behaviors.

#### **Example: Unit Test for a Utility Function**
_File: `src/utilities/mathUtils.ts`_
```typescript
export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));
```

_Test: `src/utilities/__tests__/mathUtils.test.ts`_
```typescript
import { clamp } from "../mathUtils";

describe("clamp", () => {
  it("should return the value if within range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("should return the minimum if value is below range", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it("should return the maximum if value is above range", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });
});
```

---

### **2. Integration Tests**

#### **Purpose**
Integration tests validate the interaction between multiple systems or modules to ensure they work together as expected.

#### **Standards**
- **Scope**:
  - Test communication between systems (e.g., `WeaponSystem` interacting with `AbilitySystem`).
  - Mock external dependencies where necessary to isolate the interaction.
- **Tools**: Use **Jest** or **React Testing Library**.
- **Coverage**:
  - Ensure all critical system interactions have test coverage.

#### **Example: Integration Test for Two Systems**
_File: `src/systems/WeaponSystem.ts`_
```typescript
export class WeaponSystem {
  private ammo: number = 10;

  public fire(): boolean {
    if (this.ammo > 0) {
      this.ammo--;
      return true;
    }
    return false;
  }

  public reload(amount: number): void {
    this.ammo += amount;
  }
}
```

_File: `src/systems/AbilitySystem.ts`_
```typescript
import { WeaponSystem } from "./WeaponSystem";

export class AbilitySystem {
  private weaponSystem: WeaponSystem;

  constructor(weaponSystem: WeaponSystem) {
    this.weaponSystem = weaponSystem;
  }

  public useSpecialAbility(): boolean {
    if (this.weaponSystem.fire()) {
      console.log("Special ability activated!");
      return true;
    }
    return false;
  }
}
```

_Test: `src/systems/__tests__/AbilitySystem.integration.test.ts`_
```typescript
import { WeaponSystem } from "../WeaponSystem";
import { AbilitySystem } from "../AbilitySystem";

describe("AbilitySystem and WeaponSystem Integration", () => {
  it("should activate special ability if the weapon can fire", () => {
    const weaponSystem = new WeaponSystem();
    const abilitySystem = new AbilitySystem(weaponSystem);

    expect(abilitySystem.useSpecialAbility()).toBe(true);
  });

  it("should fail to activate special ability if weapon has no ammo", () => {
    const weaponSystem = new WeaponSystem();
    const abilitySystem = new AbilitySystem(weaponSystem);

    // Simulate empty weapon
    weaponSystem.reload(-10);

    expect(abilitySystem.useSpecialAbility()).toBe(false);
  });
});
```

---

### **3. Component Tests**

#### **Purpose**
Component tests validate the behavior and appearance of React components, ensuring they render correctly and respond to user interactions as expected.

#### **Standards**
- **Scope**:
  - Test the component's UI rendering and interaction logic.
  - Mock system hooks (e.g., `useWeapon`) to isolate the component.
- **Tools**: Use **React Testing Library**.
- **Coverage**:
  - Ensure all reusable components are tested for various states (e.g., empty, loading, error).

#### **Example: Component Test for a Weapon Selector**
_File: `src/components/WeaponSelector.tsx`_
```tsx
import React from "react";
import { useWeapon } from "../hooks/useWeapon";

export const WeaponSelector: React.FC = () => {
  const { weapons, equipWeapon } = useWeapon();

  return (
    <div>
      {Object.values(weapons).map((weapon) => (
        <button key={weapon.id} onClick={() => equipWeapon(weapon.id)}>
          {weapon.name}
        </button>
      ))}
    </div>
  );
};
```

_Test: `src/components/__tests__/WeaponSelector.test.tsx`_
```tsx
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { WeaponSelector } from "../WeaponSelector";
import { useWeapon } from "../../hooks/useWeapon";

jest.mock("../../hooks/useWeapon");

describe("WeaponSelector", () => {
  it("renders all available weapons", () => {
    const mockUseWeapon = useWeapon as jest.MockedFunction<typeof useWeapon>;
    mockUseWeapon.mockReturnValue({
      weapons: {
        sword: { id: "sword", name: "Sword", ammo: null },
        bow: { id: "bow", name: "Bow", ammo: 10 },
      },
      equipWeapon: jest.fn(),
    });

    const { getByText } = render(<WeaponSelector />);
    expect(getByText("Sword")).toBeInTheDocument();
    expect(getByText("Bow")).toBeInTheDocument();
  });

  it("calls equipWeapon when a weapon is clicked", () => {
    const equipWeapon = jest.fn();
    useWeapon.mockReturnValue({
      weapons: {
        sword: { id: "sword", name: "Sword", ammo: null },
      },
      equipWeapon,
    });

    const { getByText } = render(<WeaponSelector />);
    fireEvent.click(getByText("Sword"));
    expect(equipWeapon).toHaveBeenCalledWith("sword");
  });
});
```

---

### **4. End-to-End (E2E) Tests**

#### **Purpose**
E2E tests validate full user workflows, simulating real-world interactions with the game engine.

#### **Standards**
- **Scope**:
  - Validate gameplay features, such as equipping a weapon and firing it.
  - Test workflows like navigating the UI or loading assets.
- **Tools**: Use **Cypress**.
- **Coverage**:
  - Ensure all critical user workflows are tested.

#### **Example: E2E Test for Gameplay**
_Test: `cypress/integration/gameplay.spec.js`_
```javascript
describe("Gameplay Tests", () => {
  it("should equip and fire a weapon", () => {
    cy.visit("/game");

    // Equip a weapon
    cy.get("[data-testid='equip-weapon-sword']").click();
    cy.contains("Sword equipped");

    // Fire the weapon
    cy.get("[data-testid='fire-weapon']").click();
    cy.contains("Weapon Fired").should("exist");
  });

  it("should show an error when trying to fire without ammo", () => {
    cy.visit("/game");

    // Equip an empty weapon
    cy.get("[data-testid='equip-weapon-empty']").click();
    cy.contains("Empty weapon equipped");

    // Try firing
    cy.get("[data-testid='fire-weapon']").click();
    cy.contains("No ammo").should("exist");
  });
});
```

---

### **Testing Workflow Summary**

| **Test Type**     | **Scope**                                                   | **Tools**                  | **Examples**                                                                                  |
|--------------------|-------------------------------------------------------------|----------------------------|----------------------------------------------------------------------------------------------|
| **Unit Tests**     | Test individual methods, functions, or utilities.           | Jest                       | Validating utility functions like `clamp` or system logic like `fireWeapon`.                 |
| **Integration Tests** | Test interaction between systems or modules.               | Jest                       | Ensuring `AbilitySystem` correctly interacts with `WeaponSystem`.                            |
| **Component Tests**| Validate React components' rendering and interactions.      | React Testing Library      | Ensuring `WeaponSelector` displays weapons and responds to clicks.                           |
| **E2E Tests**      | Validate full user workflows (e.g., gameplay scenarios).     | Cypress                    | Ensuring the player can equip a weapon, fire it, and handle ammo errors correctly.           |
