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
