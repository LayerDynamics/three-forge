// src/types/inventory.types.ts
export interface InventoryItem {
	id: string;
	type: 'weapon'|'armor'|'consumable'|'quest';
	stackable: boolean;
	maxStack: number;
	quantity: number;
	stats?: {
		damage?: number;
		defense?: number;
		healing?: number;
	};
}

export interface InventorySlot {
	id: string;
	item?: InventoryItem;
	locked: boolean;
}

export interface InventoryGrid {
	slots: Record<string,InventorySlot>;
	width: number;
	height: number;
}

export interface InventoryState {
	grids: Record<string,InventoryGrid>;
	equippedItems: Record<string,InventoryItem>;
	currency: number;
}
