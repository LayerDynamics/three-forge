// camera controlling logic contained here for the camera system Handles camera movement and zooming based on player input and game state.
// src/systems/CameraSystem/CameraController.ts

import {Camera,Vector3,Euler,MathUtils} from 'three';
import {CameraMode,CameraTransition} from '../../types/camera.types';

/**
 * Handles camera movement and zooming based on player input and game state.
 */
export class CameraController {
	private camera: Camera;
	private targetPosition: Vector3=new Vector3();
	private currentPosition: Vector3;
	private offset: Vector3=new Vector3(0,2,5);
	private rotation: Euler=new Euler();
	private mode: CameraMode='thirdPerson';
	private transition: CameraTransition|null=null;

	private shakeState: {
		active: boolean;
		intensity: number;
		decay: number;
		trauma: number;
	}={
			active: false,
			intensity: 0,
			decay: 0.95,
			trauma: 0,
		};

	constructor(camera: Camera) {
		this.camera=camera;
		this.currentPosition=camera.position.clone();
	}

	public update(deltaTime: number): void {
		if(this.transition) {
			this.updateTransition(deltaTime);
		} else {
			switch(this.mode) {
				case 'firstPerson':
					this.updateFirstPerson(deltaTime);
					break;
				case 'thirdPerson':
					this.updateThirdPerson(deltaTime);
					break;
				case 'orbital':
					this.updateOrbital(deltaTime);
					break;
				case 'cinematic':
					this.updateCinematic(deltaTime);
					break;
			}
		}

		// Apply shake if active
		if(this.shakeState.active) {
			this.applyShake(this.shakeState.trauma);
			this.shakeState.trauma*=this.shakeState.decay;
			if(this.shakeState.trauma<0.01) {
				this.shakeState.active=false;
				this.shakeState.trauma=0;
			}
		}

		// Apply position and rotation to camera
		this.camera.position.copy(this.currentPosition);
		this.camera.setRotationFromEuler(this.rotation);
	}

	private updateTransition(deltaTime: number): void {
		if(!this.transition) return;

		// Update progress
		this.transition.progress+=deltaTime/this.transition.duration;

		if(this.transition.progress>=1) {
			// Transition complete
			this.currentPosition.copy(this.transition.endPosition);
			this.targetPosition.copy(this.transition.endTarget);
			this.transition=null;
		} else {
			const t=this.transition.easing(Math.min(this.transition.progress,1));

			// Lerp position
			this.currentPosition.lerpVectors(
				this.transition.startPosition,
				this.transition.endPosition,
				t
			);

			// Lerp target
			this.targetPosition.lerpVectors(
				this.transition.startTarget,
				this.transition.endTarget,
				t
			);

			// Update camera look at
			this.camera.lookAt(this.targetPosition);
		}

		// Apply position to camera
		this.camera.position.copy(this.currentPosition);
	}

	private updateFirstPerson(deltaTime: number): void {
		// Position camera at target
		this.currentPosition.copy(this.targetPosition);

		// Apply rotation directly
		this.camera.rotation.copy(this.rotation);
	}

	private updateThirdPerson(deltaTime: number): void {
		// Calculate desired position based on target and offset
		const desiredPosition=this.targetPosition.clone().add(this.offset);

		// Smoothly interpolate current position
		this.currentPosition.lerp(desiredPosition,0.1);

		// Look at target
		this.camera.lookAt(this.targetPosition);
		this.rotation.copy(this.camera.rotation);
	}

	private updateOrbital(deltaTime: number): void {
		// Calculate position on sphere
		const radius=this.offset.length();
		const theta=this.rotation.y;
		const phi=this.rotation.x;

		this.currentPosition.set(
			radius*Math.sin(theta)*Math.cos(phi),
			radius*Math.sin(phi),
			radius*Math.cos(theta)*Math.cos(phi)
		).add(this.targetPosition);

		// Look at target
		this.camera.lookAt(this.targetPosition);
		this.rotation.copy(this.camera.rotation);
	}

	private updateCinematic(deltaTime: number): void {
		// Custom cinematic camera behavior
		// Could include path following, smooth transitions, etc.
	}

	public setTarget(target: Vector3): void {
		this.targetPosition.copy(target);
	}

	public setOffset(offset: Vector3): void {
		this.offset.copy(offset);
	}

	public setRotation(rotation: Euler): void {
		this.rotation.copy(rotation);
	}

	public setMode(mode: CameraMode): void {
		this.mode=mode;
	}

	public startTransition(transition: CameraTransition): void {
		this.transition={
			...transition,
			startPosition: this.currentPosition.clone(),
			startTarget: this.targetPosition.clone(),
			progress: 0,
		};
	}

	public setShake(intensity: number,decay: number): void {
		this.shakeState={
			active: intensity>0,
			intensity,
			decay,
			trauma: intensity,
		};
	}

	private applyShake(trauma: number): void {
		const shake=trauma*trauma;
		const rotationShake=shake*0.1;
		const positionShake=shake*0.3;

		// Apply random offset to current position
		const shakeOffset=new Vector3(
			MathUtils.randFloat(-1,1)*positionShake,
			MathUtils.randFloat(-1,1)*positionShake,
			MathUtils.randFloat(-1,1)*positionShake
		);
		this.currentPosition.add(shakeOffset);

		// Apply random rotation
		const shakeRotation=new Euler(
			MathUtils.randFloat(-1,1)*rotationShake,
			MathUtils.randFloat(-1,1)*rotationShake,
			MathUtils.randFloat(-1,1)*rotationShake
		);
		this.rotation.x+=shakeRotation.x;
		this.rotation.y+=shakeRotation.y;
		this.rotation.z+=shakeRotation.z;
	}

	public getCamera(): Camera {
		return this.camera;
	}

	public getPosition(): Vector3 {
		return this.currentPosition.clone();
	}

	public getTarget(): Vector3 {
		return this.targetPosition.clone();
	}
}
