// src/components/UI/LogicController.tsx

import React, { useState } from "react";
import { useLogicStore } from "../../stores/logicStore"; // Adjust the path as needed
import { GameEvent, GameState } from "../../types/logic.types";

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
    <div>
      <h3>Logic Controller</h3>
      <div>
        <label>Event Type:</label>
        <input
          type="text"
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
        />
      </div>
      <div>
        <label>Payload (JSON):</label>
        <input
          type="text"
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
        />
      </div>
      <button onClick={handleEnqueueEvent}>Enqueue Event</button>
      <div>
        <button onClick={() => handleChangeGameState("start")}>Start Game</button>
        <button onClick={() => handleChangeGameState("pause")}>Pause Game</button>
        <button onClick={() => handleChangeGameState("end")}>End Game</button>
      </div>
      <div>
        <strong>Current Game State:</strong> {gameState}
      </div>
    </div>
  );
};

export default LogicController;