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
