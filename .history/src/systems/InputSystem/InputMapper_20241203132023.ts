// src/systems/InputSystem/InputMapper.ts

import {InputBinding,InputAction,InputEvent} from '../../types/input.types';
import {EventDispatcher} from '../../utils/EventDispatcher';

export class InputMapper {
	private static instance: InputMapper|null=null;
	private bindings: Map<string,InputBinding>;
	private debugMode: boolean;

	private constructor(debug: boolean=false) {
		this.bindings=new Map();
		this.debugMode=debug;
	}

	public static getInstance(debug?: boolean): InputMapper {
		if(!InputMapper.instance) {
			InputMapper.instance=new InputMapper(debug);
		}
		return InputMapper.instance;
	}

	public mapKeyToAction(key: string): InputAction|null {
		for(const [_,binding] of this.bindings) {
			if(binding.device==='keyboard'&&binding.keys.includes(key)) {
				return binding.action;
			}
		}
		return null;
	}

	// src/systems/InputSystem/InputMapper.ts

	public mapMouseButtonToAction(button: number): InputAction|null {
		for(const [_,binding] of this.bindings) {
			if(binding.device==='mouse'&&binding.buttons?.includes(button)) {
				return binding.action;
			}
		}
		return null;
	}

	public registerBinding(binding: InputBinding): void {
		this.bindings.set(binding.action,binding);

		if(this.debugMode) {
			console.log(`Registered binding for action: ${binding.action}`);
		}
	}

	public removeBinding(action: InputAction): void {
		this.bindings.delete(action);
	}

	public getBinding(action: InputAction): InputBinding|undefined {
		return this.bindings.get(action);
	}

	public clear(): void {
		this.bindings.clear();
	}
}
