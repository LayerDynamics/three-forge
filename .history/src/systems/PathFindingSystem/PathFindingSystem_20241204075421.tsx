// src/systems/PathfindingSystem/PathfindingSystem.ts

import { Vector3 } from 'three';
import { PathNode, NavigationMesh } from '../../types/ai.types';
import { EventDispatcher } from '../../utils/EventDispatcher';

export class PathfindingSystem {
  private static instance: PathfindingSystem | null = null;
  private navigationMesh: NavigationMesh;
  private nodeUpdateInterval: number = 1000; // ms
  private lastNodeUpdate: number = 0;

  private constructor() {
    this.navigationMesh = { nodes: [], obstacles: [] };
  }

  public static getInstance(): PathfindingSystem {
    if (!PathfindingSystem.instance) {
      PathfindingSystem.instance = new PathfindingSystem();
    }
    return PathfindingSystem.instance;
  }

  public initialize(navigationMesh: NavigationMesh): void {
    this.navigationMesh = navigationMesh;
    this.buildNodeConnections();
  }

  public findPath(start: Vector3, end: Vector3): Vector3[] {
    const startNode = this.findNearestNode(start);
    const endNode = this.findNearestNode(end);

    if (!startNode || !endNode) return [];

    const openSet: PathNode[] = [startNode];
    const closedSet: Set<PathNode> = new Set();
    const path: Vector3[] = [];

    // Initialize costs
    startNode.gCost = 0;
    startNode.hCost = this.getDistance(startNode.position, endNode.position);

    while (openSet.length > 0) {
      const current = this.getLowestFCostNode(openSet);
      if (current === endNode) {
        return this.reconstructPath(current);
      }

      openSet.splice(openSet.indexOf(current), 1);
      closedSet.add(current);

      for (const neighbor of current.neighbors) {
        if (closedSet.has(neighbor)) continue;

        const tentativeGCost = current.gCost +
          this.getDistance(current.position, neighbor.position);

        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        } else if (tentativeGCost >= neighbor.gCost) {
          continue;
        }

        neighbor.parent = current;
        neighbor.gCost = tentativeGCost;
        neighbor.hCost = this.getDistance(neighbor.position, endNode.position);
      }
    }

    return path;
  }

  public updateObstacles(obstacles: Vector3[]): void {
    this.navigationMesh.obstacles = obstacles;
    this.rebuildNavigationMesh();
  }

  private buildNodeConnections(): void {
    for (const node of this.navigationMesh.nodes) {
      node.neighbors = this.navigationMesh.nodes.filter(other =>
        node !== other &&
        this.getDistance(node.position, other.position) < 10 &&
        !this.isPathBlocked(node.position, other.position)
      );
    }
  }

  private rebuildNavigationMesh(): void {
    const currentTime = Date.now();
    if (currentTime - this.lastNodeUpdate < this.nodeUpdateInterval) return;

    this.buildNodeConnections();
    this.lastNodeUpdate = currentTime;
    EventDispatcher.dispatch("NAVIGATION_MESH_UPDATED", {
      timestamp: currentTime
    });
  }

  private findNearestNode(position: Vector3): PathNode | null {
    let nearest: PathNode | null = null;
    let minDistance = Infinity;

    for (const node of this.navigationMesh.nodes) {
      const distance = this.getDistance(position, node.position);
      if (distance < minDistance && !this.isPathBlocked(position, node.position)) {
        minDistance = distance;
        nearest = node;
      }
    }

    return nearest;
  }

  private getLowestFCostNode(nodes: PathNode[]): PathNode {
    let lowest = nodes[0];
    for (const node of nodes) {
      if ((node.gCost + node.hCost) < (lowest.gCost + lowest.hCost)) {
        lowest = node;
      }
    }
    return lowest;
  }

  private reconstructPath(endNode: PathNode): Vector3[] {
    const path: Vector3[] = [];
    let current: PathNode | undefined = endNode;

    while (current) {
      path.unshift(current.position);
      current = current.parent;
    }

    return this.smoothPath(path);
  }

  private smoothPath(path: Vector3[]): Vector3[] {
    if (path.length <= 2) return path;

    const smoothed: Vector3[] = [path[0]];
    let current = 0;

    while (current < path.length - 1) {
      let furthest = current + 1;

      for (let i = current + 2; i < path.length; i++) {
        if (!this.isPathBlocked(path[current], path[i])) {
          furthest = i;
        }
      }

      smoothed.push(path[furthest]);
      current = furthest;
    }

    return smoothed;
  }

  private getDistance(a: Vector3, b: Vector3): number {
    return a.distanceTo(b);
  }

  private isPathBlocked(start: Vector3, end: Vector3): boolean {
    // Ray casting or collision check implementation
    for (const obstacle of this.navigationMesh.obstacles) {
      // Simplified collision check - replace with proper ray casting
      const toObstacle = obstacle.clone().sub(start);
      const toEnd = end.clone().sub(start);
      const projection = toObstacle.dot(toEnd) / toEnd.lengthSq();

      if (projection > 0 && projection < 1) {
        const point = start.clone().add(toEnd.multiplyScalar(projection));
        if (point.distanceTo(obstacle) < 1) return true;
      }
    }
    return false;
  }

  public cleanup(): void {
    this.navigationMesh = { nodes: [], obstacles: [] };
  }
}
