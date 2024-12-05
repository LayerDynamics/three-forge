// src/systems/PostProcessingSystem/effects/SSAOEffect.ts

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

  // Generates a random float based on UV coordinates and sample index
  float rand(vec2 co, int seed){
      return fract(sin(dot(co.xy + float(seed), vec2(12.9898,78.233))) * 43758.5453);
  }

  void main() {
    float depth = texture2D(tDepth, vUv).r;
    vec3 fragPos = vec3(vUv * resolution, depth);

    float occlusion = 0.0;

    for(int i = 0; i < 64; i++) {
      if(i >= kernelSize) break;
      // Generate random sample offset
      float sampleOffsetX = (rand(vUv, i) - 0.5) * radius;
      float sampleOffsetY = (rand(vUv, i * 2) - 0.5) * radius;
      vec2 sampleUv = vUv + vec2(sampleOffsetX, sampleOffsetY) / resolution;
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
 * Screen Space Ambient Occlusion (SSAO) Effect implemented from scratch using Three.js.
 */
export class SSAOEffect {
	private params: SSAOParameters;
	private resolution: Vector2;
	private renderTarget: WebGLRenderTarget;
	private material: ShaderMaterial;
	private scene: Scene;
	private camera: Camera;
	private quad: Mesh;

	/**
	 * Constructs a new SSAOEffect.
	 * @param params - Configuration parameters for the SSAO effect.
	 * @param resolution - The resolution of the render target.
	 */
	constructor(params: SSAOParameters,resolution: Vector2) {
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
				tDepth: {value: null as Texture|null},
				radius: {value: this.params.radius},
				intensity: {value: this.params.intensity},
				bias: {value: this.params.bias},
				kernelSize: {value: this.params.kernelSize},
				resolution: {value: this.resolution},
			},
			vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4( position, 1.0 );
        }
      `,
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
	 * Updates the SSAO effect's uniforms and renders the effect.
	 * @param renderer - The WebGL renderer instance.
	 * @param inputBuffer - The input render target containing the scene's rendered image.
	 * @param depthBuffer - The render target containing the scene's depth information.
	 * @param deltaTime - Time elapsed since the last frame.
	 */
	public render(
		renderer: WebGLRenderer,
		inputBuffer: WebGLRenderTarget,
		depthBuffer: WebGLRenderTarget,
		deltaTime: number
	): void {
		// Update uniforms with current parameters and textures
		this.material.uniforms['radius'].value=this.params.radius;
		this.material.uniforms['intensity'].value=this.params.intensity;
		this.material.uniforms['bias'].value=this.params.bias;
		this.material.uniforms['kernelSize'].value=this.params.kernelSize;
		this.material.uniforms['resolution'].value=this.resolution;

		this.material.uniforms['tDiffuse'].value=inputBuffer.texture;
		this.material.uniforms['tDepth'].value=depthBuffer.texture;

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
		this.quad.geometry=null as any;
		this.quad.material=null as any;
	}

	/**
	 * Retrieves the output texture after rendering the effect.
	 * @returns The render target containing the SSAO effect.
	 */
	public getOutput(): WebGLRenderTarget {
		return this.renderTarget;
	}
}