// store for assets using zustand
// it defines asset data and methods to update the asset data and manage the asset logic for the player and enemies using zustand
// it provides functions for creating, updating, and destroying assets, as well as handling collision detection.
// it is used to separate the asset logic from the rendering and input handling, weapons and game logic code
//
// src/stores/assetStore.ts

import {create} from "zustand";
import {Asset,AssetState} from "../types/asset.types";

export const useAssetStore=create<AssetState>((set,get) => ({
	assets: {},

	addAsset: (asset: Asset) => {
		set((state) => ({
			assets: {
				...state.assets,
				[asset.id]: asset,
			},
		}));
		console.log(`Asset added: ${asset.id}`);
	},

	removeAsset: (id: string) => {
		set((state) => {
			const {[id]: removedAsset,...remainingAssets}=state.assets;
			return {assets: remainingAssets};
		});
		console.log(`Asset removed: ${id}`);
	},

	updateAsset: (id: string,updatedFields: Partial<Asset>) => {
		set((state) => ({
			assets: {
				...state.assets,
				[id]: {
					...state.assets[id],
					...updatedFields,
				},
			},
		}));
		console.log(`Asset updated: ${id}`);
	},

	getAsset: (id: string) => get().assets[id],
}));
