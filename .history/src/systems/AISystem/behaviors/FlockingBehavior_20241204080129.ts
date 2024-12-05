// src/systems/AISystem/behaviors/FlockingBehavior.ts

import { AIBehavior, AIBehaviorType, AIEntity } from '../../../types/ai.types';
import { Vector3 } from 'three';
import { useAIStore } from '../../../stores/aiStore';

export class FlockingBehavior implements AIBehavior {
  public type: AIBehaviorType = 'flock';
  public priority: number = 2;
  
  private cohesionWeight: number = 1.0;
  private separationWeight: number = 1.5;
  private alignmentWeight: number = 1.0;
  private flockRadius: number = 10;
  private separationRadius: number = 3;
  private maxForce: number = 0.05;

  constructor(priority: number = 2) {
    this.priority = priority;
  }

  public get conditions() {
    return [
      {
        type: 'health',
        value: 0.3,
        operator: '>',
        compare: (entity: AIEntity) => {
          return entity.health / entity.maxHealth > 0.3;
        }
      }
    ];
  }

  public execute(entity: AIEntity): void {
    const neighbors = this.getNeighbors(entity);
    if (!neighbors.length) return;

    const cohesion = this.calculateCohesion(entity, neighbors)
      .multiplyScalar(this.cohesionWeight);
    
    const separation = this.calculateSeparation(entity, neighbors)
      .multiplyScalar(this.separationWeight);
    
    const alignment = this.calculateAlignment(entity, neighbors)
      .multiplyScalar(this.alignmentWeight);

    // Combine forces
    const flockingForce = new Vector3()
      .add(cohesion)
      .add(separation)
      .add(alignment)
      .clampLength(0, this.maxForce);

    // Store the desired movement in the path
    entity.path = [entity.position.clone().add(flockingForce)];
  }

  public update(entity: AIEntity, deltaTime: number): void {
    if (!entity.path?.length) return;

    const targetPosition = entity.path[0];
    const direction = targetPosition.clone().sub(entity.position);
    
    // Apply movement
    entity.position.add(direction.multiplyScalar(entity.speed * deltaTime));

    // Update rotation to face movement direction
    if (direction.lengthSq() > 0.001) {
      const targetRotation = Math.atan2(direction.x, direction.z);
      entity.rotation.y = this.lerpAngle(entity.rotation.y, targetRotation, 5 * deltaTime);
    }
  }

  private getNeighbors(entity: AIEntity): AIEntity[] {
    const neighbors: AIEntity[] = [];
    const entities = useAIStore.getState().entities;

    Object.values(entities).forEach(other => {
      if (other.id === entity.id) return;
      
      const distance = entity.position.distanceTo(other.position);
      if (distance <= this.flockRadius) {
        neighbors.push(other);
      }
    });

    return neighbors;
  }

  private calculateCohesion(entity: AIEntity, neighbors: AIEntity[]): Vector3 {
    const center = new Vector3();
    
    neighbors.forEach(neighbor => {
      center.add(neighbor.position);
    });

    if (neighbors.length > 0) {
      center.divideScalar(neighbors.length)
        .sub(entity.position)
        .normalize();
    }

    return center;
  }

  private calculateSeparation(entity: AIEntity, neighbors: AIEntity[]): Vector3 {
    const separation = new Vector3();
    
    neighbors.forEach(neighbor => {
      const distance = entity.position.distanceTo(neighbor.position);
      if (distance < this.separationRadius) {
        const repulsion = entity.position.clone()
          .sub(neighbor.position)
          .normalize()
          .divideScalar(distance);
        separation.add(repulsion);
      }
    });

    if (neighbors.length > 0) {
      separation.normalize();
    }

    return separation;
  }

  private calculateAlignment(entity: AIEntity, neighbors: AIEntity[]): Vector3 {
    const alignment = new Vector3();
    
    neighbors.forEach(neighbor => {
      if (neighbor.path?.length) {
        const direction = neighbor.path[0].clone()
          .sub(neighbor.position)
          .normalize();
        alignment.add(direction);
      }
    });

    if (neighbors.length > 0) {
      alignment.divideScalar(neighbors.length).normalize();
    }

    return alignment;
  }

  private lerpAngle(start: number, end: number, t: number): number {
    const diff = end - start;
    const adjusted = ((diff + Math.PI) % (Math.PI * 2)) - Math.PI;
    return start + adjusted * t;
  }
}