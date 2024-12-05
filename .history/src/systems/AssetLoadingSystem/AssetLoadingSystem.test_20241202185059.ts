/// src/systems/AssetLoadingSystem/AssetLoadingSystem.test.ts

import { Asset, AssetType } from "../../types/asset.types";
import { EventDispatcher } from "../../utils/EventDispatcher";
import { useAssetStore } from "../../stores/assetStore";

// Increase timeout for all tests
jest.setTimeout(10000);

// Mock loaders before imports
const mockGLTFLoad = jest.fn();
jest.mock("three/examples/jsm/loaders/GLTFLoader", () => ({
  GLTFLoader: jest.fn().mockImplementation(() => ({
    load: mockGLTFLoad
  }))
}));

const mockTextureLoad = jest.fn();
const mockAudioLoad = jest.fn();
jest.mock("three", () => {
  const actualThree = jest.requireActual("three");
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

describe("AssetLoadingSystem", () => {
  let AssetLoadingSystem: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetModules();

    // Reset store and events
    useAssetStore.setState({ assets: {} });
    (EventDispatcher as any).events = {};

    // Import system after mocks
    AssetLoadingSystem = (await import("./AssetLoadingSystem")).AssetLoadingSystem;
    AssetLoadingSystem.initialize({ debug: false });
  });

  const createMockAsset = (type: AssetType, id: string = "test"): Asset => ({
    id,
    type,
    url: `/test/${type}.test`,
    loaded: false,
    error: null,
    data: null,
    progress: 0
  });

  const waitForAssetUpdate = (assetId: string): Promise<void> => {
    return new Promise((resolve) => {
      const checkAsset = () => {
        const asset = useAssetStore.getState().getAsset(assetId);
        if (asset?.loaded || asset?.error) {
          resolve();
          return;
        }
        setTimeout(checkAsset, 10);
      };
      checkAsset();
    });
  };

  it("should load a model asset successfully", async () => {
    const mockScene = { type: "Scene" };
    mockGLTFLoad.mockImplementation((url: string, onLoad: Function) => {
      onLoad({ scene: mockScene });
    });

    const asset = createMockAsset("model", "model1");
    AssetLoadingSystem.loadAsset(asset);
    
    await waitForAssetUpdate(asset.id);

    const storedAsset = useAssetStore.getState().getAsset(asset.id);
    expect(storedAsset).toBeDefined();
    expect(storedAsset?.loaded).toBe(true);
    expect(storedAsset?.data).toBe(mockScene);
  }, 10000); // Increase individual test timeout

  it("should handle model asset loading error", async () => {
    const mockError = new Error("Failed to load model");
    mockGLTFLoad.mockImplementation(
      (url: string, onLoad: Function, onProgress: Function, onError: Function) => {
        onError(mockError);
      }
    );

    const asset = createMockAsset("model", "model2");
    AssetLoadingSystem.loadAsset(asset);
    
    await waitForAssetUpdate(asset.id);

    const storedAsset = useAssetStore.getState().getAsset(asset.id);
    expect(storedAsset).toBeDefined();
    expect(storedAsset?.error).toBeDefined();
    expect(storedAsset?.loaded).toBe(false);
  }, 10000);

  it("should load a texture asset successfully", async () => {
    const mockTexture = { type: "Texture" };
    mockTextureLoad.mockImplementation((url: string, onLoad: Function) => {
      onLoad(mockTexture);
      return mockTexture;
    });

    const asset = createMockAsset("texture", "texture1");
    AssetLoadingSystem.loadAsset(asset);
    
    await waitForAssetUpdate(asset.id);

    const storedAsset = useAssetStore.getState().getAsset(asset.id);
    expect(storedAsset).toBeDefined();
    expect(storedAsset?.loaded).toBe(true);
    expect(storedAsset?.data).toBe(mockTexture);
  }, 10000);

  it("should handle unsupported asset types", async () => {
    const asset = createMockAsset("other", "other1");
    AssetLoadingSystem.loadAsset(asset);
    
    await waitForAssetUpdate(asset.id);

    const storedAsset = useAssetStore.getState().getAsset(asset.id);
    expect(storedAsset).toBeDefined();
    expect(storedAsset?.error).toBe("Other asset types not supported");
    expect(storedAsset?.loaded).toBe(false);
  }, 10000);
});