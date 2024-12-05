import React from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';

// Import core systems
import { PhysicsSystemManager } from '../systems/PhysicsSystem/PhysicsSystem';
import { SceneGraphSystemClass } from '../systems/SceneGraphSystem/SceneGraphSystem';
import { PostProcessingSystem } from '../systems/PostProcessingSystem/PostProcessingSystem';
import { AISystem } from '../systems/AISystem/AISystem';
import { SerializationSystem } from '../systems/SerializationSystem/SerializationSystem';
import { MemorySystem } from '../systems/MemorySystem/MemorySystem';

// Import components
import ErrorBoundary from '../components/ErrorBoundary';
import InitializationManager from '../components/InitializationManager';
import SceneGraphManager from '../components/UI/SceneGraphManager';
import AudioInitializer from '../components/UI/AudioInitializer';

// Debug tools
import SceneInspector from '../components/SceneInspector';
import PerformanceProfiler from '../components/PerformanceProfiler';

interface BaseSceneProps {
  debug?: boolean;
  children?: React.ReactNode;
}

export class BaseScene extends React.Component<BaseSceneProps> {
  private physicsSystem: PhysicsSystemManager;
  private sceneGraphSystem: SceneGraphSystemClass;
  private postProcessingSystem: PostProcessingSystem;
  private aiSystem: AISystem;
  private memorySystem: MemorySystem;
  private serializationSystem: SerializationSystem;

  constructor(props: BaseSceneProps) {
    super(props);

    // Initialize core systems with proper singleton instances
    this.physicsSystem = PhysicsSystemManager.getInstance();
    this.sceneGraphSystem = SceneGraphSystemClass.getInstance();
    this.postProcessingSystem = PostProcessingSystem.getInstance();
    this.aiSystem = AISystem.getInstance();
    this.memorySystem = MemorySystem.getInstance();
    this.serializationSystem = SerializationSystem.getInstance();

    // Initialize physics configuration
    this.physicsSystem.initialize({
      engine: 'rapier',
      gravity: { x: 0, y: -9.81, z: 0 },
      debug: props.debug
    });
  }

  componentDidMount() {
    // Start core systems
    this.physicsSystem.start();
    this.aiSystem.start();
    this.postProcessingSystem.start();

    // Enable auto-save
    this.serializationSystem.enableAutoSave();
  }

  componentWillUnmount() {
    // Cleanup core systems
    this.physicsSystem.cleanup();
    this.sceneGraphSystem.cleanup();
    this.postProcessingSystem.cleanup();
    this.aiSystem.cleanup();
    this.memorySystem.cleanup();
    this.serializationSystem.cleanup();
  }

  protected setupDefaultLighting() {
    return (
      <>
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 10]}
          intensity={1}
          castShadow
        />
      </>
    );
  }

  protected setupDefaultCamera() {
    return (
      <PerspectiveCamera
        makeDefault
        position={[0, 5, 10]}
        fov={75}
      >
        <OrbitControls />
      </PerspectiveCamera>
    );
  }

  render() {
    const { debug = false, children } = this.props;

    return (
      <ErrorBoundary>
        <Canvas shadows>
          <InitializationManager />
          <SceneGraphManager
            onAddObject={(addObject) => {
              this.sceneGraphSystem.addObject(addObject);
            }}
          />

          {/* Default Scene Setup */}
          {this.setupDefaultCamera()}
          {this.setupDefaultLighting()}

          {/* Level Content */}
          {children}

          {/* Audio Setup */}
          <AudioInitializer />

          {/* Debug Tools */}
          {debug && (
            <>
              <SceneInspector />
              <PerformanceProfiler />
            </>
          )}
        </Canvas>
      </ErrorBoundary>
    );
  }
}
