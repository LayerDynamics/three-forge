// src/systems/PhysicsSystem/PhysicsSystem.tsx

import React from 'react';
import { RigidBody, RapierPhysics, CollisionEnterPayload } from '@react-three/rapier';
import { Mesh, Vector3 } from 'three';
import { useBox, useSphere, useCylinder, usePlane } from '@react-three/cannon';
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

const handleCollision = (
  event: CollisionEnterPayload,
  body: PhysicsBody
) => {
  const otherBodyId = event.collider.parent?.userData?.id;
  const contactPoint = event.contact?.point;
  if (otherBodyId && contactPoint) {
    const point = new Vector3(contactPoint.x, contactPoint.y, contactPoint.z);
    body.onCollide && body.onCollide(otherBodyId, point);
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
              return <BoxBodyCannon key={body.id} body={body} />;
            case "sphere":
              return <SphereBodyCannon key={body.id} body={body} />;
            case "capsule":
              return <CapsuleBodyCannon key={body.id} body={body} />;
            case "cylinder":
              return <CylinderBodyCannon key={body.id} body={body} />;
            case "cone":
              return <ConeBodyCannon key={body.id} body={body} />;
            case "plane":
              return <PlaneBodyCannon key={body.id} body={body} />;
            default:
              return null;
          }
        } else if (engine === "rapier") {
          switch (body.shape) {
            case "box":
              return <BoxBodyRapier key={body.id} body={body} />;
            case "sphere":
              return <SphereBodyRapier key={body.id} body={body} />;
            case "capsule":
              return <CapsuleBodyRapier key={body.id} body={body} />;
            case "cylinder":
              return <CylinderBodyRapier key={body.id} body={body} />;
            case "cone":
              return <ConeBodyRapier key={body.id} body={body} />;
            case "plane":
              return <PlaneBodyRapier key={body.id} body={body} />;
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
const BoxBodyCannon: React.FC<{ body: PhysicsBody }> = ({ body }) => {
  const [ref] = useBox(() => ({
    mass: body.type === "dynamic" ? body.mass || 1 : 0,
    position: [body.position.x, body.position.y, body.position.z],
    rotation: [body.rotation.x, body.rotation.y, body.rotation.z],
    args: (body.args as [number, number, number]) || [1, 1, 1],
    onCollide: (e: any) => {
      handleCollision(e, body);
    },
  }));

  return <mesh ref={ref as React.RefObject<Mesh>} />;
};

const SphereBodyCannon: React.FC<{ body: PhysicsBody }> = ({ body }) => {
  const [ref] = useSphere(() => ({
    mass: body.type === "dynamic" ? body.mass || 1 : 0,
    position: [body.position.x, body.position.y, body.position.z],
    rotation: [body.rotation.x, body.rotation.y, body.rotation.z],
    args: (body.args as [number]) || [1],
    onCollide: (e: any) => {
      handleCollision(e, body);
    },
  }));

  return <mesh ref={ref as React.RefObject<Mesh>} />;
};

const CapsuleBodyCannon: React.FC<{ body: PhysicsBody }> = ({ body }) => {
  const [ref] = useCylinder(() => ({
    mass: body.type === "dynamic" ? body.mass || 1 : 0,
    position: [body.position.x, body.position.y, body.position.z],
    rotation: [body.rotation.x, body.rotation.y, body.rotation.z],
    args: (body.args as [number, number]) || [0.5, 2],
    onCollide: (e: any) => {
      handleCollision(e, body);
    },
  }));

  return <mesh ref={ref as React.RefObject<Mesh>} />;
};

const CylinderBodyCannon: React.FC<{ body: PhysicsBody }> = ({ body }) => {
  const [ref] = useCylinder(() => ({
    mass: body.type === "dynamic" ? body.mass || 1 : 0,
    position: [body.position.x, body.position.y, body.position.z],
    rotation: [body.rotation.x, body.rotation.y, body.rotation.z],
    args: (body.args as [number, number, number, number]) || [1, 1, 2, 32],
    onCollide: (e: any) => {
      handleCollision(e, body);
    },
  }));

  return <mesh ref={ref as React.RefObject<Mesh>} />;
};

const ConeBodyCannon: React.FC<{ body: PhysicsBody }> = ({ body }) => {
  // Since @react-three/cannon does not have a useCone, use Cylinder as a placeholder
  const [ref] = useCylinder(() => ({
    mass: body.type === "dynamic" ? body.mass || 1 : 0,
    position: [body.position.x, body.position.y, body.position.z],
    rotation: [body.rotation.x, body.rotation.y, body.rotation.z],
    args: (body.args as [number, number, number]) || [0.5, 0, 2],
    onCollide: (e: any) => {
      handleCollision(e, body);
    },
  }));

  return <mesh ref={ref as React.RefObject<Mesh>} />;
};

const PlaneBodyCannon: React.FC<{ body: PhysicsBody }> = ({ body }) => {
  const [ref] = usePlane(() => ({
    mass: 0, // static
    position: [body.position.x, body.position.y, body.position.z],
    rotation: [body.rotation.x, body.rotation.y, body.rotation.z],
    // @react-three/cannon's usePlane does not take 'args'
    onCollide: (e: any) => {
      handleCollision(e, body);
    },
  }));

  return <mesh ref={ref as React.RefObject<Mesh>} />;
};

// Implement @react-three/rapier body components
const BoxBodyRapier: React.FC<{ body: PhysicsBody }> = ({ body }) => {
  return (
    <RigidBody
      type={body.type === "dynamic" ? "dynamic" : "fixed"}
      position={[body.position.x, body.position.y, body.position.z]}
      rotation={[body.rotation.x, body.rotation.y, body.rotation.z]}
      colliders="cuboid" // Valid collider type
      onCollisionEnter={(event) => {
        handleCollision(event, body);
      }}
      userData={{ id: body.id }} // Assign userData for identification
    >
      <mesh>
        <boxGeometry args={(body.args as [number, number, number]) || [1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    </RigidBody>
  );
};

const SphereBodyRapier: React.FC<{ body: PhysicsBody }> = ({ body }) => {
  return (
    <RigidBody
      type={body.type === "dynamic" ? "dynamic" : "fixed"}
      position={[body.position.x, body.position.y, body.position.z]}
      rotation={[body.rotation.x, body.rotation.y, body.rotation.z]}
      colliders="ball" // Valid collider type
      onCollisionEnter={(event) => {
        handleCollision(event, body);
      }}
      userData={{ id: body.id }} // Assign userData for identification
    >
      <mesh>
        <sphereGeometry args={(body.args as [number, number, number]) || [1, 32, 32]} />
        <meshStandardMaterial color="blue" />
      </mesh>
    </RigidBody>
  );
};

const CapsuleBodyRapier: React.FC<{ body: PhysicsBody }> = ({ body }) => {
  return (
    <RigidBody
      type={body.type === "dynamic" ? "dynamic" : "fixed"}
      position={[body.position.x, body.position.y, body.position.z]}
      rotation={[body.rotation.x, body.rotation.y, body.rotation.z]}
      colliders="capsule" // Ensure 'capsule' is a valid collider type
      onCollisionEnter={(event) => {
        handleCollision(event, body);
      }}
      userData={{ id: body.id }} // Assign userData for identification
    >
      <mesh>
        <cylinderGeometry args={(body.args as [number, number, number, number]) || [0.5, 0.5, 2, 32]} />
        <meshStandardMaterial color="green" />
      </mesh>
    </RigidBody>
  );
};

const CylinderBodyRapier: React.FC<{ body: PhysicsBody }> = ({ body }) => {
  return (
    <RigidBody
      type={body.type === "dynamic" ? "dynamic" : "fixed"}
      position={[body.position.x, body.position.y, body.position.z]}
      rotation={[body.rotation.x, body.rotation.y, body.rotation.z]}
      colliders="cylinder" // Ensure 'cylinder' is a valid collider type
      onCollisionEnter={(event) => {
        handleCollision(event, body);
      }}
      userData={{ id: body.id }} // Assign userData for identification
    >
      <mesh>
        <cylinderGeometry args={(body.args as [number, number, number, number]) || [1, 1, 2, 32]} />
        <meshStandardMaterial color="yellow" />
      </mesh>
    </RigidBody>
  );
};

const ConeBodyRapier: React.FC<{ body: PhysicsBody }> = ({ body }) => {
  return (
    <RigidBody
      type={body.type === "dynamic" ? "dynamic" : "fixed"}
      position={[body.position.x, body.position.y, body.position.z]}
      rotation={[body.rotation.x, body.rotation.y, body.rotation.z]}
      colliders="cone" // Ensure 'cone' is a valid collider type
      onCollisionEnter={(event) => {
        handleCollision(event, body);
      }}
      userData={{ id: body.id }} // Assign userData for identification
    >
      <mesh>
        <coneGeometry args={(body.args as [number, number, number]) || [1, 2, 32]} />
        <meshStandardMaterial color="purple" />
      </mesh>
    </RigidBody>
  );
};

const PlaneBodyRapier: React.FC<{ body: PhysicsBody }> = ({ body }) => {
  return (
    <RigidBody
      type="fixed"
      position={[body.position.x, body.position.y, body.position.z]}
      rotation={[body.rotation.x, body.rotation.y, body.rotation.z]}
      colliders="plane" // Ensure 'plane' is a valid collider type
      onCollisionEnter={(event) => {
        handleCollision(event, body);
      }}
      userData={{ id: body.id }} // Assign userData for identification
    >
      <mesh>
        <planeGeometry args={(body.args as [number, number, number, number]) || [10, 10, 32, 32]} />
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
        <>
          {/* Implement @react-three/cannon physics */}
          {/* @react-three/cannon does not provide a Debug component */}
          {/* Optionally include a CannonPhysicsDebug component */}
          <PhysicsDebug engine={engine} debug={debug} />
          <PhysicsBodyRenderer engine={engine} />
          {children}
        </>
      )}
      {engine === "rapier" && (
        <RapierPhysics gravity={[gravity.x, gravity.y, gravity.z]} debug={debug}>
          {/* Use Rapier's Debug component if available */}
          {debug && <RapierPhysicsDebugComponent />}
          <PhysicsBodyRenderer engine={engine} />
          {children}
        </RapierPhysics>
      )}
    </>
  );
};

// Dummy debug components; implement proper debug visuals if needed
const PhysicsDebug: React.FC<{ engine: PhysicsEngine, debug: boolean }> = ({ engine, debug }) => {
  if (engine === "cannon" && debug) {
    // Implement Cannon.js debug visuals if needed
    return null; // Placeholder
  }
  return null;
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
