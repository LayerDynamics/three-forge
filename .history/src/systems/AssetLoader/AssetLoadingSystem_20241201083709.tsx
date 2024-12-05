// AssetLoadingSystem.ts: Utility for loading 3D models, textures, and caching them to avoid redundant network calls.
// src/systems/AssetLoadingSystem/AssetLoadingSystem.tsx

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { TextureLoader, AudioLoader, VideoTexture, AudioListener, Audio } from "three";
import { Asset, AssetConfig, AssetType } from "../../types/asset.types";
import { useAssetStore } from "../../stores/assetStore";
import { EventDispatcher } from "../../utils/EventDispatcher";
import { AudioManager } from "../../utils/AudioManager"; // Optional: Manage audio listeners

// Singleton Class
export class AssetLoadingSystemClass {
  private static instance: AssetLoadingSystemClass | null = null;
  private config: AssetConfig;
  private loaders: Record<AssetType, any>; // Store loaders based on asset type

  private constructor(config: AssetConfig = {}) {
    this.config = config;
    this.loaders = {
      model: new GLTFLoader(),
      texture: new TextureLoader(),
      sound: new AudioLoader(),
      video: null, // Placeholder for video loader if needed
      other: null, // Placeholder for other loaders
    };
  }

  // Initialize with optional configuration
  public initialize(config: AssetConfig = {}): void {
    this.config = config;
    if (this.config.debug) {
      console.log("AssetLoadingSystem initialized with config:", config);
    }

    // Subscribe to global events if necessary
    EventDispatcher.on("RESET_GAME", () => this.reset());
  }

  // Get the singleton instance
  public static getInstance(): AssetLoadingSystemClass {
    if (!AssetLoadingSystemClass.instance) {
      AssetLoadingSystemClass.instance = new AssetLoadingSystemClass();
    }
    return AssetLoadingSystemClass.instance;
  }

  // Public API Methods

  /**
   * Loads an asset based on its type and updates the store accordingly.
   * @param asset The asset to load.
   */
  public loadAsset(asset: Asset): void {
    if (useAssetStore.getState().assets[asset.id]?.loaded) {
      if (this.config.debug) {
        console.log(`Asset already loaded: ${asset.id}`);
      }
      return; // Asset already loaded
    }

    useAssetStore.getState().addAsset(asset);

    switch (asset.type) {
      case "model":
        this.loaders.model.load(
          asset.url,
          (gltf: any) => {
            useAssetStore.getState().updateAsset(asset.id, { loaded: true, data: gltf.scene });
            if (this.config.debug) {
              console.log(`Model loaded: ${asset.id}`);
            }
            EventDispatcher.dispatch("ASSET_LOADED", { id: asset.id, type: asset.type });
          },
          undefined,
          (error: ErrorEvent) => {
            useAssetStore.getState().updateAsset(asset.id, { loaded: false, error: error.message });
            console.error(`Error loading model ${asset.id}:`, error);
            EventDispatcher.dispatch("ASSET_ERROR", { id: asset.id, type: asset.type, error: error.message });
          }
        );
        break;

      case "texture":
        this.loaders.texture.load(
          asset.url,
          (texture: any) => {
            useAssetStore.getState().updateAsset(asset.id, { loaded: true, data: texture });
            if (this.config.debug) {
              console.log(`Texture loaded: ${asset.id}`);
            }
            EventDispatcher.dispatch("ASSET_LOADED", { id: asset.id, type: asset.type });
          },
          undefined,
          (error: ErrorEvent) => {
            useAssetStore.getState().updateAsset(asset.id, { loaded: false, error: error.message });
            console.error(`Error loading texture ${asset.id}:`, error);
            EventDispatcher.dispatch("ASSET_ERROR", { id: asset.id, type: asset.type, error: error.message });
          }
        );
        break;

      case "sound":
        this.loaders.sound.load(
          asset.url,
          (buffer: any) => {
            const listener = AudioManager.getInstance().getListener();
            const sound = new Audio(listener);
            sound.setBuffer(buffer);
            useAssetStore.getState().updateAsset(asset.id, { loaded: true, data: sound });
            if (this.config.debug) {
              console.log(`Sound loaded: ${asset.id}`);
            }
            EventDispatcher.dispatch("ASSET_LOADED", { id: asset.id, type: asset.type });
          },
          undefined,
          (error: ErrorEvent) => {
            useAssetStore.getState().updateAsset(asset.id, { loaded: false, error: error.message });
            console.error(`Error loading sound ${asset.id}:`, error);
            EventDispatcher.dispatch("ASSET_ERROR", { id: asset.id, type: asset.type, error: error.message });
          }
        );
        break;

      case "video":
        // Implement video loading if needed
        break;

      case "other":
        // Implement other asset types if needed
        break;

      default:
        console.warn(`Unsupported asset type: ${asset.type}`);
        useAssetStore.getState().updateAsset(asset.id, { loaded: false, error: "Unsupported asset type" });
        EventDispatcher.dispatch("ASSET_ERROR", { id: asset.id, type: asset.type, error: "Unsupported asset type" });
        break;
    }
  }

  /**
   * Resets the AssetLoadingSystem by removing all assets.
   */
  public reset(): void {
    const assets = useAssetStore.getState().assets;
    Object.keys(assets).forEach((id) => {
      useAssetStore.getState().removeAsset(id);
    });
    if (this.config.debug) {
      console.log("AssetLoadingSystem reset all assets.");
    }
  }
}

// Export the singleton instance
export const AssetLoadingSystem = AssetLoadingSystemClass.getInstance();

// Initialize the AssetLoadingSystem (typically done in a central initialization file)
AssetLoadingSystem.initialize({
  debug: true, // Enable debug logs
});
