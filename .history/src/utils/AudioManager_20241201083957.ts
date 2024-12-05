// src/utils/AudioManager.ts

import {AudioListener,Audio} from "three";

/**
 * Singleton Class: AudioManager
 * Manages audio listeners and playback.
 */
export class AudioManagerClass {
	private static instance: AudioManagerClass|null=null;
	private listener: AudioListener;

	private constructor() {
		this.listener=new AudioListener();
	}

	// Get the singleton instance
	public static getInstance(): AudioManagerClass {
		if(!AudioManagerClass.instance) {
			AudioManagerClass.instance=new AudioManagerClass();
		}
		return AudioManagerClass.instance;
	}

	// Get the audio listener
	public getListener(): AudioListener {
		return this.listener;
	}

	// Play a sound
	public playSound(sound: Audio,volume: number=1): void {
		sound.setVolume(volume);
		sound.play();
	}

	// Stop a sound
	public stopSound(sound: Audio): void {
		sound.stop();
	}
}

// Export the singleton instance
export const AudioManager=AudioManagerClass.getInstance();
