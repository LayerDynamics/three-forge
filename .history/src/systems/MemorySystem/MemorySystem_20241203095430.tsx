// src/systems/MemorySystem/MemorySystem.tsx

import { MemoryConfig, MemoryObject, MemoryStats } from '../../types/memory.types';
import { useMemoryStore } from '../../stores/memoryStore';
import { EventDispatcher } from '../../utils/EventDispatcher';

/**
 * MemorySystem.tsx
 *
 * Manages memory objects, handles cleanup based on memory usage,
 * and integrates with memory stores and event dispatchers.
 */
export class MemorySystem {
  private static instance: MemorySystem | null = null;
  private config: MemoryConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;

  /**
   * Private constructor to enforce singleton pattern.
   * @param config Configuration settings for the MemorySystem.
   */
  private constructor(config: MemoryConfig) {
    this.config = config;
    this.cleanupInterval = null;
  }

  /**
   * Retrieves the singleton instance of MemorySystem.
   * @param config Optional configuration settings.
   * @returns The singleton instance of MemorySystem.
   */
  public static getInstance(config?: MemoryConfig): MemorySystem {
    if (!MemorySystem.instance) {
      MemorySystem.instance = new MemorySystem(config || {
        maxMemoryMB: 1024,
        cleanupThreshold: 0.9,
        minPriority: 0,
        autoCleanup: true,
        monitoringInterval: 5000,
        debug: false
      });
    }
    return MemorySystem.instance;
  }

  /**
   * Initializes the MemorySystem, starting monitoring if enabled.
   */
  public initialize(): void {
    if (this.config.autoCleanup) {
      this.startMonitoring();
    }

    EventDispatcher.on("RESET_GAME", () => this.reset());

    if (this.config.debug) {
      console.log("MemorySystem initialized with config:", this.config);
    }
  }

  /**
   * Registers a memory object and triggers cleanup if necessary.
   * @param object The MemoryObject to register.
   */
  public registerObject(object: MemoryObject): void {
    useMemoryStore.getState().addObject(object);

    if (this.shouldTriggerCleanup()) {
      this.performCleanup();
    }
  }

  /**
   * Unregisters a memory object by its ID.
   * @param id The ID of the MemoryObject to unregister.
   */
  public unregisterObject(id: string): void {
    useMemoryStore.getState().removeObject(id);
  }

  /**
   * Determines if cleanup should be triggered based on memory usage.
   * @returns Boolean indicating whether cleanup is needed.
   */
  private shouldTriggerCleanup(): boolean {
    const { totalMemory, maxMemory } = useMemoryStore.getState();
    return totalMemory / maxMemory > this.config.cleanupThreshold;
  }

  /**
   * Performs cleanup by removing low-priority and unused memory objects.
   */
  private performCleanup(): void {
    const state = useMemoryStore.getState();
    const objects = Object.values(state.objects)
      .sort((a, b) => {
        // Sort by priority (high to low) and last used (oldest first)
        if (a.priority !== b.priority) return b.priority - a.priority;
        return a.lastUsed - b.lastUsed;
      });

    let freedMemory = 0;
    const targetMemory = state.maxMemory * this.config.cleanupThreshold;

    for (const object of objects) {
      if (object.priority >= this.config.minPriority) continue;
      if (object.refs.size > 0) continue;

      state.removeObject(object.id);
      freedMemory += object.size;

      if (state.totalMemory - freedMemory <= targetMemory) break;
    }

    if (this.config.debug) {
      console.log(`MemorySystem: Cleaned up ${freedMemory} bytes`);
    }
  }

  /**
   * Starts the memory monitoring interval.
   */
  private startMonitoring(): void {
    if (this.cleanupInterval) return;

    this.cleanupInterval = setInterval(() => {
      if (this.shouldTriggerCleanup()) {
        this.performCleanup();
      }
    }, this.config.monitoringInterval);
  }

  /**
   * Stops the memory monitoring interval.
   */
  private stopMonitoring(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Resets the MemorySystem by removing all memory objects.
   */
  public reset(): void {
    const state = useMemoryStore.getState();
    Object.keys(state.objects).forEach(id => state.removeObject(id));

    if (this.config.debug) {
      console.log("MemorySystem: Reset complete");
    }
  }

  /**
   * Public method to perform a full cleanup and reset.
   */
  public cleanup(): void {
    this.stopMonitoring();
    this.reset();

    if (this.config.debug) {
      console.log("MemorySystem: Cleanup complete");
    }
  }

  /**
   * Retrieves current memory statistics.
   * @returns The current MemoryStats.
   */
  public getStats(): MemoryStats {
    return useMemoryStore.getState().getStats();
  }
}

// Export the singleton instance
export const MemorySystemInstance = MemorySystem.getInstance();
