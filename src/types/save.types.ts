// src/types/save.types.ts
export interface SaveGame {
    id: string;
    timestamp: number;
    version: string;
    thumbnail?: string;
    playerState: PlayerState;
    inventoryState: InventoryState;
    progressionState: ProgressionState;
    worldState: {
        currentLevel: string;
        enemies: Record<string,AIEntity>;
        objects: Record<string,SceneObject>;
    };
}

export interface SaveState {
    saves: Record<string,SaveGame>;
    autoSaveEnabled: boolean;
    autoSaveInterval: number;
    lastSave: number;
}
