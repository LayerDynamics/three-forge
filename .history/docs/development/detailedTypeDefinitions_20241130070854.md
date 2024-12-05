Here’s the fully detailed schema-level type definitions for **all types**, based on the structure and detail level required for implementation.

---

### **`src/types/ability.types.ts`**
Schema for abilities and their interactions.
```typescript
export interface Ability {
  id: string; // Unique identifier for the ability
  name: string; // Display name
  description: string; // Detailed description of the ability
  cooldown: number; // Time in seconds before reuse
  lastUsed: number; // Timestamp of the last activation
  isAvailable: boolean; // True if off cooldown
  activate: () => void; // Function to trigger the ability
  iconPath?: string; // Optional: Path to the ability's icon for UI
  effects?: string[]; // IDs of status effects or additional impacts
}

export interface AbilityState {
  abilities: Record<string, Ability>; // Map of ability IDs to definitions
  addAbility: (ability: Ability) => void; // Function to register a new ability
  useAbility: (id: string) => void; // Activate an ability by ID
  updateCooldowns: (currentTime: number) => void; // Refresh cooldowns
  getAbilityById: (id: string) => Ability | undefined; // Retrieve ability details
}
```

---

### **`src/types/weapon.types.ts`**
Schema for weapons and their behavior.
```typescript
export interface Weapon {
  id: string; // Unique identifier for the weapon
  name: string; // Name of the weapon
  type: "melee" | "ranged"; // Classification of weapon
  damage: number; // Base damage dealt
  range: number; // Effective range (0 for melee)
  ammo: number | null; // Remaining ammo (null for melee)
  maxAmmo: number | null; // Max ammo capacity (null for melee)
  fireRate: number; // Shots per second
  lastFired: number; // Timestamp of last shot
  reloadTime: number; // Time required to reload
  reload: () => void; // Function to reload the weapon
  fire: (target?: Vector3) => void; // Function to fire the weapon
  projectileId?: string; // Associated projectile for ranged weapons
}

export interface WeaponState {
  equippedWeaponId: string | null; // Currently equipped weapon
  weapons: Record<string, Weapon>; // Inventory of all weapons
  equipWeapon: (id: string) => void; // Function to equip a weapon
  fireWeapon: (target?: Vector3) => void; // Trigger firing
  reloadWeapon: (id: string) => void; // Reload the specified weapon
}
```

---

### **`src/types/xp.types.ts`**
Schema for experience points and leveling.
```typescript
export interface LevelReward {
  id: string; // Unique reward ID
  type: "ability" | "item" | "statBoost"; // Type of reward
  description: string; // Description of the reward
  applyReward: () => void; // Function to grant the reward
}

export interface XpState {
  currentXp: number; // Current accumulated experience points
  level: number; // Player's current level
  xpThreshold: number; // Points needed for next level
  rewards: LevelReward[]; // List of pending rewards for the next level
  addXp: (amount: number) => void; // Function to increment XP
  levelUp: () => void; // Function to handle level-up logic
}
```

---

### **`src/types/input.types.ts`**
Schema for player input mapping and handling.
```typescript
export type InputAction = "move" | "attack" | "jump" | "useAbility" | "interact";

export interface InputMapping {
  [key: string]: InputAction; // Key-to-action mapping (e.g., "W" -> "move")
}

export interface InputEvent {
  action: InputAction; // The action triggered (e.g., "move")
  key: string; // Key that triggered the action
  timestamp: number; // When the action was triggered
}

export interface InputState {
  activeActions: Set<InputAction>; // Currently active inputs
  mappings: InputMapping; // Configurable input bindings
  bindKey: (key: string, action: InputAction) => void; // Function to bind keys
  unbindKey: (key: string) => void; // Function to unbind keys
}
```

---

### **`src/types/scene.types.ts`**
Schema for the scene graph and object management.
```typescript
export interface Transform {
  position: Vector3; // Position in the scene
  rotation: Quaternion; // Orientation of the object
  scale: Vector3; // Size of the object
}

export interface SceneObject {
  id: string; // Unique object ID
  name: string; // Display name of the object
  type: "player" | "enemy" | "prop"; // Classification of object
  transform: Transform; // Object's transform data
  parentId?: string; // ID of parent object (if part of hierarchy)
  children?: string[]; // IDs of child objects
}

export interface SceneGraphState {
  objects: Record<string, SceneObject>; // Map of object IDs to scene objects
  addObject: (object: SceneObject) => void; // Function to add a new object
  removeObject: (id: string) => void; // Function to remove an object
  updateObjectTransform: (id: string, transform: Partial<Transform>) => void; // Modify object transform
}
```

---

### **`src/types/physics.types.ts`**
Schema for physics simulation and collision handling.
```typescript
export interface PhysicsBody {
  id: string; // Unique ID for the physics body
  mass: number; // Weight of the object
  restitution: number; // Bounciness coefficient
  friction: number; // Surface friction coefficient
  velocity: Vector3; // Current velocity
  position: Vector3; // Current position
  collider: "box" | "sphere" | "mesh"; // Shape of the collider
  isDynamic: boolean; // If the object is movable
}

export interface CollisionEvent {
  bodyA: string; // ID of the first body
  bodyB: string; // ID of the second body
  impactForce: number; // Magnitude of the collision
}

export interface PhysicsState {
  bodies: Record<string, PhysicsBody>; // All active physics bodies
  addBody: (body: PhysicsBody) => void; // Add a physics body
  removeBody: (id: string) => void; // Remove a physics body
  handleCollision: (event: CollisionEvent) => void; // Handle a collision event
}
```

---

### **`src/types/asset.types.ts`**
Schema for asset management.
```typescript
export interface Asset {
  id: string; // Unique identifier for the asset
  type: "model" | "texture" | "audio"; // Type of asset
  path: string; // File path or URL
  loaded: boolean; // If the asset is loaded
  data?: any; // Loaded asset data
}

export interface AssetState {
  assets: Record<string, Asset>; // Loaded assets by ID
  loadAsset: (asset: Asset) => void; // Function to load an asset
  getAsset: (id: string) => Asset | null; // Retrieve a loaded asset
}
```

---

### **`src/types/player.types.ts`**
Schema for player state and properties.
```typescript
export interface PlayerState {
  health: number; // Current health
  maxHealth: number; // Maximum health
  position: Vector3; // Player's position in the world
  inventory: string[]; // List of item IDs
  abilities: string[]; // IDs of unlocked abilities
  addItem: (itemId: string) => void; // Add item to inventory
  removeItem: (itemId: string) => void; // Remove item from inventory
}
```

---

### **`src/types/enemy.types.ts`**
Schema for enemy behaviors and stats.
```typescript
export interface EnemyState {
  id: string; // Unique enemy ID
  health: number; // Current health
  maxHealth: number; // Maximum health
  position: Vector3; // Position in the world
  behavior: "idle" | "attack" | "flee"; // Current behavior state
  updateBehavior: (behavior: "idle" | "attack" | "flee") => void; // Change behavior
}
```

---

### **`src/types/gameState.types.ts`**
Schema for overarching game state.
```typescript
export interface GameState {
  score: number; // Player's score
  currentLevel: string; // Current game level
  isPaused: boolean; // Game pause state
  setLevel: (level: string) => void; // Change the level
  togglePause: () => void; // Toggle pause state
}
```

---

### **`src/types/animation.types.ts`**
Schema for animation clips and transforms.
```typescript
export interface AnimationClip {
  name: string; // Name of the animation
  duration: number; // Length of the animation in seconds
  keyframes: Keyframe[]; // List of keyframes
}

export interface Keyframe {
  time: number; // Time in the animation
  transforms: Record<string, Transform>; // Transforms at this keyframe
}

export interface AnimationState {
  clips: Record<string, AnimationClip>; // Available animation clips
  playClip: (

clipName: string) => void; // Play an animation
  stopClip: (clipName: string) => void; // Stop an animation
}
```

---

### **`src/types/postprocessing.types.ts`**
Schema for post-processing effects.
```typescript
export interface BloomEffect {
  intensity: number; // Bloom strength
  threshold: number; // Brightness threshold for bloom
  radius: number; // Spread of the bloom
}

export interface PostProcessingConfig {
  bloom?: BloomEffect; // Bloom configuration
  colorCorrection?: { brightness: number; contrast: number }; // Color grading
  depthOfField?: { focusDistance: number; focalLength: number }; // DOF effect
}
```

---
