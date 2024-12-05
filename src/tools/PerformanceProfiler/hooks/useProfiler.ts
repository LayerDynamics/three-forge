import {create} from 'zustand';
import {useFrame} from '@react-three/fiber';
import {useCallback,useEffect} from 'react';

export interface MetricsData {
	fps: number;
	frameTime: number;
	memory: number;
	history: Array<{timestamp: number; fps: number}>;
	systemTimings: Array<{name: string; time: number}>;
	physics: {
		bodies: number;
		collisions: number;
		updateTime: number;
	};
	animation: {
		active: number;
		updateTime: number;
	};
	particles: {
		count: number;
		emitters: number;
		updateTime: number;
	};
	sceneGraph: {
		objects: number;
		depth: number;
		updateTime: number;
	};
}

interface ProfilerState {
	isVisible: boolean;
	metrics: MetricsData;
	toggleVisibility: () => void;
	updateMetrics: (data: Partial<MetricsData>) => void;
}

export const useProfiler=create<ProfilerState>((set) => ({
	isVisible: false,
	metrics: {
		fps: 0,
		frameTime: 0,
		memory: 0,
		history: [],
		systemTimings: [],
		physics: {bodies: 0,collisions: 0,updateTime: 0},
		animation: {active: 0,updateTime: 0},
		particles: {count: 0,emitters: 0,updateTime: 0},
		sceneGraph: {objects: 0,depth: 0,updateTime: 0},
	},
	toggleVisibility: () => set((state) => ({isVisible: !state.isVisible})),
	updateMetrics: (data) => set((state) => ({
		metrics: {...state.metrics,...data}
	})),
}));

export const useProfilerMetrics=() => {
	const updateMetrics=useProfiler((state) => state.updateMetrics);
	const lastTime=useRef(performance.now());

	useFrame((state) => {
		const currentTime=performance.now();
		const deltaTime=currentTime-lastTime.current;
		lastTime.current=currentTime;

		const fps=1000/deltaTime;
		const memory=(performance as any).memory?.usedJSHeapSize||0;

		updateMetrics({
			fps,
			frameTime: deltaTime,
			memory,
			history: [
				...state.metrics.history.slice(-99),
				{timestamp: currentTime,fps}
			],
		});
	});

	// Poll system metrics
	useEffect(() => {
		const interval=setInterval(() => {
			// Get metrics from various systems
			const physicsMetrics=PhysicsSystem.getInstance().getMetrics();
			const animationMetrics=AnimationSystem.getInstance().getMetrics();
			const particleMetrics=ParticleSystem.getInstance().getMetrics();
			const sceneGraphMetrics=SceneGraphSystem.getInstance().getMetrics();

			updateMetrics({
				physics: physicsMetrics,
				animation: animationMetrics,
				particles: particleMetrics,
				sceneGraph: sceneGraphMetrics,
				systemTimings: [
					{name: 'Physics',time: physicsMetrics.updateTime},
					{name: 'Animation',time: animationMetrics.updateTime},
					{name: 'Particles',time: particleMetrics.updateTime},
					{name: 'SceneGraph',time: sceneGraphMetrics.updateTime},
				],
			});
		},1000);

		return () => clearInterval(interval);
	},[]);
};