// PhysicsSystem.ts: Interfaces with @react-three/cannon to simulate physics.
// PhysicsSystem.tsx
// Updated code with all changes applied.

import React, { useRef } from 'react';
import { Physics as RapierPhysics, RigidBody, CollisionEnterHandler, RigidBodyProps } from '@react-three/rapier';
import { Vector3, Mesh } from 'three';
import { usePhysicsStore } from '../../stores/physicsStore';
import { PhysicsBody, PhysicsEngine, PhysicsSystemProps } from '../../types/physics.types';

export const PhysicsSystem: React.FC<PhysicsSystemProps> = ({ config, children }) => {
  const { gravity, engine, debug } = config;

  return (
    <>
      {engine === 'rapier' && (
        <RapierPhysics gravity={[gravity.x, gravity.y, gravity.z]}>
          <PhysicsBodyRenderer engine={engine} />
          {children}
        </RapierPhysics>
      )}
      {/* Add Cannon physics if needed */}
    </>
  );
};

const PhysicsBodyRenderer: React.FC<{ engine: PhysicsEngine }> = ({ engine }) => {
  const bodies = usePhysicsStore(state => Object.values(state.bodies));

  return (
    <>
      {bodies.map(body => {
        switch (body.shape) {
          case 'box':
            return <BoxBody key={body.id} body={body} engine={engine} />;
          case 'sphere':
            return <SphereBody key={body.id} body={body} engine={engine} />;
          case 'cylinder':
            return <CylinderBody key={body.id} body={body} engine={engine} />;
          case 'plane':
            return <PlaneBody key={body.id} body={body} engine={engine} />;
          // Add other shapes as needed
          default:
            return null;
        }
      })}
    </>
  );
};

const handleCollision: CollisionEnterHandler = (event) => {
  const otherBodyId = event.other?.rigidBodyObject?.userData.id;
  const contactPoint = event.manifold.solverContactPoint(0);
  const point = new Vector3(contactPoint.x, contactPoint.y, contactPoint.z);
  // Handle collision logic
};

interface BodyProps {
  body: PhysicsBody;
  engine: PhysicsEngine;
}

const BoxBody: React.FC<BodyProps> = ({ body, engine }) => {
  if (engine === 'rapier') {
    const meshRef = useRef<Mesh>(null);

    return (
      <RigidBody
        mass={body.type === 'dynamic' ? body.mass || 1 : 0}
        position={[body.position.x, body.position.y, body.position.z]}
        rotation={[body.rotation.x, body.rotation.y, body.rotation.z]}
        colliders="cuboid"
        userData={{ id: body.id }}
        onCollisionEnter={handleCollision}
      >
        <mesh ref={meshRef}>
          <boxGeometry args={(body.args as [number, number, number]) || [1, 1, 1]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      </RigidBody>
    );
  } else if (engine === 'cannon') {
    const [ref] = useBox(() => ({
      mass: body.type === 'dynamic' ? body.mass || 1 : 0,
      position: [body.position.x, body.position.y, body.position.z],
      rotation: [body.rotation.x, body.rotation.y, body.rotation.z],
      args: (body.args as [number, number, number]) || [1, 1, 1],
      userData: { id: body.id },
      onCollide: () => {
        // Handle collision
      },
    }));
    return (
      <mesh ref={ref as React.RefObject<Mesh>}>
        <boxGeometry args={(body.args as [number, number, number]) || [1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    );
  }
  return null;
};

// Implement SphereBody similarly
const SphereBody: React.FC<BodyProps> = ({ body, engine }) => {
  if (engine === 'rapier') {
    const meshRef = useRef<Mesh>(null);

    return (
      <RigidBody
        mass={body.type === 'dynamic' ? body.mass || 1 : 0}
        position={[body.position.x, body.position.y, body.position.z]}
        rotation={[body.rotation.x, body.rotation.y, body.rotation.z]}
        colliders="ball"
        userData={{ id: body.id }}
        onCollisionEnter={handleCollision}
      >
        <mesh ref={meshRef}>
          <sphereGeometry args={(body.args as [number, number, number]) || [1, 32, 32]} />
          <meshStandardMaterial color="blue" />
        </mesh>
      </RigidBody>
    );
  } else if (engine === 'cannon') {
    const [ref] = useSphere(() => ({
      mass: body.type === 'dynamic' ? body.mass || 1 : 0,
      position: [body.position.x, body.position.y, body.position.z],
      rotation: [body.rotation.x, body.rotation.y, body.rotation.z],
      args: (body.args as [number]) || [1],
      userData: { id: body.id },
      onCollide: () => {
        // Handle collision
      },
    }));
    return (
      <mesh ref={ref as React.RefObject<Mesh>}>
        <sphereGeometry args={(body.args as [number, number, number]) || [1, 32, 32]} />
        <meshStandardMaterial color="blue" />
      </mesh>
    );
  }
  return null;
};

// Implement CylinderBody similarly
const CylinderBody: React.FC<BodyProps> = ({ body, engine }) => {
  if (engine === 'rapier') {
    const meshRef = useRef<Mesh>(null);

    return (
      <RigidBody
        mass={body.type === 'dynamic' ? body.mass || 1 : 0}
        position={[body.position.x, body.position.y, body.position.z]}
        rotation={[body.rotation.x, body.rotation.y, body.rotation.z]}
        colliders="cylinder"
        userData={{ id: body.id }}
        onCollisionEnter={handleCollision}
      >
        <mesh ref={meshRef}>
          <cylinderGeometry args={(body.args as [number, number, number, number]) || [1, 1, 2, 32]} />
          <meshStandardMaterial color="green" />
        </mesh>
      </RigidBody>
    );
  } else if (engine === 'cannon') {
    const [ref] = useCylinder(() => ({
      mass: body.type === 'dynamic' ? body.mass || 1 : 0,
      position: [body.position.x, body.position.y, body.position.z],
      rotation: [body.rotation.x, body.rotation.y, body.rotation.z],
      args: (body.args as [number, number, number]) || [1, 1, 2],
      userData: { id: body.id },
      onCollide: () => {
        // Handle collision
      },
    }));
    return (
      <mesh ref={ref as React.RefObject<Mesh>}>
        <cylinderGeometry args={(body.args as [number, number, number, number]) || [1, 1, 2, 32]} />
        <meshStandardMaterial color="green" />
      </mesh>
    );
  }
  return null;
};

// Implement PlaneBody similarly
const PlaneBody: React.FC<BodyProps> = ({ body, engine }) => {
  if (engine === 'rapier') {
    const meshRef = useRef<Mesh>(null);

    return (
      <RigidBody
        type="fixed"
        position={[body.position.x, body.position.y, body.position.z]}
        rotation={[body.rotation.x, body.rotation.y, body.rotation.z]}
        colliders="plane"
        userData={{ id: body.id }}
      >
        <mesh ref={meshRef}>
          <planeGeometry args={(body.args as [number, number]) || [10, 10]} />
          <meshStandardMaterial color="gray" />
        </mesh>
      </RigidBody>
    );
  } else if (engine === 'cannon') {
    const [ref] = usePlane(() => ({
      type: 'Static',
      position: [body.position.x, body.position.y, body.position.z],
      rotation: [body.rotation.x, body.rotation.y, body.rotation.z],
      args: (body.args as [number, number]) || [10, 10],
      userData: { id: body.id },
    }));
    return (
      <mesh ref={ref as React.RefObject<Mesh>}>
        <planeGeometry args={(body.args as [number, number]) || [10, 10]} />
        <meshStandardMaterial color="gray" />
      </mesh>
    );
  }
  return null;
};

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
