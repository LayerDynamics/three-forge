export interface OccluderObject {
	id: string;
	bounds: Box3;      // Bounding box
	position: Vector3;
	isOccluder: boolean;  // Can this object occlude others?
	isOccludable: boolean;  // Can this object be occluded?
	visible: boolean;
}

export interface OcclusionState {
	occluders: Record<string,OccluderObject>;
	addOccluder: (object: OccluderObject) => void;
	removeOccluder: (id: string) => void;
	updateVisibility: (id: string,visible: boolean) => void;
}

export interface OcclusionConfig {
	maxOccluders: number;  // Maximum number of active occluders
	cullDistance: number;  // Distance beyond which to apply occlusion
	updateFrequency: number;
	debug?: boolean;       // Enable debug visualization
}
