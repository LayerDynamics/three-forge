import React from 'react';
import { Object3D } from 'three';

interface ObjectTreeProps {
  root: Object3D;
  selectedObject: Object3D | null;
  onSelect: (object: Object3D) => void;
}

interface TreeNodeProps extends ObjectTreeProps {
  object: Object3D;
  depth: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({ object, selectedObject, onSelect, depth }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = object.children.length > 0;
  
  return (
    <div className="select-none">
      <div 
        className={`flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer
          ${selectedObject?.uuid === object.uuid ? 'bg-blue-100' : ''}`}
        style={{ paddingLeft: `${depth * 20}px` }}
        onClick={() => onSelect(object)}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="w-4 text-gray-500 mr-1"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
        <span className="mr-2">
          {object.visible ? '👁' : '👁‍🗨'}
        </span>
        <span>{object.name || object.type}</span>
      </div>

      {isExpanded && hasChildren && (
        <div>
          {object.children.map((child) => (
            <TreeNode
              key={child.uuid}
              object={child}
              selectedObject={selectedObject}
              onSelect={onSelect}
              root={root}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const ObjectTree: React.FC<ObjectTreeProps> = ({ root, selectedObject, onSelect }) => {
  return (
    <div className="min-h-0 overflow-y-auto">
      <TreeNode
        object={root}
        selectedObject={selectedObject}
        onSelect={onSelect}
        root={root}
        depth={0}
      />
    </div>
  );
};