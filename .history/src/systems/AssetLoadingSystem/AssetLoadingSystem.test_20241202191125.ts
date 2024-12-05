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


