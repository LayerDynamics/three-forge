// src/types/asset.types.ts

import { Object3D } from "three";

export type AssetType = "model" | "texture" | "sound" | "video" | "other";

export interface Asset {
  id: string; // Unique identifier for the asset
  type: AssetType; // Type of asset
  url: string; // URL or path to the asset
  loaded: boolean; // Whether the asset has been loaded
  error: string | null; // Error message if loading failed
  data: any; // The loaded asset data (e.g., THREE.Object3D, Texture, AudioBuffer)
  progress?: number; // Loading progress percentage (0 to 100)
}

export interface AssetState {
  assets: Record<string, Asset>; // Map of asset IDs to assets
  addAsset: (asset: Asset) => void; // Function to add a new asset
  removeAsset: (id: string) => void; // Function to remove an asset
  updateAsset: (id: string, updatedFields: Partial<Asset>) => void; // Update asset properties
  getAsset: (id: string) => Asset | undefined; // Retrieve an asset by ID
}

export interface AssetConfig {
  debug?: boolean; // Enable debug mode for logging
}
