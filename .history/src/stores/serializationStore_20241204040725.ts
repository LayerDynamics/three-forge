// src/stores/serializationStore.ts

import { create } from 'zustand';
import { SerializationState } from '../types/serialization.types';

export const useSerializationStore = create<SerializationState>((set) => ({
  lastSave: 0,
  autoSaveEnabled: true,
  saveSlots: {},
  pending: false,
  error: null,

  setLastSave: (timestamp) => set({ lastSave: timestamp }),

  setSaveSlot: (slot, data) => set((state) => ({
    saveSlots: { ...state.saveSlots, [slot]: data }
  })),

  removeSaveSlot: (slot) => set((state) => {
    const { [slot]: removed, ...remaining } = state.saveSlots;
    return { saveSlots: remaining };
  }),

  setAutoSave: (enabled) => set({ autoSaveEnabled: enabled }),

  setPending: (pending) => set({ pending }),

  setError: (error) => set({ error }),

  reset: () => set({
    lastSave: 0,
    autoSaveEnabled: true,
    saveSlots: {},
    pending: false,
    error: null
  })
}));

// src/systems/SerializationSystem/DataTransform.ts

import { 
  SerializedData, 
  SerializationConfig 
} from '../../types/serialization.types';
import { createHash } from 'crypto';
import { deflate, inflate } from 'pako';

export class DataTransform {
  private config: SerializationConfig;
  private encryptionKey: string;

  constructor(config: SerializationConfig, encryptionKey: string) {
    this.config = config;
    this.encryptionKey = encryptionKey;
  }

  public async serialize(data: SerializedData): Promise<string> {
    let processed = JSON.stringify(data);

    if (this.config.compression) {
      processed = await this.compress(processed);
    }

    if (this.config.encryption) {
      processed = await this.encrypt(processed);
    }

    if (this.config.validateSchema) {
      this.validateSchema(data);
    }

    return processed;
  }

  public async deserialize(data: string): Promise<SerializedData> {
    let processed = data;

    if (this.config.encryption) {
      processed = await this.decrypt(processed);
    }

    if (this.config.compression) {
      processed = await this.decompress(processed);
    }

    const parsed = JSON.parse(processed);

    if (this.config.validateSchema) {
      this.validateSchema(parsed);
    }

    return parsed;
  }

  private async compress(data: string): Promise<string> {
    const compressed = deflate(data);
    return Buffer.from(compressed).toString('base64');
  }

  private async decompress(data: string): Promise<string> {
    const buffer = Buffer.from(data, 'base64');
    const decompressed = inflate(buffer);
    return new TextDecoder().decode(decompressed);
  }

  private async encrypt(data: string): Promise<string> {
    // Implement encryption using Web Crypto API
    const encoder = new TextEncoder();
    const key = await this.deriveKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    const encryptedData = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(data)
    );

    return JSON.stringify({
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encryptedData))
    });
  }

  private async decrypt(data: string): Promise<string> {
    // Implement decryption using Web Crypto API
    const { iv, data: encryptedData } = JSON.parse(data);
    const key = await this.deriveKey();
    
    const decryptedData = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(iv) },
      key,
      new Uint8Array(encryptedData)
    );

    return new TextDecoder().decode(decryptedData);
  }

  private async deriveKey(): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(this.encryptionKey),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  private validateSchema(data: any): void {
    // Basic schema validation
    if (!data.version || !data.timestamp || !data.systems || !data.state) {
      throw new Error('Invalid save data schema');
    }
  }

  public generateChecksum(data: SerializedData): string {
    const hash = createHash('sha256');
    hash.update(JSON.stringify(data));
    return hash.digest('hex');
  }
}