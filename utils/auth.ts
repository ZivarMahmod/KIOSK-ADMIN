/**
 * Authentication utilities using Firebase Admin SDK.
 * Verifies Firebase ID tokens from Authorization header.
 */
import { adminAuth } from "@/lib/firebase-admin";

export interface SessionUser {
  uid: string;
  email: string;
  name?: string;
}

/**
 * Get session from App Router NextRequest by verifying Firebase ID token.
 * Expects: Authorization: Bearer <firebaseIdToken>
 */
export const getSessionFromRequest = async (
  request: Request
): Promise<SessionUser | null> => {
  try {
    const authHeader =
      request.headers.get("authorization") ||
      request.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split("Bearer ")[1];
    if (!token) return null;

    const decoded = await adminAuth.verifyIdToken(token);
    return {
      uid: decoded.uid,
      email: decoded.email || "",
      name: decoded.name || decoded.email || "",
    };
  } catch {
    return null;
  }
};
