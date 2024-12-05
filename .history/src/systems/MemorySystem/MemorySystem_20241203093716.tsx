// src/systems/MemorySystem/MemorySystem.tsx

import { MemoryConfig, MemoryObject, MemoryStats } from '../../types/memory.types';
import { useMemoryStore } from '../../stores/memoryStore';
import { EventDispatcher } from '../../utils/EventDispatcher';

export class MemorySystem {
  private static instance: MemorySystem | null = null;
  private config: MemoryConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor(config: MemoryConfig) {
    this.config = config;
    this.cleanupInterval = null;
  }

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

  public initialize(): void {
    if (this.config.autoCleanup) {
      this.startMonitoring();
    }

    EventDispatcher.on("RESET_GAME", () => this.reset());

    if (this.config.debug) {
      console.log("MemorySystem initialized with config:", this.config);
    }
  }

  public registerObject(object: MemoryObject): void {
    useMemoryStore.getState().addObject(object);

    if (this.shouldTriggerCleanup()) {
      this.cleanup();
    }
  }

  public unregisterObject(id: string): void {
    useMemoryStore.getState().removeObject(id);
  }

  private shouldTriggerCleanup(): boolean {
    const { totalMemory, maxMemory } = useMemoryStore.getState();
    return totalMemory / maxMemory > this.config.cleanupThreshold;
  }

  private cleanup(): void {
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

  private startMonitoring(): void {
    if (this.cleanupInterval) return;

    this.cleanupInterval = setInterval(() => {
      if (this.shouldTriggerCleanup()) {
        this.cleanup();
      }
    }, this.config.monitoringInterval);
  }

  private stopMonitoring(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  public reset(): void {
    const state = useMemoryStore.getState();
    Object.keys(state.objects).forEach(id => state.removeObject(id));

    if (this.config.debug) {
      console.log("MemorySystem: Reset complete");
    }
  }

  public cleanup(): void {
    this.stopMonitoring();
    this.reset();

    if (this.config.debug) {
      console.log("MemorySystem: Cleanup complete");
    }
  }

  public getStats(): MemoryStats {
    return useMemoryStore.getState().getStats();
  }
}