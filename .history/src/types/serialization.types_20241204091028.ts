// src/types/serialization.types.ts
export interface SerializedSceneGraph {
	nodes: SerializedNode[];
}

export interface SerializedNode {
	id: string;
	position: [number, number, number];
	rotation: [number, number, number, number];
	scale: [number, number, number];
	parent?: string;
	children?: string[];
}

export interface SerializedPhysics {
	bodies: SerializedBody[];
}

export interface SerializedBody {
	id: string;
	mass: number;
	position: [number, number, number];
	velocity: [number, number, number];
	forces: [number, number, number][];
}

export interface SerializedInput {
	keys: Record<string, boolean>;
	mouse: {
		position: {
			x: number;
			y: number;
		};
		buttons: Record<number, boolean>;
	};
}
export interface SerializedData {
	version: string;
	timestamp: number;
	systems: {
		scene?: SerializedSceneGraph;
		physics?: SerializedPhysics;
		input?: SerializedInput;
		camera?: SerializedCamera;
		particles?: SerializedParticles;
	};
	state: {
		player?: SerializedPlayerState;
		game?: SerializedGameState;
		inventory?: SerializedInventory;
	};
	metadata: {
		playtime: number;
		saveDate: string;
		checksum: string;
	};
}

export interface SerializedCamera {
	// Define properties for SerializedCamera
}

export interface SerializedParticles {
	// Define properties for SerializedParticles
}

export interface SerializedPlayerState {
	// Define properties for SerializedPlayerState
}

export interface SerializedGameState {
	// Define properties for SerializedGameState
}

export interface SerializedInventory {
	// Define properties for SerializedInventory
}

export interface SerializationConfig {
	compression: boolean;
	encryption: boolean;
	validateSchema: boolean;
	backupFrequency?: number;
	maxSaveSlots?: number;
	autoSave?: boolean;
}

export interface SerializationState {
	lastSave: number;
	autoSaveEnabled: boolean;
	saveSlots: Record<string,SerializedData>;
	pending: boolean;
	error: string|null;
	setLastSave: (timestamp: number) => void;
	setSaveSlot: (slot: string,data: SerializedData) => void;
	removeSaveSlot: (slot: string) => void;
	setAutoSave: (enabled: boolean) => void;
	setPending: (pending: boolean) => void;
	setError: (error: string|null) => void;
	reset: () => void;
}
