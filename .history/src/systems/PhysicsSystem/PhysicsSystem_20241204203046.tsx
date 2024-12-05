
 // src/systems/PhysicsSystem/PhysicsSystem.tsx

import React from 'react';
import { RigidBody, Physics as RapierPhysics } from '@react-three/rapier';
import {
  Physics as CannonPhysics,
  useBox,
  useSphere,
  useCylinder,
  usePlane,
} from '@react-three/cannon';
import { Mesh, Vector3 } from 'three';
import { usePhysicsStore } from '../../stores/physicsStore';
import {
  PhysicsBody,
  PhysicsState,
  PhysicsConfig,
  PhysicsEngine,
} from '../../types/physics.types';

/**
 * Define a prop type for the PhysicsSystem component
 */
interface PhysicsSystemProps {
  config: PhysicsConfig;
  children: React.ReactNode;
}

/**
 * PhysicsBodyRenderer component to render physics bodies from the store
 */
interface PhysicsBodyRendererProps {
  engine: PhysicsEngine;
}

/**
 * Collision Handler for Rapier
 *
 * @param event - The collision event payload from Rapier
 * @param body - The physics body that collided
 * @param engine - The physics engine in use ("rapier")
 */
export const handleRapierCollision = (
  event: any, // Using 'any' due to lack of exported type
  body: PhysicsBody,
  engine: PhysicsEngine
) => {
  if (engine !== 'rapier') return; // Safety check

  // Extract other body ID
  const otherRigidBody = event.otherRigidBodyObject?.();
  const otherBodyId = otherRigidBody?.userData?.id;

  // Extract contact points
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
  event: any, // Using 'any' due to lack of exported type
  body: PhysicsBody,
  engine: PhysicsEngine
) => {
  if (engine !== 'cannon') return; // Safety check

  // Extract other body ID
  const otherBody = event.body;
  const otherBodyId = otherBody?.userData?.id;

  // Extract contact point
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
const PhysicsBodyRenderer: React.FC<PhysicsBodyRendererProps> = ({ engine }) => {
  const bodies = usePhysicsStore((state) => state.bodies);

  return (
    <>
      {Object.values(bodies).map((body) => {
        if (engine === 'cannon') {
          switch (body.shape) {
            case 'box':
              return (
                <BoxBodyCannon key={body.id} body={body} engine={engine} />
              );
            case 'sphere':
              return (
                <SphereBodyCannon key={body.id} body={body} engine={engine} />
              );
            case 'capsule':
              return (
                <CapsuleBodyCannon key={body.id} body={body} engine={engine} />
              );
            case 'cylinder':
              return (
                <CylinderBodyCannon key={body.id} body={body} engine={engine} />
              );
            case 'cone':
              return (
                <ConeBodyCannon key={body.id} body={body} engine={engine} />
              );
            case 'plane':
              return (
                <PlaneBodyCannon key={body.id} body={body} engine={engine} />
              );
            default:
              return null;
          }
        } else if (engine === 'rapier') {
          switch (body.shape) {
            case 'box':
              return (
                <BoxBodyRapier key={body.id} body={body} engine={engine} />
              );
            case 'sphere':
              return (
                <SphereBodyRapier key={body.id} body={body} engine={engine} />
              );
            case 'capsule':
              return (
                <CapsuleBodyRapier key={body.id} body={body} engine={engine} />
              );
            case 'cylinder':
              return (
                <CylinderBodyRapier key={body.id} body={body} engine={engine} />
              );
            case 'cone':
              return (
                <ConeBodyRapier key={body.id} body={body} engine={engine} />
              );
            case 'plane':
              return (
                <PlaneBodyRapier key={body.id} body={body} engine={engine} />
              );
            default:
              return null;
          }
        } else {
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
    onCollide: (e: any) => { // Using 'any' to match expected type
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
  // Since @react-three/cannon does not have a useCone, use Cylinder as a placeholder
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
      colliders="cuboid" // Valid collider type
      onCollisionEnter={(event: any) => { // Using 'any' to match expected type
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
      colliders="ball" // Valid collider type
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
  // Assuming 'capsule' is not a valid collider type, use 'cuboid' or compound colliders
  return (
    <RigidBody
      type={body.type === 'dynamic' ? 'dynamic' : 'fixed'}
      position={[body.position.x, body.position.y, body.position.z]}
      rotation={[body.rotation.x, body.rotation.y, body.rotation.z]}
      colliders="cuboid" // Changed from 'capsule' to 'cuboid'
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
  // Assuming 'cylinder' is not a valid collider type, use 'cuboid' or compound colliders
  return (
    <RigidBody
      type={body.type === 'dynamic' ? 'dynamic' : 'fixed'}
      position={[body.position.x, body.position.y, body.position.z]}
      rotation={[body.rotation.x, body.rotation.y, body.rotation.z]}
      colliders="cuboid" // Changed from 'cylinder' to 'cuboid'
      onCollisionEnter={(event: any) => {
        handleRapierCollision(event, body, engine);
      }}
      userData={{ id: body.id }}
    >
      <mesh>
        <cylinderGeometry args={(body.args as [number, number, number, number]) || [1, 1, 2, 32]} />
        <meshStandardMaterial color="purple" />
      </mesh>
    </RigidBody>
  );
};

const ConeBodyRapier: React.FC<{
  body: PhysicsBody;
  engine: PhysicsEngine;
}> = ({ body, engine }) => {
  // Assuming 'cone' is not a valid collider type, use 'cuboid' or compound colliders
  return (
    <RigidBody
      type={body.type === 'dynamic' ? 'dynamic' : 'fixed'}
      position={[body.position.x, body.position.y, body.position.z]}
      rotation={[body.rotation.x, body.rotation.y, body.rotation.z]}
      colliders="cuboid" // Changed from 'cone' to 'cuboid'
      onCollisionEnter={(event: any) => {
        handleRapierCollision(event, body, engine);
      }}
      userData={{ id: body.id }}
    >
      <mesh>
        <coneGeometry args={(body.args as [number, number, number]) || [1, 2, 32]} />
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
      colliders="cuboid" // Changed from 'plane' to 'cuboid'
      onCollisionEnter={(event: any) => {
        handleRapierCollision(event, body, engine);
      }}
      userData={{ id: body.id }}
    >
      <mesh>
        <boxGeometry args={[1000, 1, 1000]} /> {/* Large dimensions to simulate an infinite plane */}
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

  return (
    <>
      {engine === 'cannon' && (
        <CannonPhysics
          gravity={[gravity.x, gravity.y, gravity.z]}
          broadphase="SAP" // Using Sweep and Prune broadphase for performance
          allowSleep
          iterations={10}
          tolerance={0.001}
        >
          {debug && <CannonPhysicsDebug />}
          <PhysicsBodyRenderer engine={engine} />
          {children}
        </CannonPhysics>
      )}
      {engine === 'rapier' && (
        <RapierPhysics gravity={[gravity.x, gravity.y, gravity.z]} debug={debug}>
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
  // @react-three/cannon does not provide a built-in debug component
  // Implement debug visuals as needed or use another library
  // For example, you could use <Debug /> from another package or create custom visuals
  return null; // Placeholder
};

const RapierPhysicsDebugComponent: React.FC = () => {
  // Rapier provides a built-in Debug component
  // Uncomment the following lines if you want to enable Rapier's Debug visuals
  // import { Debug } from '@react-three/rapier';
  // return <Debug />;
  return null; // Placeholder
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

// src/systems/PhysicsSystem/PhysicsSystem.tsx

/**
 * Singleton class for physics system management
 * Provides methods to manage physics bodies globally.
 */
export class PhysicsSystemManager {
  private static instance: PhysicsSystemManager;
  private config: PhysicsConfig;

  private constructor(config: PhysicsConfig) {
    this.config = config;
    // Initialize any necessary properties
  }

  public static getInstance(config: PhysicsConfig): PhysicsSystemManager {
    if (!PhysicsSystemManager.instance) {
      PhysicsSystemManager.instance = new PhysicsSystemManager(config);
    }
    return PhysicsSystemManager.instance;
  }

  public initialize() {
    // Implementation of initialization logic
    // Initialize the physics engine based on the config
    if (this.config.engine === PhysicsEngine.Rapier) {
      // Set up Rapier physics engine
    } else if (this.config.engine === PhysicsEngine.Cannon) {
      // Set up Cannon physics engine
    }
  }

  // Additional methods for physics system management
}