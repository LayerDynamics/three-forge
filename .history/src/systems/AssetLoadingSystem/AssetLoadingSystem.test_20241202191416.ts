// src/systems/AssetLoadingSystem/AssetLoadingSystem.test.ts

jest.setTimeout(30000);

// Mock Three.js and GLTFLoader before imports
const mockLoadGLTF=jest.fn();
const mockLoadTexture=jest.fn();
const mockLoadAudio=jest.fn();

jest.mock('three',() => {
	return {
		TextureLoader: jest.fn(() => ({
			load: mockLoadTexture,
		})),
		AudioLoader: jest.fn(() => ({
			load: mockLoadAudio,
		})),
		AudioListener: jest.fn(() => ({})),
		Audio: jest.fn(() => ({
			setBuffer: jest.fn(),
			setVolume: jest.fn(),
			play: jest.fn(),
			stop: jest.fn(),
		})),
	};
});

jest.mock('three/examples/jsm/loaders/GLTFLoader',() => ({
	GLTFLoader: jest.fn(() => ({
		load: mockLoadGLTF,
	})),
}));

// Import dependencies after mocks
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {TextureLoader,AudioLoader} from 'three';
import {Asset,AssetType} from '../../types/asset.types';
import {EventDispatcher} from '../../utils/EventDispatcher';
import {useAssetStore} from '../../stores/assetStore';
import {AssetLoadingSystem} from './AssetLoadingSystem';

describe('AssetLoadingSystem',() => {
	beforeEach(async () => {
		jest.clearAllMocks();
		jest.resetModules();

		useAssetStore.setState({assets: {}});
		(EventDispatcher as any).events={};

		AssetLoadingSystem.initialize({debug: false});
	});

	const createMockAsset=(type: AssetType,id: string): Asset => ({
		id,
		type,
		url: `/test/${type}.test`,
		loaded: false,
		error: null,
		data: null,
		progress: 0,
	});

	const waitForState=(assetId: string,timeout=1000): Promise<Asset|undefined> => {
		return new Promise((resolve,reject) => {
			const start=Date.now();

			const checkAsset=() => {
				const asset=useAssetStore.getState().getAsset(assetId);
				if(asset?.loaded||asset?.error) {
					resolve(asset);
					return;
				}

				if(Date.now()-start>timeout) {
					reject(new Error(`Timeout waiting for asset ${assetId} to update`));
					return;
				}

				setImmediate(checkAsset);
			};

			checkAsset();
		});
	};

	it('should load a model asset successfully',async () => {
		const mockScene={type: 'Scene'};
		mockLoadGLTF.mockImplementation((url: string,onLoad: Function) => {
			onLoad({scene: mockScene});
		});

		const asset=createMockAsset('model','model1');
		AssetLoadingSystem.loadAsset(asset);

		const updatedAsset=await waitForState(asset.id);
		expect(updatedAsset).toBeDefined();
		expect(updatedAsset?.loaded).toBe(true);
		expect(updatedAsset?.data).toBe(mockScene);
	});

	it('should handle model asset loading error',async () => {
		const mockError=new Error('Failed to load model');
		mockLoadGLTF.mockImplementation(
			(url: string,onLoad: Function,onProgress: Function,onError: Function) => {
				onError(mockError);
			}
		);

		const asset=createMockAsset('model','model2');
		AssetLoadingSystem.loadAsset(asset);

		const updatedAsset=await waitForState(asset.id);
		expect(updatedAsset).toBeDefined();
		expect(updatedAsset?.error).toBeDefined();
		expect(updatedAsset?.loaded).toBe(false);
	});

	it('should load a texture asset successfully',async () => {
		const mockTexture={type: 'Texture'};
		mockLoadTexture.mockImplementation((url: string,onLoad: Function) => {
			onLoad(mockTexture);
		});

		const asset=createMockAsset('texture','texture1');
		AssetLoadingSystem.loadAsset(asset);

		const updatedAsset=await waitForState(asset.id);
		expect(updatedAsset).toBeDefined();
		expect(updatedAsset?.loaded).toBe(true);
		expect(updatedAsset?.data).toBe(mockTexture);
	});

	it('should handle unsupported asset types',async () => {
		const asset=createMockAsset('other','other1');
		AssetLoadingSystem.loadAsset(asset);

		const updatedAsset=await waitForState(asset.id);
		expect(updatedAsset).toBeDefined();
		expect(updatedAsset?.error).toBe('Other asset types not supported');
		expect(updatedAsset?.loaded).toBe(false);
	});
});
