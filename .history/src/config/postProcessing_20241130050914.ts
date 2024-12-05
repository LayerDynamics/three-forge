// Centralized configuration for post-processing effects (e.g., bloom intensity, color correction) and rendering settings (e.g., shadows, antialiasing)
// to maintain consistency across the application.
// This file is used to configure post-processing effects and rendering settings for the game.
// It is a centralized configuration file that can be used to configure post-processing effects and rendering settings for the game.

import { ColorCorrectionEffect, EffectPass, EffectPassOptions } from 'postprocessing'
import { Color, Vector2 } from 'three'

export const bloomOptions: EffectPassOptions = {
  intensity: 1,
  luminanceThreshold: 0.6,
  luminanceSmoothing: 0.1,
  mipmapBlur: true,
  radius: 0.4,
}

export const colorCorrectionOptions = {
  blendFunction: ColorCorrectionEffect.BLEND_MULTIPLY,
  brightness: 0.1,
  contrast: 1.0,
  saturation: 1.0,
  hue: 0.0,
  exposure: 0.0,
}

export const effectPassOptions: EffectPassOptions = {
  blendFunction: EffectPass.BLEND_ADD,
  opacity: 1.0,
  renderToScreen: true,
}

export const colorCorrectionEffect = new ColorCorrectionEffect(colorCorrectionOptions)

export const effectPass = new EffectPass(undefined, colorCorrectionEffect, effectPassOptions)

export const colorParams = {
  color: new Color(0x000000),
  opacity: 0.0,
}

export const bloomParams = {
  intensity: 1.0,
  luminanceThreshold: 0.6,
  luminanceSmoothing: 0.1,
  mipmapBlur: true,
  radius: 0.4,
}

export const colorCorrectionParams = {
  blendFunction: ColorCorrectionEffect.BLEND_MULTIPLY,
  brightness: 0.1,
  contrast: 1.0,
  saturation: 1.0,
  hue: 0.0,
  exposure: 0.0,
}

export const effectPassParams = {
  blendFunction: EffectPass.BLEND_ADD,
  opacity: 1.0,
  renderToScreen: true,
}

export const resolution = new Vector2(window.innerWidth, window.innerHeight)

export const clearColor = new Color(0x000000)

export const clearAlpha = 0

export const autoClear = true

export const autoClearColor = true

export const autoClearDepth = true

export const autoClearStencil = true

export const maxAnisotropy = 16

export const antialias = true

export const alphaTest = 0.5

export const premultipliedAlpha = false

export const logarithmicDepthBuffer = false

export const shadowMapEnabled = true

export const shadowMapType = 0

export const shadowMapAutoUpdate = true

export const shadowMapSoft = false

export const shadowMapDebug = false

export const shadowMapCascade = false

export const shadowMapCascadeOffset = 0

export const shadowMapCascadeCount = 4

export const shadowMapCascadeExtents = 1

export const shadowMapCascadeSplit = 0

export const shadowMapCascadePadding = 0

export const shadowMapCascadeBlend = 0

export const shadowMapCascadeBlendDst = 0

export const shadowMapCascadeBlendSrc = 0

export const shadowMapCascadeBlendEquation = 0

export const shadowMapCascadeBias = 0

export const shadowMapCascadeNormalBias = 0

export const shadowMapCascadeBiasSlope = 0

export const shadowMapCascadeBiasSplit = 0

export const shadowMapSize = 512

export const shadowMapDarkness = 0.5

export const shadowMapBias = 0.0001

export const shadowMapNormalBias = 0.05

export const shadowMapBiasSlope = 0.1

export const shadowMapBiasSplit = 0.0

export const toneMapping = 0

export const toneMappingExposure = 1.0

export const toneMappingWhitePoint = 1.0

export const toneMappingAverageLuminance = 1.0

export const toneMappingAdaptation = 1.0

export const toneMappingIntensity = 1.0
