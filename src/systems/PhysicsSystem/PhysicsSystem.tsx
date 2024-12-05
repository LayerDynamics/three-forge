// src/systems/PhysicsSystem/PhysicsSystem.tsx

import React, { useEffect } from 'react';
import { Mesh } from 'three';
import { RigidBody } from '@react-three/rapier';
import {
  Physics as CannonPhysics,
  useBox,
  useSphere,
  useCylinder,
  usePlane,
} from '@react-three/cannon';
import { Physics as RapierPhysics } from '@react-three/rapier';
import { Vector3 } from 'three';
import { usePhysicsStore, PhysicsBody, PhysicsEngine, PhysicsConfig, PhysicsState } from '../../stores/physicsStore';
import { extend } from '@react-three/fiber';

/**
 * Collision Handler for Rapier
 *
 * @param event - The collision event payload from Rapier
 * @param body - The physics body that collided
 * @param engine - The physics engine in use ("rapier")
 */
export const handleRapierCollision = (
  event: any, // Replace 'any' with proper type if available
  body: PhysicsBody,
  engine: PhysicsEngine
) => {
  if (engine !== 'rapier') return;

  const otherRigidBody = event.otherRigidBodyObject?.();
  const otherBodyId = otherRigidBody?.userData?.id;
  const contactPoints = event.contacts;

  if (otherBodyId && contactPoints && contactPoints.length > 0) {
    const point = new Vector3(
      contactPoints[0].x,
      contactPoints[0].y,
      contactPoints[0].z
    );
    body.onCollide && body.onCollide(otherBodyId, point);
  }
};

/**
 * Collision Handler for Cannon
 *
 * @param event - The collision event payload from Cannon
 * @param body - The physics body that collided
 * @param engine - The physics engine in use ("cannon")
 */
export const handleCannonCollision = (
  event: any, // Replace 'any' with proper type if available
  body: PhysicsBody,
  engine: PhysicsEngine
) => {
  if (engine !== 'cannon') return;

  const otherBody = event.body;
  const otherBodyId = otherBody?.userData?.id;
  const contactPoint = event.contact?.contactPoint;

  if (otherBodyId && contactPoint) {
    const point = new Vector3(
      contactPoint.x,
      contactPoint.y,
      contactPoint.z
    );
    body.onCollide && body.onCollide(otherBodyId, point);
  }
};

/**
 * PhysicsBodyRenderer Component
 * Renders all physics bodies based on the selected physics engine
 */
const PhysicsBodyRenderer: React.FC<{ engine: PhysicsEngine }> = ({ engine }) => {
  const bodies = usePhysicsStore((state) => state.bodies);

  return (
    <>
      {Object.values(bodies).map((body) => {
        switch (engine) {
          case 'cannon':
            switch (body.shape) {
              case 'box':
                return <BoxBodyCannon key={body.id} body={body} engine={engine} />;
              case 'sphere':
                return <SphereBodyCannon key={body.id} body={body} engine={engine} />;
              case 'capsule':
                return <CapsuleBodyCannon key={body.id} body={body} engine={engine} />;
              case 'cylinder':
                return <CylinderBodyCannon key={body.id} body={body} engine={engine} />;
              case 'cone':
                return <ConeBodyCannon key={body.id} body={body} engine={engine} />;
              case 'plane':
                return <PlaneBodyCannon key={body.id} body={body} engine={engine} />;
              default:
                console.warn(`Unsupported shape: ${body.shape}`);
                return null;
            }
          case 'rapier':
            switch (body.shape) {
              case 'box':
                return <BoxBodyRapier key={body.id} body={body} engine={engine} />;
              case 'sphere':
                return <SphereBodyRapier key={body.id} body={body} engine={engine} />;
              case 'capsule':
                return <CapsuleBodyRapier key={body.id} body={body} engine={engine} />;
              case 'cylinder':
                return <CylinderBodyRapier key={body.id} body={body} engine={engine} />;
              case 'cone':
                return <ConeBodyRapier key={body.id} body={body} engine={engine} />;
              case 'plane':
                return <PlaneBodyRapier key={body.id} body={body} engine={engine} />;
              default:
                console.warn(`Unsupported shape: ${body.shape}`);
                return null;
            }
          default:
            console.warn(`Unsupported engine: ${engine}`);
            return null;
        }
      })}
    </>
  );
};

/**
 * Implement @react-three/cannon body components
 */

const BoxBodyCannon: React.FC<{
  body: PhysicsBody;
  engine: PhysicsEngine;
}> = ({ body, engine }) => {
  const [ref] = useBox<Mesh>(() => ({
    mass: body.type === 'dynamic' ? body.mass ?? 1 : 0,
    position: [body.position.x, body.position.y, body.position.z],
    rotation: [body.rotation.x, body.rotation.y, body.rotation.z],
    args: (body.args as [number, number, number]) || [1, 1, 1],
    onCollide: (e: any) => {
      handleCannonCollision(e, body, engine);
    },
  }));

  return (
    <mesh ref={ref}>
      <boxGeometry args={(body.args as [number, number, number]) || [1, 1, 1]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  );
};

const SphereBodyCannon: React.FC<{
  body: PhysicsBody;
  engine: PhysicsEngine;
}> = ({ body, engine }) => {
  const [ref] = useSphere<Mesh>(() => ({
    mass: body.type === 'dynamic' ? body.mass ?? 1 : 0,
    position: [body.position.x, body.position.y, body.position.z],
    rotation: [body.rotation.x, body.rotation.y, body.rotation.z],
    args: (body.args as [number]) || [1],
    onCollide: (e: any) => {
      handleCannonCollision(e, body, engine);
    },
  }));

  return (
    <mesh ref={ref}>
      <sphereGeometry args={(body.args as [number]) || [1, 32, 32]} />
      <meshStandardMaterial color="green" />
    </mesh>
  );
};

const CapsuleBodyCannon: React.FC<{
  body: PhysicsBody;
  engine: PhysicsEngine;
}> = ({ body, engine }) => {
  const [ref] = useCylinder<Mesh>(() => ({
    mass: body.type === 'dynamic' ? body.mass ?? 1 : 0,
    position: [body.position.x, body.position.y, body.position.z],
    rotation: [body.rotation.x, body.rotation.y, body.rotation.z],
    args: (body.args as [number, number]) || [0.5, 2],
    onCollide: (e: any) => {
      handleCannonCollision(e, body, engine);
    },
  }));

  return (
    <mesh ref={ref}>
      <capsuleGeometry args={(body.args as [number, number]) || [0.5, 2, 32]} />
      <meshStandardMaterial color="purple" />
    </mesh>
  );
};

const CylinderBodyCannon: React.FC<{
  body: PhysicsBody;
  engine: PhysicsEngine;
}> = ({ body, engine }) => {
  const [ref] = useCylinder<Mesh>(() => ({
    mass: body.type === 'dynamic' ? body.mass ?? 1 : 0,
    position: [body.position.x, body.position.y, body.position.z],
    rotation: [body.rotation.x, body.rotation.y, body.rotation.z],
    args:
      (body.args as [number, number, number, number]) || [1, 1, 2, 32],
    onCollide: (e: any) => {
      handleCannonCollision(e, body, engine);
    },
  }));

  return (
    <mesh ref={ref}>
      <cylinderGeometry
        args={(body.args as [number, number, number, number]) || [1, 1, 2, 32]}
      />
      <meshStandardMaterial color="red" />
    </mesh>
  );
};

const ConeBodyCannon: React.FC<{
  body: PhysicsBody;
  engine: PhysicsEngine;
}> = ({ body, engine }) => {
  const [ref] = useCylinder<Mesh>(() => ({
    mass: body.type === 'dynamic' ? body.mass ?? 1 : 0,
    position: [body.position.x, body.position.y, body.position.z],
    rotation: [body.rotation.x, body.rotation.y, body.rotation.z],
    args:
      (body.args as [number, number, number]) || [0.5, 0, 2],
    onCollide: (e: any) => {
      handleCannonCollision(e, body, engine);
    },
  }));

  return (
    <mesh ref={ref}>
      <coneGeometry args={(body.args as [number, number, number]) || [0.5, 2, 32]} />
      <meshStandardMaterial color="yellow" />
    </mesh>
  );
};

const PlaneBodyCannon: React.FC<{
  body: PhysicsBody;
  engine: PhysicsEngine;
}> = ({ body, engine }) => {
  const [ref] = usePlane<Mesh>(() => ({
    mass: 0, // static
    position: [body.position.x, body.position.y, body.position.z],
    rotation: [body.rotation.x, body.rotation.y, body.rotation.z],
    onCollide: (e: any) => {
      handleCannonCollision(e, body, engine);
    },
  }));

  return (
    <mesh ref={ref}>
      <planeGeometry args={(body.args as [number, number]) || [1000, 1000]} />
      <meshStandardMaterial color="grey" />
    </mesh>
  );
};

/**
 * Implement @react-three/rapier body components
 */

const BoxBodyRapier: React.FC<{
  body: PhysicsBody;
  engine: PhysicsEngine;
}> = ({ body, engine }) => {
  return (
    <RigidBody
      type={body.type === 'dynamic' ? 'dynamic' : 'fixed'}
      position={[body.position.x, body.position.y, body.position.z]}
      rotation={[body.rotation.x, body.rotation.y, body.rotation.z]}
      colliders="cuboid"
      onCollisionEnter={(event: any) => {
        handleRapierCollision(event, body, engine);
      }}
      userData={{ id: body.id }}
    >
      <mesh>
        <boxGeometry args={(body.args as [number, number, number]) || [1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    </RigidBody>
  );
};

const SphereBodyRapier: React.FC<{
  body: PhysicsBody;
  engine: PhysicsEngine;
}> = ({ body, engine }) => {
  return (
    <RigidBody
      type={body.type === 'dynamic' ? 'dynamic' : 'fixed'}
      position={[body.position.x, body.position.y, body.position.z]}
      rotation={[body.rotation.x, body.rotation.y, body.rotation.z]}
      colliders="ball"
      onCollisionEnter={(event: any) => {
        handleRapierCollision(event, body, engine);
      }}
      userData={{ id: body.id }}
    >
      <mesh>
        <sphereGeometry args={(body.args as [number]) || [1, 32, 32]} />
        <meshStandardMaterial color="blue" />
      </mesh>
    </RigidBody>
  );
};

const CapsuleBodyRapier: React.FC<{
  body: PhysicsBody;
  engine: PhysicsEngine;
}> = ({ body, engine }) => {
  return (
    <RigidBody
      type={body.type === 'dynamic' ? 'dynamic' : 'fixed'}
      position={[body.position.x, body.position.y, body.position.z]}
      rotation={[body.rotation.x, body.rotation.y, body.rotation.z]}
      colliders="cuboid" // Adjust if a more appropriate collider is available
      onCollisionEnter={(event: any) => {
        handleRapierCollision(event, body, engine);
      }}
      userData={{ id: body.id }}
    >
      <mesh>
        <capsuleGeometry args={(body.args as [number, number]) || [0.5, 2, 32]} />
        <meshStandardMaterial color="green" />
      </mesh>
    </RigidBody>
  );
};

const CylinderBodyRapier: React.FC<{
  body: PhysicsBody;
  engine: PhysicsEngine;
}> = ({ body, engine }) => {
  return (
    <RigidBody
      type={body.type === 'dynamic' ? 'dynamic' : 'fixed'}
      position={[body.position.x, body.position.y, body.position.z]}
      rotation={[body.rotation.x, body.rotation.y, body.rotation.z]}
      colliders="cuboid" // Adjust if a more appropriate collider is available
      onCollisionEnter={(event: any) => {
        handleRapierCollision(event, body, engine);
      }}
      userData={{ id: body.id }}
    >
      <mesh>
        <cylinderGeometry
          args={(body.args as [number, number, number, number]) || [1, 1, 2, 32]}
        />
        <meshStandardMaterial color="purple" />
      </mesh>
    </RigidBody>
  );
};

const ConeBodyRapier: React.FC<{
  body: PhysicsBody;
  engine: PhysicsEngine;
}> = ({ body, engine }) => {
  return (
    <RigidBody
      type={body.type === 'dynamic' ? 'dynamic' : 'fixed'}
      position={[body.position.x, body.position.y, body.position.z]}
      rotation={[body.rotation.x, body.rotation.y, body.rotation.z]}
      colliders="cuboid" // Adjust if a more appropriate collider is available
      onCollisionEnter={(event: any) => {
        handleRapierCollision(event, body, engine);
      }}
      userData={{ id: body.id }}
    >
      <mesh>
        <coneGeometry args={(body.args as [number, number, number]) || [0.5, 2, 32]} />
        <meshStandardMaterial color="yellow" />
      </mesh>
    </RigidBody>
  );
};

const PlaneBodyRapier: React.FC<{
  body: PhysicsBody;
  engine: PhysicsEngine;
}> = ({ body, engine }) => {
  return (
    <RigidBody
      type="fixed"
      position={[body.position.x, body.position.y, body.position.z]}
      rotation={[body.rotation.x, body.rotation.y, body.rotation.z]}
      colliders="cuboid"
      onCollisionEnter={(event: any) => {
        handleRapierCollision(event, body, engine);
      }}
      userData={{ id: body.id }}
    >
      <mesh>
        <planeGeometry args={(body.args as [number, number]) || [1000, 1000]} />
        <meshStandardMaterial color="grey" />
      </mesh>
    </RigidBody>
  );
};

/**
 * Main PhysicsSystem Component
 * Initializes the physics engine (Rapier or Cannon) based on the provided configuration.
 */
export const PhysicsSystem: React.FC<PhysicsSystemProps> = ({
  config,
  children,
}) => {
  const { engine, gravity = new Vector3(0, -9.81, 0), debug = false } = config;

  // Initialize the PhysicsSystemManager
  useEffect(() => {
    const physicsSystemManager = PhysicsSystemManager.getInstance(config);
    physicsSystemManager.initialize();
    physicsSystemManager.start();

    return () => {
      physicsSystemManager.cleanup();
    };
  }, [config]);

  return (
    <>
      {engine === 'cannon' && (
        <CannonPhysics gravity={[gravity.x, gravity.y, gravity.z]}>
          {debug && <CannonPhysicsDebug />}
          <PhysicsBodyRenderer engine={engine} />
          {children}
        </CannonPhysics>
      )}
      {engine === 'rapier' && (
        <RapierPhysics gravity={[gravity.x, gravity.y, gravity.z]}>
          {debug && <RapierPhysicsDebugComponent />}
          <PhysicsBodyRenderer engine={engine} />
          {children}
        </RapierPhysics>
      )}
    </>
  );
};

/**
 * Dummy debug components; implement proper debug visuals if needed
 */

const CannonPhysicsDebug: React.FC = () => {
  return null; // Implement debug visuals or use a suitable library
};

const RapierPhysicsDebugComponent: React.FC = () => {
  return null; // Implement Rapier's Debug visuals if needed
};

/**
 * Serialize and deserialize physics state
 * Useful for saving/loading the physics state or for testing purposes.
 */
export const serializeState = (): PhysicsState => {
  return usePhysicsStore.getState();
};

export const deserializeState = (state: PhysicsState): void => {
  usePhysicsStore.setState(state);
};

/**
 * Singleton class for physics system management
 * Provides methods to manage physics bodies globally.
 */
export class PhysicsSystemManager {
  private static instance: PhysicsSystemManager | null = null;
  private config: PhysicsConfig;
  private isInitialized: boolean = false;
  private refCount: number = 0; // Reference counter

  private constructor(config: PhysicsConfig) {
    this.config = config;
  }

  public static getInstance(config: PhysicsConfig): PhysicsSystemManager {
    if (!PhysicsSystemManager.instance) {
      PhysicsSystemManager.instance = new PhysicsSystemManager(config);
    }
    return PhysicsSystemManager.instance;
  }

  public initialize() {
    this.refCount++;

    if (this.refCount === 1) {
      console.log('PhysicsSystemManager initializing with config:', this.config);
      this.isInitialized = true;
    }
  }

  public start() {
    if (!this.isInitialized) {
      console.error('PhysicsSystemManager not initialized.');
      return;
    }

    if (this.config.engine === 'rapier') {
      console.log('PhysicsSystemManager starting Rapier physics simulation.');
    } else if (this.config.engine === 'cannon') {
      console.log('PhysicsSystemManager starting Cannon physics simulation.');
    }
  }

  public cleanup() {
    if (this.refCount > 0) {
      this.refCount--;

      if (this.refCount === 0) {
        console.log('PhysicsSystemManager cleaning up physics systems.');
        if (this.config.engine === 'rapier') {
          console.log('PhysicsSystemManager cleaning up Rapier physics engine.');
        } else if (this.config.engine === 'cannon') {
          console.log('PhysicsSystemManager cleaning up Cannon physics engine.');
        }
        this.isInitialized = false;
        PhysicsSystemManager.instance = null;
      }
    } else {
      console.warn('PhysicsSystemManager cleanup called but refCount is already 0.');
    }
  }
}

/**
 * Define a prop type for the PhysicsSystem component
 */
interface PhysicsSystemProps {
  config: PhysicsConfig;
  children: React.ReactNode;
}

/**
 * Example PhysicsConfig and PhysicsState interfaces
 * Adjust these according to your actual store implementation
 */

// src/stores/physicsStore.ts
// Ensure this file exists and is correctly implemented

/*
import { Vector3 } from 'three';
import create from 'zustand';

export type PhysicsEngine = 'cannon' | 'rapier';

export interface PhysicsConfig {
  engine: PhysicsEngine;
  gravity: Vector3;
  debug: boolean;
}

export interface PhysicsBody {
  id: string;
  shape: string;
  type: 'static' | 'dynamic';
  mass?: number;
  position: Vector3;
  rotation: Vector3;
  args?: any;
  onCollide?: (otherBodyId: string, point: Vector3) => void;
}

export interface PhysicsState {
  bodies: Record<string, PhysicsBody>;
}

export const usePhysicsStore = create<PhysicsState>()((set) => ({
  bodies: {},
}));
*/