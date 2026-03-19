"use client";

import React, { type ReactNode } from "react";
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

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-sky-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isLoggedIn) {
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
