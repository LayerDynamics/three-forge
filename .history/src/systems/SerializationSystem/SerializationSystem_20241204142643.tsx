// src/systems/SerializationSystem/SerializationSystem.tsx

import {
  SerializedData,
  SerializationConfig
} from '../../types/serialization.types';
import { useSerializationStore } from '../../stores/serializationStore';
import { DataTransform } from './DataTransform';
import { EventDispatcher } from '../../utils/EventDispatcher';

export class SerializationSystem {
  private static instance: SerializationSystem | null = null;
  private config: SerializationConfig;
  private dataTransform: DataTransform;
  private autoSaveInterval: NodeJS.Timeout | null = null;
  private backupInterval: NodeJS.Timeout | null = null;

  private constructor(config: SerializationConfig) {
    this.config = config;
    this.dataTransform = new DataTransform(config, this.generateEncryptionKey());
  }

  public static getInstance(config?: SerializationConfig): SerializationSystem {
    if (!SerializationSystem.instance && config) {
      SerializationSystem.instance = new SerializationSystem(config);
    }
    return SerializationSystem.instance!;
  }

  private generateEncryptionKey(): string {
    // Generate a unique key based on user/game identifiers
    return 'game-encryption-key'; // In practice, this should be more secure
  }

  public async saveGame(slot: string, data: Partial<SerializedData>): Promise<void> {
    try {
      useSerializationStore.getState().setPending(true);

      const fullData: SerializedData = {
        version: '1.0.0',
        timestamp: Date.now(),
        systems: data.systems || {},
        state: data.state || {},
        metadata: {
          playtime: this.calculatePlaytime(),
          saveDate: new Date().toISOString(),
          checksum: ''
        }
      };

      // Generate checksum before serialization
      fullData.metadata.checksum = this.dataTransform.generateChecksum(fullData);

      // Serialize and store data
      const serialized = await this.dataTransform.serialize(fullData);
      await this.saveToStorage(slot, serialized);

      // Update store
      useSerializationStore.getState().setSaveSlot(slot, fullData);
      useSerializationStore.getState().setLastSave(Date.now());
      useSerializationStore.getState().setPending(false);

      EventDispatcher.dispatch('GAME_SAVED', { slot, timestamp: Date.now() });
    } catch (error) {
      useSerializationStore.getState().setPending(false);
      if (error instanceof Error) {
        useSerializationStore.getState().setError(error.message);
        EventDispatcher.dispatch('SAVE_ERROR', { error: error.message });
      }
      throw error;
    }
  }

  public async loadGame(slot: string): Promise<SerializedData> {
    try {
      useSerializationStore.getState().setPending(true);

      // Load data from storage
      const serialized = await this.loadFromStorage(slot);
      if (!serialized) {
        throw new Error(`No save data found in slot ${slot}`);
      }

      // Deserialize data
      const data = await this.dataTransform.deserialize(serialized);

      // Validate checksum
      const currentChecksum = this.dataTransform.generateChecksum({
        ...data,
        metadata: { ...data.metadata, checksum: '' }
      });

      if (currentChecksum !== data.metadata.checksum) {
        throw new Error('Save data integrity check failed');
      }

      useSerializationStore.getState().setPending(false);
      EventDispatcher.dispatch('GAME_LOADED', { slot, timestamp: Date.now() });

      return data;
    } catch (error) {
      useSerializationStore.getState().setPending(false);
      if (error instanceof Error) {
        useSerializationStore.getState().setError(error.message);
        EventDispatcher.dispatch('LOAD_ERROR', { error: error.message });
      }
      throw error;
    }
  }

  public async deleteSave(slot: string): Promise<void> {
    try {
      await this.removeFromStorage(slot);
      useSerializationStore.getState().removeSaveSlot(slot);
      EventDispatcher.dispatch('SAVE_DELETED', { slot });
    } catch (error) {
      if (error instanceof Error) {
        useSerializationStore.getState().setError(error.message);
      }
      throw error;
    }
  }

  private async saveToStorage(slot: string, data: string): Promise<void> {
    try {
      localStorage.setItem(`save_${slot}`, data);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to save game data: ${error.message}`);
      }
      throw error;
    }
  }

  private async loadFromStorage(slot: string): Promise<string | null> {
    return localStorage.getItem(`save_${slot}`);
  }

  private async removeFromStorage(slot: string): Promise<void> {
    localStorage.removeItem(`save_${slot}`);
  }

  private calculatePlaytime(): number {
    // Implement playtime calculation logic
    return 0;
  }

  public enableAutoSave(interval: number = 300000): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }

    this.autoSaveInterval = setInterval(() => {
      if (useSerializationStore.getState().autoSaveEnabled) {
        this.saveGame('autosave', {});
      }
    }, interval);

    useSerializationStore.getState().setAutoSave(true);
  }

  public disableAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
    useSerializationStore.getState().setAutoSave(false);
  }

  private startBackupSchedule(): void {
    if (!this.config.backupFrequency) return;

    this.backupInterval = setInterval(() => {
      this.createBackup();
    }, this.config.backupFrequency);
  }

  private async createBackup(): Promise<void> {
    try {
      const saves = useSerializationStore.getState().saveSlots;
      const backupData = {
        saves,
        timestamp: Date.now(),
        version: '1.0.0'
      };

      const serialized = await this.dataTransform.serialize(backupData);
      localStorage.setItem('game_backup', serialized);

      EventDispatcher.dispatch('BACKUP_CREATED', { timestamp: Date.now() });
    } catch (error) {
      console.error('Failed to create backup:', error);
    }
  }

  public async restoreFromBackup(): Promise<void> {
    try {
      const backupData = localStorage.getItem('game_backup');
      if (!backupData) {
        throw new Error('No backup found');
      }

      const restored = await this.dataTransform.deserialize(backupData);
      if (restored && typeof restored === 'object' && 'saves' in restored) {
        const saves = restored.saves as Record<string, SerializedData>;
        Object.entries(saves).forEach(([slot, data]) => {
          useSerializationStore.getState().setSaveSlot(slot, data);
        });
      }

      EventDispatcher.dispatch('BACKUP_RESTORED', { timestamp: Date.now() });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to restore backup: ${error.message}`);
      }
      throw error;
    }
  }

  public cleanup(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }

    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
    }

    useSerializationStore.getState().reset();
  }
}