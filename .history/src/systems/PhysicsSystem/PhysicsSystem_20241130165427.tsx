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
 * Local interface representing a collision event from Rapier.
 */
interface RapierCollisionPayload {
  otherRigidBodyObject: () => { userData: { id: string } } | undefined;
  contacts: Array<{ x: number; y: number; z: number }>;
}

/**
 * Local interface representing a collision event from Cannon.
 */
interface CannonCollisionEvent {
  body: { userData: { id: string } };
  contact: {
    // Assuming contact contains a point; adjust based on actual library definition
    contactPoint: { x: number; y: number; z: number };
    normal: [number, number, number];
    impactVelocity: number;
    // Add other relevant properties if necessary
  };
}

/**
 * Handle collision events from Rapier.
 */
const handleRapierCollision = (
  event: RapierCollisionPayload,
  body: PhysicsBody,
  engine: PhysicsEngine
) => {
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
 * Handle collision events from Cannon.
 */
const handleCannonCollision = (
  event: CannonCollisionEvent,
  body: PhysicsBody,
  engine: PhysicsEngine
) => {
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
    onCollide: (e: CannonCollisionEvent) => {
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
    onCollide: (e: CannonCollisionEvent) => {
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
    onCollide: (e: CannonCollisionEvent) => {
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
    onCollide: (e: CannonCollisionEvent) => {
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
    onCollide: (e: CannonCollisionEvent) => {
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
    onCollide: (e: CannonCollisionEvent) => {
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
      onCollisionEnter={(event: RapierCollisionPayload) => {
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
      onCollisionEnter={(event: RapierCollisionPayload) => {
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
      onCollisionEnter={(event: RapierCollisionPayload) => {
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
      onCollisionEnter={(event: RapierCollisionPayload) => {
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
      onCollisionEnter={(event: RapierCollisionPayload) => {
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
      onCollisionEnter={(event: RapierCollisionPayload) => {
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

/**
 * Singleton class for physics system management
 * Provides methods to manage physics bodies globally.
 */
export class PhysicsSystemManager {
  private static instance: PhysicsSystemManager | null = null;

  private constructor() {}

  /**
   * Retrieves the singleton instance of PhysicsSystemManager.
   */
  public static getInstance(): PhysicsSystemManager {
    if (!PhysicsSystemManager.instance) {
      PhysicsSystemManager.instance = new PhysicsSystemManager();
    }
    return PhysicsSystemManager.instance;
  }

  /**
   * Adds a new physics body to the physics store.
   * @param body - The physics body to add.
   */
  public addBody(body: PhysicsBody): void {
    usePhysicsStore.getState().addBody(body);
  }

  /**
   * Removes a physics body from the physics store by its ID.
   * @param id - The ID of the physics body to remove.
   */
  public removeBody(id: string): void {
    usePhysicsStore.getState().removeBody(id);
  }

  /**
   * Updates an existing physics body in the physics store.
   * @param id - The ID of the physics body to update.
   * @param updates - The partial updates to apply to the physics body.
   */
  public updateBody(id: string, updates: Partial<PhysicsBody>): void {
    usePhysicsStore.getState().updateBody(id, updates);
  }

  /**
   * Retrieves a physics body from the physics store by its ID.
   * @param id - The ID of the physics body to retrieve.
   * @returns The physics body if found, otherwise undefined.
   */
  public getBody(id: string): PhysicsBody | undefined {
    return usePhysicsStore.getState().bodies[id];
  }

  /**
   * Resets the physics store by clearing all physics bodies.
   */
  public reset(): void {
    usePhysicsStore.setState({ bodies: {} });
  }
}
