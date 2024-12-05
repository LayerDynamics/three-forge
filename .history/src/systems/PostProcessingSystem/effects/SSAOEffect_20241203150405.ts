// src/systems/PostProcessingSystem/effects/SSAOEffect.ts

import {Effect} from 'postprocessing';
import {
	Uniform,
	WebGLRenderer,
	WebGLRenderTarget,
	ShaderMaterial,
	Vector2,
	Scene,
	Camera
} from 'three';
import {SSAOParameters} from '../../../types/postProcessing.types';

/**
 * Fragment shader for Screen Space Ambient Occlusion (SSAO) Effect.
 */
const fragmentShader=`
  uniform sampler2D tDiffuse;
  uniform sampler2D tDepth;
  uniform float radius;
  uniform float intensity;
  uniform float bias;
  uniform int kernelSize;
  uniform vec2 resolution;

  varying vec2 vUv;

  // Generates a random vector based on UV coordinates
  float rand(vec2 co){
      return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
  }

  void main() {
    float depth = texture2D(tDepth, vUv).r;
    vec3 fragPos = vec3(vUv * resolution, depth);

    float occlusion = 0.0;

    for(int i = 0; i < 64; i++) {
      if(i >= kernelSize) break;
      // Sample kernel
      vec2 sampleUv = vUv + (rand(vUv + float(i)) - 0.5) * radius / resolution;
      float sampleDepth = texture2D(tDepth, sampleUv).r;
      float rangeCheck = smoothstep(0.0, 1.0, radius / abs(depth - sampleDepth));
      occlusion += (depth - sampleDepth) > bias ? rangeCheck : 0.0;
    }

    occlusion = clamp(1.0 - (occlusion / float(kernelSize)) * intensity, 0.0, 1.0);

    vec4 color = texture2D(tDiffuse, vUv);
    gl_FragColor = vec4(color.rgb * occlusion, color.a);
  }
`;

/**
 * Screen Space Ambient Occlusion (SSAO) Effect.
 */
export class SSAOEffect extends Effect {
	private params: SSAOParameters;
	private renderTarget: WebGLRenderTarget;
	private resolution: Vector2;
	private scene: Scene;
	private camera: Camera;

	/**
	 * Constructs a new SSAOEffect.
	 * @param params - Configuration parameters for the SSAO effect.
	 * @param resolution - The resolution of the render target.
	 * @param scene - The scene being rendered.
	 * @param camera - The camera used to render the scene.
	 */
	constructor(
		params: SSAOParameters,
		resolution: Vector2,
		scene: Scene,
		camera: Camera
	) {
		super(
			'SSAOEffect',
			fragmentShader,
			{
				blendFunction: 'NORMAL', // Adjust blend mode as needed
				uniforms: new Map([
					['tDiffuse',new Uniform(null)],
					['tDepth',new Uniform(null)],
					['radius',new Uniform(params.radius)],
					['intensity',new Uniform(params.intensity)],
					['bias',new Uniform(params.bias)],
					['kernelSize',new Uniform(params.kernelSize)],
					['resolution',new Uniform(resolution)]
				])
			}
		);

		this.params=params;
		this.resolution=resolution;
		this.scene=scene;
		this.camera=camera;
		this.renderTarget=new WebGLRenderTarget(resolution.x,resolution.y,{
			minFilter: WebGLRenderer.LinearFilter,
			magFilter: WebGLRenderer.LinearFilter,
			format: WebGLRenderer.RGBAFormat
		});

		this.initialize();
	}

	/**
	 * Initializes any additional resources or settings.
	 */
	private initialize(): void {
		// Any additional initialization logic can be added here
	}

	/**
	 * Updates the SSAO effect's uniforms based on the current parameters and input buffers.
	 * @param renderer - The WebGL renderer instance.
	 * @param inputBuffer - The input render target containing the scene's rendered image.
	 * @param depthBuffer - The render target containing the scene's depth information.
	 * @param deltaTime - Time elapsed since the last frame.
	 */
	public update(
		renderer: WebGLRenderer,
		inputBuffer: WebGLRenderTarget,
		depthBuffer: WebGLRenderTarget,
		deltaTime: number
	): void {
		// Update uniforms if parameters have changed
		this.uniforms.get('radius')!.value=this.params.radius;
		this.uniforms.get('intensity')!.value=this.params.intensity;
		this.uniforms.get('bias')!.value=this.params.bias;
		this.uniforms.get('kernelSize')!.value=this.params.kernelSize;
		this.uniforms.get('resolution')!.value=this.resolution;

		// Set the input textures
		this.uniforms.get('tDiffuse')!.value=inputBuffer.texture;
		this.uniforms.get('tDepth')!.value=depthBuffer.texture;

		// Render the SSAO effect into the render target
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
		if(this.uniforms.get('resolution')) {
			this.uniforms.get('resolution')!.value=resolution;
		}
	}

	/**
	 * Disposes of resources to prevent memory leaks.
	 */
	public dispose(): void {
		this.renderTarget.dispose();
		super.dispose();
	}
}
