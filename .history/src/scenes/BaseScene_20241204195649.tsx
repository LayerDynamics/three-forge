import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';

// Core Systems
import { PhysicsSystem } from '../systems/PhysicsSystem/PhysicsSystem';
import { SceneGraphSystem } from '../systems/SceneGraphSystem/SceneGraphSystem';
import { PostProcessingSystem } from '../systems/PostProcessingSystem/PostProcessingSystem';
import { AISystem } from '../systems/AISystem/AISystem';
import { AudioManager } from '../utils/AudioManager';

// Components
import ErrorBoundary from '../components/ErrorBoundary';
import InitializationManager from '../components/InitializationManager';
import SceneGraphManager from '../components/UI/SceneGraphManager';
import AudioInitializer from '../components/UI/AudioInitializer';

// Debug Components
import SceneInspector from '../tools/SceneInspector/SceneInspector';
import PerformanceProfiler from '../tools/PerformanceProfiler/PerformanceProfiler';

interface BaseSceneProps {
  debug?: boolean;
  children?: React.ReactNode;
}

export class BaseScene extends React.Component<BaseSceneProps> {
  protected physicsSystem: PhysicsSystem;
  protected sceneGraphSystem: SceneGraphSystem;
  protected postProcessingSystem: PostProcessingSystem;
  protected aiSystem: AISystem;
  protected audioManager: AudioManager;

  constructor(props: BaseSceneProps) {
    super(props);

    // Initialize core systems
    this.physicsSystem = PhysicsSystem.getInstance();
    this.sceneGraphSystem = SceneGraphSystem.getInstance();
    this.postProcessingSystem = PostProcessingSystem.getInstance();
    this.aiSystem = AISystem.getInstance();
    this.audioManager = AudioManager.getInstance();
  }

  componentDidMount() {
    // Start core systems
    this.physicsSystem.start();
    this.aiSystem.start();

    // Initialize audio
    this.audioManager.initializeListener();
  }

  componentWillUnmount() {
    // Cleanup core systems
    this.physicsSystem.cleanup();
    this.sceneGraphSystem.cleanup();
    this.postProcessingSystem.cleanup();
    this.aiSystem.cleanup();
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
              // Handle object addition to scene graph
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
