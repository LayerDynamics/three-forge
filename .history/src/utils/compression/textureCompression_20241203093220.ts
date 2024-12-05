// src/utils/compression/textureCompression.ts

import { CompressedTexture } from 'three';

interface TextureCompressionOptions {
  format: 'webp' | 'basis' | 'ktx2';
  quality: number; // 0-100
  generateMipmaps: boolean;
  powerOfTwo: boolean;
  maxDimension?: number;
}

export class TextureCompressor {
  private static instance: TextureCompressor | null = null;

  private constructor() {}

  public static getInstance(): TextureCompressor {
    if (!TextureCompressor.instance) {
      TextureCompressor.instance = new TextureCompressor();
    }
    return TextureCompressor.instance;
  }

  public async compressTexture(
    imageData: ArrayBuffer,
    options: TextureCompressionOptions
  ): Promise<ArrayBuffer> {
    try {
      const image = await this.createImageFromBuffer(imageData);
      const canvas = this.createCanvas(image, options);
      const compressedData = await this.compressCanvasToFormat(canvas, options);

      return compressedData;
    } catch (error) {
      console.error('Texture compression failed:', error);
      throw error;
    }
  }

  private async createImageFromBuffer(buffer: ArrayBuffer): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const blob = new Blob([buffer]);
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
  }

  private createCanvas(
    image: HTMLImageElement,
    options: TextureCompressionOptions
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    let width = image.width;
    let height = image.height;

    if (options.powerOfTwo) {
      width = this.nextPowerOfTwo(width);
      height = this.nextPowerOfTwo(height);
    }

    if (options.maxDimension) {
      const scale = Math.min(1, options.maxDimension / Math.max(width, height));
      width *= scale;
      height *= scale;
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');

    ctx.drawImage(image, 0, 0, width, height);
    return canvas;
  }

  private async compressCanvasToFormat(
    canvas: HTMLCanvasElement,
    options: TextureCompressionOptions
  ): Promise<ArrayBuffer> {
    switch (options.format) {
      case 'webp':
        return this.compressToWebP(canvas, options.quality);
      case 'basis':
        return this.compressToBasis(canvas);
      case 'ktx2':
        return this.compressToKTX2(canvas);
      default:
        throw new Error(`Unsupported compression format: ${options.format}`);
    }
  }

  private async compressToWebP(
    canvas: HTMLCanvasElement,
    quality: number
  ): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            reject(new Error('Failed to create WebP blob'));
            return;
          }
          try {
            const arrayBuffer = await blob.arrayBuffer();
            resolve(arrayBuffer);
          } catch (error) {
            reject(error);
          }
        },
        'image/webp',
        quality / 100
      );
    });
  }

  private async compressToBasis(canvas: HTMLCanvasElement): Promise<ArrayBuffer> {
    // Basis implementation would go here - requires basis_encoder.js
    throw new Error('Basis compression not implemented');
  }

  private async compressToKTX2(canvas: HTMLCanvasElement): Promise<ArrayBuffer> {
    // KTX2 implementation would go here - requires ktx2_encoder.js
    throw new Error('KTX2 compression not implemented');
  }

  private nextPowerOfTwo(value: number): number {
    return Math.pow(2, Math.ceil(Math.log2(value)));
  }
}
