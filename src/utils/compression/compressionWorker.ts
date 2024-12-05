
// src/utils/compression/compressionWorker.ts

interface CompressionJob {
	id: string;
	type: 'texture'|'model'|'audio';
	data: ArrayBuffer;
	options: any;
}

interface CompressionResult {
	id: string;
	type: 'texture'|'model'|'audio';
	data: ArrayBuffer;
	originalSize: number;
	compressedSize: number;
	error?: string;
}

class CompressionWorker {
	private textureCompressor: TextureCompressor;
	private modelCompressor: ModelCompressor;
	private audioCompressor: AudioCompressor;

	constructor() {
		this.textureCompressor=TextureCompressor.getInstance();
		this.modelCompressor=ModelCompressor.getInstance();
		this.audioCompressor=AudioCompressor.getInstance();

		self.onmessage=this.handleMessage.bind(this);
	}

	private async handleMessage(event: MessageEvent<CompressionJob>): Promise<void> {
		const {id,type,data,options}=event.data;

		try {
			const originalSize=data.byteLength;
			const compressedData=await this.compressData(type,data,options);

			const result: CompressionResult={
				id,
				type,
				data: compressedData,
				originalSize,
				compressedSize: compressedData.byteLength
			};

			self.postMessage(result,[result.data]);
		} catch(error) {
			self.postMessage({
				id,
				type,
				error: error.message,
				originalSize: data.byteLength,
				compressedSize: 0
			});
		}
	}

	private async compressData(
		type: CompressionJob['type'],
		data: ArrayBuffer,
		options: any
	): Promise<ArrayBuffer> {
		switch(type) {
			case 'texture':
				return this.textureCompressor.compressTexture(data,options);
			case 'model':
				return this.modelCompressor.compressModel(data,options);
			case 'audio':
				return this.audioCompressor.compressAudio(data,options);
			default:
				throw new Error(`Unsupported compression type: ${type}`);
		}
	}
}

// Initialize the worker
new CompressionWorker();
