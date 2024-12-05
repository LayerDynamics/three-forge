### **Standard Hook Development Pattern**

This is a template for creating reusable hooks in the game engine. Hooks serve as the primary interface for interacting with systems, encapsulating their logic and state in a React-friendly way. Every hook will follow this **minimum structure**, ensuring consistency and maintainability.

---

### **Core Principles of Hooks**

1. **System Access**:
   - Hooks provide access to the system's public API and state.

2. **State Synchronization**:
   - Hooks connect to the Zustand store (or equivalent) of the system and expose relevant state to React components.

3. **Encapsulation**:
   - Hooks encapsulate logic to prevent components from directly interacting with system internals.

4. **Performance**:
   - Hooks optimize reactivity using selective state updates and memoization.

---

### **Hook Structure**

#### **1. File Location**
Hooks are stored in `src/hooks/` and follow the naming convention:
```plaintext
src/hooks/use<SystemName>.ts
```

#### **2. Hook Template**
Here’s the template for defining a hook.

```typescript
import { useEffect, useCallback } from "react";
import { <SystemName>System } from "../systems/<SystemName>System"; // Import the corresponding system
import { useStore } from "zustand"; // Zustand store integration

/**
 * Hook: use<SystemName>
 * Provides an interface to interact with the <SystemName>System.
 */
export const use<SystemName> = () => {
  // Access the singleton instance of the system
  const system = <SystemName>System.getInstance();

  // Access Zustand store state selectively
  const state = useStore(system.store, (state) => ({
    // Define the state properties you want to expose
    initialized: state.initialized,
    // Add more properties as needed
  }));

  // Wrap system methods with React-friendly callbacks
  const performAction = useCallback(
    (actionData: any) => {
      system.performAction(actionData);
    },
    [system]
  );

  // Side effects or lifecycle logic related to the hook
  useEffect(() => {
    console.log(`<SystemName> Hook Mounted`);
    return () => {
      console.log(`<SystemName> Hook Unmounted`);
    };
  }, []);

  // Return the API and state
  return {
    ...state, // Spread system state properties
    performAction, // Add exposed methods
    initialize: system.initialize.bind(system), // Bind other system methods as needed
  };
};
```

---

### **Explanation of the Hook Structure**

#### **1. Importing the System**
```typescript
import { <SystemName>System } from "../systems/<SystemName>System";
```
- Each hook interacts with its corresponding system.
- The system provides a centralized store and API.

#### **2. Accessing State**
```typescript
const state = useStore(system.store, (state) => ({
  initialized: state.initialized,
}));
```
- Hooks use Zustand to read state reactively.
- Selective state mapping ensures components only re-render when relevant state changes.

#### **3. Wrapping Methods**
```typescript
const performAction = useCallback((actionData: any) => {
  system.performAction(actionData);
}, [system]);
```
- System methods are wrapped in React’s `useCallback` to ensure stable references.

#### **4. Lifecycle Management**
```typescript
useEffect(() => {
  console.log(`<SystemName> Hook Mounted`);
  return () => {
    console.log(`<SystemName> Hook Unmounted`);
  };
}, []);
```
- Hooks handle side effects and setup/cleanup logic for their respective systems.

#### **5. Exposing the API**
```typescript
return {
  ...state, // Expose state
  performAction, // Expose wrapped methods
  initialize: system.initialize.bind(system), // Bind system initialization
};
```
- Hooks expose a unified interface to React components, combining state and methods.

---

### **Minimum Features of All Hooks**

| **Feature**           | **Description**                                                                                      |
|------------------------|------------------------------------------------------------------------------------------------------|
| **System Integration** | Connects to the corresponding system (singleton pattern).                                           |
| **State Synchronization** | Reads state reactively from Zustand (or equivalent).                                                |
| **Public Methods**     | Exposes system methods via React-friendly wrappers.                                                 |
| **Lifecycle Management** | Handles setup and cleanup for the system (optional but standardized).                              |
| **Memoization**        | Uses `useCallback` and `useMemo` to optimize performance and prevent unnecessary re-renders.         |
| **Return Object**      | Returns a unified object containing state and methods for easy integration in components.            |

---

### **Example Hook**

Here’s an example of the template applied to a **Weapon System Hook**:

```typescript
import { useEffect, useCallback } from "react";
import { WeaponSystem } from "../systems/WeaponSystem"; // Import the WeaponSystem
import { useStore } from "zustand"; // Zustand for state management

/**
 * Hook: useWeapon
 * Provides an interface to interact with the WeaponSystem.
 */
export const useWeapon = () => {
  // Access the singleton instance of the WeaponSystem
  const system = WeaponSystem.getInstance();

  // Zustand store state
  const state = useStore(system.store, (state) => ({
    equippedWeaponId: state.equippedWeaponId,
    weapons: state.weapons,
  }));

  // Wrapping system methods
  const equipWeapon = useCallback((id: string) => {
    system.equipWeapon(id);
  }, [system]);

  const fireWeapon = useCallback((target: Vector3) => {
    system.fireWeapon(target);
  }, [system]);

  // Lifecycle logic
  useEffect(() => {
    console.log("useWeapon Hook Mounted");
    return () => {
      console.log("useWeapon Hook Unmounted");
    };
  }, []);

  // Return state and methods
  return {
    ...state, // Expose Zustand store state
    equipWeapon,
    fireWeapon,
    reloadWeapon: system.reloadWeapon.bind(system),
  };
};
```

---

### **Hook API: Summary**

Each hook exposes a **unified interface** that combines:
1. **State**:
   - Synchronized with the system’s Zustand store.
   - Exposes reactive properties for use in components.
2. **Methods**:
   - React-friendly wrappers for system API calls.
   - Encapsulate logic to simplify component usage.

---

### **Benefits of This Hook Pattern**

1. **Encapsulation**:
   - Prevents direct access to system internals.
   - Components interact only through hooks.

2. **Reactivity**:
   - Hooks manage state efficiently using Zustand and selective updates.

3. **Reusability**:
   - Hooks provide a standardized interface, making them interchangeable.

4. **Scalability**:
   - Adding new methods or extending functionality is straightforward.

---

Would you like this pattern expanded with specific examples for other hooks, or additional details about testing and debugging hooks?
