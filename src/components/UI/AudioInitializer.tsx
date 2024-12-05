// src/components/UI/AudioInitializer.tsx

import React from "react";
import { AudioManager } from "../../utils/AudioManager";

/**
 * Component: AudioInitializer
 * Renders a button to initialize and resume the AudioContext after a user gesture.
 */
const AudioInitializer: React.FC = () => {
  const handleInitializeAudio = () => {
    AudioManager.initializeListener();
    AudioManager.resumeAudioContext();
  };

  return (
    <button onClick={handleInitializeAudio}>
      Initialize Audio
    </button>
  );
};

export default AudioInitializer;
