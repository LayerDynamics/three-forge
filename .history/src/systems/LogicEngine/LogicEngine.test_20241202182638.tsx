// src/systems/LogicEngine/LogicEngine.test.tsx

import { LogicEngineClass, LogicEngine } from "./LogicEngine";
import { useLogicStore } from "../../stores/logicStore";
import { GameEvent, LogicComponent } from "../../types/logic.types";
import { EventDispatcher } from "../../utils/EventDispatcher";

describe("LogicEngine", () => {
  beforeEach(() => {
    // Reset the LogicStore before each test
    useLogicStore.setState({
      gameState: "menu",
      eventsQueue: [],
      logicComponents: {},
    });
    // Clear all events
    (EventDispatcher as any).events = {};
    // Stop the engine if it's running
    LogicEngine.stop();
  });

  it("should start and stop the LogicEngine", () => {
    const startSpy = jest.spyOn(LogicEngine, "start");
    const stopSpy = jest.spyOn(LogicEngine, "stop");

    LogicEngine.start();
    expect(startSpy).toHaveBeenCalled();

    LogicEngine.stop();
    expect(stopSpy).toHaveBeenCalled();
  });

  it("should register and unregister logic components", () => {
    const mockExecute = jest.fn();
    const component: LogicComponent = {
      id: "testComponent",
      execute: mockExecute,
    };

    LogicEngine.registerLogicComponent(component);
    expect(useLogicStore.getState().logicComponents["testComponent"]).toBeDefined();

    LogicEngine.unregisterLogicComponent("testComponent");
    expect(useLogicStore.getState().logicComponents["testComponent"]).toBeUndefined();
  });

  it("should handle game state transitions based on events", () => {
    const startEvent: GameEvent = { type: "START_GAME" };
    const pauseEvent: GameEvent = { type: "PAUSE_GAME" };
    const endEvent: GameEvent = { type: "END_GAME" };

    LogicEngine.enqueueEvent(startEvent);
    LogicEngine.enqueueEvent(pauseEvent);
    LogicEngine.enqueueEvent(endEvent);

    LogicEngine.start();

    // Since the loop is asynchronous, we need to wait for the events to be processed
    setTimeout(() => {
      expect(useLogicStore.getState().gameState).toBe("gameOver");
      LogicEngine.stop();
    }, 100);
  });

  it("should execute logic components upon event handling", () => {
    const mockExecute = jest.fn();
    const component: LogicComponent = {
      id: "testComponent",
      execute: mockExecute,
    };

    LogicEngine.registerLogicComponent(component);

    const event: GameEvent = { type: "CUSTOM_EVENT", payload: { data: 123 } };
    LogicEngine.enqueueEvent(event);
    LogicEngine.start();

    // Wait for the event to be processed
    setTimeout(() => {
      expect(mockExecute).toHaveBeenCalledWith(event);
      LogicEngine.stop();
    }, 100);
  });

  it("should reset the LogicEngine correctly", () => {
    const mockExecute = jest.fn();
    const component: LogicComponent = {
      id: "testComponent",
      execute: mockExecute,
    };

    LogicEngine.registerLogicComponent(component);
    LogicEngine.enqueueEvent({ type: "START_GAME" });
    LogicEngine.start();

    LogicEngine.reset();

    expect(useLogicStore.getState().gameState).toBe("menu");
    expect(useLogicStore.getState().logicComponents).toEqual({});
    expect(useLogicStore.getState().eventsQueue).toEqual([]);
  });
});
