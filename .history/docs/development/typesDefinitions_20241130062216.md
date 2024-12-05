Here is a breakdown of the **`src/types`** folder with all the necessary type definitions for the game engine, based on the provided structure.

---

### **`src/types/`**

```plaintext
types/
├── ability.types.ts       # Types for abilities and cooldowns.
├── weapon.types.ts        # Types for weapons and interactions.
├── xp.types.ts            # Types for experience points and leveling.
├── input.types.ts         # Types for user input handling.
├── scene.types.ts         # Types for scene graph objects and configurations.
├── physics.types.ts       # Types for physics properties and interactions.
├── asset.types.ts         # Types for asset loading and caching.
├── player.types.ts        # Types for player-specific state.
├── enemy.types.ts         # Types for enemy-specific state.
├── gameState.types.ts     # Types for overarching game state.
├── animation.types.ts     # Types for animations and skeletal rigs.
├── postprocessing.types.ts # Types for post-processing effects.
└── store.types.ts         # Generic types for Zustand store definitions.
```

---

### **Type Definitions**

#### **`ability.types.ts`**
```typescript
export interface Ability {
  id: string;
  name: string;
  description: string;
  cooldown: number; // Time in seconds
  lastUsed: number; // Timestamp of the last activation
  isAvailable: boolean; // Derived from cooldown
  activate: () => void; // Function to activate the ability
}

export interface AbilityState {
  abilities: Record<string, Ability>; // Map of ability IDs to ability objects
  addAbility: (ability: Ability) => void;
  useAbility: (id: string) => void;
  updateCooldowns: (currentTime: number) => void; // Periodic cooldown updates
}
```

---

#### **`weapon.types.ts`**
```typescript
export interface Weapon {
  id: string;
  name: string;
  type: "melee" | "ranged"; // Weapon type
  damage: number;
  range: number; // Maximum effective range (ranged weapons)
  ammo: number; // Remaining ammunition
  fireRate: number; // Time between shots
  lastFired: number; // Timestamp of last shot
  fire: (target?: Vector3) => void; // Firing action
}

export interface WeaponState {
  equippedWeaponId: string | null; // Current equipped weapon
  weapons: Record<string, Weapon>; // Map of weapon IDs to weapon objects
  equipWeapon: (id: string) => void;
  fireWeapon: (target?: Vector3) => void;
  reloadWeapon: (id: string) => void;
}
```

---

#### **`xp.types.ts`**
```typescript
export interface XpState {
  currentXp: number;
  level: number;
  xpThreshold: number; // XP needed for the next level
  addXp: (amount: number) => void; // Function to increment XP
  levelUp: () => void; // Function to handle leveling up
}
```

---

#### **`input.types.ts`**
```typescript
export type InputAction = "move" | "attack" | "jump" | "useAbility" | "interact";

export interface InputMapping {
  [key: string]: InputAction; // Key bindings (e.g., "W" -> "move")
}

export interface InputState {
  activeActions: Set<InputAction>; // Currently active actions
  bindKey: (key: string, action: InputAction) => void; // Function to bind keys
  unbindKey: (key: string) => void; // Function to unbind keys
}
```

---

#### **`scene.types.ts`**
```typescript
export interface SceneObject {
  id: string;
  type: "player" | "enemy" | "prop"; // Object type
  position: Vector3;
  rotation: Quaternion;
  scale: Vector3;
  parentId?: string; // Parent object ID for hierarchy
}

export interface SceneGraphState {
  objects: Record<string, SceneObject>; // Map of object IDs to scene objects
  addObject: (object: SceneObject) => void;
  removeObject: (id: string) => void;
  updateObject: (id: string, changes: Partial<SceneObject>) => void;
}
```

---

#### **`physics.types.ts`**
```typescript
export interface PhysicsBody {
  id: string;
  mass: number;
  restitution: number; // Bounciness
  friction: number;
  position: Vector3;
  velocity: Vector3;
  collider: "box" | "sphere" | "mesh"; // Collider shape
}

export interface CollisionEvent {
  bodyA: string; // ID of first colliding body
  bodyB: string; // ID of second colliding body
  impactForce: number;
}

export interface PhysicsState {
  bodies: Record<string, PhysicsBody>; // Physics bodies
  addBody: (body: PhysicsBody) => void;
  removeBody: (id: string) => void;
  handleCollision: (event: CollisionEvent) => void;
}
```

---

#### **`asset.types.ts`**
```typescript
export interface Asset {
  id: string;
  type: "model" | "texture" | "audio";
  path: string;
  loaded: boolean;
  data?: any; // Loaded asset data
}

export interface AssetState {
  assets: Record<string, Asset>;
  loadAsset: (asset: Asset) => void;
  getAsset: (id: string) => Asset | null;
}
```

---

#### **`player.types.ts`**
```typescript
export interface PlayerState {
  health: number;
  maxHealth: number;
  position: Vector3;
  inventory: string[]; // List of item IDs
  addItem: (itemId: string) => void;
  removeItem: (itemId: string) => void;
}
```

---

#### **`enemy.types.ts`**
```typescript
export interface EnemyState {
  health: number;
  maxHealth: number;
  position: Vector3;
  behavior: "idle" | "attack" | "flee";
  updateBehavior: (behavior: "idle" | "attack" | "flee") => void;
}
```

---

#### **`gameState.types.ts`**
```typescript
export interface GameState {
  score: number;
  currentLevel: string;
  isPaused: boolean;
  setLevel: (level: string) => void;
  togglePause: () => void;
}
```

---

#### **`animation.types.ts`**
```typescript
export interface AnimationClip {
  name: string;
  duration: number;
  keyframes: Keyframe[];
}

export interface Keyframe {
  time: number;
  transforms: Record<string, Transform>; // Map of object IDs to transforms
}

export interface AnimationState {
  clips: Record<string, AnimationClip>;
  playClip: (clipName: string) => void;
  stopClip: (clipName: string) => void;
}
```

---

#### **`postprocessing.types.ts`**
```typescript
export interface BloomEffect {
  intensity: number;
  threshold: number;
  radius: number;
}

export interface PostProcessingConfig {
  bloom?: BloomEffect;
  colorCorrection?: { brightness: number; contrast: number };
  depthOfField?: { focusDistance: number; focalLength: number };
}
```

---

#### **`store.types.ts`**
```typescript
export type StoreAction<T> = (state: T) => void;

export interface StoreState<T> {
  getState: () => T;
  setState: (update: StoreAction<T>) => void;
}
```

---

Would you like implementation examples for any specific system using these types?
