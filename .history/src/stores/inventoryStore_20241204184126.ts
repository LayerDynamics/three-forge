// src/stores/inventoryStore.ts

import { create } from 'zustand';
import { InventoryState, InventoryItem, InventoryGrid } from '../types/inventory.types';
import { EventDispatcher } from '../utils/EventDispatcher';

export const useInventoryStore = create<InventoryState>((set, get) => ({
  grids: {},
  equippedItems: {},
  currency: 0,
  maxWeight: 100,
  currentWeight: 0,

  addItem: (gridId: string, item: InventoryItem) => {
    const state = get();
    const grid = state.grids[gridId];

    if (!grid) return false;

    // Find first available slot
    const availableSlot = Object.entries(grid.slots).find(
      ([_, slot]) => !slot.item && !slot.locked
    );

    if (!availableSlot) return false;

    set((state) => ({
      grids: {
        ...state.grids,
        [gridId]: {
          ...grid,
          slots: {
            ...grid.slots,
            [availableSlot[0]]: {
              ...grid.slots[availableSlot[0]],
              item
            }
          }
        }
      }
    }));

    EventDispatcher.dispatch('INVENTORY_ITEM_ADDED', { gridId, item });
    return true;
  },

  removeItem: (gridId: string, slotId: string) => {
    const state = get();
    const grid = state.grids[gridId];
    const slot = grid?.slots[slotId];

    if (!grid || !slot?.item) return null;

    const removedItem = slot.item;

    set((state) => ({
      grids: {
        ...state.grids,
        [gridId]: {
          ...grid,
          slots: {
            ...grid.slots,
            [slotId]: {
              ...slot,
              item: undefined
            }
          }
        }
      }
    }));

    EventDispatcher.dispatch('INVENTORY_ITEM_REMOVED', { gridId, slotId, item: removedItem });
    return removedItem;
  },

  moveItem: (fromGridId: string, fromSlotId: string, toGridId: string, toSlotId: string) => {
    const state = get();
    const fromGrid = state.grids[fromGridId];
    const toGrid = state.grids[toGridId];
    const fromSlot = fromGrid?.slots[fromSlotId];
    const toSlot = toGrid?.slots[toSlotId];

    if (!fromGrid || !toGrid || !fromSlot?.item || toSlot.locked) return false;

    // Handle item stacking
    if (toSlot.item && toSlot.item.stackable && toSlot.item.id === fromSlot.item.id) {
      return get().stackItem(toGridId, toSlotId, fromSlotId);
    }

    set((state) => ({
      grids: {
        ...state.grids,
        [fromGridId]: {
          ...fromGrid,
          slots: {
            ...fromGrid.slots,
            [fromSlotId]: { ...fromSlot, item: toSlot.item }
          }
        },
        [toGridId]: {
          ...toGrid,
          slots: {
            ...toGrid.slots,
            [toSlotId]: { ...toSlot, item: fromSlot.item }
          }
        }
      }
    }));

    EventDispatcher.dispatch('INVENTORY_ITEM_MOVED', {
      fromGridId,
      fromSlotId,
      toGridId,
      toSlotId
    });
    return true;
  },

  equipItem: (gridId: string, slotId: string) => {
    const state = get();
    const grid = state.grids[gridId];
    const slot = grid?.slots[slotId];
    const item = slot?.item;

    if (!grid || !slot || !item || !item.slotType) return false;

    // Unequip existing item in that slot
    const existingItem = Object.values(state.equippedItems).find(
      (equippedItem) => equippedItem.slotType === item.slotType
    );

    if (existingItem) {
      get().unequipItem(existingItem.id);
    }

    set((state) => ({
      equippedItems: {
        ...state.equippedItems,
        [item.id]: { ...item, equipped: true }
      }
    }));

    get().removeItem(gridId, slotId);
    EventDispatcher.dispatch('INVENTORY_ITEM_EQUIPPED', { item });
    return true;
  },

  unequipItem: (itemId: string) => {
    const state = get();
    const item = state.equippedItems[itemId];

    if (!item) return false;

    // Find space in inventory
    const mainInventory = Object.values(state.grids).find(
      (grid) => grid.type === 'inventory'
    );

    if (!mainInventory) return false;

    const success = get().addItem(mainInventory.id, { ...item, equipped: false });
    if (!success) return false;

    set((state) => {
      const { [itemId]: removed, ...remaining } = state.equippedItems;
      return { equippedItems: remaining };
    });

    EventDispatcher.dispatch('INVENTORY_ITEM_UNEQUIPPED', { item });
    return true;
  },

  stackItem: (gridId: string, targetSlotId: string, sourceSlotId: string) => {
    const state = get();
    const grid = state.grids[gridId];
    const targetSlot = grid?.slots[targetSlotId];
    const sourceSlot = grid?.slots[sourceSlotId];

    if (!grid || !targetSlot.item || !sourceSlot.item || 
        !targetSlot.item.stackable || targetSlot.item.id !== sourceSlot.item.id) {
      return false;
    }

    const totalQuantity = targetSlot.item.quantity + sourceSlot.item.quantity;
    const maxStack = targetSlot.item.maxStack;

    if (totalQuantity <= maxStack) {
      // Combine stacks
      set((state) => ({
        grids: {
          ...state.grids,
          [gridId]: {
            ...grid,
            slots: {
              ...grid.slots,
              [targetSlotId]: {
                ...targetSlot,
                item: { ...targetSlot.item!, quantity: totalQuantity }
              },
              [sourceSlotId]: {
                ...sourceSlot,
                item: undefined
              }
            }
          }
        }
      }));
    } else {
      // Split stack
      set((state) => ({
        grids: {
          ...state.grids,
          [gridId]: {
            ...grid,
            slots: {
              ...grid.slots,
              [targetSlotId]: {
                ...targetSlot,
                item: { ...targetSlot.item!, quantity: maxStack }
              },
              [sourceSlotId]: {
                ...sourceSlot,
                item: { ...sourceSlot.item!, quantity: totalQuantity - maxStack }
              }
            }
          }
        }
      }));
    }

    EventDispatcher.dispatch('INVENTORY_ITEMS_STACKED', {
      gridId,
      targetSlotId,
      sourceSlotId
    });
    return true;
  },

  splitStack: (gridId: string, slotId: string, amount: number) => {
    const state = get();
    const grid = state.grids[gridId];
    const slot = grid?.slots[slotId];

    if (!grid || !slot.item || !slot.item.stackable || 
        amount >= slot.item.quantity || amount <= 0) {
      return false;
    }

    const newStack: InventoryItem = {
      ...slot.item,
      quantity: amount
    };

    const success = get().addItem(gridId, newStack);
    if (!success) return false;

    set((state) => ({
      grids: {
        ...state.grids,
        [gridId]: {
          ...grid,
          slots: {
            ...grid.slots,
            [slotId]: {
              ...slot,
              item: {
                ...slot.item!,
                quantity: slot.item!.quantity - amount
              }
            }
          }
        }
      }
    }));

    EventDispatcher.dispatch('INVENTORY_STACK_SPLIT', {
      gridId,
      slotId,
      amount
    });
    return true;
  },

  addCurrency: (amount: number) => {
    set((state) => ({ currency: state.currency + amount }));
    EventDispatcher.dispatch('INVENTORY_CURRENCY_ADDED', { amount });
  },

  removeCurrency: (amount: number) => {
    const state = get();
    if (state.currency < amount) return false;

    set((state) => ({ currency: state.currency - amount }));
    EventDispatcher.dispatch('INVENTORY_CURRENCY_REMOVED', { amount });
    return true;
  }
}));