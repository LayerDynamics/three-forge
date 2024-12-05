// LogicEngine:
// 1. LogicEngine is a class that extends React.Component
// 2. It contains the logic for the game
// 3. It uses Zustand for state management
// 4. It is responsible for the game's logic, the logic that isn't handled by the other systems, and Overall game outcome goal(how you win or lose)
// src/systems/LogicEngine/LogicEngine.tsx

import { GameEvent, LogicComponent } from "../../types/logic.types";
import { useLogicStore } from "../../stores/logicStore";

export class LogicEngineClass {
  private static instance: LogicEngineClass | null = null;
  private running: boolean = false;

  private constructor() {}

  public static getInstance(): LogicEngineClass {
    if (!LogicEngineClass.instance) {
      LogicEngineClass.instance = new LogicEngineClass();
    }
    return LogicEngineClass.instance;
  }

  public start(): void {
    if (this.running) return;
    this.running = true;
    this.loop();
    console.log("LogicEngine started.");
  }

  public stop(): void {
    this.running = false;
    console.log("LogicEngine stopped.");
  }

  private loop(): void {
    if (!this.running) return;

    const event = useLogicStore.getState().dequeueEvent();
    if (event) {
      this.handleEvent(event);
    }

    requestAnimationFrame(() => this.loop());
  }

  private handleEvent(event: GameEvent): void {
    const logicComponents = useLogicStore.getState().logicComponents;
    Object.values(logicComponents).forEach((component: LogicComponent) => {
      component.execute(event);
    });

    this.handleGameStateTransitions(event);
  }

  public serializeState(): LogicState {
  return useLogicStore.getState();
}

public deserializeState(state: LogicState): void {
  useLogicStore.setState(state);
}

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

  public registerLogicComponent(component: LogicComponent): void {
    useLogicStore.getState().registerLogicComponent(component);
  }

  public unregisterLogicComponent(id: string): void {
    useLogicStore.getState().unregisterLogicComponent(id);
  }

  public enqueueEvent(event: GameEvent): void {
    useLogicStore.getState().enqueueEvent(event);
  }

  public reset(): void {
    this.stop();
    useLogicStore.getState().setGameState("menu");
    const components = useLogicStore.getState().logicComponents;
    Object.keys(components).forEach((id) => this.unregisterLogicComponent(id));
    if (useLogicStore.getState().eventsQueue.length > 0) {
      useLogicStore.setState({ eventsQueue: [] });
    }
    console.log("LogicEngine reset.");
  }
}

export const LogicEngine = LogicEngineClass.getInstance();
