// vite.config.ts

import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			// Optional: Create aliases for easier imports
			'@encoders': path.resolve(__dirname,'public/encoders'),
			'@models': path.resolve(__dirname,'public/models'),
			'@textures': path.resolve(__dirname,'public/textures'),
			'@shaders': path.resolve(__dirname,'public/shaders'),
		},
	},
	build: {
		// Optional: Adjust build settings as needed
		target: 'esnext', // Ensure modern JavaScript features are supported
		assetsInlineLimit: 0, // Prevent Vite from inlining assets; useful for large files
	},
	server: {
		// Optional: Customize the development server
		watch: {
			// Watch for changes in the public directory to trigger reloads
			ignored: ['!**/public/**'],
		},
		mimeTypes: {
			// Ensure .wasm files are served with the correct MIME type
			'application/wasm': ['wasm'],
		},
		fs: {
			// Allow serving files from one level up to the project root (if necessary)
			allow: ['..'],
		},
	},
	// Optional: Ensure Vite treats certain file types as assets
	assetsInclude: [
		'**/*.glsl',
		'**/*.vs',
		'**/*.fs',
		'**/*.vert',
		'**/*.frag',
		'**/*.obj',
		'**/*.fbx',
		'**/*.gltf',
		'**/*.glb',
		'**/*.mtl',
		'**/*.bin',
		'**/*.ktx',
		'**/*.basis',
		'**/*.js',
		'**/*.wasm',
	],
});
