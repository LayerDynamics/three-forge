// src/components/UI/AudioInitializer.tsx

import React from "react";
import { AudioManager } from "../../managers/AudioManager";

const AudioInitializer: React.FC = () => {
  const handleClick = () => {
    AudioManager.resumeAudioContext();
  };

  return (
    <button onClick={handleClick}>
      Initialize Audio
    </button>
  );
};

export default AudioInitializer;
