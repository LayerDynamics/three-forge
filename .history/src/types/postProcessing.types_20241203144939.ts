// src/types/postProcessing.types.ts

import {Vector2,WebGLRenderer,Scene,Camera} from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
import {ShaderMaterial} from 'three';

export interface PostProcessingEffect {
	id: string;
	type: 'bloom'|'dof'|'ssao'|'motionBlur';
	enabled: boolean;
	priority: number;
	uniforms: Record<string,{value: any}>;
	material?: ShaderMaterial;
	needsDepthTexture?: boolean;
	needsNormalPass?: boolean;
}

export interface BloomParameters {
	strength: number;
	radius: number;
	threshold: number;
	exposure: number;
}

export interface DOFParameters {
	focus: number;
	aperture: number;
	maxBlur: number;
	bokehScale: number;
}

export interface SSAOParameters {
	radius: number;
	intensity: number;
	bias: number;
	kernelSize: number;
}

export interface MotionBlurParameters {
	velocity: number;
	samples: number;
}

export interface PostProcessingState {
	composer: EffectComposer|null;
	effects: Record<string,PostProcessingEffect>;
	renderOrder: string[];
	resolution: Vector2;
	enabled: boolean;
	presets: Record<string,Record<string,any>>;
	antialiasing: 'FXAA'|'SMAA'|'none';
	addEffect: (effect: PostProcessingEffect) => void;
	removeEffect: (id: string) => void;
	updateEffect: (id: string,updates: Partial<PostProcessingEffect>) => void;
	setEnabled: (enabled: boolean) => void;
	setResolution: (resolution: Vector2) => void;
	setRenderOrder: (order: string[]) => void;
	setAntialiasing: (method: 'FXAA'|'SMAA'|'none') => void;
	reset: () => void;
}

export interface PostProcessingConfig {
	renderer: WebGLRenderer;
	scene: Scene;
	camera: Camera;
	width: number;
	height: number;
	pixelRatio?: number;
	antialiasing?: 'FXAA'|'SMAA'|'none';
	debug?: boolean;
}