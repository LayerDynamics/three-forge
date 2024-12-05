// PostProcessingSystem.ts

// Purpose: Configures and manages post-processing effects.
// Depends On: postprocessing.ts.
// Interacts With: BaseScene,Effects.
// src/systems/PostProcessingSystem/PostProcessingSystem.tsx

import { WebGLRenderer, Scene, Camera, Vector2 } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass';
import { usePostProcessingStore } from '../../stores/postProcessingStore';
import {
  PostProcessingConfig,
  PostProcessingEffect
} from '../../types/postProcessing.types';
import { BloomEffect } from './effects/BloomEffect';
import { DOFEffect } from './effects/DOFEffect';
import { SSAOEffect } from './effects/SSAOEffect';
import { MotionBlurEffect } from './effects/MotionBlurEffect';
import { EventDispatcher } from '../../utils/EventDispatcher';

export class PostProcessingSystem {
  private static instance: PostProcessingSystem | null = null;
  private config: PostProcessingConfig;
  private composer: EffectComposer;
  private renderPass: RenderPass;
  private antialiasPass: ShaderPass | SMAAPass | null;
  private frameId: number | null = null;

  private constructor(config: PostProcessingConfig) {
    this.config = config;
    this.composer = new EffectComposer(config.renderer);
    this.renderPass = new RenderPass(config.scene, config.camera);
    this.antialiasPass = this.createAntialiasPass(config.antialiasing || 'SMAA');

    this.initializeComposer();
  }

  public static getInstance(config?: PostProcessingConfig): PostProcessingSystem {
    if (!PostProcessingSystem.instance && config) {
      PostProcessingSystem.instance = new PostProcessingSystem(config);
    }
    return PostProcessingSystem.instance!;
  }

  private initializeComposer(): void {
    // Add base render pass
    this.composer.addPass(this.renderPass);

    // Add antialiasing if enabled
    if (this.antialiasPass) {
      this.composer.addPass(this.antialiasPass);
    }

    // Set initial resolution
    this.setSize(
      this.config.width,
      this.config.height,
      this.config.pixelRatio
    );

    usePostProcessingStore.getState().setResolution(
      new Vector2(this.config.width, this.config.height)
    );
  }

  private createAntialiasPass(method: 'FXAA' | 'SMAA' | 'none'): ShaderPass | SMAAPass | null {
    switch (method) {
      case 'FXAA':
        const fxaaPass = new ShaderPass(FXAAShader);
        const pixelRatio = this.config.pixelRatio || 1;
        fxaaPass.material.uniforms['resolution'].value.x = 1 / (this.config.width * pixelRatio);
        fxaaPass.material.uniforms['resolution'].value.y = 1 / (this.config.height * pixelRatio);
        return fxaaPass;

      case 'SMAA':
        return new SMAAPass(this.config.width, this.config.height);

      default:
        return null;
    }
  }

  public addEffect(effect: PostProcessingEffect): void {
    let effectInstance;

    switch (effect.type) {
      case 'bloom':
        effectInstance = new BloomEffect(effect.uniforms as any);
        break;
      case 'dof':
        effectInstance = new DOFEffect(effect.uniforms as any);
        break;
      case 'ssao':
        effectInstance = new SSAOEffect(effect.uniforms as any);
        break;
      case 'motionBlur':
        effectInstance = new MotionBlurEffect(effect.uniforms as any);
        break;
      default:
        console.warn(`Unsupported effect type: ${effect.type}`);
        return;
    }

    const pass = new ShaderPass(effectInstance);
    this.composer.addPass(pass);
    usePostProcessingStore.getState().addEffect(effect);

    if (this.config.debug) {
      console.log(`Added effect: ${effect.type} (${effect.id})`);
    }
  }

  public removeEffect(id: string): void {
    const state = usePostProcessingStore.getState();
    const effect = state.effects[id];

    if (effect) {
      // Remove from composer
      const passIndex = this.composer.passes.findIndex(
        pass => pass.name === effect.type
      );
      if (passIndex !== -1) {
        this.composer.removePass(this.composer.passes[passIndex]);
      }

      // Remove from store
      state.removeEffect(id);

      if (this.config.debug) {
        console.log(`Removed effect: ${effect.type} (${id})`);
      }
    }
  }

  public updateEffect(id: string, updates: Partial<PostProcessingEffect>): void {
    const state = usePostProcessingStore.getState();
    const effect = state.effects[id];

    if (effect) {
      // Update store
      state.updateEffect(id, updates);

      // Update composer pass
      const pass = this.composer.passes.find(p => p.name === effect.type);
      if (pass && updates.uniforms) {
        Object.entries(updates.uniforms).forEach(([key, value]) => {
          if (pass.uniforms[key]) {
            pass.uniforms[key].value = value;
          }
        });
      }

      if (this.config.debug) {
        console.log(`Updated effect: ${effect.type} (${id})`);
      }
    }
  }

  public setSize(width: number, height: number, pixelRatio?: number): void {
    this.composer.setSize(width, height);
    usePostProcessingStore.getState().setResolution(new Vector2(width, height));

    // Update FXAA resolution if present
    if (this.antialiasPass instanceof ShaderPass) {
      const pr = pixelRatio || 1;
      this.antialiasPass.material.uniforms['resolution'].value.x = 1 / (width * pr);
      this.antialiasPass.material.uniforms['resolution'].value.y = 1 / (height * pr);
    }
  }

  public setAntialiasing(method: 'FXAA' | 'SMAA' | 'none'): void {
    // Remove existing antialiasing pass
    if (this.antialiasPass) {
      const index = this.composer.passes.indexOf(this.antialiasPass);
      if (index !== -1) {
        this.composer.removePass(this.antialiasPass);
      }
    }

    // Create and add new antialiasing pass
    this.antialiasPass = this.createAntialiasPass(method);
    if (this.antialiasPass) {
      this.composer.addPass(this.antialiasPass);
    }

    usePostProcessingStore.getState().setAntialiasing(method);
  }

  public render(deltaTime: number): void {
    if (!usePostProcessingStore.getState().enabled) {
      this.config.renderer.render(this.config.scene, this.config.camera);
      return;
    }

    this.composer.render(deltaTime);
  }

  private update = (time: number): void => {
    this.render(time);
    this.frameId = requestAnimationFrame(this.update);
  };

  public start(): void {
    if (this.frameId === null) {
      this.frameId = requestAnimationFrame(this.update);
    }
  }

  public stop(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  public cleanup(): void {
    this.stop();
    this.composer.dispose();
    usePostProcessingStore.getState().reset();
  }
}
