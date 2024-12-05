import type {Config} from 'jest';

const config: Config={
	preset: 'ts-jest', // Use ts-jest for TypeScript support
	testEnvironment: 'jsdom', // Simulate a browser-like environment for React
	roots: ['<rootDir>/src'], // Only look for tests in the src directory
	transform: {
		'^.+\\.tsx?$': 'ts-jest', // Transform TypeScript files using ts-jest
	},
	moduleFileExtensions: ['ts','tsx','js','jsx','json','node'], // Resolve these file types
	setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // Run setup file after environment setup
	moduleNameMapper: {
		'\\.(css|scss|sass)$': 'identity-obj-proxy',
		'\\.(png|jpg|jpeg|webp|svg)$': '<rootDir>/__mocks__/fileMock.ts', // Mock image imports
	},
	collectCoverage: true, // Enable coverage reports
	collectCoverageFrom: [
		'src/**/*.{ts,tsx}', // Include all TypeScript files in src folder
		'!src/**/*.d.ts', // Exclude type declaration files
		'!src/**/index.ts', // Exclude barrel files
	],
	coverageReporters: ['text','lcov'], // Generate text and lcov coverage reports
	testMatch: ['**/__tests__/**/*.(test|spec).ts?(x)','**/?(*.)+(test|spec).ts?(x)'], // Pattern for test files
	verbose: true, // Display detailed test results
};

export default config;
