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

// 3. Import the mocked classes after setting up mocks
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {TextureLoader,AudioLoader,AudioListener,Audio} from "three";
import {Asset,AssetType} from "../../types/asset.types";
import {EventDispatcher} from "../../utils/EventDispatcher";
import {useAssetStore} from "../../stores/assetStore";
import {AudioManager} from "../../utils/AudioManager";

describe("AssetLoadingSystem",() => {
	let AssetLoadingSystem: any;
	let mockGLTFLoader: jest.Mocked<GLTFLoader>;
	let mockTextureLoader: jest.Mocked<TextureLoader>;
	let mockAudioLoader: jest.Mocked<AudioLoader>;

	beforeEach(async () => {
		// Reset all mocks and modules
		jest.resetModules();

		// Create fresh mock instances
		mockGLTFLoader=new (GLTFLoader as any)();
		mockTextureLoader=new (TextureLoader as any)();
		mockAudioLoader=new (AudioLoader as any)();

		// Reset store state
		useAssetStore.setState({assets: {}});
		(EventDispatcher as any).events={};

		// Mock AudioManager
		jest.spyOn(AudioManager,"getListener").mockReturnValue(new AudioListener());

		// Import AssetLoadingSystem after setting up mocks
		AssetLoadingSystem=(await import("./AssetLoadingSystem")).AssetLoadingSystem;

		// Initialize with debug mode
		AssetLoadingSystem.initialize({debug: true});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	afterAll(() => {
		jest.restoreAllMocks();
	});

	const waitForAssetLoad=(assetId: string): Promise<void> => {
		return new Promise((resolve) => {
			EventDispatcher.on("ASSET_LOADED",(data) => {
				if(data.id===assetId) resolve();
			});
		});
	};

	it("should initialize the AssetLoadingSystem",() => {
		expect(GLTFLoader).toBeDefined();
		expect(TextureLoader).toBeDefined();
		expect(AudioLoader).toBeDefined();
	});

	it("should load a model asset successfully",async () => {
		const mockScene={ /* mock scene data */};
		const mockLoad=jest.fn().mockImplementation((url,onLoad) => {
			onLoad({scene: mockScene});
		});
		mockGLTFLoader.load=mockLoad;

		const asset=createMockAsset({
			id: "model1",
			type: "model",
			url: "/models/test.gltf"
		});

		const loadPromise=waitForAssetLoad(asset.id);
		AssetLoadingSystem.loadAsset(asset);
		await loadPromise;

		const storedAsset=useAssetStore.getState().getAsset(asset.id);
		expect(storedAsset).toBeDefined();
		expect(storedAsset?.loaded).toBe(true);
		expect(storedAsset?.data).toBe(mockScene);
	});

	it("should handle model asset loading error and load fallback",async () => {
		const mockError=new Error("Failed to load model");
		mockGLTFLoader.load=jest.fn().mockImplementation((url,onLoad,onProgress,onError) => {
			onError(mockError);
		});

		const asset=createMockAsset({
			id: "model2",
			type: "model",
			url: "/models/invalid.gltf"
		});

		let errorReceived=false;
		EventDispatcher.on("ASSET_ERROR",(data) => {
			if(data.id===asset.id) {
				errorReceived=true;
			}
		});

		AssetLoadingSystem.loadAsset(asset);

		await new Promise(resolve => setTimeout(resolve,0));

		const storedAsset=useAssetStore.getState().getAsset(asset.id);
		expect(errorReceived).toBe(true);
		expect(storedAsset?.error).toBeDefined();
	});

	it("should load a texture asset successfully",async () => {
		const mockTexture={ /* mock texture data */};
		mockTextureLoader.load=jest.fn().mockImplementation((url,onLoad) => {
			onLoad(mockTexture);
			return mockTexture;
		});

		const asset=createMockAsset({
			id: "texture1",
			type: "texture",
			url: "/textures/test.png"
		});

		const loadPromise=waitForAssetLoad(asset.id);
		AssetLoadingSystem.loadAsset(asset);
		await loadPromise;

		const storedAsset=useAssetStore.getState().getAsset(asset.id);
		expect(storedAsset).toBeDefined();
		expect(storedAsset?.loaded).toBe(true);
		expect(storedAsset?.data).toBe(mockTexture);
	});

	it("should load a sound asset successfully",async () => {
		const mockAudioBuffer={ /* mock audio buffer */};
		mockAudioLoader.load=jest.fn().mockImplementation((url,onLoad) => {
			onLoad(mockAudioBuffer);
		});

		const asset=createMockAsset({
			id: "sound1",
			type: "sound",
			url: "/sounds/test.mp3"
		});

		const loadPromise=waitForAssetLoad(asset.id);
		AssetLoadingSystem.loadAsset(asset);
		await loadPromise;

		const storedAsset=useAssetStore.getState().getAsset(asset.id);
		expect(storedAsset).toBeDefined();
		expect(storedAsset?.loaded).toBe(true);
		expect(storedAsset?.data).toBeDefined();
	});

	it("should handle unsupported asset types",async () => {
		const asset=createMockAsset({
			id: "other1",
			type: "other"
		});

		AssetLoadingSystem.loadAsset(asset);

		// Allow store updates to process
		await new Promise(resolve => setTimeout(resolve,0));

		const storedAsset=useAssetStore.getState().getAsset(asset.id);
		expect(storedAsset).toBeDefined();
		expect(storedAsset?.error).toBe("Other asset types not supported");
	});
});
