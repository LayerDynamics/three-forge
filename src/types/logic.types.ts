// src/types/logic.types.ts

// Enum for game states
export type GameState="menu"|"playing"|"paused"|"gameOver";

// Interface for game events
export interface GameEvent {
	type: string; // Event type identifier
	payload?: any; // Optional data associated with the event
}

// Interface for AI behaviors or other logic components
export interface LogicComponent {
	id: string; // Unique identifier
	execute: (event: GameEvent) => void; // Function to execute logic based on an event
}

// Interface for managing game logic in the store
export interface LogicState {
	gameState: GameState; // Current game state
	eventsQueue: GameEvent[]; // Queue of pending game events
	logicComponents: Record<string,LogicComponent>; // Registered logic components
	setGameState: (state: GameState) => void; // Function to update the game state
	enqueueEvent: (event: GameEvent) => void; // Function to add an event to the queue
	dequeueEvent: () => GameEvent|undefined; // Function to remove and return the next event from the queue
	registerLogicComponent: (component: LogicComponent) => void; // Register a new logic component
	unregisterLogicComponent: (id: string) => void; // Unregister a logic component
}