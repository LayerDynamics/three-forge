// src/systems/InputSystem/InputSystem.test.ts

import { InputSystem } from './InputSystem';
import { GamepadManager } from '../utils/GamepadManager';
import { InputMapper } from '../utils/InputMapper';
import { useInputStore } from '../../stores/inputStore';
import { InputAction, InputBinding } from '../../types/input.types';

describe('InputSystem', () => {
  let inputSystem: InputSystem;
  let mockGamepadManager: jest.Mocked<GamepadManager>;
  let mockInputMapper: jest.Mocked<InputMapper>;

  beforeEach(() => {
    // Reset the InputSystem instance
    (InputSystem as any).instance = null;

    // Mock GamepadManager
    mockGamepadManager = {
      getInstance: jest.fn(),
      startPolling: jest.fn(),
      stopPolling: jest.fn(),
      cleanup: jest.fn()
    } as unknown as jest.Mocked<GamepadManager>;

    // Mock InputMapper
    mockInputMapper = {
      getInstance: jest.fn(),
      mapKeyToAction: jest.fn(),
      mapGamepadButtonToAction: jest.fn(),
      registerBinding: jest.fn(),
      removeBinding: jest.fn()
    } as unknown as jest.Mocked<InputMapper>;

    // Initialize InputSystem
    inputSystem = InputSystem.getInstance({
      deadzone: 0.1,
      pollRate: 16,
      axisThreshold: 0.1,
      debug: true
    });
  });

  afterEach(() => {
    inputSystem.cleanup();
    useInputStore.setState({
      activeActions: new Set<InputAction>(),
      axisValues: {},
      currentDevice: 'keyboard',
      isConnected: true
    });
  });

  it('should be a singleton', () => {
    const instance1 = InputSystem.getInstance();
    const instance2 = InputSystem.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should handle keyboard input', () => {
    const mockKeyboardEvent = new KeyboardEvent('keydown', { key: 'w' });
    mockInputMapper.mapKeyToAction.mockReturnValue('move');

    document.dispatchEvent(mockKeyboardEvent);

    expect(useInputStore.getState().activeActions.has('move')).toBe(true);
    expect(useInputStore.getState().currentDevice).toBe('keyboard');
  });

  it('should handle gamepad input', () => {
    const mockGamepadEvent = new CustomEvent('GAMEPAD_BUTTON', {
      detail: { button: 0, pressed: true }
    });
    mockInputMapper.mapGamepadButtonToAction.mockReturnValue('jump');

    document.dispatchEvent(mockGamepadEvent);

    expect(useInputStore.getState().activeActions.has('jump')).toBe(true);
    expect(useInputStore.getState().currentDevice).toBe('gamepad');
  });

  it('should handle input binding changes', () => {
    const newBinding: InputBinding = {
      device: 'keyboard',
      action: 'jump',
      keys: ['Space']
    };

    inputSystem.updateBinding(newBinding);

    expect(mockInputMapper.registerBinding).toHaveBeenCalledWith(newBinding);
    expect(useInputStore.getState().bindings['jump']).toEqual(newBinding);
  });

  it('should handle axis input', () => {
    inputSystem.updateAxisValue('moveX', 0.5);

    expect(useInputStore.getState().axisValues['moveX']).toBe(0.5);
  });


  it('should cleanup properly', () => {
    inputSystem.cleanup();

    expect(mockGamepadManager.cleanup).toHaveBeenCalled();
    expect(useInputStore.getState().activeActions.size).toBe(0);
    expect(useInputStore.getState().axisValues).toEqual({});
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

    document.dispatchEvent(mockKeyboardEvent1);
    document.dispatchEvent(mockKeyboardEvent2);

    const activeActions = useInputStore.getState().activeActions;
    expect(activeActions.has('move')).toBe(true);
    expect(activeActions.has('jump')).toBe(true);
  });

  it('should handle device switching correctly', () => {
    // Start with keyboard input
    const mockKeyboardEvent = new KeyboardEvent('keydown', { key: 'w' });
    mockInputMapper.mapKeyToAction.mockReturnValue('move');
    document.dispatchEvent(mockKeyboardEvent);
    expect(useInputStore.getState().currentDevice).toBe('keyboard');

    // Switch to gamepad input
    const mockGamepadEvent = new CustomEvent('GAMEPAD_BUTTON', {
      detail: { button: 0, pressed: true }
    });
    mockInputMapper.mapGamepadButtonToAction.mockReturnValue('jump');
    document.dispatchEvent(mockGamepadEvent);
    expect(useInputStore.getState().currentDevice).toBe('gamepad');
  });

  it('should handle modifier keys', () => {
    const mockKeyboardEvent = new KeyboardEvent('keydown', {
      key: 'w',
      shiftKey: true
    });

    const binding: InputBinding = {
      device: 'keyboard',
      action: 'sprint',
      keys: ['w'],
      modifiers: { shift: true }
    };

    mockInputMapper.mapKeyToAction.mockReturnValue('sprint');
    inputSystem.updateBinding(binding);

    document.dispatchEvent(mockKeyboardEvent);
    expect(useInputStore.getState().activeActions.has('sprint')).toBe(true);
  });

  it('should validate input bindings', () => {
    const invalidBinding = {
      device: 'invalid_device',
      action: 'jump',
      keys: ['Space']
    };

    expect(() => {
      inputSystem.updateBinding(invalidBinding as InputBinding);
    }).toThrow();
  });

  it('should handle connection state changes', () => {
    // Simulate gamepad disconnection
    const disconnectEvent = new CustomEvent('gamepaddisconnected');
    document.dispatchEvent(disconnectEvent);
    expect(useInputStore.getState().isConnected).toBe(false);

    // Simulate gamepad connection
    const connectEvent = new CustomEvent('gamepadconnected');
    document.dispatchEvent(connectEvent);
    expect(useInputStore.getState().isConnected).toBe(true);
  });

  it('should maintain input history', () => {
    const mockKeyboardEvent = new KeyboardEvent('keydown', { key: 'w' });
    mockInputMapper.mapKeyToAction.mockReturnValue('move');

    document.dispatchEvent(mockKeyboardEvent);

    const history = inputSystem.getInputHistory();
    expect(history.length).toBeGreaterThan(0);
    expect(history[0].action).toBe('move');
  });

  it('should handle axis normalization', () => {
    // Test raw gamepad axis values (-1 to 1)
    inputSystem.updateAxisValue('moveX', -0.5);
    expect(useInputStore.getState().axisValues['moveX']).toBe(-0.5);

    // Test normalized mouse movement
    const mockMouseEvent = new MouseEvent('mousemove', {
      movementX: 100,
      movementY: 100
    });
    document.dispatchEvent(mockMouseEvent);

    const normalizedValue = useInputStore.getState().axisValues['lookX'];
    expect(normalizedValue).toBeGreaterThanOrEqual(-1);
    expect(normalizedValue).toBeLessThanOrEqual(1);
  });

  it('should respect input priorities', () => {
    // Register multiple bindings for the same action
    const keyboardBinding: InputBinding = {
      device: 'keyboard',
      action: 'move',
      keys: ['w']
    };

    const gamepadBinding: InputBinding = {
      device: 'gamepad',
      action: 'move',
      buttons: [0]
    };

    inputSystem.updateBinding(keyboardBinding);
    inputSystem.updateBinding(gamepadBinding);

    // Simulate simultaneous input
    const mockKeyboardEvent = new KeyboardEvent('keydown', { key: 'w' });
    const mockGamepadEvent = new CustomEvent('GAMEPAD_BUTTON', {
      detail: { button: 0, pressed: true }
    });

    document.dispatchEvent(mockKeyboardEvent);
    document.dispatchEvent(mockGamepadEvent);

    // Should prioritize the most recent input device
    expect(useInputStore.getState().currentDevice).toBe('gamepad');
  });
});
