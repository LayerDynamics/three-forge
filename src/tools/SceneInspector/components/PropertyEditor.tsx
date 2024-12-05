import React from 'react';
import { Object3D, Material, BufferGeometry } from 'three';
import { Vector3, Euler } from 'three';

interface PropertyEditorProps {
  object: Object3D;
}

const VectorInput: React.FC<{
  label: string;
  value: Vector3;
  onChange: (newValue: Vector3) => void;
}> = ({ label, value, onChange }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="flex gap-2 mt-1">
      <input
        type="number"
        value={value.x}
        onChange={(e) => onChange(new Vector3(parseFloat(e.target.value), value.y, value.z))}
        className="w-full px-2 py-1 border rounded"
        step="0.1"
      />
      <input
        type="number"
        value={value.y}
        onChange={(e) => onChange(new Vector3(value.x, parseFloat(e.target.value), value.z))}
        className="w-full px-2 py-1 border rounded"
        step="0.1"
      />
      <input
        type="number"
        value={value.z}
        onChange={(e) => onChange(new Vector3(value.x, value.y, parseFloat(e.target.value)))}
        className="w-full px-2 py-1 border rounded"
        step="0.1"
      />
    </div>
  </div>
);

export const PropertyEditor: React.FC<PropertyEditorProps> = ({ object }) => {
  const handleNameChange = (name: string) => {
    object.name = name;
  };

  const handlePositionChange = (position: Vector3) => {
    object.position.copy(position);
  };

  const handleRotationChange = (rotation: Vector3) => {
    object.rotation.set(rotation.x, rotation.y, rotation.z);
  };

  const handleScaleChange = (scale: Vector3) => {
    object.scale.copy(scale);
  };

  const handleVisibilityChange = () => {
    object.visible = !object.visible;
  };

  return (
    <div className="space-y-6">
      {/* Basic Properties */}
      <div>
        <h3 className="text-lg font-medium mb-4">Basic Properties</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={object.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="mt-1 w-full px-2 py-1 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <input
            type="text"
            value={object.type}
            disabled
            className="mt-1 w-full px-2 py-1 border rounded bg-gray-50"
          />
        </div>

        <div className="mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={object.visible}
              onChange={handleVisibilityChange}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700">Visible</span>
          </label>
        </div>
      </div>

      {/* Transform Properties */}
      <div>
        <h3 className="text-lg font-medium mb-4">Transform</h3>
        
        <VectorInput
          label="Position"
          value={object.position}
          onChange={handlePositionChange}
        />

        <VectorInput
          label="Rotation"
          value={new Vector3(object.rotation.x, object.rotation.y, object.rotation.z)}
          onChange={handleRotationChange}
        />

        <VectorInput
          label="Scale"
          value={object.scale}
          onChange={handleScaleChange}
        />
      </div>

      {/* Material Properties (if applicable) */}
      {(object as any).material && (
        <div>
          <h3 className="text-lg font-medium mb-4">Material</h3>
          <pre className="text-sm bg-gray-50 p-2 rounded">
            {JSON.stringify((object as any).material, null, 2)}
          </pre>
        </div>
      )}

      {/* Geometry Properties (if applicable) */}
      {(object as any).geometry && (
        <div>
          <h3 className="text-lg font-medium mb-4">Geometry</h3>
          <div className="text-sm">
            <div>Vertices: {(object as any).geometry.attributes.position.count}</div>
            <div>Triangles: {(object as any).geometry.index ? (object as any).geometry.index.count / 3 : 'N/A'}</div>
          </div>
        </div>
      )}
    </div>
  );
};