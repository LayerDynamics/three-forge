export type InputDevice='keyboard'|'mouse'|'gamepad';

export type InputAction=
    |'move'
    |'jump'
    |'attack'
    |'interact'
    |'aim'
    |'sprint'
    |'crouch';

export interface InputBinding {
    device: InputDevice;
    action: InputAction;
    keys: string[];  // For keyboard/mouse
    buttons?: number[];  // For gamepad
    axes?: number[];    // For gamepad/mouse
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
    debug?: boolean;
}

export interface InputEvent {
    action: InputAction;
    value: number;
    device: InputDevice;
    timestamp: number;
}
