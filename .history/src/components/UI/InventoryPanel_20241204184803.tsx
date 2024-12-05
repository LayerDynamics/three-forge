import React, { useState, useCallback } from 'react';
import { useInventoryStore } from '../../stores/inventoryStore';
import { InventoryItem, InventorySlot } from '../../types/inventory.types';
import { EventDispatcher } from '../../utils/EventDispatcher';

// InventoryGrid Component
const InventoryGrid = ({ gridId }) => {
  const grid = useInventoryStore((state) => state.grids[gridId]);
  const [draggedItem, setDraggedItem] = useState(null);

  const handleDragStart = (slotId: string) => {
    const slot = grid.slots[slotId];
    if (slot.item) {
      setDraggedItem({ gridId, slotId });
    }
  };

  const handleDrop = (targetSlotId: string) => {
    if (!draggedItem) return;
    
    const store = useInventoryStore.getState();
    store.moveItem(
      draggedItem.gridId,
      draggedItem.slotId,
      gridId,
      targetSlotId
    );
    
    setDraggedItem(null);
  };

  return (
    <div className="grid gap-1" style={{
      gridTemplateColumns: `repeat(${grid.width}, minmax(0, 1fr))`,
      width: `${grid.width * 50}px`
    }}>
      {Object.entries(grid.slots).map(([slotId, slot]) => (
        <InventorySlot
          key={slotId}
          slot={slot}
          onDragStart={() => handleDragStart(slotId)}
          onDrop={() => handleDrop(slotId)}
        />
      ))}
    </div>
  );
};

// InventorySlot Component
const InventorySlot = ({ slot, onDragStart, onDrop }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', ''); // Required for Firefox
    onDragStart();
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!slot.locked) {
      e.preventDefault();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!slot.locked) {
      onDrop();
    }
  };

  return (
    <div
      className={`w-12 h-12 border-2 ${
        slot.locked ? 'border-gray-500 bg-gray-200' : 'border-gray-300'
      } rounded flex items-center justify-center`}
      draggable={!!slot.item}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {slot.item && <InventoryItemDisplay item={slot.item} />}
    </div>
  );
};

// InventoryItemDisplay Component
const InventoryItemDisplay = ({ item }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      className="relative w-full h-full"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <img
        src={item.icon}
        alt={item.name}
        className="w-full h-full object-contain"
      />
      {item.stackable && item.quantity > 1 && (
        <span className="absolute bottom-0 right-0 text-xs bg-black bg-opacity-50 text-white px-1 rounded">
          {item.quantity}
        </span>
      )}
      {showTooltip && (
        <div className="absolute z-50 w-48 p-2 bg-gray-800 text-white rounded shadow-lg -top-2 left-full ml-2">
          <h3 className={`font-bold ${getRarityColor(item.rarity)}`}>
            {item.name}
          </h3>
          <p className="text-sm">{item.description}</p>
          {item.stats && (
            <div className="mt-1 text-sm">
              {Object.entries(item.stats).map(([stat, value]) => (
                <div key={stat}>
                  {stat}: {value}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Main Inventory Panel Component
const InventoryPanel = () => {
  const currency = useInventoryStore((state) => state.currency);
  const { currentWeight, maxWeight } = useInventoryStore((state) => ({
    currentWeight: state.currentWeight,
    maxWeight: state.maxWeight
  }));

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-lg">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Inventory</h2>
        <div className="text-right">
          <div className="text-gold">{currency} Gold</div>
          <div className="text-sm text-gray-600">
            Weight: {currentWeight}/{maxWeight}
          </div>
        </div>
      </div>
      
      <div className="flex gap-4">
        <div>
          <h3 className="mb-2">Equipment</h3>
          <InventoryGrid gridId="player-equipment" />
        </div>
        <div>
          <h3 className="mb-2">Inventory</h3>
          <InventoryGrid gridId="player-inventory" />
        </div>
      </div>
    </div>
  );
};

// Utility function for rarity colors
const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case 'legendary':
      return 'text-orange-500';
    case 'epic':
      return 'text-purple-500';
    case 'rare':
      return 'text-blue-500';
    case 'uncommon':
      return 'text-green-500';
    default:
      return 'text-gray-200';
  }
};

export default InventoryPanel;