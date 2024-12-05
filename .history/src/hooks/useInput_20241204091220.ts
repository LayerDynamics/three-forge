// useInput: Maps user inputs (keyboard, mouse, gamepad) to game actions.
// It is used to handle user input and perform actions in the game.
// src/hooks/useInput.ts

import {useEffect,useCallback} from 'react';
import {useInputStore} from '../stores/inputStore';
import {InputAction,InputDevice,InputBinding} from '../types/input.types';
import {GamepadManager} from '../systems/';
import {InputMapper} from '../utils/InputMapper';

export const useInput=() => {
    const {
        activeActions,
        axisValues,
        bindings,
        currentDevice,
        setActiveAction,
        setAxisValue,
        updateBinding,
        setCurrentDevice
    }=useInputStore();

    const gamepadManager=GamepadManager.getInstance();
    const inputMapper=InputMapper.getInstance();

    useEffect(() => {
        const handleKeyDown=(event: KeyboardEvent) => {
            const action=inputMapper.mapKeyToAction(event.key);
            if(action) {
                setActiveAction(action,true);
                setCurrentDevice('keyboard');
            }
        };

        const handleKeyUp=(event: KeyboardEvent) => {
            const action=inputMapper.mapKeyToAction(event.key);
            if(action) {
                setActiveAction(action,false);
            }
        };

        const handleGamepadButton=(event: CustomEvent) => {
            const action=inputMapper.mapGamepadButtonToAction(event.detail.button);
            if(action) {
                setActiveAction(action,event.detail.pressed);
                setCurrentDevice('gamepad');
            }
        };

        window.addEventListener('keydown',handleKeyDown);
        window.addEventListener('keyup',handleKeyUp);
        window.addEventListener('GAMEPAD_BUTTON',handleGamepadButton as EventListener);

        // Start gamepad polling
        gamepadManager.startPolling();

        return () => {
            window.removeEventListener('keydown',handleKeyDown);
            window.removeEventListener('keyup',handleKeyUp);
            window.removeEventListener('GAMEPAD_BUTTON',handleGamepadButton as EventListener);
            gamepadManager.stopPolling();
        };
    },[]);

    const isActionActive=useCallback((action: InputAction): boolean => {
        return activeActions.has(action);
    },[activeActions]);

    const getAxisValue=useCallback((axis: string): number => {
        return axisValues[axis]||0;
    },[axisValues]);

    const rebindAction=useCallback((action: InputAction,newBinding: InputBinding) => {
        updateBinding(newBinding);
        inputMapper.registerBinding(newBinding);
    },[updateBinding]);

    return {
        isActionActive,
        getAxisValue,
        rebindAction,
        currentDevice,
        bindings
    };
};
