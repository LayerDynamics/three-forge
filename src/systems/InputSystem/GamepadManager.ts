// src/systems/InputSystem/GamepadManager.ts

import {GamepadData} from '../../types/input.types';
import {EventDispatcher} from '../../utils/EventDispatcher';

export class GamepadManager {
	private static instance: GamepadManager|null=null;
	private gamepads: Map<number,GamepadData>;
	private pollInterval: NodeJS.Timeout|null;
	private debugMode: boolean;

	private constructor(debug: boolean=false) {
		this.gamepads=new Map();
		this.pollInterval=null;
		this.debugMode=debug;

		window.addEventListener('gamepadconnected',this.handleGamepadConnected);
		window.addEventListener('gamepaddisconnected',this.handleGamepadDisconnected);
	}

	public static getInstance(debug?: boolean): GamepadManager {
		if(!GamepadManager.instance) {
			GamepadManager.instance=new GamepadManager(debug);
		}
		return GamepadManager.instance;
	}

	private handleGamepadConnected=(event: GamepadEvent): void => {
		const gamepad=event.gamepad;
		this.gamepads.set(gamepad.index,{
			id: gamepad.id,
			index: gamepad.index,
			buttons: Array.from(gamepad.buttons.map(b => b.pressed)),
			axes: Array.from(gamepad.axes),
			timestamp: performance.now()
		});

		if(this.debugMode) {
			console.log(`Gamepad connected: ${gamepad.id}`);
		}

		EventDispatcher.dispatch('GAMEPAD_CONNECTED',{gamepadId: gamepad.id});
	};

	private handleGamepadDisconnected=(event: GamepadEvent): void => {
		const gamepad=event.gamepad;
		this.gamepads.delete(gamepad.index);

		if(this.debugMode) {
			console.log(`Gamepad disconnected: ${gamepad.id}`);
		}

		EventDispatcher.dispatch('GAMEPAD_DISCONNECTED',{gamepadId: gamepad.id});
	};

	public startPolling(pollRate: number=16): void {
		if(this.pollInterval) return;

		this.pollInterval=setInterval(() => {
			const gamepads=navigator.getGamepads();
			for(const gamepad of gamepads) {
				if(!gamepad) continue;

				const prevState=this.gamepads.get(gamepad.index);
				const newState: GamepadData={
					id: gamepad.id,
					index: gamepad.index,
					buttons: Array.from(gamepad.buttons.map(b => b.pressed)),
					axes: Array.from(gamepad.axes),
					timestamp: performance.now()
				};

				if(prevState) {
					this.detectChanges(prevState,newState);
				}

				this.gamepads.set(gamepad.index,newState);
			}
		},pollRate);
	}

	private detectChanges(prev: GamepadData,curr: GamepadData): void {
		// Detect button changes
		curr.buttons.forEach((pressed,index) => {
			if(pressed!==prev.buttons[index]) {
				EventDispatcher.dispatch('GAMEPAD_BUTTON',{
					gamepadId: curr.id,
					button: index,
					pressed
				});
			}
		});

		// Detect axis changes
		curr.axes.forEach((value,index) => {
			if(Math.abs(value-prev.axes[index])>0.01) {
				EventDispatcher.dispatch('GAMEPAD_AXIS',{
					gamepadId: curr.id,
					axis: index,
					value
				});
			}
		});
	}

	public stopPolling(): void {
		if(this.pollInterval) {
			clearInterval(this.pollInterval);
			this.pollInterval=null;
		}
	}

	public getGamepad(index: number): GamepadData|undefined {
		return this.gamepads.get(index);
	}

	public cleanup(): void {
		this.stopPolling();
		window.removeEventListener('gamepadconnected',this.handleGamepadConnected);
		window.removeEventListener('gamepaddisconnected',this.handleGamepadDisconnected);
		this.gamepads.clear();
	}
}
