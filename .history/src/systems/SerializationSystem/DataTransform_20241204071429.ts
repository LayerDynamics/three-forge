// src/systems/SerializationSystem/DataTransform.ts

import {SerializedData,SerializationConfig} from '../../types/serialization.types';
import {deflate,inflate} from 'pako';

export class DataTransform {
	private config: SerializationConfig;
	private encryptionKey: string;

	constructor(config: SerializationConfig,encryptionKey: string) {
		this.config=config;
		this.encryptionKey=encryptionKey;
	}

	public async serialize(data: any): Promise<string> {
		let processed=JSON.stringify(data);

		if(this.config.compression) {
			const compressed=this.compress(processed);
			processed=Buffer.from(compressed).toString('base64');
		}

		if(this.config.encryption) {
			processed=await this.encrypt(processed);
		}

		if(this.config.validateSchema) {
			this.validateSchema(data);
		}

		return processed;
	}

	public async deserialize(data: string): Promise<SerializedData> {
		let processed=data;

		if(this.config.encryption) {
			processed=await this.decrypt(processed);
		}

		if(this.config.compression) {
			const buffer=Buffer.from(processed,'base64');
			const decompressed=this.decompress(buffer);
			processed=new TextDecoder().decode(decompressed);
		}

		const parsed=JSON.parse(processed);

		if(this.config.validateSchema) {
			this.validateSchema(parsed);
		}

		return parsed;
	}

	private compress(data: string): Uint8Array {
		return deflate(data);
	}

	private decompress(data: Uint8Array): Uint8Array {
		return inflate(data);
	}

	private async encrypt(data: string): Promise<string> {
		const encoder=new TextEncoder();
		const key=await this.deriveKey();
		const iv=window.crypto.getRandomValues(new Uint8Array(12));

		const encryptedData=await window.crypto.subtle.encrypt(
			{name: 'AES-GCM',iv},
			key,
			encoder.encode(data)
		);

		const combined={
			iv: Array.from(iv),
			data: Array.from(new Uint8Array(encryptedData))
		};

		return JSON.stringify(combined);
	}

	private async decrypt(data: string): Promise<string> {
		const {iv,data: encryptedData}=JSON.parse(data);
		const key=await this.deriveKey();

		const decrypted=await window.crypto.subtle.decrypt(
			{name: 'AES-GCM',iv: new Uint8Array(iv)},
			key,
			new Uint8Array(encryptedData)
		);

		return new TextDecoder().decode(decrypted);
	}

	private async deriveKey(): Promise<CryptoKey> {
		const encoder=new TextEncoder();
		const keyMaterial=await window.crypto.subtle.importKey(
			'raw',
			encoder.encode(this.encryptionKey),
			'PBKDF2',
			false,
			['deriveBits','deriveKey']
		);

		return window.crypto.subtle.deriveKey(
			{
				name: 'PBKDF2',
				salt: encoder.encode('game-salt'),
				iterations: 100000,
				hash: 'SHA-256'
			},
			keyMaterial,
			{name: 'AES-GCM',length: 256},
			false,
			['encrypt','decrypt']
		);
	}

	private validateSchema(data: any): void {
		// Basic schema validation
		const requiredFields=['version','timestamp','systems','state'];
		for(const field of requiredFields) {
			if(!(field in data)) {
				throw new Error(`Invalid schema: missing required field '${field}'`);
			}
		}
	}

	public generateChecksum(data: SerializedData): string {
		// Create a stable string representation of the data
		const stable=JSON.stringify(data,Object.keys(data).sort());

		// Use a hash function to generate a checksum
		let hash=0;
		for(let i=0;i<stable.length;i++) {
			const char=stable.charCodeAt(i);
			hash=((hash<<5)-hash)+char;
			hash=hash&hash;
		}

		return hash.toString(16);
	}
}
