// src/systems/LogicEngine/LogicEngine.test.tsx
// Additional tests for LogicEngine

it("should process events in the correct order", () => {
	const eventOrder: string[] = [];
	const event1: GameEvent = { type: "EVENT_ONE" };
	const event2: GameEvent = { type: "EVENT_TWO" };

	const component1: LogicComponent = {
		id: "component1",
		execute: (event) => eventOrder.push(event.type),
	};

	LogicEngine.registerLogicComponent(component1);

	LogicEngine.enqueueEvent(event1);
	LogicEngine.enqueueEvent(event2);

	LogicEngine.start();

	setTimeout(() => {
		expect(eventOrder).toEqual(["EVENT_ONE", "EVENT_TWO"]);
		LogicEngine.stop();
	}, 100);
});

it("should execute multiple logic components for a single event", () => {
	const mockExecute1 = jest.fn();
	const mockExecute2 = jest.fn();
	const event: GameEvent = { type: "MULTI_EVENT" };

	const component1: LogicComponent = {
		id: "component1",
		execute: mockExecute1,
	};

	const component2: LogicComponent = {
		id: "component2",
		execute: mockExecute2,
	};

	LogicEngine.registerLogicComponent(component1);
	LogicEngine.registerLogicComponent(component2);

	LogicEngine.enqueueEvent(event);
	LogicEngine.start();

	setTimeout(() => {
		expect(mockExecute1).toHaveBeenCalledWith(event);
		expect(mockExecute2).toHaveBeenCalledWith(event);
		LogicEngine.stop();
	}, 100);
});

it("should not process events when the LogicEngine is stopped", () => {
	const mockExecute = jest.fn();
	const event: GameEvent = { type: "NO_PROCESS_EVENT" };

	const component: LogicComponent = {
		id: "component",
		execute: mockExecute,
	};

	LogicEngine.registerLogicComponent(component);

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
