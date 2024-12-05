// src/systems/InputSystem/InputSystem.test.tsx

import { GamepadManager } from '../../utils/GamepadManager';
import { InputMapper } from '../../utils/InputMapper';
import { useInputStore } from '../../stores/inputStore';
import { InputAction, InputBinding } from '../../types/input.types';
import { InputSystem } from './InputSystem'; // Ensure correct import

jest.mock('../../utils/GamepadManager');
jest.mock('../../utils/InputMapper');

describe('InputSystem', () => {
  let inputSystem: InputSystem;
  let mockGamepadManager: jest.Mocked<GamepadManager>;
  let mockInputMapper: jest.Mocked<InputMapper>;

  beforeEach(() => {
    // Reset the InputSystem instance
    (InputSystem as any).instance = null;

    // Mock GamepadManager
    mockGamepadManager = GamepadManager.getInstance() as jest.Mocked<GamepadManager>;
    mockInputMapper = InputMapper.getInstance() as jest.Mocked<InputMapper>;

    // Initialize InputSystem
    inputSystem = InputSystem.getInstance({
      deadzone: 0.1,
      pollRate: 16,
      axisThreshold: 0.1,
      debug: true,
    });
  });

  afterEach(() => {
    inputSystem.cleanup();
    useInputStore.setState({
      activeActions: new Set<InputAction>(),
      axisValues: {},
      currentDevice: 'keyboard',
      isConnected: true,
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
      detail: { button: 0, pressed: true },
    });
    mockInputMapper.mapGamepadButtonToAction.mockReturnValue('jump');

    document.dispatchEvent(mockGamepadEvent);

    expect(useInputStore.getState().activeActions.has('jump')).toBe(true);
    expect(useInputStore.getState().currentDevice).toBe('gamepad');
  });

  it('should handle input binding changes', () => {
    const gamepadBinding: InputBinding = {
      device: 'gamepad',
      action: 'move',
      buttons: [0, 1], // 'keys' is not required for gamepad
    };

    inputSystem.updateBinding(gamepadBinding);

    expect(mockInputMapper.registerBinding).toHaveBeenCalledWith(gamepadBinding);
    expect(useInputStore.getState().bindings['move']).toEqual(gamepadBinding);
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
    // Implement test logic for device switching
  });

  it('should handle modifier keys', () => {
    // Implement test logic for modifier keys
  });

  it('should validate input bindings', () => {
    // Implement test logic for input binding validation
  });

  it('should handle connection state changes', () => {
    // Implement test logic for connection state changes
  });

  it('should maintain input history', () => {
    // Implement test logic for input history maintenance
  });

  it('should handle axis normalization', () => {
    // Implement test logic for axis normalization
  });

  it('should respect input priorities', () => {
    // Implement test logic for input priorities
  });
});
