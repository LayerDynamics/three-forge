// src/hooks/usePostProcessing.ts

import {useEffect,useCallback} from 'react';
import {Vector2} from 'three';
import {PostProcessingSystem} from '../systems/PostProcessingSystem/PostProcessingSystem';
import {usePostProcessingStore} from '../stores/postProcessingStore';
import {PostProcessingEffect} from '../types/postProcessing.types';

export const usePostProcessing=() => {
    const system=PostProcessingSystem.getInstance();

    useEffect(() => {
        system.start();
        return () => {
            system.stop();
        };
    },[]);

    const addEffect=useCallback((effect: PostProcessingEffect) => {
        system.addEffect(effect);
    },[]);

    const removeEffect=useCallback((id: string) => {
        system.removeEffect(id);
    },[]);

    const updateEffect=useCallback((id: string,updates: Partial<PostProcessingEffect>) => {
        system.updateEffect(id,updates);
    },[]);

    const setResolution=useCallback((width: number,height: number,pixelRatio?: number) => {
        system.setSize(width,height,pixelRatio);
    },[]);

    const setAntialiasing=useCallback((method: 'FXAA'|'SMAA'|'none') => {
        system.setAntialiasing(method);
    },[]);

    return {
        addEffect,
        removeEffect,
        updateEffect,
        setResolution,
        setAntialiasing,
        effects: usePostProcessingStore(state => state.effects),
        enabled: usePostProcessingStore(state => state.enabled),
        resolution: usePostProcessingStore(state => state.resolution),
        antialiasing: usePostProcessingStore(state => state.antialiasing)
    };
};
