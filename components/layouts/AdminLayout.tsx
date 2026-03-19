"use client";

import React, { useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layouts/Navbar";
import PageWithSidebar from "@/components/layouts/PageWithSidebar";
import AdminSidebar from "@/components/layouts/AdminSidebar";
import { useAuth } from "@/contexts/auth-context";

/**
 * Admin layout: Navbar + left AdminSidebar + scrollable content.
 * Redirects to /login if not authenticated.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isLoggedIn, isCheckingAuth } = useAuth();
  const router = useRouter();
  // Only show the loading spinner on the very first mount (initial auth check).
  // Once auth has resolved once, never show the spinner again — this prevents
  // a flash/reload feel when navigating between sidebar links.
  const hasResolved = useRef(false);
  if (!isCheckingAuth) {
    hasResolved.current = true;
  }

  if (isCheckingAuth && !hasResolved.current) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-sky-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isLoggedIn && !isCheckingAuth) {
    router.push("/login");
    return null;
  }

  return (
    <Navbar>
      <PageWithSidebar
        sidebarContent={<AdminSidebar />}
        sidebarCollapsed={<AdminSidebar collapsed />}
      >
        <div className="min-w-0 flex-1 px-1 sm:px-0">{children}</div>
      </PageWithSidebar>
    </Navbar>
  );
}
