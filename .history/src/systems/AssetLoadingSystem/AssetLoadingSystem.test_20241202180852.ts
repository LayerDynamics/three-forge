// src/systems/AssetLoadingSystem/AssetLoadingSystem.test.ts

// 1. Mock the GLTFLoader before importing AssetLoadingSystem
jest.mock("three/examples/jsm/loaders/GLTFLoader",() => {
	return {
		GLTFLoader: jest.fn().mockImplementation(() => ({
			load: jest.fn(),
		})),
	};
});

// 2. Mock the necessary loaders from three.js before importing AssetLoadingSystem
jest.mock("three",() => {
	const actualThree=jest.requireActual("three");
	return {
		...actualThree,
		TextureLoader: jest.fn().mockImplementation(() => ({
			load: jest.fn(),
		})),
		AudioLoader: jest.fn().mockImplementation(() => ({
			load: jest.fn(),
		})),
		AudioListener: jest.fn().mockImplementation(() => ({})),
		Audio: jest.fn().mockImplementation(() => ({
			setBuffer: jest.fn(),
			setVolume: jest.fn(),
			play: jest.fn(),
			stop: jest.fn(),
			listener: {},
		})),
	};
});

// 3. Import the mocked classes after setting up mocks
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {TextureLoader,AudioLoader,AudioListener,Audio} from "three";
import {AssetLoadingSystem} from "./AssetLoadingSystem";
import {Asset} from "../../types/asset.types";
import {EventDispatcher} from "../../utils/EventDispatcher";
import {useAssetStore} from "../../stores/assetStore";
import {AudioManager} from "../../utils/AudioManager";

// 4. Define mocked classes for easier access in tests
const MockedGLTFLoader=GLTFLoader as jest.MockedClass<typeof GLTFLoader>;
const MockedTextureLoader=TextureLoader as jest.MockedClass<typeof TextureLoader>;
const MockedAudioLoader=AudioLoader as jest.MockedClass<typeof AudioLoader>;

describe("AssetLoadingSystem",() => {
	beforeEach(() => {
		// Reset the AssetStore before each test
		useAssetStore.setState({assets: {}});

		// Clear all events
		(EventDispatcher as any).events={};

		// Reset all mocked instances and their calls
		MockedGLTFLoader.mockClear();
		MockedTextureLoader.mockClear();
		MockedAudioLoader.mockClear();

		// Spy on AudioManager.getListener and mock its return value
		jest.spyOn(AudioManager,"getListener").mockReturnValue(new AudioListener());
	});

	afterAll(() => {
		jest.restoreAllMocks();
	});

	it("should initialize the AssetLoadingSystem",() => {
		AssetLoadingSystem.initialize({debug: true});
		expect(GLTFLoader).toBeDefined();
		expect(TextureLoader).toBeDefined();
		expect(AudioLoader).toBeDefined();
	});

	it("should load a model asset successfully",(done) => {
		const mockLoad=jest.fn((url,onLoad,onProgress,onError) => {
			// Simulate successful load by calling onLoad with mock data
			onLoad({ /* mock model data */});
		});

		// Get the mock GLTFLoader instance
		const mockGLTFLoaderInstance=MockedGLTFLoader.mock.instances[0];
		if(mockGLTFLoaderInstance) {
			mockGLTFLoaderInstance.load.mockImplementation(mockLoad);
		} else {
			throw new Error("GLTFLoader instance not found");
		}

		const asset: Asset={
			id: "model1",
			type: "model",
			url: "/models/scene.gltf",
			loaded: false,
			error: null,
			data: null,
			progress: 0,
		};

		// Listen for ASSET_LOADED event
		const handleAssetLoaded=(data: any) => {
			expect(data.id).toBe(asset.id);
			done();
		};

		EventDispatcher.on("ASSET_LOADED",handleAssetLoaded);

		AssetLoadingSystem.loadAsset(asset);
	});

	it("should handle model asset loading error and load fallback",(done) => {
		const mockLoad=jest.fn((url,onLoad,onProgress,onError) => {
			// Simulate load error by calling onError
			onError(new Error("Failed to load model"));
		});

		// Get the mock GLTFLoader instance
		const mockGLTFLoaderInstance=MockedGLTFLoader.mock.instances[0];
		if(mockGLTFLoaderInstance) {
			mockGLTFLoaderInstance.load.mockImplementation(mockLoad);
		} else {
			throw new Error("GLTFLoader instance not found");
		}

		const asset: Asset={
			id: "model2",
			type: "model",
			url: "/models/invalid.gltf",
			loaded: false,
			error: null,
			data: null,
			progress: 0,
		};

		// Listen for ASSET_ERROR and ASSET_LOADED events
		const handleAssetError=(data: any) => {
			expect(data.id).toBe(asset.id);
			expect(data.error).toBeDefined();
		};

		const handleAssetLoaded=(data: any) => {
			expect(data.id).toBe(asset.id);
			done();
		};

		EventDispatcher.on("ASSET_ERROR",handleAssetError);
		EventDispatcher.on("ASSET_LOADED",handleAssetLoaded);

		AssetLoadingSystem.loadAsset(asset);
	});

	it("should load a texture asset successfully",(done) => {
		const mockLoad=jest.fn((url,onLoad,onProgress,onError) => {
			// Simulate successful load by calling onLoad with mock data
			onLoad({ /* mock texture data */});
		});

		// Get the mock TextureLoader instance
		const mockTextureLoaderInstance=MockedTextureLoader.mock.instances[0];
		if(mockTextureLoaderInstance) {
			mockTextureLoaderInstance.load.mockImplementation(mockLoad);
		} else {
			throw new Error("TextureLoader instance not found");
		}

		const asset: Asset={
			id: "texture1",
			type: "texture",
			url: "/textures/texture.png",
			loaded: false,
			error: null,
			data: null,
			progress: 0,
		};

		// Listen for ASSET_LOADED event
		const handleAssetLoaded=(data: any) => {
			expect(data.id).toBe(asset.id);
			done();
		};

		EventDispatcher.on("ASSET_LOADED",handleAssetLoaded);

		AssetLoadingSystem.loadAsset(asset);
	});

	it("should load a sound asset successfully",(done) => {
		const mockLoad=jest.fn((url,onLoad,onProgress,onError) => {
			// Simulate successful load by calling onLoad with mock data
			onLoad({ /* mock audio data */});
		});

		// Get the mock AudioLoader instance
		const mockAudioLoaderInstance=MockedAudioLoader.mock.instances[0];
		if(mockAudioLoaderInstance) {
			mockAudioLoaderInstance.load.mockImplementation(mockLoad);
		} else {
			throw new Error("AudioLoader instance not found");
		}

		const asset: Asset={
			id: "sound1",
			type: "sound",
			url: "/sounds/sound.mp3",
			loaded: false,
			error: null,
			data: null,
			progress: 0,
		};

		// Listen for ASSET_LOADED event
		const handleAssetLoaded=(data: any) => {
			expect(data.id).toBe(asset.id);
			done();
		};

		EventDispatcher.on("ASSET_LOADED",handleAssetLoaded);

		AssetLoadingSystem.loadAsset(asset);
	});

	it("should handle unsupported asset types",() => {
		const asset: Asset={
			id: "unsupported1",
			type: "unsupported",
			url: "/unsupported/asset.xyz",
			loaded: false,
			error: null,
			data: null,
			progress: 0,
		};

		AssetLoadingSystem.loadAsset(asset);

		const storedAsset=useAssetStore.getState().getAsset(asset.id);
		expect(storedAsset).toBeDefined();
		expect(storedAsset?.error).toBe("Unsupported asset type");
	});
});
