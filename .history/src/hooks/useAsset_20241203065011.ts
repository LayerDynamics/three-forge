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
	const {removeAsset,getAsset,addAsset}=useAssetStore();

	// Function to load an asset
	const loadAsset=useCallback(
		(asset: Asset) => {
			addAsset(asset);
			AssetLoadingSystem.loadAsset(asset);
		},
		[addAsset]
	);

	// Function to remove an asset
	const deleteAsset=useCallback(
		(id: string) => {
			removeAsset(id);
			// Optionally, implement unloading logic if necessary
		},
		[removeAsset]
	);

	// Subscribe to asset loaded and error events
	useCallback(() => {
		const handleAssetLoaded=(data: any) => {
			console.log("Asset loaded:",data);
			const {id,data: assetData}=data;
			useAssetStore.getState().updateAsset(id,{
				loaded: true,
				data: assetData,
				error: null,
			});
		};

		const handleAssetError=(data: any) => {
			console.error("Asset error:",data);
			const {id,error}=data;
			useAssetStore.getState().updateAsset(id,{
				loaded: false,
				error: error,
			});
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
