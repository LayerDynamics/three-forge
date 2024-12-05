// src/utils/compression/audioCompression.ts

import {Buffer} from 'buffer';
import lamejs from 'lamejs'; // Ensure lamejs is installed: npm install lamejs
import OpusEncoderLib from 'opus-recorder'; // Ensure opus-recorder is installed: npm install opus-recorder
import {createFFmpeg,fetchFile} from '@ffmpeg/ffmpeg'; // Ensure ffmpeg.wasm is installed: npm install @ffmpeg/ffmpeg @ffmpeg/core

interface AudioCompressionOptions {
	format: 'mp3'|'ogg'|'opus';
	bitrate: number;
	sampleRate?: number;
	channels?: number;
	normalize?: boolean;
}

const ffmpeg=createFFmpeg({log: true});

export class AudioCompressor {
	private static instance: AudioCompressor|null=null;

	private constructor() {}

	public static getInstance(): AudioCompressor {
		if(!AudioCompressor.instance) {
			AudioCompressor.instance=new AudioCompressor();
		}
		return AudioCompressor.instance;
	}

	public async compressAudio(
		audioData: ArrayBuffer,
		options: AudioCompressionOptions
	): Promise<ArrayBuffer> {
		try {
			const audioContext=new (window.AudioContext||(window as any).webkitAudioContext)();
			const audioBuffer=await audioContext.decodeAudioData(audioData);

			if(options.normalize) {
				this.normalizeAudio(audioBuffer);
			}

			const compressedData=await this.encodeAudioFormat(audioBuffer,options);
			audioContext.close();

			return compressedData;
		} catch(error) {
			console.error('Audio compression failed:',error);
			throw error;
		}
	}

	private normalizeAudio(audioBuffer: AudioBuffer): void {
		for(let channel=0;channel<audioBuffer.numberOfChannels;channel++) {
			const data=audioBuffer.getChannelData(channel);
			let maxSample=0;

			// Find the maximum sample
			for(let i=0;i<data.length;i++) {
				maxSample=Math.max(Math.abs(data[i]),maxSample);
			}

			// Normalize if needed
			if(maxSample>1) {
				const scaleFactor=1/maxSample;
				for(let i=0;i<data.length;i++) {
					data[i]*=scaleFactor;
				}
			}
		}
	}

	private async encodeAudioFormat(
		audioBuffer: AudioBuffer,
		options: AudioCompressionOptions
	): Promise<ArrayBuffer> {
		switch(options.format) {
			case 'mp3':
				return this.encodeMP3(audioBuffer,options);
			case 'ogg':
				return this.encodeOGG(audioBuffer,options);
			case 'opus':
				return this.encodeOpus(audioBuffer,options);
			default:
				throw new Error(`Unsupported audio format: ${options.format}`);
		}
	}

	private async encodeMP3(
		audioBuffer: AudioBuffer,
		options: AudioCompressionOptions
	): Promise<ArrayBuffer> {
		return new Promise((resolve,reject) => {
			try {
				const mp3encoder=new lamejs.Mp3Encoder(
					audioBuffer.numberOfChannels,
					audioBuffer.sampleRate,
					options.bitrate
				);

				const samplesLeft=audioBuffer.getChannelData(0);
				const samplesRight=audioBuffer.numberOfChannels>1? audioBuffer.getChannelData(1):undefined;

				const sampleBlockSize=1152;
				let mp3Data: Uint8Array[]=[];

				for(let i=0;i<samplesLeft.length;i+=sampleBlockSize) {
					const leftChunk=samplesLeft.subarray(i,i+sampleBlockSize);
					let rightChunk: Float32Array|undefined=undefined;

					if(samplesRight) {
						rightChunk=samplesRight.subarray(i,i+sampleBlockSize);
					}

					const mp3buf=mp3encoder.encodeBuffer(leftChunk,rightChunk);
					if(mp3buf.length>0) {
						mp3Data.push(new Uint8Array(mp3buf));
					}
				}

				const mp3buf=mp3encoder.flush();
				if(mp3buf.length>0) {
					mp3Data.push(new Uint8Array(mp3buf));
				}

				// Combine all mp3 data
				const combined=new Uint8Array(mp3Data.reduce((acc,val) => acc+val.length,0));
				let offset=0;
				for(const chunk of mp3Data) {
					combined.set(chunk,offset);
					offset+=chunk.length;
				}

				resolve(combined.buffer);
			} catch(error) {
				reject(error);
			}
		});
	}

	private async encodeOGG(
		audioBuffer: AudioBuffer,
		options: AudioCompressionOptions
	): Promise<ArrayBuffer> {
		return new Promise(async (resolve,reject) => {
			try {
				if(!ffmpeg.isLoaded()) {
					await ffmpeg.load();
				}

				// Convert AudioBuffer to WAV Blob
				const wavBlob=this.audioBufferToWav(audioBuffer);
				const wavFile=new File([wavBlob],'input.wav');

				ffmpeg.FS('writeFile','input.wav',await fetchFile(wavFile));

				// Choose codec based on additional options if necessary
				const codec='libvorbis'; // or 'libopus' based on requirements

				const outputFile=`output.ogg`;

				await ffmpeg.run('-i','input.wav','-c:a',codec,'-b:a',`${options.bitrate}k`,outputFile);

				const data=ffmpeg.FS('readFile',outputFile);

				// Clean up
				ffmpeg.FS('unlink','input.wav');
				ffmpeg.FS('unlink',outputFile);

				resolve(data.buffer);
			} catch(error) {
				console.error('OGG encoding failed:',error);
				reject(error);
			}
		});
	}

	private async encodeOpus(
		audioBuffer: AudioBuffer,
		options: AudioCompressionOptions
	): Promise<ArrayBuffer> {
		return new Promise((resolve,reject) => {
			try {
				const workerPath='path/to/encoderWorker.min.js'; // Ensure the worker script is correctly referenced

				const recorder=new OpusEncoderLib.OpusRecorder({
					encoderSampleRate: audioBuffer.sampleRate,
					numberOfChannels: audioBuffer.numberOfChannels,
					encoderPath: workerPath,
				});

				const chunks: Uint8Array[]=[];

				recorder.ondataavailable=(e: any) => {
					if(e.data.length>0) {
						chunks.push(e.data);
					}
				};

				recorder.onerror=(e: any) => {
					reject(e.error);
				};

				recorder.oncomplete=() => {
					const combined=new Uint8Array(chunks.reduce((acc,val) => acc+val.length,0));
					let offset=0;
					for(const chunk of chunks) {
						combined.set(chunk,offset);
						offset+=chunk.length;
					}
					resolve(combined.buffer);
				};

				recorder.start();

				// Push audioBuffer data to the recorder
				const numberOfChannels=audioBuffer.numberOfChannels;
				const samples=audioBuffer.length;
				const buffer: Float32Array[]=[];

				for(let channel=0;channel<numberOfChannels;channel++) {
					buffer.push(audioBuffer.getChannelData(channel));
				}

				// Buffer size should match Opus encoder expectations
				const frameSize=960; // 20ms at 48kHz
				for(let i=0;i<samples;i+=frameSize) {
					const frame: Float32Array[]=buffer.map((channelData) =>
						channelData.slice(i,i+frameSize)
					);
					recorder.encode(frame);
				}

				recorder.finish();
			} catch(error) {
				reject(error);
			}
		});
	}

	private audioBufferToWav(audioBuffer: AudioBuffer): Blob {
		const numOfChan=audioBuffer.numberOfChannels;
		const length=audioBuffer.length*numOfChan*2+44;
		const buffer=new ArrayBuffer(length);
		const view=new DataView(buffer);

		/* RIFF identifier */
		this.writeString(view,0,'RIFF');
		/* file length */
		view.setUint32(4,36+audioBuffer.length*numOfChan*2,true);
		/* RIFF type */
		this.writeString(view,8,'WAVE');
		/* format chunk identifier */
		this.writeString(view,12,'fmt ');
		/* format chunk length */
		view.setUint32(16,16,true);
		/* sample format (raw) */
		view.setUint16(20,1,true);
		/* channel count */
		view.setUint16(22,numOfChan,true);
		/* sample rate */
		view.setUint32(24,audioBuffer.sampleRate,true);
		/* byte rate (sample rate * block align) */
		view.setUint32(28,audioBuffer.sampleRate*numOfChan*2,true);
		/* block align (channel count * bytes per sample) */
		view.setUint16(32,numOfChan*2,true);
		/* bits per sample */
		view.setUint16(34,16,true);
		/* data chunk identifier */
		this.writeString(view,36,'data');
		/* data chunk length */
		view.setUint32(40,audioBuffer.length*numOfChan*2,true);

		// Write interleaved PCM data
		let offset=44;
		for(let i=0;i<audioBuffer.length;i++) {
			for(let channel=0;channel<numOfChan;channel++) {
				const sample=audioBuffer.getChannelData(channel)[i];
				// Clamp the sample to [-1, 1]
				const clamped=Math.max(-1,Math.min(1,sample));
				// Convert to 16-bit PCM
				const pcm=clamped<0? clamped*0x8000:clamped*0x7FFF;
				view.setInt16(offset,pcm,true);
				offset+=2;
			}
		}

		return new Blob([buffer],{type: 'audio/wav'});
	}

	private writeString(view: DataView,offset: number,string: string): void {
		for(let i=0;i<string.length;i++) {
			view.setUint8(offset+i,string.charCodeAt(i));
		}
	}
}
