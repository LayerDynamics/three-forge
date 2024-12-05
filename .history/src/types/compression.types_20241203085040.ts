export interface CompressionConfig {
	textures: {
		format: "webp"|"basis"|"ktx2";
		quality: number;
		mipmap: boolean;
	};
	models: {
		draco: {
			enabled: boolean;
			level: number;
		};
		meshopt: {
			enabled: boolean;
			tolerance: number;
		};
	};
	audio: {
		format: "mp3"|"ogg";
		bitrate: number;
	};
}

export interface CompressionJob {
	id: string;
	type: "texture"|"model"|"audio";
	input: ArrayBuffer;
	config: Partial<CompressionConfig>;
}

export interface CompressionResult {
	id: string;
	compressed: ArrayBuffer;
	originalSize: number;
	compressedSize: number;
	format: string;
}
