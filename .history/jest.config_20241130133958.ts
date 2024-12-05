// jest.config.ts

import type {Config} from 'jest';

const config: Config={
	preset: 'ts-jest', // Use ts-jest for TypeScript support
	testEnvironment: 'jsdom', // Simulate a browser-like environment for React
	roots: ['<rootDir>/src'],
	transform: {
		'^.+\\.tsx?$': 'ts-jest',
	},
	moduleFileExtensions: ['ts','tsx','js','jsx','json','node'],
	setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
	moduleNameMapper: {
		'\\.(css|less|scss|sass)$': 'identity-obj-proxy',
		'\\.(png|jpg|jpeg|webp|svg)$': '<rootDir>/__mocks__/fileMock.ts',
	},
	"transformIgnorePatterns": [
		"node_modules/(?!(@react-three|three)/)"
	],
	collectCoverage: true,
	collectCoverageFrom: [
		'src/**/*.{ts,tsx}',
		'!src/**/*.d.ts',
		'!src/**/index.ts',
	],
	coverageReporters: ['text','lcov'],
	testMatch: ['**/__tests__/**/*.(test|spec).ts?(x)','**/?(*.)+(test|spec).ts?(x)'],
	verbose: true,
	globals: {
		'ts-jest': {
			tsconfig: '<rootDir>/tsconfig.app.json',
		},
	},
};

export default config;
