export interface LODLevel {
	id: string;
	distance: number;  // Distance threshold for this LOD level
	geometry: BufferGeometry;
	material: Material;
}

export interface LODObject {
	id: string;
	levels: LODLevel[];
	currentLevel: number;
	position: Vector3;
	visible: boolean;
}

export interface LODState {
	objects: Record<string,LODObject>;
	addObject: (object: LODObject) => void;
	removeObject: (id: string) => void;
	updateObjectLevel: (id: string,level: number) => void;
}

export interface LODConfig {
	maxDistance: number;  // Maximum distance to render objects
	levelCount: number;   // Number of LOD levels to generate
	debug?: boolean;      // Enable debug visualization
}
