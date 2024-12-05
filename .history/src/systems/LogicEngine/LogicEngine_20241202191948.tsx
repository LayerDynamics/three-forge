// LogicEngine:
// 1. LogicEngine is a class that extends React.Component
// 2. It contains the logic for the game
// 3. It uses Zustand for state management
// 4. It is responsible for the game's logic, the logic that isn't handled by the other systems, and Overall game outcome goal(how you win or lose)
// src/systems/LogicEngine/LogicEngine.tsx

import { GameEvent, LogicComponent } from "../../types/logic.types";
import { useLogicStore } from "../../stores/logicStore";

/**
 * Singleton Class: LogicEngineClass
 * Manages core game logic, event handling, and logic components execution.
 */
export class LogicEngineClass {
  private static instance: LogicEngineClass | null = null;
  private running: boolean = false;

  private constructor() {}

  // Get the singleton instance
  public static getInstance(): LogicEngineClass {
    if (!LogicEngineClass.instance) {
      LogicEngineClass.instance = new LogicEngineClass();
    }
    return LogicEngineClass.instance;
  }

  /**
   * Starts the LogicEngine loop.
   */
  public start(): void {
    if (this.running) return;
    this.running = true;
    this.loop();
    console.log("LogicEngine started.");
  }

  /**
   * Stops the LogicEngine loop.
   */
  public stop(): void {
    this.running = false;
    console.log("LogicEngine stopped.");
  }

  /**
   * The main loop that processes events.
   */
  private loop(): void {
    if (!this.running) return;

    const event = useLogicStore.getState().dequeueEvent();
    if (event) {
      this.handleEvent(event);
    }

    requestAnimationFrame(() => this.loop());
  }

  /**
   * Handles a single game event by dispatching it to all registered logic components.
   * @param event The game event to handle.
   */
  private handleEvent(event: GameEvent): void {
    const logicComponents = useLogicStore.getState().logicComponents;
    Object.values(logicComponents).forEach((component) => {
      component.execute(event);
    });

    // Optionally, handle global game state transitions based on events
    this.handleGameStateTransitions(event);
  }

  /**
   * Handles game state transitions based on specific events.
   * @param event The game event that may trigger a state transition.
   */
  private handleGameStateTransitions(event: GameEvent): void {
    switch (event.type) {
      case "START_GAME":
        useLogicStore.getState().setGameState("playing");
        break;
      case "PAUSE_GAME":
        useLogicStore.getState().setGameState("paused");
        break;
      case "END_GAME":
        useLogicStore.getState().setGameState("gameOver");
        break;
      default:
        break;
    }
  }

  /**
   * Registers a logic component.
   * @param component The logic component to register.
   */
  public registerLogicComponent(component: LogicComponent): void {
    useLogicStore.getState().registerLogicComponent(component);
  }

  /**
   * Unregisters a logic component by ID.
   * @param id The ID of the logic component to unregister.
   */
  public unregisterLogicComponent(id: string): void {
    useLogicStore.getState().unregisterLogicComponent(id);
  }

  /**
   * Enqueues a new game event.
   * @param event The game event to enqueue.
   */
  public enqueueEvent(event: GameEvent): void {
    useLogicStore.getState().enqueueEvent(event);
  }

  /**
   * Resets the LogicEngine by stopping the loop and clearing all events and components.
   */
  public reset(): void {
    this.stop();
    useLogicStore.getState().setGameState("menu");
    const components = useLogicStore.getState().logicComponents;
    Object.keys(components).forEach((id) => this.unregisterLogicComponent(id));
    if (useLogicStore.getState().eventsQueue.length > 0) {
      // Clear event queue
      useLogicStore.setState({ eventsQueue: [] });
    }
    console.log("LogicEngine reset.");
  }
}

// Export the singleton instance
export const LogicEngine = LogicEngineClass.getInstance();
