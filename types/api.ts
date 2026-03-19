/**
 * API response type definitions
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  error: string;
  message?: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

export interface ValidationError {
  field: string;
  message: string;
}
