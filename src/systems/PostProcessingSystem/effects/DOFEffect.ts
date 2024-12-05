// src/systems/PostProcessingSystem/effects/DOFEffect.ts

import {
	Vector2,
	WebGLRenderTarget,
	ShaderMaterial,
	Scene,
	Camera,
	Mesh,
	PlaneGeometry,
	UniformsUtils,
	WebGLRenderer,
	RGBAFormat,
	LinearFilter,
	Texture,
} from 'three';
import {DOFParameters} from '../../../types/postProcessing.types';

/**
 * Depth of Field Effect implemented from scratch without using 'postprocessing' module.
 */
export class DOFEffect {
	private params: DOFParameters;
	private resolution: Vector2;
	private renderTarget: WebGLRenderTarget;
	private material: ShaderMaterial;
	private scene: Scene;
	private camera: Camera;
	private quad: Mesh;

	/**
	 * Constructs a new Depth of Field (DOF) Effect.
	 * @param params - Configuration parameters for the DOF effect.
	 * @param resolution - The resolution of the render target.
	 */
	constructor(params: DOFParameters,resolution: Vector2) {
		this.params=params;
		this.resolution=resolution.clone();

		// Initialize the render target
		this.renderTarget=new WebGLRenderTarget(resolution.x,resolution.y,{
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			format: RGBAFormat,
		});

		// Create a full-screen quad geometry
		const geometry=new PlaneGeometry(2,2);

		// Define the shader material
		this.material=new ShaderMaterial({
			uniforms: UniformsUtils.merge([
				{
					tDiffuse: {value: null as Texture|null},
					tDepth: {value: null as Texture|null},
					focus: {value: this.params.focus},
					aperture: {value: this.params.aperture},
					maxBlur: {value: this.params.maxBlur},
					bokehScale: {value: this.params.bokehScale},
					resolution: {value: this.resolution},
				},
			]),
			vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4( position, 1.0 );
        }
      `,
			fragmentShader: /* glsl */ `
        uniform float focus;
        uniform float aperture;
        uniform float maxBlur;
        uniform float bokehScale;
        uniform sampler2D tDiffuse;
        uniform sampler2D tDepth;
        uniform vec2 resolution;

        varying vec2 vUv;

        float rand(vec2 co){
            return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
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
      `,
		});

		// Create the scene and camera for rendering the effect
		this.scene=new Scene();
		this.camera=new Camera();

		// Create the mesh and add it to the scene
		this.quad=new Mesh(geometry,this.material);
		this.scene.add(this.quad);
	}

	/**
	 * Updates the DOF effect's uniforms and renders the effect.
	 * @param renderer - The WebGL renderer instance.
	 * @param inputBuffer - The input render target containing the scene's rendered image.
	 * @param depthBuffer - The render target containing the scene's depth information.
	 */
	public render(
		renderer: WebGLRenderer,
		inputBuffer: WebGLRenderTarget,
		depthBuffer: WebGLRenderTarget
	): void {
		// Update uniforms with current parameters and textures
		this.material.uniforms['focus'].value=this.params.focus;
		this.material.uniforms['aperture'].value=this.params.aperture;
		this.material.uniforms['maxBlur'].value=this.params.maxBlur;
		this.material.uniforms['bokehScale'].value=this.params.bokehScale;
		this.material.uniforms['tDiffuse'].value=inputBuffer.texture;
		this.material.uniforms['tDepth'].value=depthBuffer.texture;

		// Render the effect to the render target
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
		this.material.uniforms['resolution'].value=this.resolution;
	}

	/**
	 * Disposes of resources to prevent memory leaks.
	 */
	public dispose(): void {
		this.renderTarget.dispose();
		this.material.dispose();
		this.quad.geometry.dispose();
	}

	/**
	 * Retrieves the output texture after rendering the effect.
	 * @returns The render target containing the DOF effect.
	 */
	public getOutput(): WebGLRenderTarget {
		return this.renderTarget;
	}
}