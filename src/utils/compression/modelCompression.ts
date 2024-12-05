// src/utils/compression/modelCompression.ts

import {
  Document,
  NodeIO,
  BufferUtils,
  Logger,
  Primitive,
  Mesh,
  Accessor,
} from '@gltf-transform/core';
import { DracoMeshCompression } from '@gltf-transform/extensions';
import * as draco3d from 'draco3d';
import * as meshopt from 'meshoptimizer';

/**
 * Interface defining compression options for Draco and Meshopt.
 */
interface ModelCompressionOptions {
  draco: {
    enabled: boolean;
    compressionLevel: number; // 0-10 (higher means better compression)
    quantization: {
      position: number; // 0-10
      normal: number;   // 0-10
      uv: number;       // 0-10
    };
  };
  meshopt: {
    enabled: boolean;
    optimizeVertexCache: boolean;
    optimizeOverdraw: boolean;
    optimizeVertexFetch: boolean;
    optimizeSeperate: boolean;
    vertexLimit: number;
  };
}

/**
 * Singleton class for compressing 3D models using Draco and Meshopt.
 */
export class ModelCompressor {
  private static instance: ModelCompressor | null = null;

  private dracoEncoderModule: any = null;
  private meshoptModule: typeof meshopt | null = null;

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  /**
   * Initializes the ModelCompressor instance by loading Draco and Meshopt modules.
   */
  public static async getInstance(): Promise<ModelCompressor> {
    if (!ModelCompressor.instance) {
      ModelCompressor.instance = new ModelCompressor();
      await ModelCompressor.instance.initialize();
    }
    return ModelCompressor.instance;
  }

  /**
   * Initializes Draco and Meshopt modules asynchronously.
   */
  private async initialize(): Promise<void> {
    try {
      // Initialize Draco Encoder
      this.dracoEncoderModule = await this.loadDracoEncoder();

      // Initialize Meshopt (Assuming meshoptimizer is already a WebAssembly module)
      this.meshoptModule = meshopt; // If meshoptimizer requires async initialization, handle accordingly
    } catch (error) {
      console.error('Initialization of compression modules failed:', error);
      throw error;
    }
  }

  /**
   * Loads the Draco encoder module asynchronously.
   */
  private loadDracoEncoder(): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const encoderModule = draco3d.createEncoderModule({});
        resolve(encoderModule);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Compresses a 3D model (glTF format) using Draco and/or Meshopt based on the provided options.
   * @param modelData The input glTF model as an ArrayBuffer.
   * @param options Compression options for Draco and Meshopt.
   * @returns The compressed glTF model as an ArrayBuffer.
   */
  public async compressModel(
    modelData: ArrayBuffer,
    options: ModelCompressionOptions
  ): Promise<ArrayBuffer> {
    try {
      // Initialize Logger to suppress warnings during transformations
      const logger = new Logger(Logger.Verbosity.SILENT);

      // Initialize NodeIO with necessary extensions
      const io = new NodeIO()
        .registerExtensions([DracoMeshCompression])
        .setLogger(logger);

      // Parse the input glTF model
      const document: Document = io.readBinary(modelData);

      // Apply Draco Compression if enabled
      if (options.draco.enabled) {
        await this.applyDracoCompression(document, options.draco);
      }

      // Apply Meshopt Optimizations if enabled
      if (options.meshopt.enabled && this.meshoptModule) {
        await this.applyMeshoptOptimization(document, options.meshopt);
      }

      // Serialize the compressed and optimized model back to ArrayBuffer
      const compressedBuffer = io.writeBinary(document);

      return compressedBuffer;
    } catch (error) {
      console.error('Model compression failed:', error);
      throw error;
    }
  }

  /**
   * Applies Draco compression to all mesh primitives in the glTF document.
   * @param document The glTF Document to compress.
   * @param options Draco compression options.
   */
  private async applyDracoCompression(
    document: Document,
    options: ModelCompressionOptions['draco']
  ): Promise<void> {
    try {
      if (!this.dracoEncoderModule) {
        throw new Error('Draco encoder module not initialized.');
      }

      const encoder = new this.dracoEncoderModule.Encoder();

      // Set compression parameters based on options
      encoder.SetEncodingSpeedOptions(options.compressionLevel, options.compressionLevel);

      // Set quantization bits
      encoder.SetAttributeQuantization(
        this.dracoEncoderModule.POSITION,
        options.quantization.position
      );
      encoder.SetAttributeQuantization(
        this.dracoEncoderModule.NORMAL,
        options.quantization.normal
      );
      encoder.SetAttributeQuantization(
        this.dracoEncoderModule.TEX_COORD,
        options.quantization.uv
      );

      // Iterate through all meshes and primitives
      for (const mesh of document.getRoot().listMeshes()) {
        for (const primitive of mesh.listPrimitives()) {
          // Skip if primitive already has Draco compression
          if (primitive.getExtension(DracoMeshCompression.KHR_DRACO_MESH_COMPRESSION)) {
            continue;
          }

          const positionAccessor = primitive.getAttribute('POSITION') as Accessor | null;
          if (!positionAccessor) {
            console.warn('Primitive missing POSITION attribute. Skipping Draco compression.');
            continue;
          }

          const indexAccessor = primitive.getIndices();
          if (!indexAccessor) {
            console.warn('Primitive missing indices. Skipping Draco compression.');
            continue;
          }

          // Extract attribute data
          const positions = positionAccessor.array as Float32Array;
          const normalsAccessor = primitive.getAttribute('NORMAL') as Accessor | null;
          const normals = normalsAccessor ? (normalsAccessor.array as Float32Array) : null;
          const texcoordAccessor = primitive.getAttribute('TEXCOORD_0') as Accessor | null;
          const texcoords = texcoordAccessor ? (texcoordAccessor.array as Float32Array) : null;

          // Extract index data
          const indices = indexAccessor.array as Uint16Array | Uint32Array;
          const indexType =
            indexAccessor.type === 'UNSIGNED_SHORT'
              ? this.dracoEncoderModule.UNSIGNED_SHORT
              : this.dracoEncoderModule.UNSIGNED_INT;

          // Create Draco Mesh
          const dracoMesh = new this.dracoEncoderModule.Mesh();
          dracoMesh.setMode(this.dracoEncoderModule.TRIANGLES);

          // Add POSITION attribute
          const posAttribute = new this.dracoEncoderModule.DracoFloat32Array();
          for (let i = 0; i < positions.length; i++) {
            posAttribute.setValue(i, positions[i]);
          }
          const posId = dracoMesh.AddAttribute(
            this.dracoEncoderModule.POSITION,
            3,
            this.dracoEncoderModule.FLOAT32,
            false,
            3
          );
          dracoMesh.attribute(posId).setFloat32Array(posAttribute);

          // Add NORMAL attribute if present
          let normId: number | null = null;
          if (normals) {
            const normAttribute = new this.dracoEncoderModule.DracoFloat32Array();
            for (let i = 0; i < normals.length; i++) {
              normAttribute.setValue(i, normals[i]);
            }
            normId = dracoMesh.AddAttribute(
              this.dracoEncoderModule.NORMAL,
              3,
              this.dracoEncoderModule.FLOAT32,
              false,
              3
            );
            dracoMesh.attribute(normId).setFloat32Array(normAttribute);
          }

          // Add TEXCOORD_0 attribute if present
          let texId: number | null = null;
          if (texcoords) {
            const texAttribute = new this.dracoEncoderModule.DracoFloat32Array();
            for (let i = 0; i < texcoords.length; i++) {
              texAttribute.setValue(i, texcoords[i]);
            }
            texId = dracoMesh.AddAttribute(
              this.dracoEncoderModule.TEX_COORD,
              2,
              this.dracoEncoderModule.FLOAT32,
              false,
              2
            );
            dracoMesh.attribute(texId).setFloat32Array(texAttribute);
          }

          // Add indices
          const dracoIndices = new this.dracoEncoderModule.DracoInt32Array();
          for (let i = 0; i < indices.length; i++) {
            dracoIndices.setValue(i, indices[i]);
          }
          dracoMesh.setIndices(dracoIndices, indexType);

          // Encode mesh
          const encodedData = new this.dracoEncoderModule.DracoInt8Array();
          const encodedLength = encoder.EncodeMeshToDracoBuffer(dracoMesh, encodedData);

          if (encodedLength <= 0) {
            console.warn('Draco encoding returned invalid length. Skipping primitive.');
            continue;
          }

          // Extract the encoded Draco data
          const compressedData = new Int8Array(encodedLength);
          for (let i = 0; i < encodedLength; i++) {
            compressedData[i] = encodedData.GetValue(i);
          }

          // Add the compressed data to a new buffer
          const buffer = document.getRoot().listBuffers()[0];
          const bufferByteLength = buffer.getArray().byteLength;
          const compressedBuffer = BufferUtils.fromArray(compressedData);
          buffer.setArray(BufferUtils.concat([buffer.getArray(), compressedBuffer]));

          // Create a new buffer view for the Draco-compressed data
          const bufferView = document.createRoot().createBufferView()
            .setBuffer(buffer)
            .setByteOffset(bufferByteLength)
            .setByteLength(encodedLength)
            .setTarget(34963); // GLTF.GLTF.ARRAY_BUFFER target

          // Create the DracoMeshCompression extension
          const dracoExtension = primitive.createExtension(DracoMeshCompression.KHR_DRACO_MESH_COMPRESSION, {
            bufferView: bufferView,
            attributes: {
              POSITION: positionAccessor.getName(),
              NORMAL: normalsAccessor ? normalsAccessor.getName() : undefined,
              TEXCOORD_0: texcoordAccessor ? texcoordAccessor.getName() : undefined,
            },
            compressionLevel: options.compressionLevel,
          });

          // Remove original attributes and indices
          primitive.listAttributes().forEach((attr) => {
            primitive.removeAttribute(attr.getName() as any);
          });
          primitive.setIndices(null);
        }

        // Clean up encoder resources
        // Note: Draco's Encoder doesn't require explicit destruction in JavaScript bindings
      } catch (error) {
        console.error('Draco compression error:', error);
        throw error;
      }
    }

  /**
   * Applies Meshopt optimizations to all mesh primitives in the glTF document.
   * @param document The glTF Document to optimize.
   * @param options Meshopt optimization options.
   */
  private async applyMeshoptOptimization(
    document: Document,
    options: ModelCompressionOptions['meshopt']
  ): Promise<void> {
    try {
      if (!this.meshoptModule) {
        throw new Error('Meshopt module not initialized.');
      }

      // Iterate through all meshes and primitives
      for (const mesh of document.getRoot().listMeshes()) {
        for (const primitive of mesh.listPrimitives()) {
          // Skip if primitive has Draco compression
          if (primitive.getExtension(DracoMeshCompression.KHR_DRACO_MESH_COMPRESSION)) {
            continue;
          }

          const positionAccessor = primitive.getAttribute('POSITION') as Accessor | null;
          const normalAccessor = primitive.getAttribute('NORMAL') as Accessor | null;
          const texcoordAccessor = primitive.getAttribute('TEXCOORD_0') as Accessor | null;
          const indexAccessor = primitive.getIndices();

          if (!positionAccessor || !indexAccessor) {
            console.warn('Primitive missing POSITION or indices. Skipping Meshopt optimization.');
            continue;
          }

          // Extract buffer data
          const positions = new Float32Array(positionAccessor.getArray().buffer);
          const indices = indexAccessor.getArray() instanceof Uint16Array
            ? new Uint16Array(indexAccessor.getArray() as Uint16Array)
            : new Uint32Array(indexAccessor.getArray() as Uint32Array);

          // Apply optimizations based on options
          let optimizedIndices: Uint16Array | Uint32Array = indices;

          if (options.optimizeVertexCache) {
            const cacheSize = 1024; // Typical GPU cache size
            optimizedIndices = this.meshoptModule.optimizeVertexCache(indices, positions.length);
          }

          if (options.optimizeOverdraw && texcoordAccessor) {
            const texcoords = new Float32Array(texcoordAccessor.getArray().buffer);
            optimizedIndices = this.meshoptModule.optimizeOverdraw(
              positions,
              texcoords,
              optimizedIndices
            );
          }

          if (options.optimizeVertexFetch) {
            optimizedIndices = this.meshoptModule.optimizeVertexFetch(
              positions,
              optimizedIndices
            );
          }

          // Currently, Meshopt does not provide a separate optimization method,
          // but you can chain multiple optimizations as needed.

          // Update the primitive's indices with the optimized data
          const optimizedIndicesArray = new (indices instanceof Uint16Array ? Uint16Array : Uint32Array)(
            optimizedIndices.length
          );
          optimizedIndicesArray.set(optimizedIndices);

          // Replace the indices accessor data
          indexAccessor.setArray(optimizedIndicesArray);
        }
      }
    } catch (error) {
      console.error('Meshopt optimization error:', error);
      throw error;
    }
  }
}
