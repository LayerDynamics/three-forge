// src/systems/SerializationSystem/SerializationSystem.test.tsx

import { SerializationSystem } from './SerializationSystem';
import { useSerializationStore } from '../../stores/serializationStore';
import { SerializedData } from '../../types/serialization.types';
import { EventDispatcher } from '../../utils/EventDispatcher';

describe('SerializationSystem', () => {
  let serializationSystem: SerializationSystem;
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    // Reset singleton instance
    (SerializationSystem as any).instance = null;

    // Mock localStorage
    mockLocalStorage = {};
    global.localStorage = {
      getItem: jest.fn((key: string) => mockLocalStorage[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        mockLocalStorage[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete mockLocalStorage[key];
      }),
      clear: jest.fn(),
      length: 0,
      key: jest.fn()
    };

    // Initialize system
    serializationSystem = SerializationSystem.getInstance({
      compression: true,
      encryption: true,
      validateSchema: true,
      backupFrequency: 300000,
      maxSaveSlots: 10,
      autoSave: true
    });

    // Reset store
    useSerializationStore.getState().reset();
  });

  afterEach(() => {
    serializationSystem.cleanup();
    jest.clearAllMocks();
  });

  it('should save game data correctly', async () => {
    const mockData: Partial<SerializedData> = {
      systems: {
        scene: { objects: {} },
        physics: { bodies: {} }
      },
      state: {
        player: { health: 100, position: [0, 0, 0] }
      }
    };

    await serializationSystem.saveGame('slot1', mockData);

    expect(localStorage.setItem).toHaveBeenCalled();
    expect(useSerializationStore.getState().saveSlots['slot1']).toBeDefined();
    expect(useSerializationStore.getState().lastSave).toBeGreaterThan(0);
  });

  it('should load game data correctly', async () => {
    const mockSaveData: SerializedData = {
      version: '1.0.0',
      timestamp: Date.now(),
      systems: {},
      state: {},
      metadata: {
        playtime: 0,
        saveDate: new Date().toISOString(),
        checksum: ''
      }
    };

    // Save data first
    await serializationSystem.saveGame('slot1', mockSaveData);

    // Load data
    const loadedData = await serializationSystem.loadGame('slot1');
    expect(loadedData.version).toBe(mockSaveData.version);
    expect(loadedData.systems).toEqual(mockSaveData.systems);
  });

  it('should handle auto-save functionality', () => {
    jest.useFakeTimers();

    serializationSystem.enableAutoSave(5000);
    expect(useSerializationStore.getState().autoSaveEnabled).toBe(true);

    jest.advanceTimersByTime(5000);
    expect(localStorage.setItem).toHaveBeenCalled();

    serializationSystem.disableAutoSave();
    expect(useSerializationStore.getState().autoSaveEnabled).toBe(false);

    jest.useRealTimers();
  });

  it('should create and restore backups', async () => {
    const mockSaveData: Partial<SerializedData> = {
      state: { player: { health: 100 } }
    };

    await serializationSystem.saveGame('slot1', mockSaveData);
    await serializationSystem.createBackup();

    await serializationSystem.deleteSave('slot1');
    expect(useSerializationStore.getState().saveSlots['slot1']).toBeUndefined();

    await serializationSystem.restoreFromBackup();
    expect(useSerializationStore.getState().saveSlots['slot1']).toBeDefined();
  });

  it('should validate data integrity', async () => {
    const mockData: Partial<SerializedData> = {
      systems: {},
      state: {}
    };

    await serializationSystem.saveGame('slot1', mockData);

    // Corrupt the data
    const corruptData = JSON.parse(mockLocalStorage['save_slot1']);
    corruptData.metadata.checksum = 'invalid';
    mockLocalStorage['save_slot1'] = JSON.stringify(corruptData);

    await expect(serializationSystem.loadGame('slot1')).rejects.toThrow();
  });

  it('should handle errors gracefully', async () => {
    const mockError = new Error('Storage full');
    jest.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw mockError;
    });

    await expect(serializationSystem.saveGame('slot1', {})).rejects.toThrow();
    expect(useSerializationStore.getState().error).toBeDefined();
  });
});
