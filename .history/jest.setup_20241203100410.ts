
import '@testing-library/jest-dom';
import {configure} from '@testing-library/react';

// Declare global property type
declare global {
	var IS_REACT_ACT_ENVIRONMENT: boolean;
}

// Optional: Adjust default timeout for testing-library queries
configure({asyncUtilTimeout: 5000});

// Mocking fetch API globally
global.fetch=jest.fn(() =>
	Promise.resolve({
		json: () => Promise.resolve({}),
	})
) as jest.Mock;

// Mocking a console warning for specific known cases
const originalWarn=console.warn;
console.warn=(...args) => {
	if(args[0].includes('React')) {
		return; // Suppress React warnings during tests
	}
	originalWarn(...args);
};

// Setting global React environment variable
global.IS_REACT_ACT_ENVIRONMENT=true;

// // jest.setup.ts

// jest.mock('@react-three/cannon',() => ({
// 	Physics: ({children}: {children: React.ReactNode}) =>
// 		React.createElement(React.Fragment,null,children),
// 	useBox: () => [jest.fn()],
// 	useSphere: () => [jest.fn()],
// 	useCylinder: () => [jest.fn()],
// 	usePlane: () => [jest.fn()],
// }));
jest.mock('../../stores/sceneGraphStore',() => ({
	useSceneGraphStore: () => ({
		addNode: jest.fn(),
		setParent: jest.fn(),
		getNode: jest.fn(),
		removeNode: jest.fn(),
	}),
}));

jest.mock('../../stores/logicStore',() => ({
	useLogicStore: () => ({
		registerLogicComponent: jest.fn(),
		unregisterLogicComponent: jest.fn(),
		dequeueEvent: jest.fn(),
	}),
}));

jest.mock('../../utils/EventDispatcher',() => ({
	EventDispatcher: {
		on: jest.fn(),
		off: jest.fn(),
		emit: jest.fn(),
	},
}));

jest.mock('../MemorySystem/MemorySystem',() => ({
	MemorySystemInstance: {
		registerObject: jest.fn(),
		unregisterObject: jest.fn(),
		calculateStats: jest.fn().mockReturnValue({
			totalMemory: 0,
			maxMemory: 1024*1024*1024, // 1GB for testing
			objectCount: {
				model: 0,
				texture: 0,
				sound: 0,
				video: 0,
				other: 0,
				geometry: 0,
				material: 0,
			},
			largestObjects: [],
		}),
		shouldTriggerCleanup: jest.fn().mockReturnValue(false),
		performCleanup: jest.fn(),
	},
}));
