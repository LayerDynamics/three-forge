// src/systems/AssetLoadingSystem/AssetLoadingSystem.test.ts

// 1. Mock the GLTFLoader before any imports
jest.mock("three/examples/jsm/loaders/GLTFLoader", () => {
  return {
    GLTFLoader: jest.fn().mockImplementation(() => ({
      load: jest.fn(),
    })),
  };
});

// 2. Mock the necessary loaders from three.js before any imports
jest.mock("three", () => {
  const actualThree = jest.requireActual("three");
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
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { TextureLoader, AudioLoader, AudioListener, Audio } from "three";
import { Asset } from "../../types/asset.types";
import { EventDispatcher } from "../../utils/EventDispatcher";
import { useAssetStore } from "../../stores/assetStore";
import { AudioManager } from "../../utils/AudioManager";

// 4. Define mocked classes for easier access in tests
const MockedGLTFLoader = GLTFLoader as jest.MockedClass<typeof GLTFLoader>;
const MockedTextureLoader = TextureLoader as jest.MockedClass<typeof TextureLoader>;
const MockedAudioLoader = AudioLoader as jest.MockedClass<typeof AudioLoader>;

describe("AssetLoadingSystem", () => {
  let AssetLoadingSystem: any;

  beforeEach(() => {
    // Reset the module registry to ensure fresh imports
    jest.resetModules();

    // Re-import AssetLoadingSystem with the mocks in place
    AssetLoadingSystem = require("./AssetLoadingSystem").AssetLoadingSystem;

    // Reset the AssetStore before each test
    useAssetStore.setState({ assets: {} });

    // Clear all events
    (EventDispatcher as any).events = {};

    // Reset all mocked instances and their calls
    MockedGLTFLoader.mockClear();
    MockedTextureLoader.mockClear();
    MockedAudioLoader.mockClear();

    // Spy on AudioManager.getListener and mock its return value
    jest.spyOn(AudioManager, "getListener").mockReturnValue(new AudioListener());

    // Initialize the AssetLoadingSystem
    AssetLoadingSystem.initialize({ debug: true });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("should initialize the AssetLoadingSystem", () => {
    expect(GLTFLoader).toBeDefined();
    expect(TextureLoader).toBeDefined();
    expect(AudioLoader).toBeDefined();
  });

  it("should load a model asset successfully", (done) => {
    const mockLoad = jest.fn((url, onLoad, onProgress, onError) => {
      // Simulate successful load by calling onLoad with mock data
      onLoad({ /* mock model data */ });
    });

    // Get the mock GLTFLoader instance
    const mockGLTFLoaderInstance = MockedGLTFLoader.mock.instances[0];
    if (mockGLTFLoaderInstance) {
      (mockGLTFLoaderInstance.load as jest.Mock).mockImplementation(mockLoad);
    } else {
      throw new Error("GLTFLoader instance not found");
    }

    const asset: Asset = {
      id: "model1",
      type: "model",
      url: "/models/scene.gltf",
      loaded: false,
      error: null,
      data: null,
      progress: 0,
    };

    // Listen for ASSET_LOADED event
    const handleAssetLoaded = (data: any) => {
      expect(data.id).toBe(asset.id);
      done();
    };

    EventDispatcher.on("ASSET_LOADED", handleAssetLoaded);

    AssetLoadingSystem.loadAsset(asset);
  });

  it("should handle model asset loading error and load fallback", (done) => {
    const mockLoad = jest.fn((url, onLoad, onProgress, onError) => {
      // Simulate load
