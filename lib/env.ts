/**
 * Environment Variables Validation
 * Validates all required environment variables at startup.
 */

/** Must be set for the app to start. */
const requiredEnvVars = [
  "NEXT_PUBLIC_API_URL",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
] as const;

/** Optional: when set, enable ImageKit image hosting. */
const optionalEnvVars = [
  "IMAGEKIT_PUBLIC_KEY",
  "IMAGEKIT_PRIVATE_KEY",
  "IMAGEKIT_URL_ENDPOINT",
  "NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY",
  "NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT",
  "BREVO_API_KEY",
  "BREVO_SENDER_EMAIL",
  "BREVO_SENDER_NAME",
  "BREVO_ADMIN_EMAIL",
] as const;

type RequiredEnvVar = (typeof requiredEnvVars)[number];
type OptionalEnvVar = (typeof optionalEnvVars)[number];
type EnvVar = RequiredEnvVar | OptionalEnvVar;

/**
 * Get environment variable with validation
 */
export function getEnvVar(key: RequiredEnvVar): string;
export function getEnvVar(key: OptionalEnvVar): string | undefined;
export function getEnvVar(key: EnvVar): string | undefined {
  const value = process.env[key];

  if (!value && requiredEnvVars.includes(key as RequiredEnvVar)) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

/**
 * Validate all required environment variables
 * Call this at app startup to fail fast if config is missing
 */
export function validateEnv(): void {
  const missing: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing
        .map((v) => `  - ${v}`)
        .join("\n")}`,
    );
  }

  console.log("Environment variables validated");
}

/**
 * Get all environment variables with their status
 * Useful for debugging configuration issues
 */
export function getEnvStatus() {
  return {
    required: requiredEnvVars.map((key) => ({
      key,
      configured: !!process.env[key],
    })),
    optional: optionalEnvVars.map((key) => ({
      key,
      configured: !!process.env[key],
    })),
  };
}
