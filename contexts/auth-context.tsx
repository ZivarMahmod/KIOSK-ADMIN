"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useQueryClient } from "@tanstack/react-query";

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string;
}

export interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  isCheckingAuth: boolean;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userData: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email || "",
          email: firebaseUser.email || "",
          image: firebaseUser.photoURL,
        };
        setUser(userData);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
        queryClient.clear();
      }
      setIsCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [queryClient]);

  const login = useCallback(
    async (email: string, password: string): Promise<User> => {
      queryClient.clear();
      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = credential.user;
      const userData: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email || "",
        email: firebaseUser.email || "",
        image: firebaseUser.photoURL,
      };
      setUser(userData);
      setIsLoggedIn(true);
      return userData;
    },
    [queryClient]
  );

  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
    setIsLoggedIn(false);
    queryClient.clear();
  }, [queryClient]);

  const refreshSession = useCallback(async () => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      await firebaseUser.reload();
      setUser({
        id: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email || "",
        email: firebaseUser.email || "",
        image: firebaseUser.photoURL,
      });
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, user, login, logout, isCheckingAuth, refreshSession }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
