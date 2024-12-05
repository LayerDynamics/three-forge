import React from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';

// Core Systems
import {PhysicsSystem} from '../systems/PhysicsSystem/PhysicsSystem';
import { SceneGraphSystemClass } from '../systems/SceneGraphSystem/SceneGraphSystem';
import { PostProcessingSystem } from '../systems/PostProcessingSystem/PostProcessingSystem';
import { AISystem } from '../systems/AISystem/AISystem';
import { SerializationSystem } from '../systems/SerializationSystem/SerializationSystem';
import { AudioManagerInstance } from '../utils/AudioManager';

// Components
import ErrorBoundary from '../components/ErrorBoundary';
import InitializationManager from '../components/InitializationManager';
import SceneGraphManager from '../components/UI/SceneGraphManager';
import AudioInitializer from '../components/UI/AudioInitializer';
import PhysicsBodyButton from '../components/UI/PhysicsBodyButton';
import SceneGraphViewer from '../components/UI/SceneGraphViewer';

// Debug Components
import SceneInspector from '../tools/SceneInspector/SceneInspector';
import PerformanceProfiler from '../tools/PerformanceProfiler/PerformanceProfiler';

interface BaseSceneProps {
  debug?: boolean;
  children?: React.ReactNode;
  onSceneReady?: () => void;
}

export class BaseScene extends React.Component<BaseSceneProps> {
  private physicsSystem: PhysicsSystemManager;
  private sceneGraphSystem: SceneGraphSystemClass;
  private postProcessingSystem: PostProcessingSystem;
  private aiSystem: AISystem;
  private serializationSystem: SerializationSystem;

  constructor(props: BaseSceneProps) {
    super(props);
    
    // Initialize core systems with singleton instances
    this.physicsSystem = PhysicsSystemManager.getInstance();
    this.sceneGraphSystem = SceneGraphSystemClass.getInstance();
    this.postProcessingSystem = PostProcessingSystem.getInstance();
    this.aiSystem = AISystem.getInstance();
    this.serializationSystem = SerializationSystem.getInstance();

    // Initialize physics configuration
    this.physicsSystem.initialize({
      engine: 'rapier',
      gravity: new Vector3(0, -9.81, 0),
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

    // Initialize audio system
    AudioManagerInstance.initializeListener();

    if (this.props.onSceneReady) {
      this.props.onSceneReady();
    }
  }

  componentWillUnmount() {
    // Cleanup core systems
    this.physicsSystem.cleanup();
    this.sceneGraphSystem.cleanup();
    this.postProcessingSystem.cleanup();
    this.aiSystem.cleanup();
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
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
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
        near={0.1}
        far={1000}
      >
        <OrbitControls 
          enableDamping
          dampingFactor={0.05}
          minDistance={1}
          maxDistance={100}
        />
      </PerspectiveCamera>
    );
  }

  render() {
    const { debug = false, children } = this.props;

    return (
      <ErrorBoundary>
        <Canvas 
          shadows
          camera={{ position: [0, 5, 10], fov: 75 }}
          gl={{ 
            antialias: true,
            alpha: false,
            stencil: false
          }}
        >
          {/* Core Systems Integration */}
          <InitializationManager />
          <SceneGraphManager
            onAddObject={(addObject) => {
              this.sceneGraphSystem.addObject(addObject);
            }}
          />

          {/* Default Scene Setup */}
          {this.setupDefaultCamera()}
          {this.setupDefaultLighting()}

          {/* Scene Grid */}
          <gridHelper args={[100, 100]} />

          {/* Level Content */}
          {children}

          {/* Audio Setup */}
          <AudioInitializer />

          {/* Debug Tools */}
          {debug && (
            <>
              <SceneInspector />
              <PerformanceProfiler />
              <PhysicsBodyButton />
              <SceneGraphViewer />
            </>
          )}
        </Canvas>
      </ErrorBoundary>
    );
  }
}