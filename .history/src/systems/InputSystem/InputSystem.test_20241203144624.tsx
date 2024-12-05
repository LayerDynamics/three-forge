// src/systems/InputSystem/InputSystem.test.tsx

import { InputSystem } from './InputSystem';
import { GamepadManager } from './GamepadManager';
import { InputMapper } from './InputMapper';
import { useInputStore } from '../../stores/inputStore'; // Corrected path
import { InputAction, InputBinding, InputDevice } from '../../types/input.types'; // Added InputDevice

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

    // Mock the new method
    mockInputMapper.mapGamepadButtonToAction = jest.fn();

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
      buttons: [0, 1],
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
    mockInputMapper.mapKeyToAction.mockReturnValue('attack');
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

    // Dispatch W keydown
    document.dispatchEvent(mockWEvent);
    expect(useInputStore.getState().activeActions.has('move')).toBe(true);
  });

  it('should validate input bindings', () => {
    // Implement your validation test here
    // Example:
    const invalidBinding: InputBinding = {
      device: 'invalidDevice' as InputDevice,
      action: 'jump',
      keys: ['Space'],
    };

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    const result = inputSystem.updateBinding(invalidBinding);

    expect(result).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith('Invalid binding:', invalidBinding);

    consoleSpy.mockRestore();
  });

  it('should handle connection state changes', () => {
    // Initially connected
    expect(useInputStore.getState().isConnected).toBe(true);

    // Simulate disconnection
    inputSystem.handleConnectionChange(false);
    expect(useInputStore.getState().isConnected).toBe(false);

    // Simulate reconnection
    inputSystem.handleConnectionChange(true);
    expect(useInputStore.getState().isConnected).toBe(true);
  });

  it('should maintain input history', () => {
    const mockKeyboardEvent = new KeyboardEvent('keydown', { key: 'w' });
    mockInputMapper.mapKeyToAction.mockReturnValue('move');

    // Dispatch keyboard event
    document.dispatchEvent(mockKeyboardEvent);

    const history = inputSystem.getInputHistory();
    expect(history.length).toBe(1);
    expect(history[0].action).toBe('move');
    expect(history[0].device).toBe('keyboard');
  });

  it('should handle axis normalization', () => {
    // Update axis with value within threshold
    inputSystem.updateAxisValue('lookX', 0.05); // Below axisThreshold of 0.1
    expect(useInputStore.getState().axisValues['lookX']).toBe(0);

    // Update axis with value above threshold
    inputSystem.updateAxisValue('lookX', 0.15);
    expect(useInputStore.getState().axisValues['lookX']).toBe(0.15);
  });

  it('should respect input priorities', () => {
    // Implement input priority tests as needed
    // Example: Prioritize gamepad over keyboard
    const mockKeyboardEvent = new KeyboardEvent('keydown', { key: 'a' });
    const mockGamepadEvent = new CustomEvent('GAMEPAD_BUTTON', {
      detail: { button: 0, pressed: true },
    });

    mockInputMapper.mapKeyToAction.mockReturnValue('attack');
    mockInputMapper.mapGamepadButtonToAction.mockReturnValue('attack');

    // Dispatch keyboard event
    document.dispatchEvent(mockKeyboardEvent);
    expect(useInputStore.getState().currentDevice).toBe('keyboard');

    // Dispatch gamepad event
    document.dispatchEvent(mockGamepadEvent);
    expect(useInputStore.getState().currentDevice).toBe('gamepad');
  });
});
