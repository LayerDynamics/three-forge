// src/systems/InputSystem/InputSystem.tsx

import { GamepadManager } from './GamepadManager';
import { InputMapper } from './InputMapper';
import { useInputStore } from '../../stores/inputStore';
import { InputAction, InputBinding, InputDevice, InputConfig, InputEvent, In } from '../../types/input.types';
import { EventDispatcher } from '../../utils/EventDispatcher';

export class InputSystem {
  private static instance: InputSystem | null = null;
  private config: InputConfig;
  private gamepadManager: GamepadManager;
  private inputMapper: InputMapper;
  private inputHistory: InputEvent[] = [];
  private readonly HISTORY_LIMIT = 100;
  private frameId: number | null = null;

  private constructor(config: InputConfig) {
    this.config = config;
    this.gamepadManager = GamepadManager.getInstance(config.debug);
    this.inputMapper = InputMapper.getInstance(config.debug);
    this.setupEventListeners();
  }

  public static getInstance(config?: InputConfig): InputSystem {
    if (!InputSystem.instance) {
      InputSystem.instance = new InputSystem(config || {
        deadzone: 0.1,
        pollRate: 16,
        axisThreshold: 0.1,
        debug: false
      });
    }
    return InputSystem.instance;
  }

  private setupEventListeners(): void {
    // Keyboard events
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    // Mouse events
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);
    window.addEventListener('wheel', this.handleMouseWheel);

    // Gamepad events
    window.addEventListener('gamepadconnected', this.handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', this.handleGamepadDisconnected);

    // Start gamepad polling
    this.gamepadManager.startPolling(this.config.pollRate);

    if (this.config.debug) {
      console.log('InputSystem initialized with config:', this.config);
    }
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    const action = this.inputMapper.mapKeyToAction(event.key);
    if (action) {
      useInputStore.getState().setActiveAction(action, true);
      useInputStore.getState().setCurrentDevice('keyboard');
      this.recordInput({
        action,
        value: 1, // Example value
        device: 'keyboard',
        timestamp: performance.now()
      });
    }
  };

  private handleKeyUp = (event: KeyboardEvent): void => {
    const action = this.inputMapper.mapKeyToAction(event.key);
    if (action) {
      useInputStore.getState().setActiveAction(action, false);
      this.recordInput({
        action,
        value: 0, // Example value
        device: 'keyboard',
        timestamp: performance.now()
      });
    }
  };

  private handleMouseMove = (event: MouseEvent): void => {
    const normalizedX = event.movementX / window.innerWidth;
    const normalizedY = event.movementY / window.innerHeight;

    if (Math.abs(normalizedX) > this.config.axisThreshold) {
      this.updateAxisValue('lookX', normalizedX);
    }
    if (Math.abs(normalizedY) > this.config.axisThreshold) {
      this.updateAxisValue('lookY', normalizedY);
    }

    useInputStore.getState().setCurrentDevice('mouse');
  };

  private handleMouseDown = (event: MouseEvent): void => {
    const action = this.inputMapper.mapMouseButtonToAction(event.button);
    if (action) {
      useInputStore.getState().setActiveAction(action, true);
      useInputStore.getState().setCurrentDevice('mouse');
      this.recordInput({
        action,
        value: 1,
        device: 'mouse',
        timestamp: performance.now()
      });
    }
  };

  private handleMouseUp = (event: MouseEvent): void => {
    const action = this.inputMapper.mapMouseButtonToAction(event.button);
    if (action) {
      useInputStore.getState().setActiveAction(action, false);
      this.recordInput({
        action,
        value: 0,
        device: 'mouse',
        timestamp: performance.now()
      });
    }
  };

  private handleMouseWheel = (event: WheelEvent): void => {
    const normalizedDelta = Math.sign(event.deltaY) * 0.1;
    this.updateAxisValue('scroll', normalizedDelta);
  };

  private handleGamepadConnected = (event: GamepadEvent): void => {
    useInputStore.getState().setConnectionState(true);
    EventDispatcher.dispatch('INPUT_DEVICE_CONNECTED', { device: 'gamepad' });
  };

  private handleGamepadDisconnected = (event: GamepadEvent): void => {
    useInputStore.getState().setConnectionState(false);
    EventDispatcher.dispatch('INPUT_DEVICE_DISCONNECTED', { device: 'gamepad' });
  };

  public updateBinding(binding: InputBinding): void {
    if (!this.validateBinding(binding)) {
      if (this.config.debug) {
        console.error('Invalid binding:', binding);
      }
      return;
    }

    useInputStore.getState().updateBinding(binding);
    this.inputMapper.registerBinding(binding);

    if (this.config.debug) {
      console.log(`Binding updated for action: ${binding.action}`);
    }
  }

  private validateBinding(binding: InputBinding): boolean {
    const validDevices: InputDevice[] = ['keyboard', 'mouse', 'gamepad'];

    if (!validDevices.includes(binding.device)) {
      return false;
    }

    if (!binding.action) {
      return false;
    }

    switch (binding.device) {
      case 'keyboard':
        return Array.isArray(binding.keys) && binding.keys.length > 0;
      case 'mouse':
        return Array.isArray(binding.buttons) && binding.buttons.length > 0;
      case 'gamepad':
        return Array.isArray(binding.buttons) && binding.buttons.length > 0;
      default:
        return false;
    }
  }

  public updateAxisValue(axis: string, value: number): void {
    // Apply deadzone
    const finalValue = Math.abs(value) < this.config.deadzone ? 0 : value;
    useInputStore.getState().setAxisValue(axis, finalValue);
    this.recordInput({
      action: axis as InputAction,
      value: finalValue,
      device: 'mouse', // or 'gamepad' based on context
      timestamp: performance.now()
    });
  }

  private recordInput(event: InputEvent): void {
    this.inputHistory.push(event);
    if (this.inputHistory.length > this.HISTORY_LIMIT) {
      this.inputHistory.shift();
    }
  }

  public getInputHistory(): InputEvent[] {
    return [...this.inputHistory];
  }

  public cleanup(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('wheel', this.handleMouseWheel);
    window.removeEventListener('gamepadconnected', this.handleGamepadConnected);
    window.removeEventListener('gamepaddisconnected', this.handleGamepadDisconnected);
    this.gamepadManager.cleanup();
    this.inputMapper.clear();
    this.inputHistory = [];
  }

  public reset(): void {
    this.cleanup();
    useInputStore.getState().reset();
    InputSystem.instance = null;
  }

  /**
   * Handles connection state changes for input devices
   * @param connected Whether the device is connected
   */
  public handleConnectionChange = (connected: boolean): void => {
    if (this.config.debug) {
      console.log(`InputSystem: Connection state changed to ${connected}`);
    }

    if (connected) {
      // Re-initialize if reconnected
      this.setupEventListeners();
      this.gamepadManager.startPolling(this.config.pollRate);
    } else {
      // Cleanup if disconnected
      this.cleanup();
    }

    // Update store connection state
    useInputStore.getState().setConnectionState(connected);
  };
}
