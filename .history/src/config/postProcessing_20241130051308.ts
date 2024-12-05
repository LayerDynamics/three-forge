// Centralized configuration for post-processing effects (e.g., bloom intensity, color correction) and rendering settings (e.g., shadows, antialiasing)
// to maintain consistency across the application.
// This file is used to configure post-processing effects and rendering settings for the game.
// It is a centralized configuration file that can be used to configure post-processing effects and rendering settings for the game.
// This file is used to configure post-processing effects and rendering settings for the game.
// It is a centralized configuration file that can be used to configure post-processing effects and rendering settings for the game.
import { BloomEffect, DepthOfFieldEffect, EffectComposer, EffectPass, RenderPass } from 'postprocessing';
import { useFrame, useThree } from 'react-three-fiber';
import { usePostProcessing } from '../hooks/usePostProcessing';
import { useStore } from '../store';
export const PostProcessing = () => {
    const { scene, gl, camera, size } = useThree();
    const postProcessing = usePostProcessing();
    const { effects } = useStore(state => state.config);
    const composer = useStore(state => state.composer);
    const bloomEffect = new BloomEffect();
    const depthOfFieldEffect = new DepthOfFieldEffect(camera, { focusDistance: 0, focalLength: 0, bokehScale: 1 });
    useFrame(() => {
        composer.render();
    });
    return (
        <EffectComposer ref={composer} args={[gl]}>
            <RenderPass attachArray="passes" scene={scene} camera={camera} />
            <EffectPass attachArray
