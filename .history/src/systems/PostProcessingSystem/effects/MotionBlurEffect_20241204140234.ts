// src/systems/PostProcessingSystem/effects/MotionBlurEffect.ts

import {
	Vector2,
	WebGLRenderTarget,
	ShaderMaterial,
	Scene,
	Camera,
	Mesh,
	PlaneGeometry,
	WebGLRenderer,
	RGBAFormat,
	LinearFilter,
	Texture,
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
 * Motion Blur Effect implemented from scratch using Three.js.
 */
export class MotionBlurEffect {
	private params: MotionBlurParameters;
	private resolution: Vector2;
	private renderTarget: WebGLRenderTarget;
	private material: ShaderMaterial;
	private scene: Scene;
	private camera: Camera;
	private quad: Mesh;

	/**
	 * Constructs a new MotionBlurEffect.
	 * @param params - Configuration parameters for the Motion Blur effect.
	 * @param resolution - The resolution of the render target.
	 */
	constructor(params: MotionBlurParameters,resolution: Vector2) {
		this.params=params;
		this.resolution=resolution.clone();

		// Initialize the render target
		this.renderTarget=new WebGLRenderTarget(this.resolution.x,this.resolution.y,{
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			format: RGBAFormat,
		});

		// Define the shader material
		this.material=new ShaderMaterial({
			uniforms: {
				tDiffuse: {value: null as Texture|null},
				tVelocity: {value: null as Texture|null},
				samples: {value: this.params.samples},
				resolution: {value: this.resolution},
			},
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
			transparent: false,
		});

		// Create a full-screen quad
		const geometry=new PlaneGeometry(2,2);
		this.quad=new Mesh(geometry,this.material);

		// Setup a separate scene and camera for rendering the quad
		this.scene=new Scene();
		this.camera=new Camera();
		this.scene.add(this.quad);
	}

	/**
	 * Updates the Motion Blur effect's uniforms and renders the effect.
	 * @param renderer - The WebGL renderer instance.
	 * @param inputBuffer - The input render target containing the scene's rendered image.
	 * @param velocityBuffer - The render target containing the scene's velocity information.
	 * @param deltaTime - Time elapsed since the last frame.
	 */
	public render(
		renderer: WebGLRenderer,
		inputBuffer: WebGLRenderTarget,
		velocityBuffer: WebGLRenderTarget,
		deltaTime: number
	): void {
		// Update uniforms with current parameters and textures
		this.material.uniforms['samples'].value=this.params.samples;
		this.material.uniforms['resolution'].value=this.resolution;

		this.material.uniforms['tDiffuse'].value=inputBuffer.texture;
		this.material.uniforms['tVelocity'].value=velocityBuffer.texture;

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
		this.renderTarget.setSize(this.resolution.x,this.resolution.y);
		this.material.uniforms['resolution'].value=this.resolution;
	}

	/**
	 * Disposes of resources to prevent memory leaks.
	 */
	public dispose(): void {
		this.renderTarget.dispose();
		this.material.dispose();
		this.quad.geometry.dispose();
		this.scene.remove(this.quad);
		// Nullify references to aid garbage collection
		(this.quad.material as ShaderMaterial)=null as any;
		(this.quad.geometry as PlaneGeometry)=null as any;
	}

	/**
	 * Retrieves the output texture after rendering the effect.
	 * @returns The render target containing the Motion Blur effect.
	 */
	public getOutput(): WebGLRenderTarget {
		return this.renderTarget;
	}
}