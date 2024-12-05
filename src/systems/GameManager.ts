// src/systems/GameManager.ts

class GameManager {
	private inputSystem: InputSystem;
	private cameraSystem: CameraSystem;
	private particleSystem: ParticleSystem;
	private postProcessSystem: PostProcessingSystem;
	private serializationSystem: SerializationSystem;

	public initialize() {
		// Initialize all systems
		this.inputSystem=new InputSystem({
			deadzone: 0.1,
			pollRate: 60
		});

		this.cameraSystem=new CameraSystem({
			fov: 75,
			near: 0.1,
			far: 1000
		});

		// Connect systems
		this.inputSystem.onAction('cameraMoveRight',(value) => {
			this.cameraSystem.moveRight(value);
		});

		// Setup serialization
		this.serializationSystem.registerSystem('input',{
			serialize: () => this.inputSystem.serialize(),
			deserialize: (data) => this.inputSystem.deserialize(data)
		});
	}

	public update(deltaTime: number) {
		this.inputSystem.update(deltaTime);
		this.particleSystem.update(deltaTime);
		this.postProcessSystem.update(deltaTime);
		this.cameraSystem.update(deltaTime);
	}
}
