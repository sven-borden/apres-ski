import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  type Firestore,
} from "firebase/firestore";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

function getFirebaseApp(): FirebaseApp {
  if (typeof window === "undefined") {
    throw new Error("Firebase should only be initialized in the browser");
  }

  const requiredEntries = Object.entries(firebaseConfig) as [string, string | undefined][];
  for (const [key, value] of requiredEntries) {
    if (!value) {
      throw new Error(`Missing Firebase config value: ${key}`);
    }
  }

  return getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
}

let _app: FirebaseApp | undefined;
let _db: Firestore | undefined;
let _analytics: Analytics | undefined;
let _analyticsReady: Promise<Analytics | null> | undefined;

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

export function getAnalyticsInstance(): Analytics | undefined {
  return _analytics;
}

export function initAnalytics(): Promise<Analytics | null> {
  if (_analyticsReady) return _analyticsReady;
  _analyticsReady = isSupported().then((supported) => {
    if (supported) {
      const app = getFirebaseInstance();
      _analytics = getAnalytics(app);
      return _analytics;
    }
    return null;
  });
  return _analyticsReady;
}
