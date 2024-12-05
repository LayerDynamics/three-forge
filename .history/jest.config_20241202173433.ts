// jest.config.ts

import type {Config} from 'jest';

const config: Config={
	preset: 'ts-jest', // Use ts-jest for TypeScript support
	testEnvironment: 'jsdom', // Use jsdom for a browser-like environment for React
	roots: ['<rootDir>/src'],
	transform: {
		'^.+\\.tsx?$': ['ts-jest',{
			tsconfig: 'tsconfig.jest.json', // Ensure this path is correct
		}],
	},
	moduleFileExtensions: ['ts','tsx','js','jsx','json','node'],
	setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
	moduleNameMapper: {
		'\\.(css|less|scss|sass)$': 'identity-obj-proxy',
		'\\.(png|jpg|jpeg|webp|svg)$': '<rootDir>/__mocks__/fileMock.ts',
		'^@react-three/cannon$': '<rootDir>/__mocks__/react-three-cannon.js',
		'^@react-three/rapier$': '<rootDir>/__mocks__/react-three-rapier.js',
	},
	transformIgnorePatterns: [
		'node_modules/(?!(@react-three|three)/)',
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
	cashe: true
};

export default config;
