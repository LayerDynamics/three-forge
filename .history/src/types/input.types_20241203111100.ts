// src/types/input.types.ts

export type InputDevice='keyboard'|'mouse'|'gamepad';

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
	|'pause';

export interface InputAxis {
	id: string;
	value: number;
	deadzone: number;
	sensitivity: number;
	invert: boolean;
}

export interface InputBinding {
	device: InputDevice;
	action: InputAction;
	keys: string[];
	buttons?: number[];
	axes?: number[];
	modifiers?: {
		shift?: boolean;
		ctrl?: boolean;
		alt?: boolean;
	};
}

export interface InputState {
	activeActions: Set<InputAction>;
	axisValues: Record<string,number>;
	bindings: Record<string,InputBinding>;
	currentDevice: InputDevice;
	isConnected: boolean;
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
