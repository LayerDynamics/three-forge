// src/systems/PostProcessingSystem/effects/DOFEffect.ts

import {Effect} from 'postprocessing';
import {
	Uniform,
	WebGLRenderer,
	WebGLRenderTarget,
	ShaderMaterial,
	Vector2,
	Camera,
	Scene
} from 'three';
import {DOFParameters} from '../../../types/postProcessing.types';

// Define the fragment shader for the Depth of Field (DOF) Effect
const fragmentShader=`
  uniform float focus;
  uniform float aperture;
  uniform float maxBlur;
  uniform float bokehScale;
  uniform sampler2D tDiffuse;
  uniform sampler2D tDepth;
  uniform vec2 resolution;

  varying vec2 vUv;

  // Simple random function based on UV coordinates
  float rand(vec2 co){
      return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
  }

  void main() {
    // Retrieve the current fragment's depth
    float depth = texture2D(tDepth, vUv).r;
    // Calculate blur amount based on depth difference from focus
    float blurAmount = abs(depth - focus) * aperture;
    blurAmount = clamp(blurAmount, 0.0, maxBlur);

    // Initialize color accumulator and total weight
    vec3 color = vec3(0.0);
    float total = 0.0;

    // Number of samples for the blur
    int samples = 10;
    float stepSize = blurAmount / float(samples);

    // Perform a simple linear blur based on the blur amount
    for(int i = -5; i < 5; i++) {
      float offset = float(i) * stepSize;
      vec2 sampleUv = vUv + vec2(offset, 0.0) / resolution;
      color += texture2D(tDiffuse, sampleUv).rgb;
      total += 1.0;
    }

    // Average the accumulated color
    color /= total;

    // Apply bokeh scaling if necessary
    color *= bokehScale;

    gl_FragColor = vec4(color, 1.0);
  }
`;

export class DOFEffect extends Effect {
	private params: DOFParameters;
	private renderTarget: WebGLRenderTarget;
	private resolution: Vector2;
	private scene: Scene;
	private camera: Camera;

	/**
	 * Constructs a new Depth of Field (DOF) Effect.
	 * @param params - Configuration parameters for the DOF effect.
	 * @param resolution - The resolution of the render target.
	 * @param scene - The scene being rendered.
	 * @param camera - The camera used to render the scene.
	 */
	constructor(
		params: DOFParameters,
		resolution: Vector2,
		scene: Scene,
		camera: Camera
	) {
		super(
			'DOFEffect',
			fragmentShader,
			{
				blendFunction: 'NORMAL', // Adjust blend mode as needed
				uniforms: new Map([
					['focus',new Uniform(params.focus)],
					['aperture',new Uniform(params.aperture)],
					['maxBlur',new Uniform(params.maxBlur)],
					['bokehScale',new Uniform(params.bokehScale)],
					['tDepth',new Uniform(null)], // Depth texture to be set externally
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
	 * Updates the DOF effect's uniforms based on the current parameters and input buffer.
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
		this.uniforms.get('focus')!.value=this.params.focus;
		this.uniforms.get('aperture')!.value=this.params.aperture;
		this.uniforms.get('maxBlur')!.value=this.params.maxBlur;
		this.uniforms.get('bokehScale')!.value=this.params.bokehScale;
		this.uniforms.get('tDiffuse')!.value=inputBuffer.texture;
		this.uniforms.get('tDepth')!.value=depthBuffer.texture;
		this.uniforms.get('resolution')!.value=this.resolution;

		// Render the DOF effect into the render target
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
