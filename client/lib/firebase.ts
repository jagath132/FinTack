import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBWP5XozWofZsLQeKifbzeahpNqcbnD8X8",
  authDomain: "fin-track-b0e90.firebaseapp.com",
  projectId: "fin-track-b0e90",
  storageBucket: "fin-track-b0e90.firebasestorage.app",
  messagingSenderId: "16859678390",
  appId: "1:16859678390:web:56d51a213b9e43df618817",
  measurementId: "G-EETFES1BBH",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Connect to emulator if in development
let emulatorConnected = false;
if (import.meta.env.DEV && !emulatorConnected) {
  try {
    connectFirestoreEmulator(db, "localhost", 9080);
    emulatorConnected = true;
    console.log("✅ Connected to Firestore Emulator");
  } catch (error) {
    console.warn("⚠️ Failed to connect to Firestore Emulator:", error);
  }
}
