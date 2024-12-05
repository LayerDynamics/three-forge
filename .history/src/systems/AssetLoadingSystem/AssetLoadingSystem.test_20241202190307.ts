/// src/systems/AssetLoadingSystem/AssetLoadingSystem.test.ts

// 1. Set global Jest timeout
jest.setTimeout(30000);

// 1. Mock Three.js and GLTFLoader before any imports
jest.mock("three",() => {
	const mockThree={
		TextureLoader: jest.fn(() => ({
			load: jest.fn()
		})),
		AudioLoader: jest.fn(() => ({
			load: jest.fn()
		})),
		AudioListener: jest.fn(() => ({})),
		Audio: jest.fn(() => ({
			setBuffer: jest.fn(),
			setVolume: jest.fn(),
			play: jest.fn(),
			stop: jest.fn()
		}))
	};
	return mockThree;
});

jest.mock("three/examples/jsm/loaders/GLTFLoader",() => ({
	GLTFLoader: jest.fn(() => ({
		load: jest.fn()
	}))
}));

// 2. Import dependencies after mocks
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {TextureLoader,AudioLoader} from "three";
import {Asset,AssetType} from "../../types/asset.types";
import {EventDispatcher} from "../../utils/EventDispatcher";
import {useAssetStore} from "../../stores/assetStore";

// Define types for mocked loaders
type MockLoader={
	load: jest.Mock;
};

type MockLoaderConstructor=jest.Mock<MockLoader>;

// 3. Test suite
describe("AssetLoadingSystem",() => {
	let AssetLoadingSystem: any;
	let mockGLTFLoader: MockLoaderConstructor;
	let mockTextureLoader: MockLoaderConstructor;
	let mockAudioLoader: MockLoaderConstructor;

	beforeEach(async () => {
		jest.clearAllMocks();
		jest.resetModules();

		// Reset store and events
		useAssetStore.setState({assets: {}});
		(EventDispatcher as any).events={};

		// Get mock constructors
		mockGLTFLoader=GLTFLoader as unknown as MockLoaderConstructor;
		mockTextureLoader=TextureLoader as unknown as MockLoaderConstructor;
		mockAudioLoader=AudioLoader as unknown as MockLoaderConstructor;

		// Import system after mocks
		AssetLoadingSystem=(await import("./AssetLoadingSystem")).AssetLoadingSystem;
		AssetLoadingSystem.initialize({debug: false});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	// Helper functions
	const createMockAsset=(type: AssetType,id: string): Asset => ({
		id,
		type,
		url: `/test/${type}.test`,
		loaded: false,
		error: null,
		data: null,
		progress: 0
	});

	// 2. Improved waitForAssetUpdate helper
	const waitForAssetUpdate = (assetId: string, timeout = 5000): Promise<void> => {
		const startTime = Date.now();

		return new Promise((resolve, reject) => {
			const checkAsset = () => {
				const asset = useAssetStore.getState().getAsset(assetId);

				if (asset?.loaded || asset?.error) {
					resolve();
					return;
				}

				if (Date.now() - startTime > timeout) {
					reject(new Error(`Timed out waiting for asset ${assetId} to update`));
					return;
				}

				setTimeout(checkAsset, 100);
			};

			checkAsset();
		});
	};

	// 3. Updated test cases with specific timeouts
	it("should load a model asset successfully", async () => {
		const mockScene = { type: "Scene" };
		const loadMock = jest.fn().mockImplementation((url, onLoad) => {
			onLoad({ scene: mockScene });
		});

		mockGLTFLoader.mockImplementation(() => ({
			load: loadMock
		}));

		const asset = createMockAsset("model", "model1");
		AssetLoadingSystem.loadAsset(asset);

		await expect(waitForAssetUpdate(asset.id, 10000)).resolves.not.toThrow();

		const storedAsset = useAssetStore.getState().getAsset(asset.id);
		expect(storedAsset).toBeDefined();
		expect(storedAsset?.loaded).toBe(true);
		expect(storedAsset?.data).toBe(mockScene);
	}, 15000);  // Test-specific timeout

	it("should handle model asset loading error", async () => {
		const mockError = new Error("Failed to load model");
		const loadMock = jest.fn().mockImplementation((url, onLoad, onProgress, onError) => {
			onError(mockError);
		});

		mockGLTFLoader.mockImplementation(() => ({
			load: loadMock
		}));

		const asset = createMockAsset("model", "model2");
		AssetLoadingSystem.loadAsset(asset);

		await expect(waitForAssetUpdate(asset.id, 10000)).resolves.not.toThrow();

		const storedAsset = useAssetStore.getState().getAsset(asset.id);
		expect(storedAsset).toBeDefined();
		expect(storedAsset?.error).toBeDefined();
		expect(storedAsset?.loaded).toBe(false);
	}, 15000);

	it("should load a texture asset successfully", async () => {
		const mockTexture = { type: "Texture" };
		const loadMock = jest.fn().mockImplementation((url, onLoad) => {
			onLoad(mockTexture);
			return mockTexture;
		});

		mockTextureLoader.mockImplementation(() => ({
			load: loadMock
		}));

		const asset = createMockAsset("texture", "texture1");
		AssetLoadingSystem.loadAsset(asset);

		await expect(waitForAssetUpdate(asset.id, 10000)).resolves.not.toThrow();

		const storedAsset = useAssetStore.getState().getAsset(asset.id);
		expect(storedAsset).toBeDefined();
		expect(storedAsset?.loaded).toBe(true);
		expect(storedAsset?.data).toBe(mockTexture);
	}, 15000);

	it("should handle unsupported asset types", async () => {
		const asset = createMockAsset("other", "other1");
		AssetLoadingSystem.loadAsset(asset);

		await expect(waitForAssetUpdate(asset.id, 10000)).resolves.not.toThrow();

		const storedAsset = useAssetStore.getState().getAsset(asset.id);
		expect(storedAsset).toBeDefined();
		expect(storedAsset?.error).toBe("Other asset types not supported");
		expect(storedAsset?.loaded).toBe(false);
	}, 15000);
});
