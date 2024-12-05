// src/components/UI/AnimationController.tsx

import React, { useState } from "react";
import { useAnimation } from "../../hooks/useAnimation";

/**
 * Component: AnimationController
 * Provides buttons to play, pause, and stop animations.
 */
const AnimationController: React.FC = () => {
  const { playAnimation, pauseAnimation, stopAnimation } = useAnimation();
  const [animationId, setAnimationId] = useState<string>("");

  const handlePlay = () => {
    if (animationId) {
      playAnimation(animationId);
    }
  };

  const handlePause = () => {
    if (animationId) {
      pauseAnimation(animationId);
    }
  };

  const handleStop = () => {
    if (animationId) {
      stopAnimation(animationId);
    }
  };

  return (
    <div style={{ position: "absolute", bottom: 10, left: 10, backgroundColor: "rgba(255,255,255,0.8)", padding: "10px", borderRadius: "5px" }}>
      <h3>Animation Controller</h3>
      <input
        type="text"
        placeholder="Animation ID"
        value={animationId}
        onChange={(e) => setAnimationId(e.target.value)}
        style={{ marginBottom: "10px", width: "100%" }}
      />
      <div>
        <button onClick={handlePlay} disabled={!animationId} style={{ marginRight: "5px" }}>
          Play
        </button>
        <button onClick={handlePause} disabled={!animationId} style={{ marginRight: "5px" }}>
          Pause
        </button>
        <button onClick={handleStop} disabled={!animationId}>
          Stop
        </button>
      </div>
    </div>
  );
};

export default AnimationController;
