// src/systems/PostProcessingSystem/effects/SSAOEffect.ts

import {Effect} from 'postprocessing';
import {Uniform,WebGLRenderTarget} from 'three';
import {SSAOParameters} from '../../../types/postProcessing.types';

export class SSAOEffect extends Effect {
	private params: SSAOParameters;
	private renderTarget: WebGLRenderTarget;

	constructor(params: SSAOParameters) {
		super('SSAOEffect',fragmentShader,{
			uniforms: new Map([
				['radius',new Uniform(params.radius)],
				['intensity',new Uniform(params.intensity)],
				['bias',new Uniform(params.bias)],
				['kernelSize',new Uniform(params.kernelSize)]
			])
		});

		this.params=params;
		this.renderTarget=new WebGLRenderTarget(1,1);
	}

	update(renderer: WebGLRenderer,inputBuffer: WebGLRenderTarget,deltaTime: number) {
		// Implementation of SSAO effect update
	}
}
