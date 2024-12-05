// src/systems/PostProcessingSystem/effects/MotionBlurEffect.ts

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
import {MotionBlurParameters} from '../../../types/postProcessing.types';

/**
 * Vertex shader for Motion Blur Effect.
 */
const vertexShader=`
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Fragment shader for Motion Blur Effect.
 */
const fragmentShader=`
  uniform sampler2D tDiffuse;
  uniform sampler2D tVelocity;
  uniform int samples;
  uniform vec2 resolution;

  varying vec2 vUv;

  void main() {
    vec2 velocity = texture2D(tVelocity, vUv).xy;
    vec3 color = texture2D(tDiffuse, vUv).rgb;
    float total = 1.0;

    for(int i = 1; i <= 16; i++) { // Assuming samples <= 16
      if(i > samples) break;
      vec2 offset = velocity * float(i) / resolution;
      color += texture2D(tDiffuse, vUv + offset).rgb;
      total += 1.0;
    }

    color /= total;
    gl_FragColor = vec4(color, 1.0);
  }
`;

/**
 * Motion Blur Effect.
 */
export class MotionBlurEffect extends Effect {
	private params: MotionBlurParameters;
	private renderTarget: WebGLRenderTarget;
	private resolution: Vector2;
	private scene: Scene;
	private camera: Camera;

	/**
	 * Constructs a new MotionBlurEffect.
	 * @param params - Configuration parameters for the Motion Blur effect.
	 * @param resolution - The resolution of the render target.
	 * @param scene - The scene being rendered.
	 * @param camera - The camera used to render the scene.
	 */
	constructor(
		params: MotionBlurParameters,
		resolution: Vector2,
		scene: Scene,
		camera: Camera
	) {
		super(
			'MotionBlurEffect',
			fragmentShader,
			{
				vertexShader: vertexShader,
				blendFunction: 'NORMAL', // Adjust blend mode as needed
				uniforms: new Map([
					['tDiffuse',new Uniform(null)],
					['tVelocity',new Uniform(null)],
					['samples',new Uniform(params.samples)],
					['resolution',new Uniform(resolution)]
				]),
				materialOptions: {
					depthWrite: false
				}
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
	 * Updates the Motion Blur effect's uniforms based on the current parameters and input buffers.
	 * @param renderer - The WebGL renderer instance.
	 * @param inputBuffer - The input render target containing the scene's rendered image.
	 * @param velocityBuffer - The render target containing the scene's velocity information.
	 * @param deltaTime - Time elapsed since the last frame.
	 */
	public update(
		renderer: WebGLRenderer,
		inputBuffer: WebGLRenderTarget,
		velocityBuffer: WebGLRenderTarget,
		deltaTime: number
	): void {
		// Update uniforms if parameters have changed
		this.uniforms.get('samples')!.value=this.params.samples;
		this.uniforms.get('resolution')!.value=this.resolution;

		// Set the input textures
		this.uniforms.get('tDiffuse')!.value=inputBuffer.texture;
		this.uniforms.get('tVelocity')!.value=velocityBuffer.texture;

		// Render the Motion Blur effect into the render target
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
