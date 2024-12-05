// src/systems/PhysicsSystem/PhysicsSystem.tsx

import React from 'react';
import { RigidBody, Physics as RapierPhysics } from '@react-three/rapier';
import { Mesh, Vector3 } from 'three';
import { useBox, useSphere, useCylinder, usePlane, Physics as CannonPhysics } from '@react-three/cannon';
import { usePhysicsStore } from '../../stores/physicsStore';
import { PhysicsBody, PhysicsState, PhysicsConfig, PhysicsEngine } from '../../types/physics.types';

// Define a prop type for the PhysicsSystem component
interface PhysicsSystemProps {
  config: PhysicsConfig;
  children: React.ReactNode;
}

// PhysicsBodyRenderer component to render physics bodies from the store
interface PhysicsBodyRendererProps {
  engine: PhysicsEngine;
}

// Exported handleCollision function for use in tests
export const handleCollision = (
  event: any, // Use 'any' since 'CollisionEvent' is not exported
  body: PhysicsBody,
  engine: PhysicsEngine
) => {
  if (engine === "rapier") {
    // For RapierPhysics
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
  } else if (engine === "cannon") {
    // For CannonPhysics
    const otherBody = event.body; // Assuming 'event.body' is available
    const otherBodyId = otherBody?.userData?.id;

    const contactPoint = event.contactPoint;

    if (otherBodyId && contactPoint) {
      const point = new Vector3(
        contactPoint.x,
        contactPoint.y,
        contactPoint.z
      );
      body.onCollide && body.onCollide(otherBodyId, point);
    }
  }
};

const PhysicsBodyRenderer: React.FC<PhysicsBodyRendererProps> = ({ engine }) => {
  const bodies = usePhysicsStore((state) => state.bodies);

  return (
    <>
      {Object.values(bodies).map((body) => {
        if (engine === "cannon") {
          switch (body.shape) {
            case "box":
              return <BoxBodyCannon key={body.id} body={body} engine={engine} />;
            case "sphere":
              return <SphereBodyCannon key={body.id} body={body} engine={engine} />;
            case "capsule":
              return <CapsuleBodyCannon key={body.id} body={body} engine={engine} />;
            case "cylinder":
              return <CylinderBodyCannon key={body.id} body={body} engine={engine} />;
            case "cone":
              return <ConeBodyCannon key={body.id} body={body} engine={engine} />;
            case "plane":
              return <PlaneBodyCannon key={body.id} body={body} engine={engine} />;
            default:
              return null;
          }
        } else if (engine === "rapier") {
          switch (body.shape) {
            case "box":
              return <BoxBodyRapier key={body.id} body={body} engine={engine} />;
            case "sphere":
              return <SphereBodyRapier key={body.id} body={body} engine={engine} />;
            case "capsule":
              // Rapier supports 'capsule'
              return <CapsuleBodyRapier key={body.id} body={body} engine={engine} />;
            case "cylinder":
              // Rapier supports 'cylinder'
              return <CylinderBodyRapier key={body.id} body={body} engine={engine} />;
            case "cone":
              // Rapier supports 'cone'
              return <ConeBodyRapier key={body.id} body={body} engine={engine} />;
            case "plane":
              // Rapier does not support 'plane', use 'cuboid' with large dimensions
              return <PlaneBodyRapier key={body.id} body={body} engine={engine} />;
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

// Implement @react-three/cannon body components
const BoxBodyCannon: React.FC<{ body: PhysicsBody; engine: PhysicsEngine }> = ({ body, engine }) => {
  const [ref] = useBox<Mesh>(() => ({
    mass: body.type === "dynamic" ? body.mass || 1 : 0,
    position: [body.position.x, body.position.y, body.position.z],
    rotation: [body.rotation.x, body.rotation.y, body.rotation.z],
    args: (body.args as [number, number, number]) || [1, 1, 1],
    onCollide: (e: any) => {
      handleCollision(e, body, engine);
    },
  }));

  return <mesh ref={ref} />;
};

const SphereBodyCannon: React.FC<{ body: PhysicsBody; engine: PhysicsEngine }> = ({ body, engine }) => {
  const [ref] = useSphere<Mesh>(() => ({
    mass: body.type === "dynamic" ? body.mass || 1 : 0,
    position: [body.position.x, body.position.y, body.position.z],
    rotation: [body.rotation.x, body.rotation.y, body.rotation.z],
    args: (body.args as [number]) || [1],
    onCollide: (e: any) => {
      handleCollision(e, body, engine);
    },
  }));

  return <mesh ref={ref} />;
};

const CapsuleBodyCannon: React.FC<{ body: PhysicsBody; engine: PhysicsEngine }> = ({ body, engine }) => {
  const [ref] = useCylinder<Mesh>(() => ({
    mass: body.type === "dynamic" ? body.mass || 1 : 0,
    position: [body.position.x, body.position.y, body.position.z],
    rotation: [body.rotation.x, body.rotation.y, body.rotation.z],
    args: (body.args as [number, number]) || [0.5, 2],
    onCollide: (e: any) => {
      handleCollision(e, body, engine);
    },
  }));

  return <mesh ref={ref} />;
};

const CylinderBodyCannon: React.FC<{ body: PhysicsBody; engine: PhysicsEngine }> = ({ body, engine }) => {
  const [ref] = useCylinder<Mesh>(() => ({
    mass: body.type === "dynamic" ? body.mass || 1 : 0,
    position: [body.position.x, body.position.y, body.position.z],
    rotation: [body.rotation.x, body.rotation.y, body.rotation.z],
    args: (body.args as [number, number, number, number]) || [1, 1, 2, 32],
    onCollide: (e: any) => {
      handleCollision(e, body, engine);
    },
  }));

  return <mesh ref={ref} />;
};

const ConeBodyCannon: React.FC<{ body: PhysicsBody; engine: PhysicsEngine }> = ({ body, engine }) => {
  // Since @react-three/cannon does not have a useCone, use Cylinder as a placeholder
  const [ref] = useCylinder<Mesh>(() => ({
    mass: body.type === "dynamic" ? body.mass || 1 : 0,
    position: [body.position.x, body.position.y, body.position.z],
    rotation: [body.rotation.x, body.rotation.y, body.rotation.z],
    args: (body.args as [number, number, number]) || [0.5, 0, 2],
    onCollide: (e: any) => {
      handleCollision(e, body, engine);
    },
  }));

  return <mesh ref={ref} />;
};

const PlaneBodyCannon: React.FC<{ body: PhysicsBody; engine: PhysicsEngine }> = ({ body, engine }) => {
  const [ref] = usePlane<Mesh>(() => ({
    mass: 0, // static
    position: [body.position.x, body.position.y, body.position.z],
    rotation: [body.rotation.x, body.rotation.y, body.rotation.z],
    // @react-three/cannon's usePlane does not take 'args'
    onCollide: (e: any) => {
      handleCollision(e, body, engine);
    },
  }));

  return <mesh ref={ref} />;
};

// Implement @react-three/rapier body components
const BoxBodyRapier: React.FC<{ body: PhysicsBody; engine: PhysicsEngine }> = ({ body, engine }) => {
  return (
    <RigidBody
      type={body.type === "dynamic" ? "dynamic" : "fixed"}
      position={[body.position.x, body.position.y, body.position.z]}
      rotation={[body.rotation.x, body.rotation.y, body.rotation.z]}
      colliders="cuboid" // Valid collider type
      onCollisionEnter={(event) => {
        handleCollision(event, body, engine);
      }}
      userData={{ id: body.id } as any} // Type assertion to bypass TypeScript error
    >
      <mesh>
        <boxGeometry args={(body.args as [number, number, number]) || [1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    </RigidBody>
  );
};

const SphereBodyRapier: React.FC<{ body: PhysicsBody; engine: PhysicsEngine }> = ({ body, engine }) => {
  return (
    <RigidBody
      type={body.type === "dynamic" ? "dynamic" : "fixed"}
      position={[body.position.x, body.position.y, body.position.z]}
      rotation={[body.rotation.x, body.rotation.y, body.rotation.z]}
      colliders="ball" // Valid collider type
      onCollisionEnter={(event) => {
        handleCollision(event, body, engine);
      }}
      userData={{ id: body.id } as any} // Type assertion to bypass TypeScript error
    >
      <mesh>
        <sphereGeometry args={(body.args as [number, number, number]) || [1, 32, 32]} />
        <meshStandardMaterial color="blue" />
      </mesh>
    </RigidBody>
  );
};

const CapsuleBodyRapier: React.FC<{ body: PhysicsBody; engine: PhysicsEngine }> = ({ body, engine }) => {
  return (
    <RigidBody
      type={body.type === "dynamic" ? "dynamic" : "fixed"}
      position={[body.position.x, body.position.y, body.position.z]}
      rotation={[body.rotation.x, body.rotation.y, body.rotation.z]}
      colliders="capsule" // Valid collider type
      onCollisionEnter={(event) => {
        handleCollision(event, body, engine);
      }}
      userData={{ id: body.id } as any} // Type assertion to bypass TypeScript error
    >
      <mesh>
        <cylinderGeometry args={(body.args as [number, number, number, number]) || [0.5, 0.5, 2, 32]} />
        <meshStandardMaterial color="green" />
      </mesh>
    </RigidBody>
  );
};

const CylinderBodyRapier: React.FC<{ body: PhysicsBody; engine: PhysicsEngine }> = ({ body, engine }) => {
  return (
    <RigidBody
      type={body.type === "dynamic" ? "dynamic" : "fixed"}
      position={[body.position.x, body.position.y, body.position.z]}
      rotation={[body.rotation.x, body.rotation.y, body.rotation.z]}
      colliders="cylinder" // Valid collider type
      onCollisionEnter={(event) => {
        handleCollision(event, body, engine);
      }}
      userData={{ id: body.id } as any} // Type assertion to bypass TypeScript error
    >
      <mesh>
        <cylinderGeometry args={(body.args as [number, number, number, number]) || [1, 1, 2, 32]} />
        <meshStandardMaterial color="purple" />
      </mesh>
    </RigidBody>
  );
};

const ConeBodyRapier: React.FC<{ body: PhysicsBody; engine: PhysicsEngine }> = ({ body, engine }) => {
  return (
    <RigidBody
      type={body.type === "dynamic" ? "dynamic" : "fixed"}
      position={[body.position.x, body.position.y, body.position.z]}
      rotation={[body.rotation.x, body.rotation.y, body.rotation.z]}
      colliders="cone" // Valid collider type
      onCollisionEnter={(event) => {
        handleCollision(event, body, engine);
      }}
      userData={{ id: body.id } as any} // Type assertion to bypass TypeScript error
    >
      <mesh>
        <coneGeometry args={(body.args as [number, number, number]) || [1, 2, 32]} />
        <meshStandardMaterial color="yellow" />
      </mesh>
    </RigidBody>
  );
};

const PlaneBodyRapier: React.FC<{ body: PhysicsBody; engine: PhysicsEngine }> = ({ body, engine }) => {
  return (
    <RigidBody
      type="fixed"
      position={[body.position.x, body.position.y, body.position.z]}
      rotation={[body.rotation.x, body.rotation.y, body.rotation.z]}
      colliders="cuboid" // Changed from 'plane' to 'cuboid'
      onCollisionEnter={(event) => {
        handleCollision(event, body, engine);
      }}
      userData={{ id: body.id } as any} // Type assertion to bypass TypeScript error
    >
      <mesh>
        <boxGeometry args={[1000, 1, 1000]} /> {/* Large dimensions to simulate an infinite plane */}
        <meshStandardMaterial color="grey" />
      </mesh>
    </RigidBody>
  );
};

// Main PhysicsSystem component
export const PhysicsSystem: React.FC<PhysicsSystemProps> = ({ config, children }) => {
  const { engine, gravity = new Vector3(0, -9.81, 0), debug = false } = config;

  return (
    <>
      {engine === "cannon" && (
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
      {engine === "rapier" && (
        <RapierPhysics gravity={[gravity.x, gravity.y, gravity.z]} debug={debug}>
          {debug && <RapierPhysicsDebugComponent />}
          <PhysicsBodyRenderer engine={engine} />
          {children}
        </RapierPhysics>
      )}
    </>
  );
};

// Dummy debug components; implement proper debug visuals if needed
const CannonPhysicsDebug: React.FC = () => {
  // @react-three/cannon does not provide a built-in debug component
  // Implement debug visuals as needed or use another library
  return null; // Placeholder
};

// Rapier provides a built-in debug component
const RapierPhysicsDebugComponent: React.FC = () => {
  // Import and use Rapier's Debug component if available
  // Example:
  // import { Debug } from '@react-three/rapier';
  // return <Debug />;
  return null; // Placeholder
};

// Serialize and deserialize physics state
export const serializeState = (): PhysicsState => {
  return usePhysicsStore.getState();
};

export const deserializeState = (state: PhysicsState): void => {
  usePhysicsStore.setState(state);
};

// Create a singleton class for physics system management
export class PhysicsSystemManager {
  private static instance: PhysicsSystemManager | null = null;

  private constructor() {}

  public static getInstance(): PhysicsSystemManager {
    if (!PhysicsSystemManager.instance) {
      PhysicsSystemManager.instance = new PhysicsSystemManager();
    }
    return PhysicsSystemManager.instance;
  }

  public addBody(body: PhysicsBody): void {
    usePhysicsStore.getState().addBody(body);
  }

  public removeBody(id: string): void {
    usePhysicsStore.getState().removeBody(id);
  }

  public updateBody(id: string, updates: Partial<PhysicsBody>): void {
    usePhysicsStore.getState().updateBody(id, updates);
  }

  public getBody(id: string): PhysicsBody | undefined {
    return usePhysicsStore.getState().bodies[id];
  }

  public reset(): void {
    usePhysicsStore.setState({ bodies: {} });
  }
}
