/**
 * Server-side session helper using Firebase Admin SDK.
 * Verifies the Firebase ID token from the Authorization header or cookie.
 */
import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { headers, cookies } from "next/headers";

/**
 * Initialize Firebase Admin if not already initialized.
 */
function ensureFirebaseAdmin() {
  if (getApps().length === 0) {
    initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
}

/**
 * Get the current authenticated user session from the Firebase ID token.
 * Returns the decoded token or null if not authenticated.
 */
export async function getSession() {
  try {
    ensureFirebaseAdmin();
    const auth = getAuth();

    // Try Authorization header first, then cookie
    const headerStore = await headers();
    const authHeader = headerStore.get("authorization");
    let token: string | undefined;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }

    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get("firebase-token")?.value;
    }

    if (!token) {
      return null;
    }

    const decodedToken = await auth.verifyIdToken(token);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email ?? null,
      name: decodedToken.name ?? null,
      picture: decodedToken.picture ?? null,
    };
  } catch (error) {
    console.error("Failed to verify Firebase token:", error);
    return null;
  }
}
