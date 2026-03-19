/**
 * Authentication-related type definitions
 */

/**
 * User interface for authentication context
 */
export interface User {
  id: string;
  name?: string;
  email: string;
  image?: string;
  role?: string;
}

/**
 * Auth context type definition
 */
export interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  isCheckingAuth: boolean;
}

/**
 * Login request payload
 */
export interface LoginInput {
  email: string;
  password: string;
}
