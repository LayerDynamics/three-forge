import React, { useState } from 'react';
import { useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { ObjectTree } from './components/ObjectTree';
import { PropertyEditor } from './components/PropertyEditor';
import { TransformControls } from './components/TransformControls';
import { useInspector } from './hooks/useInspector';

const SceneInspector = () => {
  const { scene } = useThree();
  const { selectedObject, setSelectedObject, isVisible, toggleVisibility } = useInspector();
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'properties'>('hierarchy');

  if (!isVisible) return null;

  return (
    <Html fullscreen>
      <div className="fixed right-0 top-0 h-screen w-96 bg-white/90 shadow-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Scene Inspector</h2>
          <button 
            onClick={toggleVisibility}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            className={`px-4 py-2 ${activeTab === 'hierarchy' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('hierarchy')}
          >
            Hierarchy
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'properties' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('properties')}
            disabled={!selectedObject}
          >
            Properties
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'hierarchy' && (
            <ObjectTree 
              root={scene} 
              selectedObject={selectedObject}
              onSelect={setSelectedObject}
            />
          )}
          {activeTab === 'properties' && selectedObject && (
            <PropertyEditor object={selectedObject} />
          )}
        </div>
      </div>

      {/* Transform Controls */}
      {selectedObject && (
        <TransformControls object={selectedObject} />
      )}
    </Html>
  );
};

export default SceneInspector;