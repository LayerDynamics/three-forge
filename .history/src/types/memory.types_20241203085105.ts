export interface MemoryObject {
  id: string;
  type: "geometry" | "texture" | "audio" | "animation";
  size: number;     // Approximate memory size in bytes
  priority: number; // Priority for memory retention (higher = keep longer)
  lastUsed: number; // Timestamp of last usage
  data: any;        // Actual asset data
  dispose: () => void;  // Cleanup function
}

export interface MemoryState {
  objects: Record<string, MemoryObject>;
  totalMemory: number;
  maxMemory: number;
  addObject: (object: MemoryObject) => void;
  removeObject: (id: string) => void;
  updateUsage: (id: string) => void;
}

export interface MemoryConfig {
  maxMemoryMB: number;     // Maximum memory usage
  cleanupThreshold: number;  // Percentage at which to trigger cleanup
  minPriority: number;      // Minimum priority to keep during cleanup
  debug?: boolean;          // Enable memory usage monitoring
}
