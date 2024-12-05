/// src/systems/AssetLoadingSystem/AssetLoadingSystem.test.ts

// Helper for creating test assets
interface MockAssetParams {
	id?: string;
	type: AssetType;
	url?: string;
}

const createMockAsset=({id="test",type,url}: MockAssetParams): Asset => ({
	id,
	type,
	url: url||`/test/${type}.test`,
	loaded: false,
	error: null,
	data: null,
	progress: 0
});

// 1. Mock the GLTFLoader before any imports
jest.mock("three/examples/jsm/loaders/GLTFLoader",() => ({
	GLTFLoader: jest.fn().mockImplementation(() => ({
		load: jest.fn()
	}))
}));

// 2. Mock the necessary loaders from three.js before any imports
jest.mock("three",() => {
	const actualThree=jest.requireActual("three");
	return {
		...actualThree,
		TextureLoader: jest.fn().mockImplementation(() => ({
			load: jest.fn()
		})),
		AudioLoader: jest.fn().mockImplementation(() => ({
			load: jest.fn()
		})),
		AudioListener: jest.fn().mockImplementation(() => ({})),
		Audio: jest.fn().mockImplementation(() => ({
			setBuffer: jest.fn(),
			setVolume: jest.fn(),
			play: jest.fn(),
			stop: jest.fn(),
			listener: {}
		}))
	};
});

/// src/systems/AssetLoadingSystem/AssetLoadingSystem.test.ts

import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {TextureLoader,AudioLoader,AudioListener,Audio} from "three";
import {Asset,AssetType} from "../../types/asset.types";
import {EventDispatcher} from "../../utils/EventDispatcher";
import {useAssetStore} from "../../stores/assetStore";
import {AudioManager} from "../../utils/AudioManager";

// Increase default timeout for all tests
jest.setTimeout(10000);

describe("AssetLoadingSystem",() => {
	let AssetLoadingSystem: any;
	let mockLoaders: {
		gltf: jest.SpyInstance;
		texture: jest.SpyInstance;
		audio: jest.SpyInstance;
	};

	beforeEach(async () => {
		// Reset modules and mocks
		jest.resetModules();

		// Setup mock loaders before importing AssetLoadingSystem
		mockLoaders={
			gltf: jest.spyOn(GLTFLoader.prototype,'load').mockImplementation(jest.fn()),
			texture: jest.spyOn(TextureLoader.prototype,'load').mockImplementation(jest.fn()),
			audio: jest.spyOn(AudioLoader.prototype,'load').mockImplementation(jest.fn())
		};

		// Reset store and event dispatcher
		useAssetStore.setState({assets: {}});
		(EventDispatcher as any).events={};

		// Mock AudioManager
		jest.spyOn(AudioManager,"getListener").mockReturnValue(new AudioListener());

		// Import AssetLoadingSystem after mocks are setup
		AssetLoadingSystem=(await import("./AssetLoadingSystem")).AssetLoadingSystem;
		AssetLoadingSystem.initialize({debug: true});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	const createMockAsset=(type: AssetType,id: string="test"): Asset => ({
		id,
		type,
		url: `/test/${type}.test`,
		loaded: false,
		error: null,
		data: null,
		progress: 0
	});

	const waitForAssetUpdate=(assetId: string): Promise<void> => {
		return new Promise((resolve) => {
			const unsubscribe=useAssetStore.subscribe((state) => {
				const asset=state.getAsset(assetId);
				if(asset?.loaded||asset?.error) {
					unsubscribe();
					resolve();
				}
			});
		});
	};

	it("should initialize the AssetLoadingSystem",() => {
		expect(GLTFLoader).toBeDefined();
		expect(TextureLoader).toBeDefined();
		expect(AudioLoader).toBeDefined();
	});

	it("should load a model asset successfully",async () => {
		const mockScene={type: "Scene"};
		mockLoaders.gltf.mockImplementation((url,onLoad) => {
			setTimeout(() => onLoad({scene: mockScene}),0);
		});

		const asset=createMockAsset("model","model1");
		const updatePromise=waitForAssetUpdate(asset.id);

		AssetLoadingSystem.loadAsset(asset);
		await updatePromise;

		const storedAsset=useAssetStore.getState().getAsset(asset.id);
		expect(storedAsset).toBeDefined();
		expect(storedAsset?.loaded).toBe(true);
		expect(storedAsset?.data).toBe(mockScene);
	});

	it("should handle model asset loading error",async () => {
		const mockError=new Error("Failed to load model");
		mockLoaders.gltf.mockImplementation((url,onLoad,onProgress,onError) => {
			setTimeout(() => onError(mockError),0);
		});

		const asset=createMockAsset("model","model2");
		const updatePromise=waitForAssetUpdate(asset.id);

		AssetLoadingSystem.loadAsset(asset);
		await updatePromise;

		const storedAsset=useAssetStore.getState().getAsset(asset.id);
		expect(storedAsset).toBeDefined();
		expect(storedAsset?.error).toBeDefined();
	});

	it("should load a texture asset successfully",async () => {
		const mockTexture={type: "Texture"};
		mockLoaders.texture.mockImplementation((url,onLoad) => {
			setTimeout(() => onLoad(mockTexture),0);
			return mockTexture;
		});

		const asset=createMockAsset("texture","texture1");
		const updatePromise=waitForAssetUpdate(asset.id);

		AssetLoadingSystem.loadAsset(asset);
		await updatePromise;

		const storedAsset=useAssetStore.getState().getAsset(asset.id);
		expect(storedAsset).toBeDefined();
		expect(storedAsset?.loaded).toBe(true);
		expect(storedAsset?.data).toBe(mockTexture);
	});

	it("should handle unsupported asset types",async () => {
		const asset=createMockAsset("other","other1");
		const updatePromise=waitForAssetUpdate(asset.id);

		AssetLoadingSystem.loadAsset(asset);
		await updatePromise;

		const storedAsset=useAssetStore.getState().getAsset(asset.id);
		expect(storedAsset).toBeDefined();
		expect(storedAsset?.error).toBe("Other asset types not supported");
	});
});
