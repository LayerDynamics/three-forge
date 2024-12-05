// src/types/inventory.types.ts

export interface InventoryItem {
	id: string;
	type: 'weapon'|'armor'|'consumable'|'quest';
	name: string;
	description: string;
	icon: string;
	stackable: boolean;
	maxStack: number;
	quantity: number;
	rarity: 'common'|'uncommon'|'rare'|'epic'|'legendary';
	stats?: {
		damage?: number;
		defense?: number;
		healing?: number;
	};
	requirements?: {
		level?: number;
		strength?: number;
		dexterity?: number;
	};
	equipped?: boolean;
	slotType?: 'head'|'chest'|'legs'|'weapon'|'offhand';
}

export interface InventorySlot {
	id: string;
	item?: InventoryItem;
	locked: boolean;
	type?: 'equipment'|'general'|'quest';
	allowedTypes?: string[];
}

export interface InventoryGrid {
	id: string;
	slots: Record<string,InventorySlot>;
	width: number;
	height: number;
	type: 'inventory'|'equipment'|'bank';
}

export interface InventoryState {
	grids: Record<string,InventoryGrid>;
	equippedItems: Record<string,InventoryItem>;
	currency: number;
	maxWeight: number;
	currentWeight: number;

	addItem: (gridId: string,item: InventoryItem) => boolean;
	removeItem: (gridId: string,slotId: string) => InventoryItem|null;
	moveItem: (fromGridId: string,fromSlotId: string,toGridId: string,toSlotId: string) => boolean;
	equipItem: (gridId: string,slotId: string) => boolean;
	unequipItem: (itemId: string) => boolean;
	stackItem: (gridId: string,targetSlotId: string,sourceSlotId: string) => boolean;
	splitStack: (gridId: string,slotId: string,amount: number) => boolean;
	addCurrency: (amount: number) => void;
	removeCurrency: (amount: number) => boolean;
}