import React, { useEffect, useState } from 'react';
import { BaseScene } from './scenes/BaseScene';
import { LevelManager } from './scenes/LevelManager';
import { EventDispatcher } from './utils/EventDispatcher';
import { useLogicStore } from './stores/logicStore';

// Initial level configurations
const initialLevelData = {
  id: 'base_level',
  name: 'Base Level',
  terrain: {
    width: 1000,
    height: 1000,
    scale: 1,
    seed: Date.now(),
    octaves: 4,
    persistence: 0.5,
    lacunarity: 2.0,
    resolution: 128
  },
  entities: [],
  lighting: {
    exposure: 1.0,
    gamma: 2.2,
    ambient: {
      intensity: 0.2,
      color: 0xffffff
    },
    lights: []
  },
  spawnPoints: [
    { id: 'default', position: [0, 2, 0], rotation: [0, 0, 0] }
  ],
  metadata: {
    author: 'System',
    createdAt: Date.now(),
    lastModified: Date.now(),
    version: '1.0.0'
  }
};

export const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const gameState = useLogicStore(state => state.gameState);

  useEffect(() => {
    const initializeGame = async () => {
      try {
        // Store initial level data
        await localStorage.setItem(
          'level_base_level',
          JSON.stringify(initialLevelData)
        );

        // Dispatch initialization events
        EventDispatcher.dispatch('GAME_INIT', {
          timestamp: Date.now()
        });

        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize game:', error);
        // Handle initialization error
      }
    };

    initializeGame();

    return () => {
      // Cleanup on unmount
      EventDispatcher.dispatch('GAME_CLEANUP', {
        timestamp: Date.now()
      });
    };
  }, []);

  if (!isInitialized) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-2xl">Initializing Game Engine...</div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen">
      <BaseScene debug={process.env.NODE_ENV === 'development'}>
        <LevelManager
          levels={{
            'base_level': {
              id: 'base_level',
              name: 'Base Level',
              component: React.lazy(() => import('./scenes/ProceduralLevel')),
              requiredAssets: [],
            }
          }}
          initialLevelId="base_level"
          defaultTransition={{
            type: 'fade',
            duration: 1000
          }}
          onLevelLoad={(levelId) => {
            console.log(`Level ${levelId} loaded`);
          }}
          onLevelUnload={(levelId) => {
            console.log(`Level ${levelId} unloaded`);
          }}
        />
      </BaseScene>
    </div>
  );
};

export default App;