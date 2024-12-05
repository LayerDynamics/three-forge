// src/systems/InputSystem/InputSystem.test.tsx

import { GamepadManager } from './GamepadManager';
import { InputMapper } from './InputMapper';
import { useInputStore } from '../../stores/inputStore';
import { InputAction, InputBinding } from '../../types/input.types';
import { InputSystem } from './InputSystem'; // Ensure correct import

jest.mock('./GamepadManager');
jest.mock('./InputMapper');

describe('InputSystem', () => {
  let inputSystem: InputSystem;
  let mockGamepadManager: jest.Mocked<GamepadManager>;
  let mockInputMapper: jest.Mocked<InputMapper>;

  beforeEach(() => {
    // Reset the InputSystem instance to ensure a fresh singleton for each test
    (InputSystem as any).instance = null;

    // Mock GamepadManager and InputMapper instances
    mockGamepadManager = GamepadManager.getInstance() as jest.Mocked<GamepadManager>;
    mockInputMapper = InputMapper.getInstance() as jest.Mocked<InputMapper>;

    // Initialize InputSystem with test configuration
    inputSystem = InputSystem.getInstance({
      deadzone: 0.1,
      pollRate: 16,
      axisThreshold: 0.1,
      debug: true,
    });
  });

  afterEach(() => {
    // Cleanup InputSystem after each test
    inputSystem.cleanup();

    // Reset the input store to its default state
    useInputStore.setState({
      activeActions: new Set<InputAction>(),
      axisValues: {},
      currentDevice: 'keyboard',
      isConnected: true,
      bindings: {},
      inputHistory: [],
    });

    // Restore all mocks to their original implementations
    jest.restoreAllMocks();
  });

  it('should be a singleton', () => {
    const instance1 = InputSystem.getInstance();
    const instance2 = InputSystem.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should handle keyboard input', () => {
    const mockKeyboardEvent = new KeyboardEvent('keydown', { key: 'w' });
    mockInputMapper.mapKeyToAction.mockReturnValue('move');

    // Dispatch keyboard event
    document.dispatchEvent(mockKeyboardEvent);

    // Verify that the 'move' action is active and the current device is 'keyboard'
    expect(useInputStore.getState().activeActions.has('move')).toBe(true);
    expect(useInputStore.getState().currentDevice).toBe('keyboard');
  });

  it('should handle gamepad input', () => {
    const mockGamepadEvent = new CustomEvent('GAMEPAD_BUTTON', {
      detail: { button: 0, pressed: true },
    });
    mockInputMapper.mapGamepadButtonToAction.mockReturnValue('jump');

    // Dispatch gamepad event
    document.dispatchEvent(mockGamepadEvent);

    // Verify that the 'jump' action is active and the current device is 'gamepad'
    expect(useInputStore.getState().activeActions.has('jump')).toBe(true);
    expect(useInputStore.getState().currentDevice).toBe('gamepad');
  });

  it('should handle input binding changes', () => {
    const gamepadBinding: InputBinding = {
      device: 'gamepad',
      action: 'move',
      buttons: [0, 1], // 'keys' is not required for gamepad
    };

    // Update input binding
    inputSystem.updateBinding(gamepadBinding);

    // Verify that InputMapper's registerBinding was called with the correct binding
    expect(mockInputMapper.registerBinding).toHaveBeenCalledWith(gamepadBinding);

    // Verify that the binding is correctly stored in the input store
    expect(useInputStore.getState().bindings['move']).toEqual(gamepadBinding);
  });

  it('should handle axis input', () => {
    // Update axis value
    inputSystem.updateAxisValue('moveX', 0.5);

    // Verify that the axis value is correctly updated in the input store
    expect(useInputStore.getState().axisValues['moveX']).toBe(0.5);
  });

  it('should cleanup properly', () => {
    // Perform cleanup
    inputSystem.cleanup();

    // Verify that GamepadManager's cleanup method was called
    expect(mockGamepadManager.cleanup).toHaveBeenCalled();

    // Verify that the input store has been reset
    expect(useInputStore.getState().activeActions.size).toBe(0);
    expect(useInputStore.getState().axisValues).toEqual({});
    expect(useInputStore.getState().bindings).toEqual({});
    expect(useInputStore.getState().inputHistory).toEqual([]);
  });

  it('should respect deadzone settings', () => {
    // Test axis values below deadzone
    inputSystem.updateAxisValue('moveX', 0.05); // Below deadzone of 0.1
    expect(useInputStore.getState().axisValues['moveX']).toBe(0);

    // Test axis values above deadzone
    inputSystem.updateAxisValue('moveX', 0.15); // Above deadzone of 0.1
    expect(useInputStore.getState().axisValues['moveX']).toBe(0.15);
  });

  it('should handle multiple simultaneous actions', () => {
    const mockKeyboardEvent1 = new KeyboardEvent('keydown', { key: 'w' });
    const mockKeyboardEvent2 = new KeyboardEvent('keydown', { key: 'Space' });

    mockInputMapper.mapKeyToAction
      .mockReturnValueOnce('move')
      .mockReturnValueOnce('jump');

    // Dispatch multiple keyboard events
    document.dispatchEvent(mockKeyboardEvent1);
    document.dispatchEvent(mockKeyboardEvent2);

    const activeActions = useInputStore.getState().activeActions;
    expect(activeActions.has('move')).toBe(true);
    expect(activeActions.has('jump')).toBe(true);
  });

  it('should handle device switching correctly', () => {
    // Initially, currentDevice should be 'keyboard'
    expect(useInputStore.getState().currentDevice).toBe('keyboard');

    // Dispatch a gamepad event
    const mockGamepadEvent = new CustomEvent('GAMEPAD_BUTTON', {
      detail: { button: 1, pressed: true },
    });
    mockInputMapper.mapGamepadButtonToAction.mockReturnValue('attack');

    document.dispatchEvent(mockGamepadEvent);

    // Verify that the currentDevice is now 'gamepad'
    expect(useInputStore.getState().currentDevice).toBe('gamepad');

    // Dispatch another keyboard event
    const mockKeyboardEvent = new KeyboardEvent('keydown', { key: 'a' });
    mockInputMapper.mapKeyToAction.mockReturnValue('strafe');

    document.dispatchEvent(mockKeyboardEvent);

    // Verify that the currentDevice has switched back to 'keyboard'
    expect(useInputStore.getState().currentDevice).toBe('keyboard');
  });

  it('should handle modifier keys', () => {
    const mockShiftEvent = new KeyboardEvent('keydown', { key: 'Shift' });
    const mockWEvent = new KeyboardEvent('keydown', { key: 'w' });

    // Mock InputMapper to handle combination
    mockInputMapper.mapKeyToAction.mockImplementation((key: string) => {
      if (key === 'Shift') return 'run';
      if (key === 'w') return 'move';
      return null;
    });

    // Dispatch Shift keydown
    document.dispatchEvent(mockShiftEvent);
    expect(useInputStore.getState().activeActions.has('run')).toBe(true);
    expect(useInputStore.getState().currentDevice).toBe('keyboard');

    // Dispatch 'w' keydown with Shift held
    document.dispatchEvent(mockWEvent);
    expect(useInputStore.getState().activeActions.has('move')).toBe(true);
    expect(useInputStore.getState().activeActions.has('run')).toBe(true);
  });

  it('should validate input bindings', () => {
    // Attempt to register an invalid binding (missing 'action')
    const invalidBinding: any = {
      device: 'keyboard',
      keys: ['Ctrl', 'C'],
      // 'action' is missing
    };

    // Expect that registering an invalid binding throws an error or is handled gracefully
    expect(() => inputSystem.updateBinding(invalidBinding)).toThrowError();

    // Alternatively, if the system handles it gracefully without throwing:
    // inputSystem.updateBinding(invalidBinding);
    // expect(mockInputMapper.registerBinding).not.toHaveBeenCalled();
    // expect(useInputStore.getState().bindings).not.toHaveProperty('C');
  });

  it('should handle connection state changes', () => {
    // Initially, isConnected should be true
    expect(useInputStore.getState().isConnected).toBe(true);

    // Simulate disconnection
    const mockDisconnectEvent = new Event('DISCONNECT');
    document.dispatchEvent(mockDisconnectEvent);
    inputSystem.handleConnectionChange(false);

    // Verify that isConnected is now false
    expect(useInputStore.getState().isConnected).toBe(false);

    // Simulate reconnection
    const mockConnectEvent = new Event('CONNECT');
    document.dispatchEvent(mockConnectEvent);
    inputSystem.handleConnectionChange(true);

    // Verify that isConnected is back to true
    expect(useInputStore.getState().isConnected).toBe(true);
  });

  it('should maintain input history', () => {
    // Dispatch a series of inputs
    const mockKeyboardEvent1 = new KeyboardEvent('keydown', { key: 'w' });
    const mockKeyboardEvent2 = new KeyboardEvent('keydown', { key: 'a' });
    const mockGamepadEvent = new CustomEvent('GAMEPAD_BUTTON', {
      detail: { button: 2, pressed: true },
    });

    mockInputMapper.mapKeyToAction
      .mockReturnValueOnce('move')
      .mockReturnValueOnce('strafe');

    mockInputMapper.mapGamepadButtonToAction.mockReturnValue('dash');

    document.dispatchEvent(mockKeyboardEvent1);
    document.dispatchEvent(mockKeyboardEvent2);
    document.dispatchEvent(mockGamepadEvent);

    const inputHistory = useInputStore.getState().inputHistory;

    // Verify that the input history has recorded the actions in order
    expect(inputHistory).toEqual(['move', 'strafe', 'dash']);
  });

  it('should handle axis normalization', () => {
    // Update axis value beyond normalization limits
    inputSystem.updateAxisValue('lookY', 1.5); // Assuming normalization clamps to [-1, 1]
    expect(useInputStore.getState().axisValues['lookY']).toBe(1);

    inputSystem.updateAxisValue('lookY', -1.2);
    expect(useInputStore.getState().axisValues['lookY']).toBe(-1);

    // Update axis within normalization limits
    inputSystem.updateAxisValue('lookY', 0.8);
    expect(useInputStore.getState().axisValues['lookY']).toBe(0.8);
  });

  it('should respect input priorities', () => {
    // Define priority: keyboard > gamepad
    // Register gamepad binding for 'action1'
    const gamepadBinding: InputBinding = {
      device: 'gamepad',
      action: 'action1',
      buttons: [0],
    };
    inputSystem.updateBinding(gamepadBinding);

    // Register keyboard binding for 'action1'
    const keyboardBinding: InputBinding = {
      device: 'keyboard',
      action: 'action1',
      keys: ['Enter'],
    };
    inputSystem.updateBinding(keyboardBinding);

    // Simulate gamepad input
    const mockGamepadEvent = new CustomEvent('GAMEPAD_BUTTON', {
      detail: { button: 0, pressed: true },
    });
    mockInputMapper.mapGamepadButtonToAction.mockReturnValue('action1');
    document.dispatchEvent(mockGamepadEvent);

    // Verify that 'action1' from gamepad is active
    expect(useInputStore.getState().activeActions.has('action1')).toBe(true);
    expect(useInputStore.getState().currentDevice).toBe('gamepad');

    // Now simulate keyboard input for the same action
    const mockKeyboardEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    mockInputMapper.mapKeyToAction.mockReturnValue('action1');
    document.dispatchEvent(mockKeyboardEvent);

    // Verify that 'action1' is still active and currentDevice is now 'keyboard'
    expect(useInputStore.getState().activeActions.has('action1')).toBe(true);
    expect(useInputStore.getState().currentDevice).toBe('keyboard');

    // Depending on implementation, ensure that the higher priority input (keyboard) takes precedence
    // For example, if 'action1' behavior differs based on device, verify correct behavior here
  });
});
