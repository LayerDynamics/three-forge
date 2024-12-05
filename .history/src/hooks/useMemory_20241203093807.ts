// src/hooks/useMemory.ts

import {useEffect,useCallback} from 'react';
import {MemorySystem} from '../systems/MemorySystem/MemorySystem';
import {useMemoryStore} from '../stores/memoryStore';
import {MemoryObject,MemoryStats} from '../types/memory.types';

export const useMemory=() => {
    const system=MemorySystem.getInstance();

    const registerObject=useCallback((object: MemoryObject) => {
        system.registerObject(object);
    },[system]);

    const unregisterObject=useCallback((id: string) => {
        system.unregisterObject(id);
    },[system]);

    const getStats=useCallback((): MemoryStats => {
        return system.getStats();
    },[system]);

    const addReference=useCallback((id: string,refId: string) => {
        useMemoryStore.getState().addReference(id,refId);
    },[]);

    const removeReference=useCallback((id: string,refId: string) => {
        useMemoryStore.getState().removeReference(id,refId);
    },[]);

    return {
        registerObject,
        unregisterObject,
        getStats,
        addReference,
        removeReference,
        memoryObjects: useMemoryStore((state) => state.objects),
        totalMemory: useMemoryStore((state) => state.totalMemory),
        stats: useMemoryStore((state) => state.stats)
    };
};
