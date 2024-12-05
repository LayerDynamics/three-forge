// useAssetLoader.ts

// Purpose: Simplifies dynamic loading of assets.
// Depends On: AssetLoader.
// Interacts With: All scene and component files.
// src/hooks/useAsset.ts

import {useCallback} from "react";
import {Asset,AssetType} from "../types/asset.types";
import {AssetLoadingSystem} from "../systems/AssetLoadingSystem/AssetLoadingSystem";
import {useAssetStore} from "../stores/assetStore";
import {EventDispatcher} from "../utils/EventDispatcher";

/**
 * Hook: useAsset
 * Provides an interface to interact with the AssetLoadingSystem.
 */
export const useAsset=() => {
	const {addAsset,removeAsset,getAsset}=useAssetStore();

	// Function to load an asset
	const loadAsset=useCallback(
		(asset: Asset) => {
			AssetLoadingSystem.loadAsset(asset);
		},
		[]
	);

	// Function to remove an asset
	const deleteAsset=useCallback(
		(id: string) => {
			AssetLoadingSystem.reset(); // Alternatively, implement individual asset removal
			removeAsset(id);
		},
		[removeAsset]
	);

	// Optionally, implement functions to handle different asset types

	// Subscribe to asset loaded and error events
	useCallback(() => {
		const handleAssetLoaded=(data: any) => {
			console.log("Asset loaded:",data);
			// Handle event (e.g., update UI)
		};

		const handleAssetError=(data: any) => {
			console.error("Asset error:",data);
			// Handle event (e.g., display error message)
		};

		EventDispatcher.on("ASSET_LOADED",handleAssetLoaded);
		EventDispatcher.on("ASSET_ERROR",handleAssetError);

		return () => {
			EventDispatcher.off("ASSET_LOADED",handleAssetLoaded);
			EventDispatcher.off("ASSET_ERROR",handleAssetError);
		};
	},[]);

	return {
		loadAsset,
		removeAsset: deleteAsset,
		getAsset,
		assets: useAssetStore((state) => state.assets),
	};
};
