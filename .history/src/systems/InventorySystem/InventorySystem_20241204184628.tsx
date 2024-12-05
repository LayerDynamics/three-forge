// src/systems/InventorySystem/InventorySystem.ts

import { InventoryItem, InventoryGrid, InventorySlot } from '../../types/inventory.types';
import { useInventoryStore } from '../../stores/inventoryStore';
import { EventDispatcher } from '../../utils/EventDispatcher';

export class InventorySystem {
  private static instance: InventorySystem | null = null;
  private frameId: number | null = null;

  private constructor() {
    this.setupEventListeners();
  }

  public static getInstance(): InventorySystem {
    if (!InventorySystem.instance) {
      InventorySystem.instance = new InventorySystem();
    }
    return InventorySystem.instance;
  }

  private setupEventListeners(): void {
    EventDispatcher.on("ITEM_DROPPED", this.handleItemDrop.bind(this));
    EventDispatcher.on("ITEM_PICKED_UP", this.handleItemPickup.bind(this));
    EventDispatcher.on("INVENTORY_FULL", this.handleInventoryFull.bind(this));
  }

  public createGrid(config: {
    id: string;
    width: number;
    height: number;
    type: 'inventory' | 'equipment' | 'bank';
  }): InventoryGrid {
    const slots: Record<string, InventorySlot> = {};
    
    for (let y = 0; y < config.height; y++) {
      for (let x = 0; x < config.width; x++) {
        const slotId = `${x}-${y}`;
        slots[slotId] = {
          id: slotId,
          locked: false,
          type: 'general'
        };
      }
    }

    const grid: InventoryGrid = {
      id: config.id,
      slots,
      width: config.width,
      height: config.height,
      type: config.type
    };

    useInventoryStore.getState().grids[config.id] = grid;
    return grid;
  }

  public initializePlayerInventory(): void {
    // Create main inventory grid (8x5)
    this.createGrid({
      id: 'player-inventory',
      width: 8,
      height: 5,
      type: 'inventory'
    });

    // Create equipment grid (1x6)
    this.createGrid({
      id: 'player-equipment',
      width: 1,
      height: 6,
      type: 'equipment'
    });

    // Set initial currency and weight limits
    const store = useInventoryStore.getState();
    store.currency = 0;
    store.maxWeight = 100;
    store.currentWeight = 0;
  }

  public addItemToInventory(item: InventoryItem): boolean {
    const store = useInventoryStore.getState();
    const mainInventory = store.grids['player-inventory'];
    
    if (!mainInventory) return false;

    // Check weight limit
    if (store.currentWeight + (item.weight || 0) > store.maxWeight) {
      EventDispatcher.dispatch('INVENTORY_FULL', { item });
      return false;
    }

    return store.addItem('player-inventory', item);
  }

  public canEquipItem(item: InventoryItem): boolean {
    if (!item.slotType) return false;
    
    // Check requirements
    if (item.requirements) {
      // Implement requirement checking logic here
      // e.g., check player level, stats, etc.
    }
    
    return true;
  }

  public getStackableSlot(item: InventoryItem, gridId: string): string | null {
    if (!item.stackable) return null;

    const store = useInventoryStore.getState();
    const grid = store.grids[gridId];
    
    if (!grid) return null;

    for (const [slotId, slot] of Object.entries(grid.slots)) {
      if (slot.item?.id === item.id && slot.item.quantity < slot.item.maxStack) {
        return slotId;
      }
    }

    return null;
  }

  private handleItemDrop(data: { item: InventoryItem; position: { x: number; y: number; z: number } }): void {
    const store = useInventoryStore.getState();
    // Implement item dropping logic
  }

  private handleItemPickup(data: { item: InventoryItem }): void {
    this.addItemToInventory(data.item);
  }

  private handleInventoryFull(data: { item: InventoryItem }): void {
    // Implement inventory full behavior (e.g., show notification)
    console.warn('Inventory is full!', data.item);
  }

  public update = (): void => {
    // Implement any per-frame updates needed
    this.frameId = requestAnimationFrame(this.update);
  };

  public start(): void {
    if (this.frameId === null) {
      this.update();
    }
  }

  public stop(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  public cleanup(): void {
    this.stop();
    EventDispatcher.off("ITEM_DROPPED", this.handleItemDrop);
    EventDispatcher.off("ITEM_PICKED_UP", this.handleItemPickup);
    EventDispatcher.off("INVENTORY_FULL", this.handleInventoryFull);
  }
}