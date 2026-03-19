"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, TrendingUp, ShoppingCart, Clock } from "lucide-react";

interface ReportData {
  totalSales: number;
  totalRevenue: number;
  totalItems: number;
  salesByProduct: { name: string; count: number; revenue: number }[];
  salesByCategory: { category: string; count: number; revenue: number }[];
}

export default function ReportsPage() {
  const [period, setPeriod] = useState("all");
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const { auth } = await import("@/lib/firebase");
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch(`/api/reports?period=${period}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) setData(await res.json());
      } catch (e) {
        console.error("Failed to fetch report", e);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [period]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Rapporter</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Försäljningsstatistik och analyser</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[160px]">
            <Clock className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Idag</SelectItem>
            <SelectItem value="7days">7 dagar</SelectItem>
            <SelectItem value="30days">30 dagar</SelectItem>
            <SelectItem value="all">All tid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Laddar rapport...</div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="rounded-xl border border-indigo-400/20 bg-indigo-50/50 dark:bg-indigo-900/10 p-5">
              <div className="flex items-center gap-3 mb-2">
                <ShoppingCart className="h-5 w-5 text-indigo-500" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Antal kvitton</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{data.totalSales}</p>
            </div>
            <div className="rounded-xl border border-indigo-400/20 bg-indigo-50/50 dark:bg-indigo-900/10 p-5">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-indigo-500" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Total intäkt</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{data.totalRevenue.toFixed(0)} kr</p>
            </div>
            <div className="rounded-xl border border-indigo-400/20 bg-indigo-50/50 dark:bg-indigo-900/10 p-5">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="h-5 w-5 text-indigo-500" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Sålda artiklar</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{data.totalItems}</p>
            </div>
          </div>

          <div className="rounded-xl border border-indigo-400/20 dark:border-white/10 shadow-lg bg-white/80 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
            <div className="p-4 border-b border-indigo-100 dark:border-white/10">
              <h2 className="font-semibold text-gray-900 dark:text-white">Top produkter</h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-indigo-50/50 dark:bg-white/10">
                  <TableHead className="font-semibold">#</TableHead>
                  <TableHead className="font-semibold">Produkt</TableHead>
                  <TableHead className="font-semibold text-right">Antal sålda</TableHead>
                  <TableHead className="font-semibold text-right">Intäkt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data.salesByProduct || []).length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-500">Ingen försäljningsdata ännu</TableCell></TableRow>
                ) : (
                  (data.salesByProduct || []).sort((a, b) => b.revenue - a.revenue).slice(0, 10).map((product, i) => (
                    <TableRow key={product.name} className="hover:bg-indigo-50/30 dark:hover:bg-white/5">
                      <TableCell className="font-medium text-gray-500">{i + 1}</TableCell>
                      <TableCell className="font-medium text-gray-900 dark:text-white">{product.name}</TableCell>
                      <TableCell className="text-right text-gray-600 dark:text-gray-400">{product.count}</TableCell>
                      <TableCell className="text-right font-semibold text-gray-900 dark:text-white">{product.revenue.toFixed(0)} kr</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">Kunde inte ladda rapport</div>
      )}
    </div>
  );
}
