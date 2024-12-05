import '@testing-library/jest-dom'; // Provides custom jest matchers for testing-library
import {configure} from '@testing-library/react';

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

// Mocking global variables or methods
globalThis.IS_REACT_ACT_ENVIRONMENT=true; // Ensures React act() environment for testing
