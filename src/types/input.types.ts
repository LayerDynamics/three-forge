// src/types/input.types.ts

export type InputDevice = 'keyboard' | 'mouse' | 'gamepad';

export type InputAction=
	|'move'
	|'jump'
	|'attack'
	|'interact'
	|'aim'
	|'sprint'
	|'crouch'
	|'menu'
	|'inventory'
	|'pause'
	|'run'; // Added 'run'

export interface InputAxis {
	id: string;
	value: number;
	deadzone: number;
	sensitivity: number;
	invert: boolean;
}

export type InputBinding=
	|KeyboardInputBinding
	|GamepadInputBinding
	|MouseInputBinding;

interface BaseInputBinding {
	device: InputDevice;
	action: InputAction;
}

interface KeyboardInputBinding extends BaseInputBinding {
	device: 'keyboard';
	keys: string[];
	modifiers?: {
		shift?: boolean;
		ctrl?: boolean;
		alt?: boolean;
	};
}

interface GamepadInputBinding extends BaseInputBinding {
	device: 'gamepad';
	buttons: number[];
	axes?: number[];
}

interface MouseInputBinding extends BaseInputBinding {
	device: 'mouse';
	buttons?: number[];
	axes?: number[];
}

export interface InputState {
	activeActions: Set<InputAction>;
	axisValues: Record<string,number>;
	bindings: Record<string,InputBinding>;
	currentDevice: InputDevice;
	isConnected: boolean;
	inputHistory: InputAction[]; // Added 'inputHistory'
}

export interface InputConfig {
	deadzone: number;
	pollRate: number;
	axisThreshold: number;
	debug?: boolean;
}

export interface GamepadData {
	id: string;
	index: number;
	buttons: boolean[];
	axes: number[];
	timestamp: number;
}

export interface InputEvent {
	action: InputAction;
	value: number;
	device: InputDevice;
	timestamp: number;
}

export interface InputStore extends InputState {
  setActiveAction: (action: InputAction, active: boolean) => void;
  setAxisValue: (axis: string, value: number) => void;
  updateBinding: (binding: InputBinding) => void;
  setCurrentDevice: (device: InputDevice) => void;
  setConnectionState: (connected: boolean) => void;
  reset: () => void;
}
