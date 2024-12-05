import React from 'react';
import { MetricsData } from '../hooks/useProfiler';

interface SystemMonitorProps {
  metrics: MetricsData;
}

export const SystemMonitor: React.FC<SystemMonitorProps> = ({ metrics }) => {
  return (
    <div className="space-y-4">
      {/* Physics System */}
      <div className="bg-gray-800 p-3 rounded">
        <div className="text-sm text-gray-400 mb-2">Physics System</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm">Bodies: {metrics.physics.bodies}</div>
          <div className="text-sm">Collisions: {metrics.physics.collisions}</div>
          <div className="text-sm">Update Time: {metrics.physics.updateTime.toFixed(2)}ms</div>
        </div>
      </div>

      {/* Animation System */}
      <div className="bg-gray-800 p-3 rounded">
        <div className="text-sm text-gray-400 mb-2">Animation System</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm">Active: {metrics.animation.active}</div>
          <div className="text-sm">Update Time: {metrics.animation.updateTime.toFixed(2)}ms</div>
        </div>
      </div>

      {/* Particle System */}
      <div className="bg-gray-800 p-3 rounded">
        <div className="text-sm text-gray-400 mb-2">Particle System</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm">Particles: {metrics.particles.count}</div>
          <div className="text-sm">Emitters: {metrics.particles.emitters}</div>
          <div className="text-sm">Update Time: {metrics.particles.updateTime.toFixed(2)}ms</div>
        </div>
      </div>

      {/* Scene Graph */}
      <div className="bg-gray-800 p-3 rounded">
        <div className="text-sm text-gray-400 mb-2">Scene Graph</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm">Objects: {metrics.sceneGraph.objects}</div>
          <div className="text-sm">Depth: {metrics.sceneGraph.depth}</div>
          <div className="text-sm">Update Time: {metrics.sceneGraph.updateTime.toFixed(2)}ms</div>
        </div>
      </div>
    </div>
  );
};