import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

export interface LocalFriend {
  id: string;
  name: string;
}

interface DbFriend {
  id: number;
  userId: string;
  name: string;
  createdAt: string;
}

const FRIENDS_KEY = "clocktower_friends";
const FRIENDS_UPDATED_EVENT = "clocktower_friends_updated";

function loadFromLocalStorage(): LocalFriend[] {
  const stored = localStorage.getItem(FRIENDS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem(FRIENDS_KEY);
      return [];
    }
  }
  return [];
}

function saveToLocalStorage(friendsList: LocalFriend[]) {
  localStorage.setItem(FRIENDS_KEY, JSON.stringify(friendsList));
  window.dispatchEvent(new CustomEvent(FRIENDS_UPDATED_EVENT));
}

export function useFriends() {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [localFriends, setLocalFriends] = useState<LocalFriend[]>([]);
  const [localLoading, setLocalLoading] = useState(true);

  const { data: dbFriends = [], isLoading: dbLoading } = useQuery<DbFriend[]>({
    queryKey: ["/api/friends"],
    enabled: !!user,
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      const res = await apiRequest("POST", "/api/friends", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const res = await apiRequest("PUT", `/api/friends/${id}`, { name });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/friends/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
    },
  });

  useEffect(() => {
    if (!user) {
      setLocalFriends(loadFromLocalStorage());
      setLocalLoading(false);

      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === FRIENDS_KEY) {
          setLocalFriends(loadFromLocalStorage());
        }
      };

      const handleCustomEvent = () => {
        setLocalFriends(loadFromLocalStorage());
      };

      window.addEventListener("storage", handleStorageChange);
      window.addEventListener(FRIENDS_UPDATED_EVENT, handleCustomEvent);

      return () => {
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener(FRIENDS_UPDATED_EVENT, handleCustomEvent);
      };
    } else {
      setLocalLoading(false);
    }
  }, [user]);

  const friends: LocalFriend[] = user
    ? dbFriends.map(f => ({ id: `db-${f.id}`, name: f.name }))
    : localFriends;

  const isLoading = authLoading || (user ? dbLoading : localLoading);

  const addFriend = useCallback((name: string) => {
    if (user) {
      createMutation.mutate({ name });
    } else {
      // Functional update so multiple addFriend calls in the same tick
      // (e.g. saving several names at once) don't overwrite each other.
      const newFriend: LocalFriend = {
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name,
      };
      setLocalFriends(prev => {
        const updated = [...prev, newFriend];
        saveToLocalStorage(updated);
        return updated;
      });
    }
  }, [user, createMutation]);

  const renameFriend = useCallback((id: string, name: string) => {
    if (user && id.startsWith("db-")) {
      const dbId = parseInt(id.replace("db-", ""));
      updateMutation.mutate({ id: dbId, name });
    } else {
      const updated = localFriends.map(f =>
        f.id === id ? { ...f, name } : f
      );
      setLocalFriends(updated);
      saveToLocalStorage(updated);
    }
  }, [user, localFriends, updateMutation]);

  const removeFriend = useCallback((id: string) => {
    if (user && id.startsWith("db-")) {
      const dbId = parseInt(id.replace("db-", ""));
      deleteMutation.mutate(dbId);
    } else {
      const updated = localFriends.filter(f => f.id !== id);
      setLocalFriends(updated);
      saveToLocalStorage(updated);
    }
  }, [user, localFriends, deleteMutation]);

  return {
    friends,
    isLoading,
    isSaving: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    addFriend,
    renameFriend,
    removeFriend,
    isLoggedIn: !!user,
  };
}
