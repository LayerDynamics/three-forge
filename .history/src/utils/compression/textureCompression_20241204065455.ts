// src/utils/compression/textureCompression.ts

import {CompressedTexture} from 'three';
import {loadScript} from '../loadScript';

interface TextureCompressionOptions {
	format: 'webp'|'basis'|'ktx2';
	quality: number; // 0-100
	generateMipmaps: boolean;
	powerOfTwo: boolean;
	maxDimension?: number;
}

type BasisModule={
	compress: (imageData: Uint8Array,quality: number) => Uint8Array;
	// Add other necessary functions exposed by Basis Transcoder
};

type KTX2Module={
	compress: (imageData: Uint8Array,quality: number) => Uint8Array;
	// Add other necessary functions exposed by KTX2 Encoder
};

declare global {
	interface Window {
		BasisTranscoder: () => Promise<BasisModule>;
		Libktx: () => Promise<KTX2Module>;
	}
}

export class TextureCompressor {
	private static instance: TextureCompressor|null=null;

	private basisModule: BasisModule|null=null;
	private ktx2Module: KTX2Module|null=null;

	private constructor() {}

	public static getInstance(): TextureCompressor {
		if(!TextureCompressor.instance) {
			TextureCompressor.instance=new TextureCompressor();
		}
		return TextureCompressor.instance;
	}

	/**
	 * Compresses the given image data based on the specified options.
	 * @param imageData The raw image data as an ArrayBuffer.
	 * @param options Compression options.
	 * @returns A Promise that resolves to the compressed image data as an ArrayBuffer.
	 */
	public async compressTexture(
		imageData: ArrayBuffer,
		options: TextureCompressionOptions
	): Promise<ArrayBuffer> {
		try {
			const image=await this.createImageFromBuffer(imageData);
			const canvas=this.createCanvas(image,options);
			const compressedData=await this.compressCanvasToFormat(canvas,options);

			return compressedData;
		} catch(error) {
			console.error('Texture compression failed:',error);
			throw error;
		}
	}

	/**
	 * Loads and initializes the Basis Transcoder module.
	 */
	private async loadBasisModule(): Promise<void> {
		if(this.basisModule) return; // Already loaded

		await loadScript('/encoders/basis_transcoder/basis_transcoder.js');

		if((window as any).BasisTranscoder) {
			// Initialize the module
			this.basisModule=await (window as any).BasisTranscoder();
		} else {
			throw new Error('BasisTranscoder module not found on window');
		}
	}

	/**
	 * Loads and initializes the KTX2 Encoder module.
	 */
	private async loadKTX2Module(): Promise<void> {
		if(this.ktx2Module) return; // Already loaded

		await loadScript('/encoders/ktx2_encoder/libktx.js');

		if((window as any).Libktx) {
			// Initialize the module
			this.ktx2Module=await (window as any).Libktx();
		} else {
			throw new Error('Libktx module not found on window');
		}
	}

	/**
	 * Compresses the canvas to the specified format.
	 * @param canvas The canvas element containing the image.
	 * @param options Compression options.
	 * @returns A Promise that resolves to the compressed image data as an ArrayBuffer.
	 */
	private async compressCanvasToFormat(
		canvas: HTMLCanvasElement,
		options: TextureCompressionOptions
	): Promise<ArrayBuffer> {
		switch(options.format) {
			case 'webp':
				return this.compressToWebP(canvas,options.quality);
			case 'basis':
				return this.compressToBasis(canvas,options.quality);
			case 'ktx2':
				return this.compressToKTX2(canvas,options.quality);
			default:
				throw new Error(`Unsupported compression format: ${options.format}`);
		}
	}

	/**
	 * Compresses the canvas to WebP format.
	 * @param canvas The canvas element containing the image.
	 * @param quality Compression quality (0-100).
	 * @returns A Promise that resolves to the compressed WebP image data as an ArrayBuffer.
	 */
	private async compressToWebP(
		canvas: HTMLCanvasElement,
		quality: number
	): Promise<ArrayBuffer> {
		return new Promise((resolve,reject) => {
			canvas.toBlob(
				async (blob) => {
					if(!blob) {
						reject(new Error('Failed to create WebP blob'));
						return;
					}
					try {
						const arrayBuffer=await blob.arrayBuffer();
						resolve(arrayBuffer);
					} catch(error) {
						reject(error);
					}
				},
				'image/webp',
				quality/100
			);
		});
	}

	/**
	 * Compresses the canvas using the Basis Transcoder.
	 * @param canvas The canvas element containing the image.
	 * @param quality Compression quality (0-100).
	 * @returns A Promise that resolves to the compressed Basis image data as an ArrayBuffer.
	 */
	private async compressToBasis(
		canvas: HTMLCanvasElement,
		quality: number
	): Promise<ArrayBuffer> {
		await this.loadBasisModule();

		if(!this.basisModule) {
			throw new Error('Basis Transcoder module is not loaded');
		}

		// Convert canvas to raw pixel data (RGBA)
		const ctx=canvas.getContext('2d');
		if(!ctx) throw new Error('Failed to get 2D context');

		const imageData=ctx.getImageData(0,0,canvas.width,canvas.height);
		const pixelData=new Uint8Array(imageData.data.buffer);

		// Use the Basis Transcoder to compress the pixel data
		const compressedData=this.basisModule.compress(pixelData,quality);

		return compressedData.buffer;
	}

	/**
	 * Compresses the canvas using the KTX2 Encoder.
	 * @param canvas The canvas element containing the image.
	 * @param quality Compression quality (0-100).
	 * @returns A Promise that resolves to the compressed KTX2 image data as an ArrayBuffer.
	 */
	private async compressToKTX2(
		canvas: HTMLCanvasElement,
		quality: number
	): Promise<ArrayBuffer> {
		await this.loadKTX2Module();

		if(!this.ktx2Module) {
			throw new Error('KTX2 Encoder module is not loaded');
		}

		// Convert canvas to raw pixel data (RGBA)
		const ctx=canvas.getContext('2d');
		if(!ctx) throw new Error('Failed to get 2D context');

		const imageData=ctx.getImageData(0,0,canvas.width,canvas.height);
		const pixelData=new Uint8Array(imageData.data.buffer);

		// Use the KTX2 Encoder to compress the pixel data
		const compressedData=this.ktx2Module.compress(pixelData,quality);

		return compressedData.buffer;
	}

	/**
	 * Creates an HTMLImageElement from an ArrayBuffer.
	 * @param buffer The image data as an ArrayBuffer.
	 * @returns A Promise that resolves to the loaded HTMLImageElement.
	 */
	private async createImageFromBuffer(buffer: ArrayBuffer): Promise<HTMLImageElement> {
		return new Promise((resolve,reject) => {
			const blob=new Blob([buffer]);
			const img=new Image();
			img.onload=() => {
				URL.revokeObjectURL(img.src); // Clean up
				resolve(img);
			};
			img.onerror=reject;
			img.src=URL.createObjectURL(blob);
		});
	}

	/**
	 * Creates a canvas element from an HTMLImageElement based on the specified options.
	 * @param image The loaded HTMLImageElement.
	 * @param options Compression options.
	 * @returns The created HTMLCanvasElement.
	 */
	private createCanvas(
		image: HTMLImageElement,
		options: TextureCompressionOptions
	): HTMLCanvasElement {
		const canvas=document.createElement('canvas');
		let width=image.width;
		let height=image.height;

		if(options.powerOfTwo) {
			width=this.nextPowerOfTwo(width);
			height=this.nextPowerOfTwo(height);
		}

		if(options.maxDimension) {
			const scale=Math.min(1,options.maxDimension/Math.max(width,height));
			width=Math.round(width*scale);
			height=Math.round(height*scale);
		}

		canvas.width=width;
		canvas.height=height;

		const ctx=canvas.getContext('2d');
		if(!ctx) throw new Error('Failed to get 2D context');

		ctx.drawImage(image,0,0,width,height);
		return canvas;
	}

	/**
	 * Calculates the next power of two for a given value.
	 * @param value The input number.
	 * @returns The next power of two.
	 */
	private nextPowerOfTwo(value: number): number {
		return Math.pow(2,Math.ceil(Math.log2(value)));
	}
}
