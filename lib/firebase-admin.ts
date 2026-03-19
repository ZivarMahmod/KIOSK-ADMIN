import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getServiceAccount(): ServiceAccount {
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!key) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not set");
  }
  return JSON.parse(key) as ServiceAccount;
}

// Initialize Firebase Admin (prevent duplicate initialization)
const app =
  getApps().length === 0
    ? initializeApp({ credential: cert(getServiceAccount()) })
    : getApps()[0]!;

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
export default app;
