import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  type Firestore,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseApp(): FirebaseApp {
  if (typeof window === "undefined") {
    throw new Error("Firebase should only be initialized in the browser");
  }

  const requiredVars = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ] as const;

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      throw new Error(`Missing environment variable: ${varName}`);
    }
  }

  return getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
}

let _app: FirebaseApp | undefined;
let _db: Firestore | undefined;

export function getFirebaseInstance() {
  if (!_app) {
    _app = getFirebaseApp();
  }
  return _app;
}

export function getDb() {
  if (!_db) {
    const app = getFirebaseInstance();
    _db = initializeFirestore(app, {
      localCache: persistentLocalCache(),
    });
  }
  return _db;
}

export const app = typeof window !== "undefined" ? getFirebaseInstance() : undefined;
export const db = typeof window !== "undefined" ? getDb() : undefined;
