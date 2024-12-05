import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useLogicStore } from '../stores/logicStore';
import { EventDispatcher } from '../utils/EventDispatcher';

interface ProceduralLevelProps {
  levelData?: LevelData;
  loadingProgress?: number;
}

const ProceduralLevel: React.FC<ProceduralLevelProps> = ({
  levelData,
  loadingProgress = 0
}) => {
  const { scene } = useThree();
  const gameState = useLogicStore(state => state.gameState);

  useEffect(() => {
    const handleLevelReady = () => {
      EventDispatcher.dispatch('LEVEL_READY', {
        levelId: levelData?.id,
        timestamp: Date.now()
      });
    };

    if (levelData && scene) {
      handleLevelReady();
    }

    return () => {
      EventDispatcher.dispatch('LEVEL_CLEANUP', {
        levelId: levelData?.id,
        timestamp: Date.now()
      });
    };
  }, [levelData, scene]);

  return (
    <group name={`level_${levelData?.id}`}>
      {/* Level content will be generated here by LevelManager */}
      {loadingProgress < 100 && (
        <group name="loading_indicator" position={[0, 0, -10]}>
          <mesh>
            <planeGeometry args={[2, 0.1]} />
            <meshBasicMaterial color="white" />
            <mesh 
              position={[-1 + loadingProgress / 100, 0, 0.1]}
              scale={[loadingProgress / 50, 1, 1]}
            >
              <planeGeometry />
              <meshBasicMaterial color="blue" />
            </mesh>
          </mesh>
        </group>
      )}
    </group>
  );
};

export default ProceduralLevel;