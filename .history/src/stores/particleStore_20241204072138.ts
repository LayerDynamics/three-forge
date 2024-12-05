// src/stores/particleStore.ts

import {create from 'zustand';
import {Particle,Emitter} from '../types/particle.types';

interface ParticleState {
	particles: Record<string,Particle>;
	emitters: Record<string,Emitter>;
	active: boolean;
	particleCount: number;
	addParticle: (particle: Particle) => void;
	removeParticle: (id: string) => void;
	updateParticle: (id: string,particle: Particle) => void;
	addEmitter: (emitter: Emitter) => void;
	removeEmitter: (id: string) => void;
	setActive: (active: boolean) => void;
	reset: () => void;
}

export const useParticleStore=create<ParticleState>((set) => ({
	particles: {},
	emitters: {},
	active: false,
	particleCount: 0,

	addParticle: (particle: Particle) =>
		set((state) => ({
			particles: {...state.particles,[particle.id]: particle},
			particleCount: state.particleCount+1,
		})),

	removeParticle: (id: string) =>
		set((state) => {
			const {[id]: removed,...remainingParticles}=state.particles;
			return {
				particles: remainingParticles,
				particleCount: state.particleCount>0? state.particleCount-1:0,
			};
		}),

	updateParticle: (id: string,particle: Particle) =>
		set((state) => ({
			particles: {...state.particles,[id]: {...state.particles[id],...particle}},
		})),

	addEmitter: (emitter: Emitter) =>
		set((state) => ({
			emitters: {...state.emitters,[emitter.config.id]: emitter},
		})),

	removeEmitter: (id: string) =>
		set((state) => {
			const {[id]: removed,...remainingEmitters}=state.emitters;
			return {
				emitters: remainingEmitters,
			};
		}),

	setActive: (active: boolean) =>
		set({
			active,
		}),

	reset: () =>
		set({
			particles: {},
			emitters: {},
			active: false,
			particleCount: 0,
		}),
}));
