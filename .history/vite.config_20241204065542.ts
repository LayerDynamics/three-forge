// vite.config.ts

import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import glsl from 'vite-plugin-glsl';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		glsl(), // If you're importing GLSL shaders directly
	],
	resolve: {
		alias: {
			'@encoders': path.resolve(__dirname,'public/encoders'),
			'@models': path.resolve(__dirname,'public/models'),
			'@textures': path.resolve(__dirname,'public/textures'),
			'@shaders': path.resolve(__dirname,'public/shaders'),
		},
	},
	build: {
		target: 'esnext',
		assetsInlineLimit: 0,
	},
	server: {
		watch: {
			ignored: ['!**/public/**'],
		},
		mimeTypes: {
			'application/wasm': ['wasm'],
		},
		fs: {
			allow: ['..'],
		},
	},
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
