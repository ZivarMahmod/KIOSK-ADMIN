/**
 * Sentry monitoring stub
 * No-op implementations — Sentry is not configured for this project.
 */

export function captureException(
  _error: Error,
  _context?: Record<string, unknown>,
): void {
  // no-op
}

export function captureMessage(
  _message: string,
  _level?: string,
  _context?: Record<string, unknown>,
): void {
  // no-op
}
