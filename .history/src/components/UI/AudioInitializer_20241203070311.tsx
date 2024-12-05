// src/components/UI/AudioInitializer.tsx

import React from "react";
import { AudioManager } from "../../utils/AudioManager";

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
