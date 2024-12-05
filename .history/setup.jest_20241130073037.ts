import '@testing-library/jest-dom'; // Provides custom jest matchers for testing-library
import {configure} from '@testing-library/react';

// Optional: Adjust default timeout for testing-library queries
configure({asyncUtilTimeout: 5000});



// Mocking global variables or methods
globalThis.IS_REACT_ACT_ENVIRONMENT=true; // Ensures React act() environment for testing
