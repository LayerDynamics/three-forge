// src/stores/particleStore.ts

import {create} from 'zustand';
import {Particle,Emitter,ParticleSystemState} from '../types/particle.types';
import {Vector3,Color} from 'three';

export const useParticleStore=create<ParticleSystemState>((set,get) => ({
	particles: {},
	emitters: {},
	active: true,
	particleCount: 0,

	addParticle: (particle: Particle) => set(state => ({
		particles: {...state.particles,[particle.id]: particle},
		particleCount: state.particleCount+1
	})),

	removeParticle: (id: string) => set(state => {
		const {[id]: removed,...remaining}=state.particles;
		return {
			particles: remaining,
			particleCount: state.particleCount-1
		};
	}),

	updateParticle: (id: string,updates: Partial<Particle>) => set(state => ({
		particles: {
			...state.particles,
			[id]: {...state.particles[id],...updates}
		}
	})),

	addEmitter: (emitter: Emitter) => set(state => ({
		emitters: {...state.emitters,[emitter.id]: emitter}
	})),

	removeEmitter: (id: string) => set(state => {
		const {[id]: removed,...remaining}=state.emitters;
		return {emitters: remaining};
	}),

	updateEmitter: (id: string,updates: Partial<Emitter>) => set(state => ({
		emitters: {
			...state.emitters,
			[id]: {...state.emitters[id],...updates}
		}
	})),

	setActive: (active: boolean) => set({active}),

	reset: () => set({
		particles: {},
		emitters: {},
		active: true,
		particleCount: 0
	})
}));
