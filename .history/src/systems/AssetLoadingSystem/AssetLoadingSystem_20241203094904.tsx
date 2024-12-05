// src/systems/AssetLoadingSystem/AssetLoadingSystem.tsx

/**
 * AssetLoadingSystem.tsx
 *
 * Utility for loading 3D models, textures, sounds, and caching them to avoid redundant network calls.
 * Implements a singleton pattern to ensure a single instance manages all asset loading.
 * Adds progress reporting and caching mechanisms for optimized performance.
 * Integrates with MemorySystem for asset memory management.
 */

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import {
  TextureLoader,
  AudioLoader,
  Audio,
  AudioListener,
} from "three";
import { Asset, AssetConfig, AssetType } from "../../types/asset.types";
import { useAssetStore } from "../../stores/assetStore";
import { EventDispatcher } from "../../utils/EventDispatcher";
import { AudioManagerInstance } from "../../utils/AudioManager";// Ensure correct import
import { MemorySystem } from '../MemorySystem/MemorySystem';
import { MemoryObjectType, MemoryObject } from "../../types/memory.types";

// Define a loader type that matches three.js loader signatures
interface Loader {
  load(
    url: string,
    onLoad: (data: any) => void,
    onProgress?: (event: ProgressEvent<EventTarget>) => void,
    onError?: (error: any) => void
  ): void;
}

interface LoaderRecord {
  [key: string]: Loader | null;
}

export class AssetLoadingSystemClass {
  private static instance: AssetLoadingSystemClass | null = null;
  private config: AssetConfig;
  private loaders: LoaderRecord; // Store loaders based on asset type
  private memorySystem = MemorySystem.getInstance();

  private constructor(config: AssetConfig = { debug: false }) {
    this.config = config;
    this.loaders = {
      model: new GLTFLoader(),
      texture: new TextureLoader(),
      sound: new AudioLoader(),
      other: null, // Placeholder for other loaders
    };
  }

  /**
   * Initializes the AssetLoadingSystem with the provided configuration.
   * @param config Configuration settings for the AssetLoadingSystem.
   */
  public initialize(config: AssetConfig = { debug: false }): void {
    this.config = config;
    if (this.config.debug) {
      console.log("AssetLoadingSystem initialized with config:", config);
    }

    // Subscribe to global events if necessary
    EventDispatcher.on("RESET_GAME", () => this.reset());
  }

  /**
   * Retrieves the singleton instance of AssetLoadingSystemClass.
   * @returns The singleton instance.
   */
  public static getInstance(): AssetLoadingSystemClass {
    if (!AssetLoadingSystemClass.instance) {
      AssetLoadingSystemClass.instance = new AssetLoadingSystemClass();
    }
    return AssetLoadingSystemClass.instance;
  }

  /**
   * Calculates the size of the asset. This is a placeholder implementation.
   * @param asset The asset for which to calculate the size.
   * @returns The size of the asset in bytes.
   */
  private calculateAssetSize(asset: Asset): number {
    // Implement actual size calculation logic
    // For example, fetching the asset and calculating its byte size
    // Here, we'll return a dummy value
    return 1024; // Placeholder
  }

  /**
   * Disposes of the asset to free up memory.
   * @param asset The asset to dispose.
   */
  private disposeAsset(asset: Asset): void {
    // Implement actual disposal logic based on asset type
    switch (asset.type) {
      case "model":
        if (asset.data && asset.data.dispose) {
          asset.data.dispose();
        }
        break;
      case "texture":
        if (asset.data && asset.data.dispose) {
          asset.data.dispose();
        }
        break;
      case "sound":
        if (asset.data && asset.data.disconnect) {
          asset.data.disconnect();
        }
        break;
      // Add more cases as needed
      default:
        console.warn(`No disposal method implemented for asset type: ${asset.type}`);
        break;
    }
    if (this.config.debug) {
      console.log(`Disposed asset: ${asset.id}`);
    }
  }

  /**
   * Loads an asset based on its type and updates the store accordingly.
   * If loading a model fails, attempts to load a fallback model.
   * Implements progress reporting and caching to optimize performance.
   * Integrates with MemorySystem for asset memory management.
   * @param asset The asset to load.
   */
  public async loadAsset(asset: Asset): Promise<void> {
    const existingAsset = useAssetStore.getState().getAsset(asset.id);
    if (existingAsset?.loaded) {
      if (this.config.debug) {
        console.log(`Asset already loaded: ${asset.id}`);
      }
      return; // Asset already loaded, no need to load again
    }

    useAssetStore.getState().addAsset(asset);

    try {
      switch (asset.type) {
        case "model":
          await this.loadModel(asset);
          break;

        case "texture":
          await this.loadTexture(asset);
          break;

        case "sound":
          await this.loadSound(asset);
          break;

        case "video":
          // Video assets are not supported as VideoLoader has been removed
          console.warn(`Video asset loading is not supported: ${asset.id}`);
          useAssetStore.getState().updateAsset(asset.id, {
            loaded: false,
            error: "Video asset loading is not supported.",
            progress: 0,
          });
          EventDispatcher.dispatch("ASSET_ERROR", {
            id: asset.id,
            type: asset.type,
            error: "Video asset loading is not supported.",
          });
          break;

        case "other":
          // Implement other asset types if needed
          console.warn(`Other asset types not supported: ${asset.id}`);
          useAssetStore.getState().updateAsset(asset.id, {
            loaded: false,
            error: "Other asset types not supported",
            progress: 0,
          });
          EventDispatcher.dispatch("ASSET_ERROR", {
            id: asset.id,
            type: asset.type,
            error: "Other asset types not supported",
          });
          break;

        default:
          console.warn(`Unsupported asset type: ${asset.type}`);
          useAssetStore.getState().updateAsset(asset.id, {
            loaded: false,
            error: "Unsupported asset type",
            progress: 0,
          });
          EventDispatcher.dispatch("ASSET_ERROR", {
            id: asset.id,
            type: asset.type,
            error: "Unsupported asset type",
          });
          break;
      }
    } catch (error: any) {
      console.error(`Error loading asset ${asset.id}:`, error);
      useAssetStore.getState().updateAsset(asset.id, {
        loaded: false,
        error: error.message,
        progress: 0,
      });
      EventDispatcher.dispatch("ASSET_ERROR", {
        id: asset.id,
        type: asset.type,
        error: error.message,
      });
    }
  }

  /**
   * Loads a model asset.
   * @param asset The model asset to load.
   */
  private loadModel(asset: Asset): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loaders.model?.load(
        asset.url,
        (gltf: any) => {
          useAssetStore.getState().updateAsset(asset.id, {
            loaded: true,
            data: gltf.scene,
            progress: 100,
          });
          if (this.config.debug) {
            console.log(`Model loaded: ${asset.id}`);
          }

          // Register with MemorySystem
          this.memorySystem.registerObject({
            id: asset.id,
            type: asset.type as MemoryObjectType, // Type assertion after alignment
            size: this.calculateAssetSize(asset),
            priority: asset.priority || 1,
            lastUsed: Date.now(),
            data: gltf.scene,
            refs: new Set(),
            dispose: () => this.disposeAsset(asset),
          });

          EventDispatcher.dispatch("ASSET_LOADED", {
            id: asset.id,
            type: asset.type,
          });
          resolve();
        },
        (xhr: ProgressEvent) => {
          const percentComplete = xhr.lengthComputable
            ? (xhr.loaded / xhr.total) * 100
            : 0;
          useAssetStore.getState().updateAsset(asset.id, {
            progress: percentComplete,
          });
          if (this.config.debug) {
            console.log(
              `Loading model ${asset.id}: ${Math.round(percentComplete)}%`
            );
          }
        },
        (error: ErrorEvent) => {
          useAssetStore.getState().updateAsset(asset.id, {
            loaded: false,
            error: error.message,
            progress: 0,
          });
          console.error(`Error loading model ${asset.id}:`, error);

          // Attempt to load a fallback model
          if (!asset.id.endsWith("_fallback")) {
            const fallbackAsset: Asset = {
              id: `${asset.id}_fallback`,
              type: "model",
              url: "/models/fallback.gltf", // Ensure this path is correct
              loaded: false,
              error: null,
              data: null,
              progress: 0,
              priority: asset.priority, // Now exists
            };
            if (this.config.debug) {
              console.log(
                `Attempting to load fallback model for ${asset.id}`
              );
            }
            this.loadAsset(fallbackAsset).then(resolve).catch(reject);
          } else {
            reject(error);
          }

          EventDispatcher.dispatch("ASSET_ERROR", {
            id: asset.id,
            type: asset.type,
            error: error.message,
          });
        }
      );
    });
  }

  /**
   * Loads a texture asset.
   * @param asset The texture asset to load.
   */
  private loadTexture(asset: Asset): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loaders.texture?.load(
        asset.url,
        (texture: any) => {
          useAssetStore.getState().updateAsset(asset.id, {
            loaded: true,
            data: texture,
            progress: 100,
          });
          if (this.config.debug) {
            console.log(`Texture loaded: ${asset.id}`);
          }

          // Register with MemorySystem
          this.memorySystem.registerObject({
            id: asset.id,
            type: asset.type as MemoryObjectType, // Type assertion after alignment
            size: this.calculateAssetSize(asset),
            priority: asset.priority || 1,
            lastUsed: Date.now(),
            data: texture,
            refs: new Set(),
            dispose: () => this.disposeAsset(asset),
          });

          EventDispatcher.dispatch("ASSET_LOADED", {
            id: asset.id,
            type: asset.type,
          });
          resolve();
        },
        (xhr: ProgressEvent) => {
          const percentComplete = xhr.lengthComputable
            ? (xhr.loaded / xhr.total) * 100
            : 0;
          useAssetStore.getState().updateAsset(asset.id, {
            progress: percentComplete,
          });
          if (this.config.debug) {
            console.log(
              `Loading texture ${asset.id}: ${Math.round(percentComplete)}%`
            );
          }
        },
        (error: ErrorEvent) => {
          useAssetStore.getState().updateAsset(asset.id, {
            loaded: false,
            error: error.message,
            progress: 0,
          });
          console.error(`Error loading texture ${asset.id}:`, error);
          EventDispatcher.dispatch("ASSET_ERROR", {
            id: asset.id,
            type: asset.type,
            error: error.message,
          });
          reject(error);
        }
      );
    });
  }

  /**
   * Loads a sound asset.
   * @param asset The sound asset to load.
   */
  private loadSound(asset: Asset): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loaders.sound?.load(
        asset.url,
        (buffer: any) => {
          const listener = AudioManagerInstance.getListener();
					AudioManagerInstance.playSound(sound, volume);
          sound.setBuffer(buffer);
          useAssetStore.getState().updateAsset(asset.id, {
            loaded: true,
            data: sound,
            progress: 100,
          });
          if (this.config.debug) {
            console.log(`Sound loaded: ${asset.id}`);
          }

          // Register with MemorySystem
          this.memorySystem.registerObject({
            id: asset.id,
            type: asset.type as MemoryObjectType, // Type assertion after alignment
            size: this.calculateAssetSize(asset),
            priority: asset.priority || 1,
            lastUsed: Date.now(),
            data: sound,
            refs: new Set(),
            dispose: () => this.disposeAsset(asset),
          });

          EventDispatcher.dispatch("ASSET_LOADED", {
            id: asset.id,
            type: asset.type,
          });
          resolve();
        },
        (xhr: ProgressEvent) => {
          const percentComplete = xhr.lengthComputable
            ? (xhr.loaded / xhr.total) * 100
            : 0;
          useAssetStore.getState().updateAsset(asset.id, {
            progress: percentComplete,
          });
          if (this.config.debug) {
            console.log(
              `Loading sound ${asset.id}: ${Math.round(percentComplete)}%`
            );
          }
        },
        (error: ErrorEvent) => {
          useAssetStore.getState().updateAsset(asset.id, {
            loaded: false,
            error: error.message,
            progress: 0,
          });
          console.error(`Error loading sound ${asset.id}:`, error);
          EventDispatcher.dispatch("ASSET_ERROR", {
            id: asset.id,
            type: asset.type,
            error: error.message,
          });
          reject(error);
        }
      );
    });
  }

  /**
   * Resets the AssetLoadingSystem by removing all assets from the store and disposing them.
   */
  public reset(): void {
    const assets = useAssetStore.getState().assets;
    Object.keys(assets).forEach((id) => {
      const asset = useAssetStore.getState().getAsset(id);
      if (asset && asset.loaded && asset.data) {
        this.disposeAsset(asset);
      }
      useAssetStore.getState().removeAsset(id);
    });
    if (this.config.debug) {
      console.log("AssetLoadingSystem: Reset all assets.");
    }
  }
}

// Export the singleton instance
export const AssetLoadingSystem = AssetLoadingSystemClass.getInstance();

// Initialize the AssetLoadingSystem (typically done in a central initialization file)
AssetLoadingSystem.initialize({
  debug: true, // Enable debug logs
});
