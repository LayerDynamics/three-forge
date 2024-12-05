export interface PostProcessingEffect {
    id: string;
    type: 'bloom'|'dof'|'ssao'|'motionBlur';
    enabled: boolean;
    priority: number;
    uniforms: Record<string,any>;
    parameters: Record<string,number>;
}

export interface BloomParameters {
    intensity: number;
    threshold: number;
    radius: number;
}

export interface DOFParameters {
    focusDistance: number;
    focalLength: number;
    bokehScale: number;
}

export interface PostProcessingState {
    effects: Record<string,PostProcessingEffect>;
    renderOrder: string[];
    resolution: Vector2;
    enabled: boolean;
}

export interface PostProcessingConfig {
    defaultEffects: PostProcessingEffect[];
    antialiasing: 'FXAA'|'SMAA'|'none';
    HDR: boolean;
}
