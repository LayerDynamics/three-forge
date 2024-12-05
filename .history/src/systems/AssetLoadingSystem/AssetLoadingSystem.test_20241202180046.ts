// src/systems/AssetLoadingSystem/AssetLoadingSystem.test.ts

// Mock three.js loaders BEFORE importing the AssetLoadingSystem
jest.mock("three/examples/jsm/loaders/GLTFLoader",() => {
	return {
		GLTFLoader: jest.fn().mockImplementation(() => ({
			load: jest.fn(),
		})),
	};
});

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

// Import necessary modules AFTER mocking
import {AssetLoadingSystem} from "./AssetLoadingSystem";
import {Asset} from "../../types/asset.types";
import {useAssetStore} from "../../stores/assetStore";
import {EventDispatcher} from "../../utils/EventDispatcher";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {TextureLoader,AudioLoader,AudioListener,Audio} from "three";
import {AudioManager} from "../../";

// Extend Jest's ModuleMocked to include specific loaders
const MockedGLTFLoader=GLTFLoader as jest.MockedClass<typeof GLTFLoader>;
const MockedTextureLoader=TextureLoader as jest.MockedClass<typeof TextureLoader>;
const MockedAudioLoader=AudioLoader as jest.MockedClass<typeof AudioLoader>;

describe("AssetLoadingSystem",() => {
	beforeEach(() => {
		// Reset the AssetStore before each test
		useAssetStore.setState({assets: {}});

		// Clear all events
		(EventDispatcher as any).events={};

		// Reset mocks
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
			// Simulate successful load
			onLoad({scene: {}});
		});

		// Get the mock GLTFLoader instance
		const mockGLTFLoaderInstance=MockedGLTFLoader.mock.instances[0];
		if(mockGLTFLoaderInstance) {
			(mockGLTFLoaderInstance.load as jest.Mock).mockImplementation(mockLoad);
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
			expect(data.id).toBe("model1");
			expect(data.type).toBe("model");
			const loadedAsset=useAssetStore.getState().assets["model1"];
			expect(loadedAsset).toBeDefined();
			expect(loadedAsset.loaded).toBe(true);
			expect(loadedAsset.data).toEqual({});
			done();
		};

		EventDispatcher.on("ASSET_LOADED",handleAssetLoaded);

		AssetLoadingSystem.loadAsset(asset);
	});

	it("should handle model asset loading error and load fallback",(done) => {
		const mockLoad=jest.fn((url,onLoad,onProgress,onError) => {
			// Simulate load error
			onError(new ErrorEvent("error",{message: "Failed to load model"}));
		});

		// Get the mock GLTFLoader instance
		const mockGLTFLoaderInstance=MockedGLTFLoader.mock.instances[0];
		if(mockGLTFLoaderInstance) {
			(mockGLTFLoaderInstance.load as jest.Mock).mockImplementation(mockLoad);
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
			expect(data.id).toBe("model2");
			expect(data.type).toBe("model");
			expect(data.error).toBe("Failed to load model");
			const failedAsset=useAssetStore.getState().assets["model2"];
			expect(failedAsset).toBeDefined();
			expect(failedAsset.loaded).toBe(false);
			expect(failedAsset.error).toBe("Failed to load model");
		};

		const handleAssetLoaded=(data: any) => {
			if(data.id==="model2_fallback") {
				expect(data.type).toBe("model");
				const fallbackAsset=useAssetStore.getState().assets["model2_fallback"];
				expect(fallbackAsset).toBeDefined();
				expect(fallbackAsset.loaded).toBe(true);
				expect(fallbackAsset.data).toEqual({});
				done();
			}
		};

		EventDispatcher.on("ASSET_ERROR",handleAssetError);
		EventDispatcher.on("ASSET_LOADED",handleAssetLoaded);

		AssetLoadingSystem.loadAsset(asset);
	});

	it("should load a texture asset successfully",(done) => {
		const mockLoad=jest.fn((url,onLoad,onProgress,onError) => {
			// Simulate successful load
			onLoad({uuid: "texture1"});
		});

		// Get the mock TextureLoader instance
		const mockTextureLoaderInstance=MockedTextureLoader.mock.instances[0];
		if(mockTextureLoaderInstance) {
			(mockTextureLoaderInstance.load as jest.Mock).mockImplementation(mockLoad);
		} else {
			throw new Error("TextureLoader instance not found");
		}

		const asset: Asset={
			id: "texture1",
			type: "texture",
			url: "/textures/grass.jpg",
			loaded: false,
			error: null,
			data: null,
			progress: 0,
		};

		// Listen for ASSET_LOADED event
		const handleAssetLoaded=(data: any) => {
			expect(data.id).toBe("texture1");
			expect(data.type).toBe("texture");
			const loadedAsset=useAssetStore.getState().assets["texture1"];
			expect(loadedAsset).toBeDefined();
			expect(loadedAsset.loaded).toBe(true);
			expect(loadedAsset.data).toEqual({uuid: "texture1"});
			done();
		};

		EventDispatcher.on("ASSET_LOADED",handleAssetLoaded);

		AssetLoadingSystem.loadAsset(asset);
	});

	it("should load a sound asset successfully",(done) => {
		const mockLoad=jest.fn((url,onLoad,onProgress,onError) => {
			// Simulate successful load
			onLoad({uuid: "sound1"});
		});

		// Get the mock AudioLoader instance
		const mockAudioLoaderInstance=MockedAudioLoader.mock.instances[0];
		if(mockAudioLoaderInstance) {
			(mockAudioLoaderInstance.load as jest.Mock).mockImplementation(mockLoad);
		} else {
			throw new Error("AudioLoader instance not found");
		}

		const asset: Asset={
			id: "sound1",
			type: "sound",
			url: "/sounds/explosion.mp3",
			loaded: false,
			error: null,
			data: null,
			progress: 0,
		};

		// Mock AudioManager's getListener method
		const mockListener=new AudioListener();
		(AudioManager.getListener as jest.Mock).mockReturnValue(mockListener);

		// Listen for ASSET_LOADED event
		const handleAssetLoaded=(data: any) => {
			expect(data.id).toBe("sound1");
			expect(data.type).toBe("sound");
			const loadedAsset=useAssetStore.getState().assets["sound1"];
			expect(loadedAsset).toBeDefined();
			expect(loadedAsset.loaded).toBe(true);
			expect(loadedAsset.data).toBeInstanceOf(Audio);
			// Since Audio is mocked, we check if listener was set correctly
			expect(loadedAsset.data.listener).toBe(mockListener);
			done();
		};

		EventDispatcher.on("ASSET_LOADED",handleAssetLoaded);

		AssetLoadingSystem.loadAsset(asset);
	});

	it("should handle unsupported asset types",(done) => {
		const asset: Asset={
			id: "unknown1",
			type: "other",
			url: "/unknown/asset.xyz",
			loaded: false,
			error: null,
			data: null,
			progress: 0,
		};

		// Listen for ASSET_ERROR event
		const handleAssetError=(data: any) => {
			expect(data.id).toBe("unknown1");
			expect(data.type).toBe("other");
			expect(data.error).toBe("Other asset types not supported");
			const loadedAsset=useAssetStore.getState().assets["unknown1"];
			expect(loadedAsset).toBeDefined();
			expect(loadedAsset.loaded).toBe(false);
			expect(loadedAsset.error).toBe("Other asset types not supported");
			done();
		};

		EventDispatcher.on("ASSET_ERROR",handleAssetError);

		AssetLoadingSystem.loadAsset(asset);
	});
});
