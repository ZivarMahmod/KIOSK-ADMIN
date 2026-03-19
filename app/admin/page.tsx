"use client";

import { useReceipts } from "@/hooks/queries/use-receipts";
import { useProducts, useCategories } from "@/hooks/queries";
import { useWarehouses } from "@/hooks/queries";
import { Package, FolderTree, Warehouse, Receipt, TrendingUp, AlertTriangle } from "lucide-react";

export default function AdminDashboard() {
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: warehouses = [] } = useWarehouses();
  const { data: receipts = [] } = useReceipts();

  const todayStr = new Date().toISOString().split("T")[0];
  const todayReceipts = receipts.filter((r) => r.datum === todayStr);
  const todayRevenue = todayReceipts.reduce((sum, r) => sum + (r.total || 0), 0);
  const totalRevenue = receipts.reduce((sum, r) => sum + (r.total || 0), 0);
  const lowStock = products.filter((p) => (p.quantity || 0) <= 5 && (p.quantity || 0) > 0);

  const stats = [
    { label: "Produkter", value: products.length, icon: Package, color: "rose" },
    { label: "Kategorier", value: categories.length, icon: FolderTree, color: "emerald" },
    { label: "Lagerplatser", value: warehouses.length, icon: Warehouse, color: "sky" },
    { label: "Kvitton", value: receipts.length, icon: Receipt, color: "orange" },
    { label: "Försäljning idag", value: `${todayRevenue.toFixed(0)} kr`, icon: TrendingUp, color: "indigo" },
    { label: "Total försäljning", value: `${totalRevenue.toFixed(0)} kr`, icon: TrendingUp, color: "violet" },
  ];

  const colorMap: Record<string, string> = {
    rose: "border-rose-400/20 bg-rose-50/50 dark:bg-rose-900/10",
    emerald: "border-emerald-400/20 bg-emerald-50/50 dark:bg-emerald-900/10",
    sky: "border-sky-400/20 bg-sky-50/50 dark:bg-sky-900/10",
    orange: "border-orange-400/20 bg-orange-50/50 dark:bg-orange-900/10",
    indigo: "border-indigo-400/20 bg-indigo-50/50 dark:bg-indigo-900/10",
    violet: "border-violet-400/20 bg-violet-50/50 dark:bg-violet-900/10",
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Översikt av din kiosk</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className={`rounded-xl border p-5 ${colorMap[stat.color]}`}>
            <div className="flex items-center gap-3 mb-2">
              <stat.icon className="h-5 w-5 text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Low stock warnings */}
      {lowStock.length > 0 && (
        <div className="rounded-xl border border-yellow-400/30 bg-yellow-50/50 dark:bg-yellow-900/10 p-5 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Lågt lager ({lowStock.length})</h2>
          </div>
          <div className="space-y-2">
            {lowStock.slice(0, 5).map((p) => (
              <div key={p.id} className="flex justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">{p.name}</span>
                <span className="font-medium text-yellow-600">{p.quantity} kvar</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent receipts */}
      {receipts.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Senaste kvitton</h2>
          <div className="space-y-2">
            {receipts.slice(0, 5).map((r) => (
              <div key={r.id} className="flex justify-between text-sm py-1 border-b border-gray-100 dark:border-white/5 last:border-0">
                <span className="font-mono text-gray-600 dark:text-gray-400">{r.kvittoNummer}</span>
                <span className="text-gray-500">{r.datum} {r.tid}</span>
                <span className="font-semibold text-gray-900 dark:text-white">{r.total} kr</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
