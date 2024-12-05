// src/components/UI/LogicController.tsx

import React, { useState } from "react";
import { useLogic } from "../../hooks/useLogic";
import { GameEvent, GameState, us } from "../../types/logic.types";

/**
 * Component: LogicController
 * Provides controls to interact with the LogicEngine, such as changing game states and enqueuing events.
 */
const LogicController: React.FC = () => {
  const { enqueueEvent, gameState, setGameState } = useLogicStore();
  const [eventType, setEventType] = useState<string>("");
  const [payload, setPayload] = useState<string>("");

  const handleEnqueueEvent = () => {
    if (eventType.trim() === "") return;
    let parsedPayload;
    try {
      parsedPayload = payload ? JSON.parse(payload) : undefined;
    } catch (error) {
      alert("Invalid JSON payload.");
      return;
    }
    const event: GameEvent = {
      type: eventType,
      payload: parsedPayload,
    };
    enqueueEvent(event);
    setEventType("");
    setPayload("");
  };

  const handleChangeGameState = (state: GameState) => {
    enqueueEvent({ type: `${state.toUpperCase()}_GAME` });
  };

  return (
    <div style={{ position: "absolute", bottom: 10, right: 10, backgroundColor: "rgba(255,255,255,0.8)", padding: "10px", borderRadius: "5px" }}>
      <h3>Logic Controller</h3>
      <div style={{ marginBottom: "10px" }}>
        <label>Enqueue Event:</label>
        <input
          type="text"
          placeholder="Event Type"
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          style={{ width: "100%", marginBottom: "5px" }}
        />
        <input
          type="text"
          placeholder='Payload (JSON, e.g., {"key":"value"})'
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          style={{ width: "100%", marginBottom: "5px" }}
        />
        <button onClick={handleEnqueueEvent} style={{ width: "100%" }}>
          Enqueue Event
        </button>
      </div>
      <div>
        <label>Change Game State:</label>
        <div>
          <button onClick={() => handleChangeGameState("menu")} style={{ marginRight: "5px" }}>
            Menu
          </button>
          <button onClick={() => handleChangeGameState("playing")} style={{ marginRight: "5px" }}>
            Playing
          </button>
          <button onClick={() => handleChangeGameState("paused")} style={{ marginRight: "5px" }}>
            Paused
          </button>
          <button onClick={() => handleChangeGameState("gameOver")}>
            Game Over
          </button>
        </div>
      </div>
      <div style={{ marginTop: "10px" }}>
        <strong>Current Game State:</strong> {gameState}
      </div>
    </div>
  );
};

export default LogicController;
