import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OFFICIAL_SCRIPTS } from "@/lib/game-data";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

export interface LocalScript {
  id: string;
  name: string;
  isOfficial: boolean;
  characterIds: string[];
}

interface DbScript {
  id: number;
  userId: string;
  name: string;
  characterIds: string[];
  createdAt: string;
  updatedAt: string;
}

const CUSTOM_SCRIPTS_KEY = "clocktower_custom_scripts";
const SCRIPTS_UPDATED_EVENT = "clocktower_scripts_updated";

function loadFromLocalStorage(): LocalScript[] {
  const stored = localStorage.getItem(CUSTOM_SCRIPTS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem(CUSTOM_SCRIPTS_KEY);
      return [];
    }
  }
  return [];
}

function saveToLocalStorage(scripts: LocalScript[]) {
  localStorage.setItem(CUSTOM_SCRIPTS_KEY, JSON.stringify(scripts));
  window.dispatchEvent(new CustomEvent(SCRIPTS_UPDATED_EVENT));
}

export function useLocalScripts() {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [localScripts, setLocalScripts] = useState<LocalScript[]>([]);
  const [localLoading, setLocalLoading] = useState(true);

  const { data: dbScripts = [], isLoading: dbLoading } = useQuery<DbScript[]>({
    queryKey: ["/api/custom-scripts"],
    enabled: !!user,
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; characterIds: string[] }) => {
      const res = await apiRequest("POST", "/api/custom-scripts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-scripts"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name, characterIds }: { id: number; name: string; characterIds: string[] }) => {
      const res = await apiRequest("PUT", `/api/custom-scripts/${id}`, { name, characterIds });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-scripts"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/custom-scripts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-scripts"] });
    },
  });

  useEffect(() => {
    if (!user) {
      setLocalScripts(loadFromLocalStorage());
      setLocalLoading(false);
      
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === CUSTOM_SCRIPTS_KEY) {
          setLocalScripts(loadFromLocalStorage());
        }
      };
      
      const handleCustomEvent = () => {
        setLocalScripts(loadFromLocalStorage());
      };
      
      window.addEventListener("storage", handleStorageChange);
      window.addEventListener(SCRIPTS_UPDATED_EVENT, handleCustomEvent);
      
      return () => {
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener(SCRIPTS_UPDATED_EVENT, handleCustomEvent);
      };
    } else {
      setLocalLoading(false);
    }
  }, [user]);

  const customScripts: LocalScript[] = user
    ? dbScripts.map(s => ({
        id: `db-${s.id}`,
        name: s.name,
        isOfficial: false,
        characterIds: s.characterIds,
      }))
    : localScripts;

  const isLoading = authLoading || (user ? dbLoading : localLoading);

  const addCustomScript = useCallback((name: string, characterIds: string[]) => {
    if (user) {
      createMutation.mutate({ name, characterIds });
      return { id: `db-temp-${Date.now()}`, name, isOfficial: false, characterIds };
    } else {
      const newScript: LocalScript = {
        id: `custom-${Date.now()}`,
        name,
        isOfficial: false,
        characterIds,
      };
      const updated = [...localScripts, newScript];
      setLocalScripts(updated);
      saveToLocalStorage(updated);
      return newScript;
    }
  }, [user, localScripts, createMutation]);

  const updateCustomScript = useCallback((id: string, name: string, characterIds: string[]) => {
    if (user && id.startsWith("db-")) {
      const dbId = parseInt(id.replace("db-", ""));
      updateMutation.mutate({ id: dbId, name, characterIds });
    } else {
      const updated = localScripts.map(s => 
        s.id === id ? { ...s, name, characterIds } : s
      );
      setLocalScripts(updated);
      saveToLocalStorage(updated);
    }
  }, [user, localScripts, updateMutation]);

  const deleteCustomScript = useCallback((id: string) => {
    if (user && id.startsWith("db-")) {
      const dbId = parseInt(id.replace("db-", ""));
      deleteMutation.mutate(dbId);
    } else {
      const updated = localScripts.filter(s => s.id !== id);
      setLocalScripts(updated);
      saveToLocalStorage(updated);
    }
  }, [user, localScripts, deleteMutation]);

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

  const saveCustomScripts = useCallback((scripts: LocalScript[]) => {
    if (!user) {
      setLocalScripts(scripts);
      saveToLocalStorage(scripts);
    }
  }, [user]);

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
    isLoggedIn: !!user,
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
