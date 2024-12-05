// src/hooks/useSerialization.ts

import { useEffect, useCallback } from 'react';
import { SerializedData } from '../types/serialization.types';
import { SerializationSystem } from '../systems/SerializationSystem/SerializationSystem';
import { useSerializationStore } from '../stores/serializationStore';

export const useSerialization = () => {
  const system = SerializationSystem.getInstance();

  useEffect(() => {
    // Enable auto-save by default
    if (useSerializationStore.getState().autoSaveEnabled) {
      system.enableAutoSave();
    }

    return () => {
      system.cleanup();
    };
  }, []);

  const saveGame = useCallback(async (slot: string, data: Partial<SerializedData>) => {
    try {
      await system.saveGame(slot, data);
    } catch (error) {
      console.error('Failed to save game:', error);
      throw error;
    }
  }, []);

  const loadGame = useCallback(async (slot: string) => {
    try {
      return await system.loadGame(slot);
    } catch (error) {
      console.error('Failed to load game:', error);
      throw error;
    }
  }, []);

  const deleteSave = useCallback(async (slot: string) => {
    try {
      await system.deleteSave(slot);
    } catch (error) {
      console.error('Failed to delete save:', error);
      throw error;
    }
  }, []);

  const createBackup = useCallback(async () => {
    try {
      await system.createBackup();
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw error;
    }
  }, []);

  const restoreBackup = useCallback(async () => {
    try {
      await system.restoreFromBackup();
    } catch (error) {
      console.error('Failed to restore backup:', error);
      throw error;
    }
  }, []);

  const toggleAutoSave = useCallback((enabled: boolean) => {
    if (enabled) {
      system.enableAutoSave();
    } else {
      system.disableAutoSave();
    }
  }, []);

  return {
    saveGame,
    loadGame,
    deleteSave,
    createBackup,
    restoreBackup,
    toggleAutoSave,
    // Direct store access
    saveSlots: useSerializationStore(state => state.saveSlots),
    lastSave: useSerializationStore(state => state.lastSave),
    autoSaveEnabled: useSerializationStore(state => state.autoSaveEnabled),
    pending: useSerializationStore(state => state.pending),
    error: useSerializationStore(state => state.error)
  };
};
