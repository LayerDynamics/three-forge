import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { MetricsDisplay } from './components/MetricsDisplay';
import { TimelineView } from './components/TimelineView';
import { SystemMonitor } from './components/SystemMonitor';
import { useProfiler } from './hooks/useProfiler';

const PerformanceProfiler = () => {
  const { isVisible, toggleVisibility, metrics } = useProfiler();
  const [activeTab, setActiveTab] = useState<'metrics' | 'timeline' | 'systems'>('metrics');

  if (!isVisible) {
    return (
      <button 
        onClick={toggleVisibility}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg"
      >
        Show Profiler
      </button>
    );
  }

  return (
    <Html fullscreen>
      <div className="fixed bottom-4 right-4 w-96 bg-gray-900/90 text-white rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Performance Profiler</h2>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${metrics.fps > 30 ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{Math.round(metrics.fps)} FPS</span>
            <button 
              onClick={toggleVisibility}
              className="ml-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700">
          <button
            className={`flex-1 py-2 ${activeTab === 'metrics' ? 'bg-gray-800' : ''}`}
            onClick={() => setActiveTab('metrics')}
          >
            Metrics
          </button>
          <button
            className={`flex-1 py-2 ${activeTab === 'timeline' ? 'bg-gray-800' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            Timeline
          </button>
          <button
            className={`flex-1 py-2 ${activeTab === 'systems' ? 'bg-gray-800' : ''}`}
            onClick={() => setActiveTab('systems')}
          >
            Systems
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 h-64 overflow-y-auto">
          {activeTab === 'metrics' && <MetricsDisplay metrics={metrics} />}
          {activeTab === 'timeline' && <TimelineView metrics={metrics} />}
          {activeTab === 'systems' && <SystemMonitor metrics={metrics} />}
        </div>
      </div>
    </Html>
  );
};

export default PerformanceProfiler;