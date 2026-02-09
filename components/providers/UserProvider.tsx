"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useSyncExternalStore,
} from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { UserSetupModal } from "@/components/UserSetupModal";
import type { LocalUser } from "@/lib/types";

const STORAGE_KEY = "apres-ski-user";

interface UserContextValue {
  user: LocalUser | null;
  isReady: boolean;
  needsSetup: boolean;
  saveUser: (data: { name: string; color: string; avatar: string }) => void;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  isReady: false,
  needsSetup: false,
  saveUser: () => {},
});

export function useUser() {
  return useContext(UserContext);
}

function getStoredUser(): LocalUser | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

const serverSnapshot = null;

let listeners: (() => void)[] = [];
let cachedUser: LocalUser | null | undefined;

function subscribe(onStoreChange: () => void) {
  listeners.push(onStoreChange);
  return () => {
    listeners = listeners.filter((l) => l !== onStoreChange);
  };
}

function getSnapshot(): LocalUser | null {
  if (cachedUser === undefined) {
    cachedUser = getStoredUser();
  }
  return cachedUser;
}

function getServerSnapshot(): LocalUser | null {
  return serverSnapshot;
}

function notifyListeners() {
  cachedUser = getStoredUser();
  for (const listener of listeners) {
    listener();
  }
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const storedUser = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const [savedThisSession, setSavedThisSession] = useState(false);

  const user = storedUser;
  const isReady = true;
  const needsSetup = !user && !savedThisSession;

  const saveUser = useCallback(
    (data: { name: string; color: string; avatar: string }) => {
      const id = crypto.randomUUID();
      const localUser: LocalUser = {
        id,
        name: data.name,
        color: data.color,
        avatar: data.avatar,
        createdAt: Date.now(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(localUser));
      notifyListeners();
      setSavedThisSession(true);

      const db = getDb();
      setDoc(doc(db, "participants", id), {
        id,
        name: data.name,
        color: data.color,
        avatar: data.avatar,
        joinedAt: serverTimestamp(),
        tripId: "",
      });
    },
    [],
  );

  return (
    <UserContext.Provider value={{ user, isReady, needsSetup, saveUser }}>
      {children}
      {needsSetup && <UserSetupModal onSave={saveUser} />}
    </UserContext.Provider>
  );
}
