### **What Makes a System in Our Game Engine?**

In our game engine, a **System** is a self-contained, reusable module responsible for managing a specific aspect of the game's functionality. Each system interacts with other systems and components while maintaining its core responsibility. Systems adhere to a consistent **architecture pattern** for clarity, modularity, and extensibility.

---

### **Core Features of a System**

All systems in the game engine share the following **essential characteristics**:

1. **Initialization**:
   Systems must initialize their internal state, dependencies, and resources when the game or scene starts.

2. **State Management**:
   Systems use Zustand or equivalent mechanisms to manage state and expose reactive hooks or APIs for interaction.

3. **Interface/API**:
   Each system provides a well-defined API (functions, methods) to expose its capabilities to other systems, components, or hooks.

4. **Event Handling**:
   Systems respond to game-wide events (e.g., player actions, collisions) using an event dispatcher or custom handlers.

5. **Update Loop**:
   Systems can register update functions that are invoked during the game loop for real-time processing.

6. **Inter-System Communication**:
   Systems can communicate with others using APIs, shared stores, or a central manager.

7. **Error Handling and Debugging**:
   Systems include logging and error recovery mechanisms to handle unexpected states.

---

### **Development Pattern for Systems**

A **System** in our engine adheres to the following coding pattern:

#### 1. **Folder Structure**
Each system resides in the `src/systems/` directory and consists of:
- A **main system file** (e.g., `AbilitySystem.ts`) implementing core logic.
- An **API wrapper** or **helper hooks** for easier integration (e.g., `useAbility.ts`).
- Optional **type definitions** if system-specific types are required.

Example:
```plaintext
src/systems/AbilitySystem.ts
src/hooks/useAbility.ts
src/types/ability.types.ts
```

---

#### 2. **Core Components of a System**

##### **System Interface**
Each system defines:
- **Initialization:** A function to set up its internal state and resources.
- **State Management:** Zustand store or equivalent for reactive state management.
- **Public API:** Functions that expose system capabilities to other systems or components.
- **Lifecycle Methods:** Start, stop, and reset capabilities if the system’s state needs management between scenes or levels.

##### **Structure of a System File**
```typescript
export class AbilitySystem {
  private static instance: AbilitySystem | null = null; // Singleton instance

  // Internal state managed by Zustand or private variables
  private store = create<AbilityState>((set) => ({
    abilities: {},
    addAbility: (ability) => set((state) => ({ abilities: { ...state.abilities, [ability.id]: ability } })),
    useAbility: (id) => { /* ...logic to trigger ability */ },
    updateCooldowns: (currentTime) => { /* ...logic to update cooldowns */ },
  }));

  // Singleton Pattern for System Initialization
  public static getInstance(): AbilitySystem {
    if (!AbilitySystem.instance) {
      AbilitySystem.instance = new AbilitySystem();
    }
    return AbilitySystem.instance;
  }

  // Initialize the system (called during game startup)
  public initialize(): void {
    console.log("AbilitySystem initialized");
    // Load abilities or any required resources
  }

  // API to expose system functionality
  public addAbility(ability: Ability): void {
    this.store.getState().addAbility(ability);
  }

  public useAbility(id: string): void {
    this.store.getState().useAbility(id);
  }

  public update(currentTime: number): void {
    this.store.getState().updateCooldowns(currentTime);
  }
}
```

---

#### 3. **Shared System Features**

##### **State Management**
Every system uses Zustand for managing internal state:
- Encapsulates state in a private store.
- Exposes state manipulation functions via the system’s API.

Example:
```typescript
const weaponStore = create<WeaponState>((set) => ({
  weapons: {},
  equippedWeaponId: null,
  equipWeapon: (id) => set((state) => ({ equippedWeaponId: id })),
  fireWeapon: (target) => { /* Firing logic */ },
}));
```

---

##### **Event Handling**
Systems subscribe to or dispatch events using a central event manager:
- Events include player inputs, system-specific events (e.g., weapon fired), or global events (e.g., level completed).

Example Event Listener:
```typescript
import { EventDispatcher } from "../utilities/eventDispatcher";

EventDispatcher.on("PLAYER_ATTACK", (data) => {
  const weaponSystem = WeaponSystem.getInstance();
  weaponSystem.fireWeapon(data.target);
});
```

---

##### **Inter-System Communication**
Systems interact through:
- **Direct API calls** (e.g., `AbilitySystem.getInstance().useAbility()`).
- **Shared Zustand stores** for shared data (e.g., player state).

Example:
```typescript
const abilitySystem = AbilitySystem.getInstance();
const playerState = playerStore.getState();

if (playerState.health < 50) {
  abilitySystem.useAbility("heal");
}
```

---

##### **Update Loop Integration**
Systems requiring periodic updates implement an `update` method and register it with the main game loop.

Example:
```typescript
export class AnimationSystem {
  public update(deltaTime: number): void {
    // Update animations based on deltaTime
    this.animations.forEach((animation) => animation.update(deltaTime));
  }
}
```

---

##### **Error Handling and Debugging**
Systems log critical errors and state transitions:
```typescript
try {
  const weapon = weaponStore.getState().weapons[weaponId];
  if (!weapon) throw new Error(`Weapon ${weaponId} not found`);
  weapon.fire();
} catch (error) {
  console.error("WeaponSystem error:", error);
}
```

---

### **Coding Style Summary**

1. **Singleton Pattern**:
   - Systems like `AbilitySystem` or `WeaponSystem` follow a singleton pattern to ensure a single instance is globally accessible.

2. **Encapsulation**:
   - Internal state is managed through private variables or Zustand stores.
   - Only public methods expose functionality.

3. **Lifecycle Integration**:
   - Systems implement `initialize`, `update`, and optional `reset` methods for integration with the game lifecycle.

4. **Clear Interfaces**:
   - Systems expose a consistent API for accessing functionality.
   - API methods directly manipulate state or perform actions.

5. **Event-Driven**:
   - Systems listen for and dispatch events for asynchronous communication.

---

### **Example High-Level Pattern**

#### **Ability System**
- **State:** Tracks all abilities and their cooldowns.
- **API:** Add, remove, or activate abilities.
- **Update Loop:** Recalculates cooldowns every frame.
- **Event Handling:** Listens for player input to trigger abilities.

#### **Weapon System**
- **State:** Manages weapons, ammo, and firing states.
- **API:** Equip, fire, or reload weapons.
- **Update Loop:** Tracks weapon cooldowns for firing rate.
- **Event Handling:** Responds to attack inputs and collision events.

#### **Scene Graph System**
- **State:** Tracks objects, parent-child relationships.
- **API:** Add, remove, and modify scene objects.
- **Update Loop:** Propagates transform changes across the hierarchy.

---

Would you like a **full implementation example** for a specific system like the `AbilitySystem` or `WeaponSystem` using this pattern?
---

### **System Template: General Structure**

#### **Folder Layout**
Each system will follow this layout:
```plaintext
src/systems/<SystemName>System.ts   # Main logic for the system
src/hooks/use<SystemName>.ts        # Hook for integrating the system with components
src/types/<systemName>.types.ts     # Type definitions specific to the system
```

---

### **System Coding Template**

#### **1. System File**
**Location:** `src/systems/<SystemName>System.ts`

Defines the core logic, state, and API of the system.

```typescript
// src/systems/<SystemName>System.ts
import { create } from "zustand"; // Zustand for state management
import { EventDispatcher } from "../utilities/eventDispatcher"; // Event management
import { <SystemName>State, <SystemName>Config } from "../types/<systemName>.types";

export class <SystemName>System {
  private static instance: <SystemName>System | null = null;

  // Private Zustand store for internal state
  private store = create<<SystemName>State>((set) => ({
    // Define default state properties here
    initialized: false,
    // Add other properties or functions
    reset: () => set(() => ({ initialized: false })),
  }));

  // Singleton Pattern for System Initialization
  public static getInstance(): <SystemName>System {
    if (!<SystemName>System.instance) {
      <SystemName>System.instance = new <SystemName>System();
    }
    return <SystemName>System.instance;
  }

  // Initialize the system
  public initialize(config: <SystemName>Config): void {
    if (this.store.getState().initialized) {
      console.warn(`<SystemName>System is already initialized.`);
      return;
    }
    console.log(`<SystemName>System initialized with config:`, config);

    // Setup logic based on config
    this.store.setState({ initialized: true });
  }

  // Public API Methods
  public performAction(data: any): void {
    console.log("Performing action with data:", data);
    // Add logic for the system's main operations
  }

  // Update Method for Game Loop
  public update(deltaTime: number): void {
    console.log(`<SystemName>System update with deltaTime:`, deltaTime);
    // Add frame-by-frame logic here
  }
}
```

---

#### **2. Hook for System Integration**
**Location:** `src/hooks/use<SystemName>.ts`

Provides an easy way to interact with the system in React components.

```typescript
// src/hooks/use<SystemName>.ts
import { <SystemName>System } from "../systems/<SystemName>System";

export const use<SystemName> = () => {
  const system = <SystemName>System.getInstance();

  return {
    initialize: system.initialize.bind(system),
    performAction: system.performAction.bind(system),
    update: system.update.bind(system),
    // Add additional bindings as needed
  };
};
```

---

#### **3. Type Definitions**
**Location:** `src/types/<systemName>.types.ts`

Defines all types related to the system for strong typing and clarity.

```typescript
// src/types/<systemName>.types.ts
export interface <SystemName>State {
  initialized: boolean; // Whether the system is initialized
  // Add other state properties specific to the system
  reset: () => void; // Reset function for clearing state
}

export interface <SystemName>Config {
  // Configuration parameters for initializing the system
  debug?: boolean; // Example: Enable debug mode
  // Add other configuration parameters here
}
```

---

### **Common Features for All Systems**

#### **Core Components**
Every system will include:
1. **Singleton Instance**:
   Ensures only one instance of a system exists.
   ```typescript
   private static instance: <SystemName>System | null = null;
   ```

2. **Initialization**:
   Handles system setup and prevents re-initialization if already active.
   ```typescript
   public initialize(config: <SystemName>Config): void {
     if (this.store.getState().initialized) return;
     this.store.setState({ initialized: true });
   }
   ```

3. **Zustand Store**:
   Encapsulates system-specific state with a private store.
   ```typescript
   private store = create<<SystemName>State>((set) => ({
     initialized: false,
     reset: () => set(() => ({ initialized: false })),
   }));
   ```

4. **Public API**:
   Exposes methods for interacting with the system (e.g., `performAction`).

5. **Update Method**:
   Defines per-frame logic for integration with the game loop.
   ```typescript
   public update(deltaTime: number): void {
     // Add frame-by-frame operations here
   }
   ```

6. **Event Handling**:
   Subscribes to or dispatches events using a central `EventDispatcher`.
   ```typescript
   EventDispatcher.on("EVENT_NAME", (data) => {
     console.log("Received event:", data);
   });
   ```

---

### **Standard Lifecycle**
All systems implement a standard lifecycle for consistency.

| **Lifecycle Method** | **Purpose**                                                              |
|-----------------------|--------------------------------------------------------------------------|
| `initialize(config)`  | Sets up the system (state, dependencies, configuration).                |
| `update(deltaTime)`   | Updates the system every frame (game loop integration).                 |
| `reset()`             | Clears the system's state (useful when restarting a scene or the game). |

---

### **Example Usage of the Template**

#### Creating the `AbilitySystem`
1. **Define the core logic in `AbilitySystem.ts`**:
   - Manage abilities, cooldowns, and activations.
2. **Expose a hook `useAbility.ts`**:
   - Provide an interface for React components to use the system.
3. **Use the types from `ability.types.ts`**:
   - Ensure consistency across state, API, and store.

#### Extending to Other Systems
To create a new system (e.g., `WeaponSystem`):
1. Replace `<SystemName>` with `Weapon`.
2. Implement specific logic for weapons (e.g., firing, reloading).
3. Use the shared structure for consistency.

---

### **High-Level Benefits of This Pattern**

1. **Modularity**:
   - Each system is self-contained, making debugging and extension easier.

2. **Consistency**:
   - All systems follow the same structure, simplifying onboarding for new developers.

3. **Extensibility**:
   - New systems can be added by following the template and filling in specifics.

4. **Interoperability**:
   - Shared state and event-driven communication make it easy for systems to interact.

---

Would you like this pattern expanded with a sample system implementation (e.g., `AbilitySystem`) using the template?
