"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  FolderOpen,
  Gift,
  Heart,
  LayoutDashboard,
  Package,
  Settings,
  Warehouse,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Admin sidebar for Zivert Kiosk: simplified nav items for kiosk management.
 */

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Produkter", icon: Package },
  { href: "/admin/categories", label: "Kategorier", icon: FolderOpen },
  { href: "/admin/warehouses", label: "Lagerplatser", icon: Warehouse },
  { href: "/admin/receipts", label: "Kvitton", icon: FileText },
  { href: "/admin/reports", label: "Rapporter", icon: BarChart3 },
  { href: "/admin/offers", label: "Erbjudanden", icon: Gift },
  { href: "/admin/wishes", label: "Önskningar", icon: Heart },
  { href: "/admin/settings", label: "Inställningar", icon: Settings },
];

export default function AdminSidebar({
  collapsed = false,
}: { collapsed?: boolean } = {}) {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    cn(
      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
      collapsed ? "justify-center px-0 w-9 h-9 mx-auto" : "",
      pathname === href || (href !== "/admin" && pathname.startsWith(href))
        ? "bg-sky-500/15 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300"
        : "hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300",
    );

  return (
    <nav
      className="flex min-h-0 flex-col p-2 gap-0.5"
      aria-label="Admin navigation"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={linkClass(item.href)}
            title={collapsed ? item.label : undefined}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {!collapsed && (
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
