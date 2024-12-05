// src/systems/AISystem/behaviors/IdleBehavior.ts

import { AIBehavior, AIBehaviorType, AIEntity } from '../../../types/ai.types';
import { Vector3 } from 'three';

export class IdleBehavior implements AIBehavior {
  public type: AIBehaviorType = 'idle';
  public priority: number = 0;  // Lowest priority as default behavior
  private idleTimer: number = 0;
  private nextActionTime: number = 0;
  private readonly MIN_IDLE_TIME = 2000;  // 2 seconds
  private readonly MAX_IDLE_TIME = 5000;  // 5 seconds
  private readonly WANDER_RADIUS = 3;     // Units to wander from current position

  constructor(priority: number = 0) {
    this.priority = priority;
    this.resetIdleTimer();
  }

  public get conditions() {
    return [
      {
        type: 'health',
        value: 0,
        operator: '>',
        compare: (entity: AIEntity) => true  // Always valid as fallback
      }
    ];
  }

  public execute(entity: AIEntity): void {
    const currentTime = Date.now();
    
    if (currentTime >= this.nextActionTime) {
      // Decide whether to wander or stay still
      if (Math.random() > 0.7) {  // 30% chance to wander
        const wanderPoint = this.getRandomWanderPoint(entity.position);
        entity.path = [wanderPoint];
      }
      
      this.resetIdleTimer();
    }

    // Occasionally look around
    if (Math.random() > 0.95) {  // 5% chance per execute
      entity.rotation.y = Math.random() * Math.PI * 2;
    }
  }

  public update(entity: AIEntity, deltaTime: number): void {
    this.idleTimer += deltaTime;

    if (entity.path?.length) {
      const nextPosition = entity.path[0];
      const direction = nextPosition.clone().sub(entity.position).normalize();
      
      // Move at a slower pace during idle wandering
      const idleSpeed = entity.speed * 0.5;
      entity.position.add(direction.multiplyScalar(idleSpeed * deltaTime));

      // Update rotation smoothly
      const targetRotation = Math.atan2(direction.x, direction.z);
      entity.rotation.y = this.lerpAngle(
        entity.rotation.y, 
        targetRotation, 
        2 * deltaTime
      );

      // Clear path when destination reached
      if (entity.position.distanceTo(nextPosition) < 0.5) {
        entity.path = [];
      }
    }
  }

  private resetIdleTimer(): void {
    this.idleTimer = 0;
    this.nextActionTime = Date.now() + 
      this.MIN_IDLE_TIME + 
      Math.random() * (this.MAX_IDLE_TIME - this.MIN_IDLE_TIME);
  }

  private getRandomWanderPoint(currentPosition: Vector3): Vector3 {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * this.WANDER_RADIUS;

    return new Vector3(
      currentPosition.x + Math.cos(angle) * radius,
      currentPosition.y,
      currentPosition.z + Math.sin(angle) * radius
    );
  }

  private lerpAngle(start: number, end: number, t: number): number {
    const diff = end - start;
    const adjusted = ((diff + Math.PI) % (Math.PI * 2)) - Math.PI;
    return start + adjusted * t;
  }
}