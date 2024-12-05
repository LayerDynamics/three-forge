// src/systems/PostProcessingSystem/PostProcessingSystem.test.tsx

import { PostProcessingSystem } from './PostProcessingSystem';
import { usePostProcessingStore } from '../../stores/postProcessingStore';
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Vector2
} from 'three';
import { EventDispatcher } from '../../utils/EventDispatcher';

describe('PostProcessingSystem', () => {
  let postProcessingSystem: PostProcessingSystem;
  let renderer: WebGLRenderer;
  let scene: Scene;
  let camera: PerspectiveCamera;

  beforeEach(() => {
    // Reset the PostProcessingSystem instance
    (PostProcessingSystem as any).instance = null;

    // Create required Three.js instances
    renderer = new WebGLRenderer();
    renderer.setSize(800, 600);
    scene = new Scene();
    camera = new PerspectiveCamera(75, 800 / 600, 0.1, 1000);

    // Initialize system with test configuration
    postProcessingSystem = PostProcessingSystem.getInstance({
      renderer,
      scene,
      camera,
      width: 800,
      height: 600,
      pixelRatio: 1,
      antialiasing: 'SMAA',
      debug: true
    });

    // Reset the store
    usePostProcessingStore.getState().reset();

    // Mock RAF
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => setTimeout(cb, 16));
  });

  afterEach(() => {
    postProcessingSystem.cleanup();
    renderer.dispose();
    jest.restoreAllMocks();
  });

  it('should be a singleton', () => {
    const instance1 = PostProcessingSystem.getInstance();
    const instance2 = PostProcessingSystem.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should handle effect addition and removal', () => {
    const bloomEffect = {
      id: 'bloom1',
      type: 'bloom' as const,
      enabled: true,
      priority: 1,
      uniforms: {
        strength: { value: 1.5 },
        radius: { value: 0.8 },
        threshold: { value: 0.6 }
      }
    };

    postProcessingSystem.addEffect(bloomEffect);
    expect(usePostProcessingStore.getState().effects['bloom1']).toBeDefined();

    postProcessingSystem.removeEffect('bloom1');
    expect(usePostProcessingStore.getState().effects['bloom1']).toBeUndefined();
  });

  it('should update effect parameters', () => {
    const dofEffect = {
      id: 'dof1',
      type: 'dof' as const,
      enabled: true,
      priority: 2,
      uniforms: {
        focus: { value: 10.0 },
        aperture: { value: 0.1 },
        maxBlur: { value: 1.0 }
      }
    };

    postProcessingSystem.addEffect(dofEffect);

    const updates = {
      uniforms: {
        focus: { value: 15.0 },
        aperture: { value: 0.2 }
      }
    };

    postProcessingSystem.updateEffect('dof1', updates);
    const updatedEffect = usePostProcessingStore.getState().effects['dof1'];
    expect(updatedEffect.uniforms.focus.value).toBe(15.0);
    expect(updatedEffect.uniforms.aperture.value).toBe(0.2);
  });

  it('should handle resolution changes', () => {
    const newWidth = 1920;
    const newHeight = 1080;
    const pixelRatio = 2;

    postProcessingSystem.setSize(newWidth, newHeight, pixelRatio);
    const resolution = usePostProcessingStore.getState().resolution;
    expect(resolution).toEqual(new Vector2(newWidth, newHeight));
  });

  it('should switch antialiasing methods', () => {
    // Test FXAA
    postProcessingSystem.setAntialiasing('FXAA');
    expect(usePostProcessingStore.getState().antialiasing).toBe('FXAA');

    // Test SMAA
    postProcessingSystem.setAntialiasing('SMAA');
    expect(usePostProcessingStore.getState().antialiasing).toBe('SMAA');

    // Test disabled
    postProcessingSystem.setAntialiasing('none');
    expect(usePostProcessingStore.getState().antialiasing).toBe('none');
  });

  it('should manage render loop correctly', () => {
    const renderSpy = jest.spyOn(postProcessingSystem as any, 'render');

    postProcessingSystem.start();

    // Wait for a few frames
    jest.advanceTimersByTime(50);

    expect(renderSpy).toHaveBeenCalled();

    postProcessingSystem.stop();
    renderSpy.mockClear();

    // Ensure no more renders after stopping
    jest.advanceTimersByTime(50);
    expect(renderSpy).not.toHaveBeenCalled();
  });

  it('should handle effect priorities in render order', () => {
    const effect1 = {
      id: 'effect1',
      type: 'bloom' as const,
      enabled: true,
      priority: 2,
      uniforms: {}
    };

    const effect2 = {
      id: 'effect2',
      type: 'dof' as const,
      enabled: true,
      priority: 1,
      uniforms: {}
    };

    postProcessingSystem.addEffect(effect2);
    postProcessingSystem.addEffect(effect1);

    const renderOrder = usePostProcessingStore.getState().renderOrder;
    expect(renderOrder.indexOf(effect1.id)).toBeGreaterThan(renderOrder.indexOf(effect2.id));
  });

  it('should handle cleanup properly', () => {
    const effect = {
      id: 'test',
      type: 'bloom' as const,
      enabled: true,
      priority: 1,
      uniforms: {}
    };

    postProcessingSystem.addEffect(effect);
    postProcessingSystem.cleanup();

    expect(usePostProcessingStore.getState().effects).toEqual({});
    expect(usePostProcessingStore.getState().renderOrder).toEqual([]);
  });

  it('should handle disabled state correctly', () => {
    const renderSpy = jest.spyOn(renderer, 'render');

    usePostProcessingStore.getState().setEnabled(false);
    postProcessingSystem.render(0);

    expect(renderSpy).toHaveBeenCalledWith(scene, camera);
  });

  it('should handle multiple concurrent effects', () => {
    const effects = [
      {
        id: 'bloom',
        type: 'bloom' as const,
        enabled: true,
        priority: 1,
        uniforms: { strength: { value: 1.0 } }
      },
      {
        id: 'dof',
        type: 'dof' as const,
        enabled: true,
        priority: 2,
        uniforms: { focus: { value: 10.0 } }
      },
      {
        id: 'ssao',
        type: 'ssao' as const,
        enabled: true,
        priority: 0,
        uniforms: { intensity: { value: 0.5 } }
      }
    ];

    effects.forEach(effect => postProcessingSystem.addEffect(effect));

    const storedEffects = usePostProcessingStore.getState().effects;
    expect(Object.keys(storedEffects).length).toBe(3);

    // Verify render order based on priority
    const renderOrder = usePostProcessingStore.getState().renderOrder;
    expect(renderOrder).toEqual(['ssao', 'bloom', 'dof']);
  });

  it('should emit events on effect changes', () => {
    const eventSpy = jest.spyOn(EventDispatcher, 'dispatch');

    const effect = {
      id: 'test',
      type: 'bloom' as const,
      enabled: true,
      priority: 1,
      uniforms: {}
    };

    postProcessingSystem.addEffect(effect);
    expect(eventSpy).toHaveBeenCalledWith('EFFECT_ADDED', expect.any(Object));

    postProcessingSystem.removeEffect('test');
    expect(eventSpy).toHaveBeenCalledWith('EFFECT_REMOVED', expect.any(Object));
  });
});
