import { useState, useEffect, useCallback } from "react";
import { OFFICIAL_SCRIPTS } from "@/lib/game-data";

export interface LocalScript {
  id: string;
  name: string;
  isOfficial: boolean;
  characterIds: string[];
}

const CUSTOM_SCRIPTS_KEY = "clocktower_custom_scripts";

const SCRIPTS_UPDATED_EVENT = "clocktower_scripts_updated";

export function useLocalScripts() {
  const [customScripts, setCustomScripts] = useState<LocalScript[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFromStorage = useCallback(() => {
    const stored = localStorage.getItem(CUSTOM_SCRIPTS_KEY);
    if (stored) {
      try {
        setCustomScripts(JSON.parse(stored));
      } catch {
        localStorage.removeItem(CUSTOM_SCRIPTS_KEY);
        setCustomScripts([]);
      }
    } else {
      setCustomScripts([]);
    }
  }, []);

  useEffect(() => {
    loadFromStorage();
    setIsLoading(false);
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CUSTOM_SCRIPTS_KEY) {
        loadFromStorage();
      }
    };
    
    const handleCustomEvent = () => {
      loadFromStorage();
    };
    
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(SCRIPTS_UPDATED_EVENT, handleCustomEvent);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(SCRIPTS_UPDATED_EVENT, handleCustomEvent);
    };
  }, [loadFromStorage]);

  const saveCustomScripts = useCallback((scripts: LocalScript[]) => {
    setCustomScripts(scripts);
    localStorage.setItem(CUSTOM_SCRIPTS_KEY, JSON.stringify(scripts));
    window.dispatchEvent(new CustomEvent(SCRIPTS_UPDATED_EVENT));
  }, []);

  const addCustomScript = useCallback((name: string, characterIds: string[]) => {
    const newScript: LocalScript = {
      id: `custom-${Date.now()}`,
      name,
      isOfficial: false,
      characterIds,
    };
    const updated = [...customScripts, newScript];
    saveCustomScripts(updated);
    return newScript;
  }, [customScripts, saveCustomScripts]);

  const updateCustomScript = useCallback((id: string, name: string, characterIds: string[]) => {
    const updated = customScripts.map(s => 
      s.id === id ? { ...s, name, characterIds } : s
    );
    saveCustomScripts(updated);
  }, [customScripts, saveCustomScripts]);

  const deleteCustomScript = useCallback((id: string) => {
    const updated = customScripts.filter(s => s.id !== id);
    saveCustomScripts(updated);
  }, [customScripts, saveCustomScripts]);

  const getScriptById = useCallback((id: string | null): LocalScript | null => {
    if (!id) return null;
    
    const official = OFFICIAL_SCRIPTS.find(s => s.id === id);
    if (official) {
      return {
        id: official.id,
        name: official.name,
        isOfficial: true,
        characterIds: official.characters,
      };
    }
    
    return customScripts.find(s => s.id === id) || null;
  }, [customScripts]);

  const allScripts: LocalScript[] = [
    ...OFFICIAL_SCRIPTS.map(s => ({
      id: s.id,
      name: s.name,
      isOfficial: true,
      characterIds: s.characters,
    })),
    ...customScripts,
  ];

  return {
    allScripts,
    customScripts,
    isLoading,
    addCustomScript,
    updateCustomScript,
    deleteCustomScript,
    getScriptById,
    saveCustomScripts,
  };
}

export function getScriptByIdStatic(id: string | null): LocalScript | null {
  if (!id) return null;
  
  const official = OFFICIAL_SCRIPTS.find(s => s.id === id);
  if (official) {
    return {
      id: official.id,
      name: official.name,
      isOfficial: true,
      characterIds: official.characters,
    };
  }
  
  const stored = localStorage.getItem(CUSTOM_SCRIPTS_KEY);
  if (stored) {
    try {
      const customScripts: LocalScript[] = JSON.parse(stored);
      return customScripts.find(s => s.id === id) || null;
    } catch {
      return null;
    }
  }
  
  return null;
}
