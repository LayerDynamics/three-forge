// src/systems/AssetLoadingSystem/AssetLoadingSystem.tsx

/**
 * AssetLoadingSystem.tsx
 *
 * Utility for loading 3D models, textures, sounds, and caching them to avoid redundant network calls.
 * Implements a singleton pattern to ensure a single instance manages all asset loading.
 * Adds progress reporting and caching mechanisms for optimized performance.
 */

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import {
  TextureLoader,
  AudioLoader,
  // VideoLoader, // Removed VideoLoader as it's unsupported
  VideoTexture,
  Audio,
  AudioListener,
} from "three";
import { Asset, AssetConfig, AssetType } from "../../types/asset.types";
import { useAssetStore } from "../../stores/assetStore";
import { EventDispatcher } from "../../utils/EventDispatcher";
import { AudioManager } from "../../utils/AudioManager"; // Ensure correct import

// Define a loader type that matches three.js loader signatures
interface Loader {
  load(
    url: string,
    onLoad: (data: any) => void,
    onProgress?: (event: ProgressEvent<EventTarget>) => void,
    onError?: (error: any) => void // Use 'any' to match three.js signature
  ): void;
}

interface LoaderRecord {
  [key: string]: Loader | null;
}


export class AssetLoadingSystemClass {
  private static instance: AssetLoadingSystemClass | null = null;
  private config: AssetConfig;
  private loaders: LoaderRecord; // Store loaders based on asset type

  private constructor(config: AssetConfig = { debug: false }) {
    this.config = config;
    this.loaders = {
      model: new GLTFLoader(),
      texture: new TextureLoader(),
      sound: new AudioLoader(),
      // video: null, // Removed VideoLoader to prevent TypeScript errors
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
   * Loads an asset based on its type and updates the store accordingly.
   * If loading a model fails, attempts to load a fallback model.
   * Implements progress reporting and caching to optimize performance.
   * @param asset The asset to load.
   */
  public loadAsset(asset: Asset): void {
    const existingAsset = useAssetStore.getState().getAsset(asset.id);
    if (existingAsset?.loaded) {
      if (this.config.debug) {
        console.log(`Asset already loaded: ${asset.id}`);
      }
      return; // Asset already loaded, no need to load again
    }

    useAssetStore.getState().addAsset(asset);

    switch (asset.type) {
      case "model":
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
            EventDispatcher.dispatch("ASSET_LOADED", {
              id: asset.id,
              type: asset.type,
            });
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
              };
              if (this.config.debug) {
                console.log(
                  `Attempting to load fallback model for ${asset.id}`
                );
              }
              this.loadAsset(fallbackAsset);
            }

            EventDispatcher.dispatch("ASSET_ERROR", {
              id: asset.id,
              type: asset.type,
              error: error.message,
            });
          }
        );
        break;

      case "texture":
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
            EventDispatcher.dispatch("ASSET_LOADED", {
              id: asset.id,
              type: asset.type,
            });
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
          }
        );
        break;

      case "sound":
        this.loaders.sound?.load(
          asset.url,
          (buffer: any) => {
            const listener: AudioListener = AudioManager.getListener(); // Corrected line
            const sound = new Audio(listener);
            sound.setBuffer(buffer);
            useAssetStore.getState().updateAsset(asset.id, {
              loaded: true,
              data: sound,
              progress: 100,
            });
            if (this.config.debug) {
              console.log(`Sound loaded: ${asset.id}`);
            }
            EventDispatcher.dispatch("ASSET_LOADED", {
              id: asset.id,
              type: asset.type,
            });
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
          }
        );
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
  }

  /**
   * Resets the AssetLoadingSystem by removing all assets from the store.
   */
  public reset(): void {
    const assets = useAssetStore.getState().assets;
    Object.keys(assets).forEach((id) => {
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
