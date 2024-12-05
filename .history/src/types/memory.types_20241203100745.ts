// src/types/memory.types.ts

import {Object3D,Material,BufferGeometry,Texture,AudioBuffer} from 'three';

/**
 * Extended MemoryObjectType to include all necessary types.
 */
export type MemoryObjectType=
	|"model"
	|"texture"
	|"sound"
	|"video"
	|"other"
	|"geometry"
	|"audio"
	|"material"
	|"animation"
	|"physics";

/**
 * Interface representing a memory-managed object.
 */
export interface MemoryObject {
	id: string;
	type: MemoryObjectType;
	size: number;
	priority: number;
	lastUsed: number;
	data: any;
	refs: Set<string>;
	dispose: () => void;
}

/**
 * Interface representing memory statistics.
 */
export interface MemoryStats {
	totalMemory: number;
	maxMemory: number;
	objectCount: Record<MemoryObjectType,number>;
	largestObjects: Array<{id: string; size: number; type: MemoryObjectType}>;
}

/**
 * Interface for MemorySystem configuration.
 */
export interface MemoryConfig {
	maxMemoryMB: number;
	cleanupThreshold: number;
	minPriority: number;
	autoCleanup: boolean;
	monitoringInterval: number;
	debug?: boolean;
}

/**
 * Interface for MemoryStore state managed by Zustand.
 */
export interface MemoryState {
	objects: Record<string,MemoryObject>;
	totalMemory: number;
	maxMemory: number;
	stats: MemoryStats;
	lastCleanup: number;
	addObject: (object: MemoryObject) => void;
	removeObject: (id: string) => void;
	updateUsage: (id: string) => void;
	addReference: (id: string,refId: string) => void;
	removeReference: (id: string,refId: string) => void;
	getStats: () => MemoryStats;
}
