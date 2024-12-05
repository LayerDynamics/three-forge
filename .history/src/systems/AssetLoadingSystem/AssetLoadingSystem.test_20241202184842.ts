/// src/systems/AssetLoadingSystem/AssetLoadingSystem.test.ts

import {Asset,AssetType} from "../../types/asset.types";
import {EventDispatcher} from "../../utils/EventDispatcher";
import {useAssetStore} from "../../stores/assetStore";

// Increase Jest timeout for all tests
jest.setTimeout(10000);

// 1. Mock the GLTFLoader before any imports
const mockGLTFLoad=jest.fn();
jest.mock("three/examples/jsm/loaders/GLTFLoader",() => ({
	GLTFLoader: jest.fn().mockImplementation(() => ({
		load: mockGLTFLoad
	}))
}));

// 2. Mock the three.js loaders
const mockTextureLoad=jest.fn();
const mockAudioLoad=jest.fn();
jest.mock("three",() => {
	const actualThree=jest.requireActual("three");
	return {
		...actualThree,
		TextureLoader: jest.fn().mockImplementation(() => ({
			load: mockTextureLoad
		})),
		AudioLoader: jest.fn().mockImplementation(() => ({
			load: mockAudioLoad
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

// 3. Import after mocks
import {AudioManager} from "../../utils/AudioManager";

describe("AssetLoadingSystem",() => {
	let AssetLoadingSystem: any;

	beforeEach(async () => {
		// Reset modules and mocks
		jest.clearAllMocks();
		jest.resetModules();

		// Reset store and event dispatcher
		useAssetStore.setState({assets: {}});
		(EventDispatcher as any).events={};

		// Import AssetLoadingSystem after mocks are setup
		AssetLoadingSystem=(await import("./AssetLoadingSystem")).AssetLoadingSystem;
		AssetLoadingSystem.initialize({debug: false}); // Disable debug to reduce noise
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

	const waitForAssetUpdate=async (assetId: string,timeout=1000): Promise<void> => {
		return new Promise((resolve,reject) => {
			const timeoutId=setTimeout(() => {
				unsubscribe();
				reject(new Error(`Asset update timeout for ${assetId}`));
			},timeout);

			const unsubscribe=useAssetStore.subscribe((state) => {
				const asset=state.getAsset(assetId);
				if(asset?.loaded||asset?.error) {
					clearTimeout(timeoutId);
					unsubscribe();
					resolve();
				}
			});
		});
	};

	it("should load a model asset successfully",async () => {
		const mockScene={type: "Scene"};
		mockGLTFLoad.mockImplementation((url: string,onLoad: Function) => {
			onLoad({scene: mockScene}); // Remove setTimeout
		});

		const asset=createMockAsset("model","model1");

		AssetLoadingSystem.loadAsset(asset);
		await waitForAssetUpdate(asset.id);

		const storedAsset=useAssetStore.getState().getAsset(asset.id);
		expect(storedAsset).toBeDefined();
		expect(storedAsset?.loaded).toBe(true);
		expect(storedAsset?.data).toBe(mockScene);
	});

	it("should handle model asset loading error",async () => {
		const mockError=new Error("Failed to load model");
		mockGLTFLoad.mockImplementation(
			(url: string,onLoad: Function,onProgress: Function,onError: Function) => {
				onError(mockError); // Remove setTimeout
			}
		);

		const asset=createMockAsset("model","model2");

		AssetLoadingSystem.loadAsset(asset);
		await waitForAssetUpdate(asset.id);

		const storedAsset=useAssetStore.getState().getAsset(asset.id);
		expect(storedAsset).toBeDefined();
		expect(storedAsset?.error).toBeDefined();
		expect(storedAsset?.loaded).toBe(false);
	});

	it("should load a texture asset successfully",async () => {
		const mockTexture={type: "Texture"};
		mockTextureLoad.mockImplementation((url: string,onLoad: Function) => {
			onLoad(mockTexture); // Remove setTimeout
			return mockTexture;
		});

		const asset=createMockAsset("texture","texture1");

		AssetLoadingSystem.loadAsset(asset);
		await waitForAssetUpdate(asset.id);

		const storedAsset=useAssetStore.getState().getAsset(asset.id);
		expect(storedAsset).toBeDefined();
		expect(storedAsset?.loaded).toBe(true);
		expect(storedAsset?.data).toBe(mockTexture);
	});

	it("should handle unsupported asset types",async () => {
		const asset=createMockAsset("other","other1");

		AssetLoadingSystem.loadAsset(asset);
		await waitForAssetUpdate(asset.id);

		const storedAsset=useAssetStore.getState().getAsset(asset.id);
		expect(storedAsset).toBeDefined();
		expect(storedAsset?.error).toBe("Other asset types not supported");
		expect(storedAsset?.loaded).toBe(false);
	});
});
