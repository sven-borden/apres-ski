"use client";

import { useSyncExternalStore } from "react";
import { initials } from "@/lib/crew";

/** The participant identity stored on this device (PROJECT.md §3). */
export type LocalUser = { id: string; name: string; color: string; avatar: string };

const KEY = "apres.localUser";
let cache: LocalUser | null | undefined; // undefined = not read yet
const listeners = new Set<() => void>();

function read(): LocalUser | null {
  if (cache !== undefined) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as LocalUser) : null;
  } catch {
    cache = null;
  }
  return cache;
}

export function setLocalUser(user: LocalUser): void {
  cache = user;
  try {
    localStorage.setItem(KEY, JSON.stringify(user));
  } catch {
    // storage unavailable — identity lives only for this session
  }
  listeners.forEach((l) => l());
}

export function makeAvatar(name: string): string {
  return initials(name);
}

function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** Read once, cached, listeners notified on change — no hydration mismatch. */
export function useLocalUser(): LocalUser | null {
  return useSyncExternalStore(
    subscribe,
    () => read(),
    () => null, // server snapshot
  );
}
