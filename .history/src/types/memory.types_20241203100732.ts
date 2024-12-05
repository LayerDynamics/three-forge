 FAIL  src/systems/AssetLoadingSystem/AssetLoadingSystem.test.ts
  ● Test suite failed to run

src/systems/MemorySystem/MemorySystem.tsx: 93: 18-error TS2339: Property 'totalMemory' does not exist on type 'MemoryStats'.

    93     return stats.totalMemory/stats.maxMemory>this.config.cleanupThreshold;
~~~~~~~~~~~
	src/systems/MemorySystem/MemorySystem.tsx: 93: 38-error TS2339: Property 'maxMemory' does not exist on type 'MemoryStats'.

    93     return stats.totalMemory/stats.maxMemory>this.config.cleanupThreshold;
~~~~~~~~~
	src/systems/MemorySystem/MemorySystem.tsx: 108: 7-error TS2353: Object literal may only specify known properties,and 'geometry' does not exist in type 'Record<MemoryObjectType, number>'.

    108       geometry: 0,
	~~~~~~~~
	src/systems/MemorySystem/MemorySystem.tsx: 138: 7-error TS2353: Object literal may only specify known properties,and 'totalMemory' does not exist in type 'MemoryStats'.

    138       totalMemory,
	~~~~~~~~~~~

	FAIL  src/systems/SceneGraphSystem/SceneGraphSystem.test.tsx
  ● Test suite failed to run

src/systems/SceneGraphSystem/SceneGraphSystem.test.tsx: 56: 7-error TS2322: Type 'Mock<void, [node: SceneGraphNode], any>' is not assignable to type '(node: SceneGraphStoreNode) => void'.
      Types of parameters 'node' and 'node' are incompatible.
	Property 'object3D' is missing in type 'SceneGraphStoreNode' but required in type 'SceneGraphNode'.

    56       addNode: jest.fn((node: SceneGraphNode) => {
		~~~~~~~

			src/types/sceneGraph.types.ts: 21: 2
		21  object3D: Object3D; // Three.js Object3D instance
		~~~~~~~~
			'object3D' is declared here.
