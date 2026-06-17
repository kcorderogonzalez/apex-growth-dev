import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";

const firebaseConfig = {
  apiKey: "test-api-key",
  authDomain: "local-project.firebaseapp.com",
  projectId: "local-project",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

if (import.meta.env.DEV && import.meta.env.VITE_FIREBASE_AUTH_EMULATOR !== "false") {
  try {
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  } catch {
    // Already connected — safe to ignore
  }
}
