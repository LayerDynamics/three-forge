// src/systems/OcclusionSystem/OcclusionSystem.tsx

import { Camera, Frustum, Matrix4, Box3, Vector3, Object3D } from 'three';
import { OccluderObject, OcclusionConfig } from '../../types/occlusion.types';
import { useOcclusionStore } from '../../stores/occlusionStore';
import { EventDispatcher } from '../../utils/EventDispatcher';

export class OcclusionSystem {
  private static instance: OcclusionSystem | null = null;
  private config: OcclusionConfig;
  private camera: Camera | null = null;
  private frustum: Frustum;
  private projScreenMatrix: Matrix4;
  private updateTimer: number;
  private lastUpdate: number;
  private frameId: number | null;

  private constructor(config: OcclusionConfig) {
    this.config = config;
    this.camera = null;
    this.frustum = new Frustum();
    this.projScreenMatrix = new Matrix4();
    this.updateTimer = 0;
    this.lastUpdate = 0;
    this.frameId = null;
  }

  public static getInstance(config?: OcclusionConfig): OcclusionSystem {
    if (!OcclusionSystem.instance) {
      OcclusionSystem.instance = new OcclusionSystem(config || {
        maxOccluders: 100,
        cullDistance: 1000,
        updateFrequency: 16.67, // 60fps
        debug: false
      });
    }
    return OcclusionSystem.instance;
  }

  public initialize(camera: Camera): void {
    this.camera = camera;
    this.startUpdate();
    EventDispatcher.on("RESET_GAME", () => this.reset());

    if (this.config.debug) {
      console.log("OcclusionSystem initialized with config:", this.config);
    }
  }

  public registerObject(object: Object3D, options: {
    isOccluder?: boolean;
    isOccludable?: boolean;
  } = {}): void {
    const bounds = new Box3().setFromObject(object);
    const occluder: OccluderObject = {
      id: object.uuid,
      bounds,
      position: object.position,
      isOccluder: options.isOccluder ?? true,
      isOccludable: options.isOccludable ?? true,
      visible: true,
      object, // Now valid since 'object' is part of 'OccluderObject'
      lastVisibilityCheck: 0
    };

    useOcclusionStore.getState().addOccluder(occluder);

    if (this.config.debug) {
      console.log(`OcclusionSystem: Registered object ${occluder.id}`);
    }
  }

  public unregisterObject(id: string): void {
    useOcclusionStore.getState().removeOccluder(id);

    if (this.config.debug) {
      console.log(`OcclusionSystem: Unregistered object ${id}`);
    }
  }

  private isInFrustum(bounds: Box3): boolean {
    if (!this.camera) return true;

    this.projScreenMatrix.multiplyMatrices(
      this.camera.projectionMatrix,
      this.camera.matrixWorldInverse
    );

    this.frustum.setFromProjectionMatrix(this.projScreenMatrix);
    return this.frustum.intersectsBox(bounds);
  }

  private isOccluded(object: OccluderObject, occluders: OccluderObject[]): boolean {
    if (!this.camera || !object.isOccludable) return false;

    const cameraPosition = this.camera.position;
    const objectCenter = object.bounds.getCenter(new Vector3());
    const rayDirection = objectCenter.clone().sub(cameraPosition).normalize();

    for (const occluder of occluders) {
      if (occluder.id === object.id || !occluder.isOccluder || !occluder.visible) continue;

      // Simple ray-box intersection test
      const intersection = this.rayBoxIntersection(
        cameraPosition,
        rayDirection,
        occluder.bounds
      );

      if (intersection && intersection.distanceTo(cameraPosition) <
          objectCenter.distanceTo(cameraPosition)) {
        return true;
      }
    }

    return false;
  }

  private rayBoxIntersection(
    origin: Vector3,
    direction: Vector3,
    box: Box3
  ): Vector3 | null {
    const min = box.min;
    const max = box.max;

    let tmin = -Infinity;
    let tmax = Infinity;

    for (let i = 0; i < 3; i++) {
      const t1 = (min.getComponent(i) - origin.getComponent(i)) / direction.getComponent(i);
      const t2 = (max.getComponent(i) - origin.getComponent(i)) / direction.getComponent(i);

      tmin = Math.max(tmin, Math.min(t1, t2));
      tmax = Math.min(tmax, Math.max(t1, t2));
    }

    if (tmax < 0 || tmin > tmax) {
      return null;
    }

    return origin.clone().add(direction.multiplyScalar(tmin));
  }

  private updateObjectVisibility(object: OccluderObject, occluders: OccluderObject[]): void {
    const inFrustum = this.isInFrustum(object.bounds);
    const occluded = this.isOccluded(object, occluders);
    const visible = inFrustum && !occluded;

    if (visible !== object.visible) {
      useOcclusionStore.getState().updateVisibility(object.id, visible);
      object.object.visible = visible; // Now valid

      if (this.config.debug) {
        console.log(
          `OcclusionSystem: Object ${object.id} visibility changed to ${visible}`
        );
      }
    }
  }

  private update = (timestamp: number): void => {
    if (!this.camera) return;

    const deltaTime = timestamp - this.lastUpdate;

    if (deltaTime >= this.config.updateFrequency) {
      const occluders = Object.values(useOcclusionStore.getState().occluders)
        .filter(obj => obj.isOccluder)
        .sort((a, b) => {
          const distA = a.position.distanceTo(this.camera!.position);
          const distB = b.position.distanceTo(this.camera!.position);
          return distA - distB;
        })
        .slice(0, this.config.maxOccluders);

      Object.values(useOcclusionStore.getState().occluders)
        .forEach(object => {
          this.updateObjectVisibility(object, occluders);
        });

      this.lastUpdate = timestamp;
    }

    this.frameId = requestAnimationFrame(this.update);
  };

  private startUpdate(): void {
    if (this.frameId === null) {
      this.frameId = requestAnimationFrame(this.update);
    }
  }

  private stopUpdate(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  public reset(): void {
    useOcclusionStore.setState({ occluders: {} });
    this.stopUpdate();

    if (this.config.debug) {
      console.log("OcclusionSystem: Reset complete");
    }
  }

  public cleanup(): void {
    this.stopUpdate();
    this.camera = null;
    useOcclusionStore.setState({ occluders: {} });

    if (this.config.debug) {
      console.log("OcclusionSystem: Cleanup complete");
    }
  }
}
