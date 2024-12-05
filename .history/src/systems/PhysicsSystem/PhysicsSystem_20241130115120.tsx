// src/systems/PhysicsSystem/PhysicsSystem.tsx

import React from "react";
// Import necessary hooks from @react-three/cannon
import { useBox, useSphere, useCylinder, usePlane } from "@react-three/cannon";
// Import RigidBody from @react-three/rapier
import { Physics as RapierPhysics, RigidBody } from "@react-three/rapier";
import { PhysicsConfig, PhysicsBody, PhysicsEngine, PhysicsState } from "../../types/physics.types";
import { usePhysicsStore } from "../../stores/physicsStore";
import { Vector3 } from "three";
import { EventDispatcher } from "../../utils/EventDispatcher";

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
  event: any, // Define a proper type based on @react-three/rapier's collision event
  body: PhysicsBody
) => {
  const otherBodyId = event.other?.rigidBodyObject?.userData?.id;
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
            // Implement other shapes as needed
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
            // Implement other shapes as needed
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
    args: body.args || [1, 1, 1],
    onCollide: (e: any) => {
      handleCollision(e, body);
    },
  }));

  return <mesh ref={ref} />;
};

const SphereBodyCannon: React.FC<{ body: PhysicsBody }> = ({ body }) => {
  const [ref] = useSphere(() => ({
    mass: body.type === "dynamic" ? body.mass || 1 : 0,
    position: [body.position.x, body.position.y, body.position.z],
    rotation: [body.rotation.x, body.rotation.y, body.rotation.z],
    args: body.args || [1],
    onCollide: (e: any) => {
      handleCollision(e, body);
    },
  }));

  return <mesh ref={ref} />;
};

const CapsuleBodyCannon: React.FC<{ body: PhysicsBody }> = ({ body }) => {
  const [ref] = useCylinder(() => ({
    mass: body.type === "dynamic" ? body.mass || 1 : 0,
    position: [body.position.x, body.position.y, body.position.z],
    rotation: [body.rotation.x, body.rotation.y, body.rotation.z],
    args: body.args || [0.5, 2], // radiusTop, radiusBottom, height
    onCollide: (e: any) => {
      handleCollision(e, body);
    },
  }));

  return <mesh ref={ref} />;
};

const CylinderBodyCannon: React.FC<{ body: PhysicsBody }> = ({ body }) => {
  const [ref] = useCylinder(() => ({
    mass: body.type === "dynamic" ? body.mass || 1 : 0,
    position: [body.position.x, body.position.y, body.position.z],
    rotation: [body.rotation.x, body.rotation.y, body.rotation.z],
    args: body.args || [1, 1, 2], // radiusTop, radiusBottom, height
    onCollide: (e: any) => {
      handleCollision(e, body);
    },
  }));

  return <mesh ref={ref} />;
};

const ConeBodyCannon: React.FC<{ body: PhysicsBody }> = ({ body }) => {
  // @react-three/cannon does not have a useCone hook by default
  // Implement a custom cone collider or use other shapes approximating a cone
  // For simplicity, use a cylinder as a placeholder
  const [ref] = useCylinder(() => ({
    mass: body.type === "dynamic" ? body.mass || 1 : 0,
    position: [body.position.x, body.position.y, body.position.z],
    rotation: [body.rotation.x, body.rotation.y, body.rotation.z],
    args: body.args || [0.5, 0, 2], // cone shape approximation
    onCollide: (e: any) => {
      handleCollision(e, body);
    },
  }));

  return <mesh ref={ref} />;
};

const PlaneBodyCannon: React.FC<{ body: PhysicsBody }> = ({ body }) => {
  const [ref] = usePlane(() => ({
    mass: 0, // static
    position: [body.position.x, body.position.y, body.position.z],
    rotation: [body.rotation.x, body.rotation.y, body.rotation.z],
    // Note: @react-three/cannon's usePlane doesn't take 'args'
    onCollide: (e: any) => {
      handleCollision(e, body);
    },
  }));

  return <mesh ref={ref} />;
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
        <boxGeometry args={body.args || [1, 1, 1]} />
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
        <sphereGeometry args={body.args || [1, 32, 32]} />
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
      colliders="capsule" // Valid collider type
      onCollisionEnter={(event) => {
        handleCollision(event, body);
      }}
      userData={{ id: body.id }} // Assign userData for identification
    >
      <mesh>
        <cylinderGeometry args={body.args || [0.5, 0.5, 2, 32]} />
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
      colliders="cylinder" // Valid collider type
      onCollisionEnter={(event) => {
        handleCollision(event, body);
      }}
      userData={{ id: body.id }} // Assign userData for identification
    >
      <mesh>
        <cylinderGeometry args={body.args || [1, 1, 2, 32]} />
        <meshStandardMaterial color="purple" />
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
      colliders="cone" // Valid collider type
      onCollisionEnter={(event) => {
        handleCollision(event, body);
      }}
      userData={{ id: body.id }} // Assign userData for identification
    >
      <mesh>
        <coneGeometry args={body.args || [1, 2, 32]} />
        <meshStandardMaterial color="yellow" />
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
      colliders="plane" // Valid collider type
      onCollisionEnter={(event) => {
        handleCollision(event, body);
      }}
      userData={{ id: body.id }} // Assign userData for identification
    >
      <mesh>
        <planeGeometry args={body.args || [10, 10]} />
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
        <Physics
          gravity={[gravity.x, gravity.y, gravity.z]}
          broadphase="SAP" // Using Sweep and Prune broadphase for performance
          allowSleep
          iterations={10}
          tolerance={0.001}
        >
          {debug && <CannonPhysicsDebug />}
          <PhysicsBodyRenderer engine={engine} />
          {children}
        </Physics>
      )}
      {engine === "rapier" && (
        <RapierPhysics gravity={gravity.toArray()} debug={debug}>
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
  // Implement debug visuals as needed
  return null;
};

// Rapier provides a built-in debug component
const RapierPhysicsDebugComponent: React.FC = () => {
  // Replace this with the actual Debug component from @react-three/rapier if needed
  // Example:
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
