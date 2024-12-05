// src/types/memory.types.ts

import {Object3D,Material,BufferGeometry,Texture,AudioBuffer} from 'three';

export type MemoryObjectType=
	|'geometry'
	|'texture'
	|'audio'
	|'material'
	|'animation'
	|'physics';

export interface MemoryObject {
	id: string;
	type: MemoryObjectType;
	size: number;
	priority: number;
	lastUsed: number;
	data: Object3D|Material|BufferGeometry|Texture|AudioBuffer;
	refs: Set<string>;
	dispose: () => void;
	metadata?: Record<string,any>;
}

export interface MemoryStats {
	totalAllocated: number;
	totalAvailable: number;
	objectCount: Record<MemoryObjectType,number>;
	largestObjects: Array<{id: string; size: number; type: MemoryObjectType}>;
}

export interface MemoryConfig {
	maxMemoryMB: number;
	cleanupThreshold: number;
	minPriority: number;
	autoCleanup: boolean;
	monitoringInterval: number;
	debug?: boolean;
}

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
