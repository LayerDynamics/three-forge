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

	/**
	 * Retrieves the singleton instance of AudioManagerClass.
	 * @returns The singleton instance.
	 */
	public static getInstance(): AudioManagerClass {
		if(!AudioManagerClass.instance) {
			AudioManagerClass.instance=new AudioManagerClass();
		}
		return AudioManagerClass.instance;
	}

	/**
	 * Returns the AudioListener instance.
	 * @returns The AudioListener.
	 */
	public getListener(): AudioListener {
		return this.listener;
	}

	/**
	 * Plays a sound using the provided Audio object.
	 * @param sound The Audio object to play.
	 * @param volume The volume level (0 to 1).
	 */
	public playSound(sound: Audio,volume: number=1): void {
		sound.setVolume(volume);
		sound.play();
	}

	/**
	 * Stops a sound using the provided Audio object.
	 * @param sound The Audio object to stop.
	 */
	public stopSound(sound: Audio): void {
		sound.stop();
	}
}

// Export the singleton instance
export const AudioManager=AudioManagerClass.getInstance();
