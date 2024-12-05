/// src/systems/AssetLoadingSystem/AssetLoadingSystem.test.ts

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

// 3. Test suite
describe("AssetLoadingSystem",() => {
	let AssetLoadingSystem: any;
	let mockGLTFLoader: jest.MockedFunction<typeof GLTFLoader>;
	let mockTextureLoader: jest.MockedFunction<typeof TextureLoader>;
	let mockAudioLoader: jest.MockedFunction<typeof AudioLoader>;

	beforeEach(async () => {
		jest.clearAllMocks();
		jest.resetModules();

		// Reset store and events
		useAssetStore.setState({assets: {}});
		(EventDispatcher as any).events={};

		// Get mock instances
		mockGLTFLoader=GLTFLoader as jest.MockedFunction<typeof GLTFLoader>;
		mockTextureLoader=TextureLoader as jest.MockedFunction<typeof TextureLoader>;
		mockAudioLoader=AudioLoader as jest.MockedFunction<typeof AudioLoader>;

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

	const waitForAssetUpdate=async (assetId: string): Promise<void> => {
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

	// Tests with proper timeouts and error handling
	it("should load a model asset successfully",async () => {
		const mockScene={type: "Scene"};
		const loadMock=jest.fn().mockImplementation((url,onLoad) => {
			onLoad({scene: mockScene});
		});
		mockGLTFLoader.mockImplementation(() => ({load: loadMock}));

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
		const loadMock=jest.fn().mockImplementation((url,onLoad,onProgress,onError) => {
			onError(mockError);
		});
		mockGLTFLoader.mockImplementation(() => ({load: loadMock}));

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
		const loadMock=jest.fn().mockImplementation((url,onLoad) => {
			onLoad(mockTexture);
			return mockTexture;
		});
		mockTextureLoader.mockImplementation(() => ({load: loadMock}));

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
