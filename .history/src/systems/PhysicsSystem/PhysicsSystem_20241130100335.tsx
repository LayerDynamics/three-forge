// PhysicsSystem.ts: Interfaces with @react-three/cannon to simulate physics.
// src/systems/PhysicsSystem/PhysicsSystem.tsx

import React from "react";
import { Physics as CannonPhysics } from "@react-three/cannon";
import { Physics as RapierPhysics, Debug as RapierDebug } from "@react-three/rapier";
import { PhysicsConfig, PhysicsBody, PhysicsEngine } from "../../types/physics.types";
import { usePhysicsStore } from "../../stores/physicsStore";
import { RigidBody } from "@react-three/rapier";
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
      body.onCollide &&
        body.onCollide(
          e.body.id,
          new Vector3(e.contact.impact.x, e.contact.impact.y, e.contact.impact.z)
        );
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
      body.onCollide &&
        body.onCollide(
          e.body.id,
          new Vector3(e.contact.impact.x, e.contact.impact.y, e.contact.impact.z)
        );
    },
  }));

  return <mesh ref={ref} />;
};

const CapsuleBodyCannon: React.FC<{ body: PhysicsBody }> = ({ body }) => {
  const [ref] = useCapsule(() => ({
    mass: body.type === "dynamic" ? body.mass || 1 : 0,
    position: [body.position.x, body.position.y, body.position.z],
    rotation: [body.rotation.x, body.rotation.y, body.rotation.z],
    args: body.args || [0.5, 2], // radius, height
    onCollide: (e: any) => {
      body.onCollide &&
        body.onCollide(
          e.body.id,
          new Vector3(e.contact.impact.x, e.contact.impact.y, e.contact.impact.z)
        );
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
      body.onCollide &&
        body.onCollide(
          e.body.id,
          new Vector3(e.contact.impact.x, e.contact.impact.y, e.contact.impact.z)
        );
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
      body.onCollide &&
        body.onCollide(
          e.body.id,
          new Vector3(e.contact.impact.x, e.contact.impact.y, e.contact.impact.z)
        );
    },
  }));

  return <mesh ref={ref} />;
};

const PlaneBodyCannon: React.FC<{ body: PhysicsBody }> = ({ body }) => {
  const [ref] = usePlane(() => ({
    mass: 0, // static
    position: [body.position.x, body.position.y, body.position.z],
    rotation: [body.rotation.x, body.rotation.y, body.rotation.z],
    args: body.args || [10, 10], // size
    onCollide: (e: any) => {
      body.onCollide &&
        body.onCollide(
          e.body.id,
          new Vector3(e.contact.impact.x, e.contact.impact.y, e.contact.impact.z)
        );
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
      colliders={body.args || "cuboid"} // default to cuboid collider
      onCollisionEnter={(event) => {
        const otherBodyId = event.collider2.rigidBody?.userData.id;
        const contactPoint = new Vector3(...event.contact.point);
        body.onCollide && body.onCollide(otherBodyId, contactPoint);
      }}
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
      colliders={body.args || "ball"}
      onCollisionEnter={(event) => {
        const otherBodyId = event.collider2.rigidBody?.userData.id;
        const contactPoint = new Vector3(...event.contact.point);
        body.onCollide && body.onCollide(otherBodyId, contactPoint);
      }}
    >
      <mesh>
        <sphereGeometry args={body.args || [1, 32, 32]} />
        <meshStandardMaterial color="blue" />
      </mesh>
    </RigidBody>
  );
};

const CapsuleBodyRapier: React.FC<{ body: PhysicsBody }> = ({ body }) => {
  // Implement CapsuleBodyRapier using rapier's RigidBody and capsule colliders
  // For simplicity, use cylinder as a placeholder
  return (
    <RigidBody
      type={body.type === "dynamic" ? "dynamic" : "fixed"}
      position={[body.position.x, body.position.y, body.position.z]}
      rotation={[body.rotation.x, body.rotation.y, body.rotation.z]}
      colliders={body.args || "capsule"}
      onCollisionEnter={(event) => {
        const otherBodyId = event.collider2.rigidBody?.userData.id;
        const contactPoint = new Vector3(...event.contact.point);
        body.onCollide && body.onCollide(otherBodyId, contactPoint);
      }}
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
      colliders={body.args || "cylinder"} // default to cylinder collider
      onCollisionEnter={(event) => {
        const otherBodyId = event.collider2.rigidBody?.userData.id;
        const contactPoint = new Vector3(...event.contact.point);
        body.onCollide && body.onCollide(otherBodyId, contactPoint);
      }}
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
      colliders={body.args || "cone"} // default to cone collider
      onCollisionEnter={(event) => {
        const otherBodyId = event.collider2.rigidBody?.userData.id;
        const contactPoint = new Vector3(...event.contact.point);
        body.onCollide && body.onCollide(otherBodyId, contactPoint);
      }}
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
      colliders={body.args || "plane"}
      onCollisionEnter={(event) => {
        const otherBodyId = event.collider2.rigidBody?.userData.id;
        const contactPoint = new Vector3(...event.contact.point);
        body.onCollide && body.onCollide(otherBodyId, contactPoint);
      }}
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
        <CannonPhysics gravity={[gravity.x, gravity.y, gravity.z]} allowSleep>
          {debug && <CannonPhysicsDebug />}
          <PhysicsBodyRenderer engine={engine} />
          {children}
        </CannonPhysics>
      )}
      {engine === "rapier" && (
        <RapierPhysics gravity={gravity.toArray()} debug={debug}>
          {debug && <RapierDebug />}
          <PhysicsBodyRenderer engine={engine} />
          {children}
        </RapierPhysics>
      )}
    </>
  );
};

// Dummy debug components; in real use, you might need to implement proper debug visuals
const CannonPhysicsDebug: React.FC = () => {
  // @react-three/cannon does not provide a debug component by default
  // Implement debug visuals as needed, e.g., using helper meshes or a separate physics debugger
  return null;
};

const RapierDebug: React.FC = () => {
  return <RapierDebug />;
};

// Serialize and deserialize physics state

export const serializeState = (): PhysicsState => {
	return usePhysicsStore.getState();
};

export const deserializeState = (state: PhysicsState): void => {
	usePhysicsStore.setState(state);
};
