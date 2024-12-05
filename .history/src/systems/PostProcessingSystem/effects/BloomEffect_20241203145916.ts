// src/systems/PostProcessingSystem/effects/BloomEffect.ts

import {Effect,BlendFunction} from 'postprocessing';
import {Uniform,WebGLRenderer,WebGLRenderTarget,ShaderMaterial,Vector2} from 'three';
import {BloomParameters} from '../../../types/postProcessing.types';

// Define the fragment shader for the Bloom Effect
const fragmentShader=`
  uniform float strength;
  uniform float radius;
  uniform float threshold;
  uniform float exposure;

  varying vec2 vUv;

  void main() {
    vec4 color = texture2D(tDiffuse, vUv);
    float brightness = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));

    // Apply threshold
    float factor = smoothstep(threshold, threshold + 0.1, brightness);
    vec3 bloom = color.rgb * factor * strength;

    // Apply Gaussian blur approximation
    bloom = bloom * (1.0 + radius);

    // Exposure adjustment
    bloom = vec3(1.0) - exp(-bloom * exposure);

    gl_FragColor = vec4(bloom, color.a);
  }
`;

export class BloomEffect extends Effect {
	private params: BloomParameters;
	private renderTarget: WebGLRenderTarget;
	private resolution: Vector2;

	constructor(params: BloomParameters,resolution: Vector2) {
		super(
			'BloomEffect',
			fragmentShader,
			{
				blendFunction: BlendFunction.ADD, // Adjust blend mode as needed
				uniforms: new Map([
					['strength',new Uniform(params.strength)],
					['radius',new Uniform(params.radius)],
					['threshold',new Uniform(params.threshold)],
					['exposure',new Uniform(params.exposure)],
					['tDiffuse',{value: null}] // Texture input
				])
			}
		);

		this.params=params;
		this.resolution=resolution;
		this.renderTarget=new WebGLRenderTarget(resolution.x,resolution.y);

		this.initialize();
	}

	/**
	 * Initializes any additional resources or settings.
	 */
	private initialize(): void {
		// Any initialization logic can be added here
	}

	/**
	 * Updates the effect's uniforms based on the current parameters.
	 * @param renderer - The WebGL renderer instance.
	 * @param inputBuffer - The input render target containing the scene's rendered image.
	 * @param deltaTime - Time elapsed since the last frame.
	 */
	public update(renderer: WebGLRenderer,inputBuffer: WebGLRenderTarget,deltaTime: number): void {
		// Update uniforms if parameters have changed
		this.uniforms.get('strength')!.value=this.params.strength;
		this.uniforms.get('radius')!.value=this.params.radius;
		this.uniforms.get('threshold')!.value=this.params.threshold;
		this.uniforms.get('exposure')!.value=this.params.exposure;

		// Set the input texture
		this.uniforms.get('tDiffuse')!.value=inputBuffer.texture;

		// Render the bloom effect into the render target
		renderer.setRenderTarget(this.renderTarget);
		renderer.render(this.scene,this.camera);
		renderer.setRenderTarget(null);
	}

	/**
	 * Resizes the render target to match the new resolution.
	 * @param resolution - The new resolution as a Vector2.
	 */
	public setResolution(resolution: Vector2): void {
		this.resolution.copy(resolution);
		this.renderTarget.setSize(resolution.x,resolution.y);
	}

	/**
	 * Disposes of resources to prevent memory leaks.
	 */
	public dispose(): void {
		this.renderTarget.dispose();
		super.dispose();
	}
}
