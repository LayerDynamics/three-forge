// src/utils/compression/audioCompression.ts

import { Buffer } from 'buffer';
import lamejs from 'lamejs'; // Ensure lamejs is installed: npm install lamejs
import OpusEncoder from 'opus-recorder'; // Ensure opus-recorder is installed: npm install opus-recorder

interface AudioCompressionOptions {
    format: 'mp3' | 'ogg' | 'opus';
    bitrate: number;
    sampleRate?: number;
    channels?: number;
    normalize?: boolean;
}

export class AudioCompressor {
    private static instance: AudioCompressor | null = null;

    private constructor() {}

    public static getInstance(): AudioCompressor {
        if (!AudioCompressor.instance) {
            AudioCompressor.instance = new AudioCompressor();
        }
        return AudioCompressor.instance;
    }

    public async compressAudio(
        audioData: ArrayBuffer,
        options: AudioCompressionOptions
    ): Promise<ArrayBuffer> {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const audioBuffer = await audioContext.decodeAudioData(audioData);

            if (options.normalize) {
                this.normalizeAudio(audioBuffer);
            }

            const compressedData = await this.encodeAudioFormat(audioBuffer, options);
            audioContext.close();

            return compressedData;
        } catch (error) {
            console.error('Audio compression failed:', error);
            throw error;
        }
    }

    private normalizeAudio(audioBuffer: AudioBuffer): void {
        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
            const data = audioBuffer.getChannelData(channel);
            let maxSample = 0;

            // Find the maximum sample
            for (let i = 0; i < data.length; i++) {
                maxSample = Math.max(Math.abs(data[i]), maxSample);
            }

            // Normalize if needed
            if (maxSample > 1) {
                const scaleFactor = 1 / maxSample;
                for (let i = 0; i < data.length; i++) {
                    data[i] *= scaleFactor;
                }
            }
        }
    }

    private async encodeAudioFormat(
        audioBuffer: AudioBuffer,
        options: AudioCompressionOptions
    ): Promise<ArrayBuffer> {
        switch (options.format) {
            case 'mp3':
                return this.encodeMP3(audioBuffer, options);
            case 'ogg':
                return this.encodeOGG(audioBuffer, options);
            case 'opus':
                return this.encodeOpus(audioBuffer, options);
            default:
                throw new Error(`Unsupported audio format: ${options.format}`);
        }
    }

    private async encodeMP3(
        audioBuffer: AudioBuffer,
        options: AudioCompressionOptions
    ): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            try {
                const mp3encoder = new lamejs.Mp3Encoder(
                    audioBuffer.numberOfChannels,
                    audioBuffer.sampleRate,
                    options.bitrate
                );

                const samplesLeft = audioBuffer.getChannelData(0);
                const samplesRight = audioBuffer.numberOfChannels > 1 ? audioBuffer.getChannelData(1) : undefined;

                const sampleBlockSize = 1152;
                let mp3Data: Uint8Array[] = [];

                for (let i = 0; i < samplesLeft.length; i += sampleBlockSize) {
                    const leftChunk = samplesLeft.subarray(i, i + sampleBlockSize);
                    let rightChunk: Float32Array | undefined = undefined;

                    if (samplesRight) {
                        rightChunk = samplesRight.subarray(i, i + sampleBlockSize);
                    }

                    const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
                    if (mp3buf.length > 0) {
                        mp3Data.push(new Uint8Array(mp3buf));
                    }
                }

                const mp3buf = mp3encoder.flush();
                if (mp3buf.length > 0) {
                    mp3Data.push(new Uint8Array(mp3buf));
                }

                // Combine all mp3 data
                const combined = new Uint8Array(mp3Data.reduce((acc, val) => acc + val.length, 0));
                let offset = 0;
                for (const chunk of mp3Data) {
                    combined.set(chunk, offset);
                    offset += chunk.length;
                }

                resolve(combined.buffer);
            } catch (error) {
                reject(error);
            }
        });
    }

    private async encodeOGG(
        audioBuffer: AudioBuffer,
        options: AudioCompressionOptions
    ): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            try {
                // OGG encoding is not directly supported in the browser.
                // You would need to use a WebAssembly module or an external library.
                // For demonstration, we throw an error.
                // Implement OGG encoding using a suitable library here.
                throw new Error('OGG encoding not implemented');
            } catch (error) {
                reject(error);
            }
        });
    }

    private async encodeOpus(
        audioBuffer: AudioBuffer,
        options: AudioCompressionOptions
    ): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            try {
                // Initialize Opus Encoder
                const encoder = new OpusEncoder(audioBuffer.sampleRate, audioBuffer.numberOfChannels, OpusEncoder.Application.AUDIO);

                const samplesLeft = audioBuffer.getChannelData(0);
                const samplesRight = audioBuffer.numberOfChannels > 1 ? audioBuffer.getChannelData(1) : undefined;

                const frameSize = 960; // 20ms at 48kHz
                let opusData: Uint8Array[] = [];

                for (let i = 0; i < samplesLeft.length; i += frameSize) {
                    const leftChunk = samplesLeft.slice(i, i + frameSize);
                    let rightChunk: Float32Array | undefined = undefined;

                    if (samplesRight) {
                        rightChunk = samplesRight.slice(i, i + frameSize);
                    }

                    const encoded = encoder.encode(leftChunk, rightChunk);
                    if (encoded.length > 0) {
                        opusData.push(encoded);
                    }
                }

                // Combine all opus data
                const totalLength = opusData.reduce((acc, val) => acc + val.length, 0);
                const combined = new Uint8Array(totalLength);
                let offset = 0;
                for (const chunk of opusData) {
                    combined.set(chunk, offset);
                    offset += chunk.length;
                }

                encoder.finish();
                resolve(combined.buffer);
            } catch (error) {
                reject(error);
            }
        });
    }
}
