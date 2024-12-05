// src/utils/AudioManager.ts

import { AudioListener, Audio } from "three";

/**
 * Singleton Class: AudioManager
 * Manages audio listeners and playback.
 */
export class AudioManager {
  private static listener: AudioListener | null = null;

  public static getListener(): AudioListener {
    if (!this.listener) {
      this.listener = new AudioListener();
      // Initialize listener as needed
    }
    return this.listener;
  }

  // Other AudioManager methods...
  private static instance: AudioManager | null = null;

  private constructor() {}

  /**
   * Retrieves the singleton instance of AudioManager.
   * @returns The singleton instance.
   */
  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * Initializes the AudioListener after a user gesture.
   * @returns The initialized AudioListener.
   */
  public initializeListener(): AudioListener {
    if (!this.listener) {
      this.listener = new AudioListener();
      // Suspend the AudioContext initially to prevent autoplay issues
      this.listener.context.suspend();
      console.log("AudioListener initialized and AudioContext suspended.");
    }
    return this.listener;
  }

  /**
   * Resumes the AudioContext in response to a user gesture.
   */
  public resumeAudioContext(): void {
    if (this.listener && this.listener.context.state === "suspended") {
      this.listener.context.resume()
        .then(() => {
          console.log("AudioContext resumed successfully.");
        })
        .catch((err) => {
          console.error("Failed to resume AudioContext:", err);
        });
    }
  }

  /**
   * Plays a sound using the provided Audio object.
   * @param sound The Audio object to play.
   * @param volume The volume level (0 to 1).
   */
  public playSound(sound: Audio, volume: number = 1): void {
    if (!this.listener) {
      console.warn("AudioListener not initialized. Please initialize audio first.");
      return;
    }
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
export const AudioManagerInstance = AudioManager.getInstance();
