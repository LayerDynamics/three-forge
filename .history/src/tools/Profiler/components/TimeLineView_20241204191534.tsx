import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { MetricsData } from '../hooks/useProfiler';

interface TimelineViewProps {
  metrics: MetricsData;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ metrics }) => {
  return (
    <div className="space-y-4">
      {/* Frame Time Breakdown */}
      <div className="bg-gray-800 p-3 rounded">
        <div className="text-sm text-gray-400 mb-2">Frame Time Breakdown</div>
        <BarChart width={320} height={100} data={metrics.systemTimings}>
          <XAxis dataKey="name" hide />
          <YAxis hide />
          <Tooltip 
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-gray-900 p-2 rounded shadow">
                  <div>{payload[0].payload.name}</div>
                  <div>{payload[0].value.toFixed(2)}ms</div>
                </div>
              );
            }}
          />
          <Bar dataKey="time" fill="#4ade80" />
        </BarChart>
      </div>

      {/* System Execution Timeline */}
      <div className="space-y-2">
        {metrics.systemTimings.map((timing) => (
          <div key={timing.name} className="bg-gray-800 p-2 rounded">
            <div className="flex justify-between text-sm">
              <span>{timing.name}</span>
              <span>{timing.time.toFixed(2)}ms</span>
            </div>
            <div className="w-full bg-gray-700 h-1 mt-1 rounded">
              <div 
                className="bg-blue-500 h-full rounded"
                style={{ 
                  width: `${(timing.time / metrics.frameTime) * 100}%`
                }} 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};