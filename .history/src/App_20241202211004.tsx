// App.tsx (Ensure correct imports)
import React from 'react';
import { Canvas } from '@react-three/fiber';
import LogicEngine from './components/LogicEngine';
import ModelViewer from './components/ModelViewer';
import AbilityButton from './components/AbilityButton';
import WeaponButton from './components/WeaponButton';
import PhysicsBodyButton from './components/PhysicsBodyButton';
import AnimationController from './components/AnimationController';
import AssetLoader from './components/AssetLoader';
import LogicController from './components/LogicController';
import SceneGraphViewer from './components/SceneGraphViewer';

const App = () => {
  return (
    <div>
      <Canvas>
        <LogicEngine />
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        {/* Example Animated Object */}
        <ModelViewer assetId="treeModel" />
        {/* Example UI Components */}
        <AbilityButton abilityId="heal" />
        <WeaponButton weaponId="sword" />
        <WeaponButton weaponId="bow" />
        <PhysicsBodyButton />
        <AnimationController />
        <AssetLoader />
        <LogicController />
        <SceneGraphViewer /> {/* New component */}
      </Canvas>
    </div>
  );
};

export default App;