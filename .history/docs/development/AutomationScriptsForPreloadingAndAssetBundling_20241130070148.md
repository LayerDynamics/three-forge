### **Preloading and Asset Bundling Scripts**

Preloading and bundling assets are crucial for ensuring smooth performance and reducing load times in the game engine. Below are detailed scripts for both processes.

---

### **1. Asset Preloading**

#### **Goal**
- Preload assets (e.g., models, textures, audio) into memory before gameplay begins.
- Cache assets for quick access during runtime.

#### **Tools**
- **Three.js** for loading models and textures.
- **@react-three/drei** for simplified asset management and caching.

#### **Script**

_File: `src/systems/AssetPreloader.ts`_

```typescript
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { TextureLoader, AudioLoader } from "three";
import { Cache } from "three";

// Cache configuration
Cache.enabled = true;

export class AssetPreloader {
  private static assets: Record<string, any> = {};

  /**
   * Preloads a GLTF model and caches it.
   * @param key - Unique key to identify the asset.
   * @param path - Path to the GLTF file.
   */
  public static async preloadModel(key: string, path: string): Promise<void> {
    const loader = new GLTFLoader();
    return new Promise((resolve, reject) => {
      loader.load(
        path,
        (gltf) => {
          this.assets[key] = gltf;
          console.log(`Model preloaded: ${key}`);
          resolve();
        },
        undefined,
        (error) => {
          console.error(`Failed to preload model: ${key}`, error);
          reject(error);
        }
      );
    });
  }

  /**
   * Preloads a texture and caches it.
   * @param key - Unique key to identify the asset.
   * @param path - Path to the texture file.
   */
  public static async preloadTexture(key: string, path: string): Promise<void> {
    const loader = new TextureLoader();
    return new Promise((resolve, reject) => {
      loader.load(
        path,
        (texture) => {
          this.assets[key] = texture;
          console.log(`Texture preloaded: ${key}`);
          resolve();
        },
        undefined,
        (error) => {
          console.error(`Failed to preload texture: ${key}`, error);
          reject(error);
        }
      );
    });
  }

  /**
   * Preloads an audio file and caches it.
   * @param key - Unique key to identify the asset.
   * @param path - Path to the audio file.
   */
  public static async preloadAudio(key: string, path: string): Promise<void> {
    const loader = new AudioLoader();
    return new Promise((resolve, reject) => {
      loader.load(
        path,
        (audioBuffer) => {
          this.assets[key] = audioBuffer;
          console.log(`Audio preloaded: ${key}`);
          resolve();
        },
        undefined,
        (error) => {
          console.error(`Failed to preload audio: ${key}`, error);
          reject(error);
        }
      );
    });
  }

  /**
   * Retrieves a preloaded asset.
   * @param key - Unique key for the asset.
   * @returns The cached asset.
   */
  public static getAsset(key: string): any {
    return this.assets[key];
  }
}
```

#### **Usage Example**

```typescript
import { AssetPreloader } from "./systems/AssetPreloader";

async function preloadAssets() {
  await Promise.all([
    AssetPreloader.preloadModel("hero", "/assets/processed/models/hero.glb"),
    AssetPreloader.preloadTexture("skybox", "/assets/processed/textures/skybox.webp"),
    AssetPreloader.preloadAudio("theme", "/assets/processed/audio/theme_optimized.mp3"),
  ]);

  console.log("All assets preloaded!");
}

// Call this during game initialization
preloadAssets();
```

---

### **2. Asset Bundling**

#### **Goal**
- Bundle assets into a single archive or package to reduce network requests.
- Enable efficient downloading and loading during gameplay.

#### **Tools**
- **Rollup**: For bundling assets into JavaScript modules.
- **JSZip**: For creating compressed asset archives.

---

#### **2.1 Bundling with Rollup**

**Use Case**: Bundle assets into JavaScript modules for preloading.

**Script**: `rollup.config.js`
```javascript
import { defineConfig } from "rollup";
import json from "@rollup/plugin-json";
import image from "@rollup/plugin-image";
import gltf from "rollup-plugin-gltf";

export default defineConfig({
  input: "src/assets/index.js", // Entry point for asset references
  output: {
    file: "dist/assetsBundle.js",
    format: "iife", // Immediately Invoked Function Expression
    name: "Assets",
  },
  plugins: [
    json(), // Handles .json files
    image(), // Handles image files
    gltf(), // Handles .gltf and .glb files
  ],
});
```

**Usage**:
1. Create an `index.js` file in the `src/assets/` directory to reference all assets:
   ```javascript
   export const heroModel = require("./processed/models/hero.glb");
   export const skyboxTexture = require("./processed/textures/skybox.webp");
   export const themeAudio = require("./processed/audio/theme_optimized.mp3");
   ```

2. Run Rollup to generate the bundled asset file:
   ```bash
   npx rollup -c rollup.config.js
   ```

3. Include the bundled file in your project and use the assets:
   ```javascript
   import { heroModel, skyboxTexture, themeAudio } from "./dist/assetsBundle.js";

   console.log(heroModel); // Path to the bundled model
   ```

---

#### **2.2 Creating Asset Archives with JSZip**

**Use Case**: Create a compressed archive of assets to reduce server requests.

**Script**: `bundleAssets.js`
```javascript
const JSZip = require("jszip");
const fs = require("fs");
const path = require("path");

async function bundleAssets(inputFolder, outputFile) {
  const zip = new JSZip();

  function addFilesToZip(dir, zipDir) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        const folder = zipDir.folder(file);
        addFilesToZip(filePath, folder);
      } else {
        zipDir.file(file, fs.readFileSync(filePath));
      }
    });
  }

  addFilesToZip(inputFolder, zip);

  const content = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(outputFile, content);

  console.log(`Assets bundled into ${outputFile}`);
}

const inputFolder = path.resolve(__dirname, "src/assets/processed");
const outputFile = path.resolve(__dirname, "dist/assetsBundle.zip");

bundleAssets(inputFolder, outputFile);
```

**Usage**:
1. Run the script:
   ```bash
   node bundleAssets.js
   ```

2. Include and extract the archive in the game at runtime:
   ```javascript
   import JSZip from "jszip";
   import { AssetPreloader } from "./systems/AssetPreloader";

   async function loadAssetBundle(bundlePath) {
     const response = await fetch(bundlePath);
     const arrayBuffer = await response.arrayBuffer();
     const zip = await JSZip.loadAsync(arrayBuffer);

     zip.forEach(async (relativePath, file) => {
       if (!file.dir) {
         const content = await file.async("blob");

         if (relativePath.endsWith(".glb")) {
           AssetPreloader.preloadModel(relativePath, URL.createObjectURL(content));
         } else if (relativePath.endsWith(".webp")) {
           AssetPreloader.preloadTexture(relativePath, URL.createObjectURL(content));
         } else if (relativePath.endsWith(".mp3")) {
           AssetPreloader.preloadAudio(relativePath, URL.createObjectURL(content));
         }
       }
     });
   }

   // Usage during game initialization
   loadAssetBundle("/dist/assetsBundle.zip");
   ```

---

### **Summary**

| **Task**             | **Tool/Script**                | **Purpose**                                                                 |
|-----------------------|--------------------------------|-----------------------------------------------------------------------------|
| **Preloading Assets** | `AssetPreloader.ts`           | Preload and cache models, textures, and audio during initialization.       |
| **Bundling Assets**   | `rollup.config.js`            | Bundle assets into a single JavaScript module for optimized delivery.      |
| **Compressing Assets**| `bundleAssets.js` with JSZip  | Create a compressed archive for efficient downloading and runtime loading. |

Would you like further examples of how to manage **dynamic loading** or integrate these processes into CI/CD pipelines?
