import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
  type AppCheck,
} from "firebase/app-check";

// Firebase is retained only for App Check (reCAPTCHA v3) protecting the API
// routes. Data lives in PocketBase (see lib/pb/server.ts) and analytics in
// Umami (see lib/analytics.ts).
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

  const requiredEntries = Object.entries(firebaseConfig) as [
    string,
    string | undefined,
  ][];
  for (const [key, value] of requiredEntries) {
    if (!value) {
      throw new Error(`Missing Firebase config value: ${key}`);
    }
  }

  return getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
}

let _app: FirebaseApp | undefined;
let _appCheck: AppCheck | undefined;

export function getFirebaseInstance() {
  if (!_app) {
    _app = getFirebaseApp();
  }
  return _app;
}

export function initAppCheck(): AppCheck | undefined {
  if (_appCheck) return _appCheck;

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY;
  if (!siteKey) return undefined;

  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }

  const app = getFirebaseInstance();
  _appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });
  return _appCheck;
}
