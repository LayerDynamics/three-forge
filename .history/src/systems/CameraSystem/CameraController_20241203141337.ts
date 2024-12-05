// camera controlling logic contained here for the camera system Handles camera movement and zooming based on player input and game state.
// src/systems/CameraSystem/CameraController.ts

import {Camera,Vector3,Euler,Quaternion,MathUtils} from 'three';
import {CameraMode,CameraTransition} from '../../types/camera.types';

export class CameraController {
	private camera: Camera;
	private targetPosition: Vector3;
	private currentPosition: Vector3;
	private offset: Vector3;
	private rotation: Euler;
	private mode: CameraMode;
	private transition: CameraTransition|null;
	private quaternion: Quaternion;

	constructor(camera: Camera) {
		this.camera=camera;
		this.targetPosition=new Vector3();
		this.currentPosition=camera.position.clone();
		this.offset=new Vector3(0,2,5);
		this.rotation=new Euler();
		this.mode='thirdPerson';
		this.transition=null;
		this.quaternion=new Quaternion();
	}

	public update(deltaTime: number): void {
		if(this.transition) {
			this.updateTransition(deltaTime);
			return;
		}

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

		// Apply position and rotation to camera
		this.camera.position.copy(this.currentPosition);
		this.camera.setRotationFromEuler(this.rotation);
	}

	private updateTransition(deltaTime: number): void {
		if(!this.transition) return;

		this.transition.progress+=deltaTime/this.transition.duration;

		if(this.transition.progress>=1) {
			this.currentPosition.copy(this.transition.endPosition);
			this.targetPosition.copy(this.transition.endTarget);
			this.transition=null;
			return;
		}

		const t=this.transition.easing(this.transition.progress);

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
			progress: 0
		};
	}

	public applyShake(trauma: number): void {
		const shake=trauma*trauma;
		const rotationShake=shake*0.1;
		const positionShake=shake*0.3;

		// Apply random offset to current position
		this.currentPosition.add(new Vector3(
			MathUtils.randFloat(-1,1)*positionShake,
			MathUtils.randFloat(-1,1)*positionShake,
			MathUtils.randFloat(-1,1)*positionShake
		));

		// Apply random rotation
		this.rotation.x+=MathUtils.randFloat(-1,1)*rotationShake;
		this.rotation.y+=MathUtils.randFloat(-1,1)*rotationShake;
		this.rotation.z+=MathUtils.randFloat(-1,1)*rotationShake;
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
