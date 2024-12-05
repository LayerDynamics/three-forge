// src/hooks/useAsset.ts

import {useCallback} from "react";
import {Asset} from "../types/asset.types";
import {AssetLoadingSystem} from "../systems/AssetLoadingSystem/AssetLoadingSystem";
import {useAssetStore} from "../stores/assetStore";
import {EventDispatcher} from "../utils/EventDispatcher";

/**
 * Hook: useAsset
 * Provides an interface to interact with the AssetLoadingSystem.
 */
export const useAsset=() => {
	const {removeAsset,getAsset}=useAssetStore();

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
			useAssetStore.getState().removeAsset(id);
			// Optionally, implement unloading logic if necessary
		},
		[]
	);

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
