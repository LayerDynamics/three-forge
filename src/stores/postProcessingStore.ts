// src/stores/postProcessingStore.ts

import {create} from 'zustand';
import {PostProcessingState} from '../types/postProcessing.types';
import {Vector2} from 'three';

export const usePostProcessingStore=create<PostProcessingState>((set,get) => ({
    composer: null,
    effects: {},
    renderOrder: [],
    resolution: new Vector2(1920,1080),
    enabled: true,
    presets: {
        default: {
            bloom: {
                strength: 1,
                radius: 0.5,
                threshold: 0.8,
                exposure: 1
            },
            dof: {
                focus: 10,
                aperture: 0.1,
                maxBlur: 1.0,
                bokehScale: 1
            }
        },
        performance: {
            bloom: {
                strength: 0.5,
                radius: 0.3,
                threshold: 0.9,
                exposure: 1
            },
            dof: {
                focus: 10,
                aperture: 0.05,
                maxBlur: 0.5,
                bokehScale: 0.5
            }
        }
    },
    antialiasing: 'SMAA',

    addEffect: (effect) => set(state => ({
        effects: {...state.effects,[effect.id]: effect},
        renderOrder: [...state.renderOrder,effect.id]
    })),

    removeEffect: (id) => set(state => {
        const {[id]: removed,...remainingEffects}=state.effects;
        return {
            effects: remainingEffects,
            renderOrder: state.renderOrder.filter(effectId => effectId!==id)
        };
    }),

    updateEffect: (id,updates) => set(state => ({
        effects: {
            ...state.effects,
            [id]: {...state.effects[id],...updates}
        }
    })),

    setEnabled: (enabled) => set({enabled}),

    setResolution: (resolution) => set({resolution}),

    setRenderOrder: (order) => set({renderOrder: order}),

    setAntialiasing: (method) => set({antialiasing: method}),

    reset: () => set({
        effects: {},
        renderOrder: [],
        enabled: true,
        antialiasing: 'SMAA'
    })
}));
