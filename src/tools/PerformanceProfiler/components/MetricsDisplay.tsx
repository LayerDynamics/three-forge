import React from 'react';
import { useThree } from '@react-three/fiber';
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { MetricsData } from '../hooks/useProfiler';

interface MetricsDisplayProps {
  metrics: MetricsData;
}

export const MetricsDisplay: React.FC<MetricsDisplayProps> = ({ metrics }) => {
  const { gl } = useThree();
  const info = gl.info;

  return (
    <div className="space-y-4">
      {/* Performance Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 p-3 rounded">
          <div className="text-sm text-gray-400">Frame Time</div>
          <div className="text-xl">{metrics.frameTime.toFixed(2)}ms</div>
        </div>
        <div className="bg-gray-800 p-3 rounded">
          <div className="text-sm text-gray-400">FPS</div>
          <div className="text-xl">{Math.round(metrics.fps)}</div>
        </div>
        <div className="bg-gray-800 p-3 rounded">
          <div className="text-sm text-gray-400">Memory</div>
          <div className="text-xl">{(metrics.memory / 1024 / 1024).toFixed(1)} MB</div>
        </div>
        <div className="bg-gray-800 p-3 rounded">
          <div className="text-sm text-gray-400">Draw Calls</div>
          <div className="text-xl">{info.render.calls}</div>
        </div>
      </div>

      {/* Historical FPS Chart */}
      <div className="bg-gray-800 p-3 rounded">
        <div className="text-sm text-gray-400 mb-2">FPS History</div>
        <LineChart width={320} height={100} data={metrics.history.slice(-100)}>
          <XAxis dataKey="timestamp" hide />
          <YAxis domain={[0, 'dataMax + 10']} hide />
          <Line
            type="monotone"
            dataKey="fps"
            stroke="#4ade80"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </div>

      {/* GPU Stats */}
      <div className="bg-gray-800 p-3 rounded">
        <div className="text-sm text-gray-400 mb-2">GPU Statistics</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Geometries: {info.memory.geometries}</div>
          <div>Textures: {info.memory.textures}</div>
          <div>Triangles: {info.render.triangles}</div>
          <div>Lines: {info.render.lines}</div>
        </div>
      </div>
    </div>
  );
};