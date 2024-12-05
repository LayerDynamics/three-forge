/// src/systems/AssetLoadingSystem/AssetLoadingSystem.test.ts

// 1. Set global Jest timeout
jest.setTimeout(30000);

// Mock Three.js and GLTFLoader before imports
const mockLoadGLTF=jest.fn();
const mockLoadTexture=jest.fn();
const mockLoadAudio=jest.fn();

jest.mock("three",() => {
	return {
		TextureLoader: jest.fn(() => ({
			load: mockLoadTexture
		})),
		AudioLoader: jest.fn(() => ({
			load: mockLoadAudio
		})),
		AudioListener: jest.fn(() => ({})),
		Audio: jest.fn(() => ({
			setBuffer: jest.fn(),
			setVolume: jest.fn(),
			play: jest.fn(),
			stop: jest.fn()
		}))
	};
});

jest.mock("three/examples/jsm/loaders/GLTFLoader",() => ({
	GLTFLoader: jest.fn(() => ({
		load: mockLoadGLTF
	}))
}));

// Import dependencies after mocks
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {TextureLoader,AudioLoader} from "three";
import {Asset,AssetType} from "../../types/asset.types";
import {EventDispatcher} from "../../utils/EventDispatcher";
import {useAssetStore} from "../../stores/assetStore";


describe("AssetLoadingSystem",() => {
	let AssetLoadingSystem: any;

	beforeEach(async () => {
		jest.clearAllMocks();
		jest.resetModules();

		useAssetStore.setState({assets: {}});
		(EventDispatcher as any).events={};

		AssetLoadingSystem=(await import("./AssetLoadingSystem")).AssetLoadingSystem;
		AssetLoadingSystem.initialize({debug: false});
	});

	const createMockAsset=(type: AssetType,id: string): Asset => ({
		id,
		type,
		url: `/test/${type}.test`,
		loaded: false,
		error: null,
		data: null,
		progress: 0
	});

	const waitForState=(assetId: string,timeout=1000): Promise<Asset|undefined> => {
		return new Promise((resolve,reject) => {
			const start=Date.now();

			// Check initial state
			const initialAsset=useAssetStore.getState().getAsset(assetId);
			if(initialAsset?.loaded||initialAsset?.error) {
				resolve(initialAsset);
				return;
			}

			// Subscribe to store updates
			const unsubscribe=useAssetStore.subscribe((state) => {
				const asset=state.getAsset(assetId);
				if(asset?.loaded||asset?.error) {
					unsubscribe();
					resolve(asset);
				}
			});

			// Add timeout
			const timeoutId=setTimeout(() => {
				unsubscribe();
				reject(new Error(`Timeout waiting for asset ${assetId} to update`));
			},timeout);

			// Cleanup on rejection
			return () => {
				clearTimeout(timeoutId);
				unsubscribe();
			};
		});
	};

	it("should load a model asset successfully",async () => {
		const mockScene={type: "Scene"};
		mockLoadGLTF.mockImplementation((url: string,onLoad: Function) => {
			onLoad({scene: mockScene});
		});

		const asset=createMockAsset("model","model1");
		AssetLoadingSystem.loadAsset(asset);

		const updatedAsset=await waitForState(asset.id);
		expect(updatedAsset).toBeDefined();
		expect(updatedAsset?.loaded).toBe(true);
		expect(updatedAsset?.data).toBe(mockScene);
	},2000);

	it("should handle model asset loading error",async () => {
		const mockError=new Error("Failed to load model");
		mockLoadGLTF.mockImplementation((url: string,onLoad: Function,onProgress: Function,onError: Function) => {
			onError(mockError);
		});

		const asset=createMockAsset("model","model2");
		AssetLoadingSystem.loadAsset(asset);

		const updatedAsset=await waitForState(asset.id);
		expect(updatedAsset).toBeDefined();
		expect(updatedAsset?.error).toBeDefined();
		expect(updatedAsset?.loaded).toBe(false);
	},2000);

	it("should load a texture asset successfully",async () => {
		const mockTexture={type: "Texture"};
		mockLoadTexture.mockImplementation((url: string,onLoad: Function) => {
			onLoad(mockTexture);
			return mockTexture;
		});

		const asset=createMockAsset("texture","texture1");
		AssetLoadingSystem.loadAsset(asset);

		const updatedAsset=await waitForState(asset.id);
		expect(updatedAsset).toBeDefined();
		expect(updatedAsset?.loaded).toBe(true);
		expect(updatedAsset?.data).toBe(mockTexture);
	},2000);

	it("should handle unsupported asset types",async () => {
		const asset=createMockAsset("other","other1");
		AssetLoadingSystem.loadAsset(asset);

		const updatedAsset=await waitForState(asset.id);
		expect(updatedAsset).toBeDefined();
		expect(updatedAsset?.error).toBe("Other asset types not supported");
		expect(updatedAsset?.loaded).toBe(false);
	},2000);
});
