import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  onAuthStateChanged
} from 'firebase/auth';

// Vite loads env variables prefixed with VITE_
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "juda-497014.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "juda-497014",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "juda-497014.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

let app;
let auth;
let googleProvider;

// Gracefully initialize Firebase client. If config is unconfigured, log warning and set auth to null (mock fallback will operate).
const isConfigured = !!firebaseConfig.apiKey;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    console.log("✅ Firebase Client SDK initialized successfully!");
  } catch (err) {
    console.error("❌ Failed to initialize Firebase Client SDK:", err);
  }
} else {
  console.warn(
    "⚠️ VITE_FIREBASE_API_KEY is not set in frontend environment variables. " +
    "Firebase Client is running in mock simulation mode."
  );
}

export { 
  auth, 
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  onAuthStateChanged,
  isConfigured
};
