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
}

export interface SerializationConfig {
	compression: boolean;
	encryption: boolean;
	validateSchema: boolean;
	backupFrequency?: number;
}

export interface SerializationState {
	lastSave: number;
	autoSaveEnabled: boolean;
	saveSlots: Record<string,SerializedData>;
	pending: boolean;
}
