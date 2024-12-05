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
