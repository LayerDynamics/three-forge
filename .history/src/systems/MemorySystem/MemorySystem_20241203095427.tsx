 FAIL  src/systems/AssetLoadingSystem/AssetLoadingSystem.test.ts
  ● Test suite failed to run

    src/stores/memoryStore.ts:15:13 - error TS2353: Object literal may only specify known properties, and 'geometry' does not exist in type 'Record<MemoryObjectType, number>'.

    15             geometry: 0,
                   ~~~~~~~~

      src/types/memory.types.ts:21:2
        21  objectCount: Record<MemoryObjectType,number>;
            ~~~~~~~~~~~
        The expected type comes from property 'objectCount' which is declared here on type 'MemoryStats'
    src/stores/memoryStore.ts:28:24 - error TS2304: Cannot find name 'calculateStats'.

    28         const newStats=calculateStats(newObjects);
                              ~~~~~~~~~~~~~~
    src/stores/memoryStore.ts:43:24 - error TS2304: Cannot find name 'calculateStats'.

    43         const newStats=calculateStats(remainingObjects);
                              ~~~~~~~~~~~~~~
