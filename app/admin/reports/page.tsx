"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart3, TrendingUp, TrendingDown, ShoppingCart, Clock, Download,
  DollarSign, ArrowUpRight, ArrowDownRight, FileText
} from "lucide-react";

interface DailySale { date: string; count: number; revenue: number; }
interface HourlySale { hour: number; count: number; revenue: number; }
interface PaymentMethod { method: string; count: number; revenue: number; }
interface VatBreakdown { rate: number; netAmount: number; vatAmount: number; totalAmount: number; }
interface ProductSale { name: string; count: number; revenue: number; }
interface CategorySale { category: string; count: number; revenue: number; }
interface ReturnReport { count: number; reasons: { reason: string; count: number }[]; }

interface ReportData {
  totalSales: number;
  totalRevenue: number;
  totalItems: number;
  avgOrderValue: number;
  prevTotalRevenue: number;
  prevTotalSales: number;
  prevAvgOrderValue: number;
  salesByProduct: ProductSale[];
  salesByCategory: CategorySale[];
  dailySales: DailySale[];
  hourlySales: HourlySale[];
  paymentMethods: PaymentMethod[];
  vatBreakdown: VatBreakdown[];
  returnReport: ReturnReport;
}

const PERIOD_COLORS = ["#f97316", "#3b82f6", "#22c55e", "#a855f7", "#ef4444", "#14b8a6", "#eab308", "#ec4899"];
const CATEGORY_COLORS = ["#3b82f6", "#22c55e", "#f97316", "#a855f7", "#ef4444", "#14b8a6", "#eab308", "#ec4899", "#6366f1", "#f43f5e"];

function PctChange({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) return null;
  const pct = ((current - previous) / previous) * 100;
  const isUp = pct >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isUp ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
      {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

export default function ReportsPage() {
  const [period, setPeriod] = useState("30days");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const { auth } = await import("@/lib/firebase");
        const token = await auth.currentUser?.getIdToken();
        let url = `/api/reports?period=${period}`;
        if (period === "custom" && customFrom) {
          url += `&from=${customFrom}`;
          if (customTo) url += `&to=${customTo}`;
        }
        const res = await fetch(url, {
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
  }, [period, customFrom, customTo]);

  // CSV Export
  const exportCSV = useCallback(() => {
    if (!data) return;
    const header = "Produkt;Antal salda;Intakt\n";
    const rows = (data.salesByProduct || [])
      .sort((a, b) => b.revenue - a.revenue)
      .map(p => `${p.name};${p.count};${p.revenue.toFixed(0)}`)
      .join("\n");
    const blob = new Blob(["\uFEFF" + header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapport_${period}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "CSV exporterad" });
  }, [data, period, toast]);

  // ABC Analysis
  const abcProducts = useMemo(() => {
    if (!data?.salesByProduct?.length) return [];
    const sorted = [...data.salesByProduct].sort((a, b) => b.revenue - a.revenue);
    const totalRev = sorted.reduce((s, p) => s + p.revenue, 0);
    let cumulative = 0;
    return sorted.map((p) => {
      cumulative += p.revenue;
      const pct = totalRev > 0 ? (cumulative / totalRev) * 100 : 0;
      let grade: "A" | "B" | "C" = "C";
      if (pct <= 80) grade = "A";
      else if (pct <= 95) grade = "B";
      return { ...p, grade, cumulativePct: pct };
    });
  }, [data]);

  // Max values for charts
  const maxDailyRevenue = useMemo(() => Math.max(1, ...(data?.dailySales || []).map(d => d.revenue)), [data]);
  const maxHourlyCount = useMemo(() => Math.max(1, ...(data?.hourlySales || []).map(h => h.count)), [data]);
  const maxCategoryRevenue = useMemo(() => Math.max(1, ...(data?.salesByCategory || []).map(c => c.revenue)), [data]);
  const maxPaymentRevenue = useMemo(() => Math.max(1, ...(data?.paymentMethods || []).map(p => p.revenue)), [data]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Rapporter</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Forsaljningsstatistik och analyser</p>
        </div>
        <div className="flex gap-2 items-center">
          <Button variant="outline" onClick={exportCSV} className="gap-2" disabled={!data}>
            <Download className="h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" onClick={() => toast({ title: "PDF export (placeholder)" })} className="gap-2">
            <FileText className="h-4 w-4" /> PDF
          </Button>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[160px]">
              <Clock className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Idag</SelectItem>
              <SelectItem value="7days">7 dagar</SelectItem>
              <SelectItem value="30days">30 dagar</SelectItem>
              <SelectItem value="90days">90 dagar</SelectItem>
              <SelectItem value="year">I ar</SelectItem>
              <SelectItem value="all">All tid</SelectItem>
              <SelectItem value="custom">Anpassad...</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Custom date range */}
      {period === "custom" && (
        <div className="flex gap-3 items-center mb-4 p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-200/50 dark:border-indigo-500/20">
          <Label className="text-sm text-gray-500 whitespace-nowrap">Fran:</Label>
          <Input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="w-[160px]" />
          <Label className="text-sm text-gray-500 whitespace-nowrap">Till:</Label>
          <Input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="w-[160px]" />
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Laddar rapport...</div>
      ) : data ? (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="rounded-xl border border-indigo-400/20 bg-indigo-50/50 dark:bg-indigo-900/10 p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-indigo-500" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total forsaljning</p>
                </div>
                <PctChange current={data.totalRevenue} previous={data.prevTotalRevenue} />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{data.totalRevenue.toFixed(0)} kr</p>
            </div>
            <div className="rounded-xl border border-indigo-400/20 bg-indigo-50/50 dark:bg-indigo-900/10 p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-indigo-500" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Antal ordrar</p>
                </div>
                <PctChange current={data.totalSales} previous={data.prevTotalSales} />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{data.totalSales}</p>
            </div>
            <div className="rounded-xl border border-indigo-400/20 bg-indigo-50/50 dark:bg-indigo-900/10 p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-indigo-500" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Snittordervarde</p>
                </div>
                <PctChange current={data.avgOrderValue} previous={data.prevAvgOrderValue} />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{data.avgOrderValue.toFixed(0)} kr</p>
            </div>
            <div className="rounded-xl border border-indigo-400/20 bg-indigo-50/50 dark:bg-indigo-900/10 p-5">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-indigo-500" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Salda artiklar</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{data.totalItems}</p>
            </div>
          </div>

          <Tabs defaultValue="charts" className="mb-8">
            <TabsList className="mb-4">
              <TabsTrigger value="charts">Diagram</TabsTrigger>
              <TabsTrigger value="products">Produkter</TabsTrigger>
              <TabsTrigger value="details">Detaljrapporter</TabsTrigger>
            </TabsList>

            <TabsContent value="charts">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Sales Bar Chart */}
                <div className="rounded-xl border border-indigo-400/20 dark:border-white/10 shadow-lg bg-white/80 dark:bg-white/5 backdrop-blur-sm p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Daglig forsaljning</h3>
                  {data.dailySales.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">Ingen data</p>
                  ) : (
                    <div className="flex items-end gap-1 h-48 overflow-x-auto pb-6 relative">
                      {data.dailySales.slice(-30).map((day, i) => {
                        const height = (day.revenue / maxDailyRevenue) * 100;
                        return (
                          <div key={day.date} className="flex flex-col items-center flex-shrink-0 group" style={{ minWidth: data.dailySales.length > 14 ? "20px" : "30px" }}>
                            <div className="relative w-full flex justify-center">
                              <div
                                className="w-full max-w-[24px] rounded-t-sm bg-indigo-500 hover:bg-indigo-400 transition-colors cursor-pointer"
                                style={{ height: `${Math.max(height, 2)}%` }}
                                title={`${day.date}: ${day.revenue.toFixed(0)} kr (${day.count} ordrar)`}
                              />
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                                {day.revenue.toFixed(0)} kr
                              </div>
                            </div>
                            <span className="text-[9px] text-gray-400 mt-1 rotate-[-45deg] origin-top-left whitespace-nowrap">
                              {day.date.slice(5)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Category Distribution - Horizontal Bars */}
                <div className="rounded-xl border border-indigo-400/20 dark:border-white/10 shadow-lg bg-white/80 dark:bg-white/5 backdrop-blur-sm p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Kategorifordelning</h3>
                  {data.salesByCategory.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">Ingen data</p>
                  ) : (
                    <div className="space-y-3">
                      {[...data.salesByCategory].sort((a, b) => b.revenue - a.revenue).slice(0, 8).map((cat, i) => (
                        <div key={cat.category}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700 dark:text-gray-300 truncate">{cat.category}</span>
                            <span className="font-medium text-gray-900 dark:text-white ml-2">{cat.revenue.toFixed(0)} kr</span>
                          </div>
                          <div className="h-5 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${(cat.revenue / maxCategoryRevenue) * 100}%`,
                                backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Payment Method Breakdown */}
                <div className="rounded-xl border border-indigo-400/20 dark:border-white/10 shadow-lg bg-white/80 dark:bg-white/5 backdrop-blur-sm p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Betalmetoder</h3>
                  {data.paymentMethods.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">Ingen data</p>
                  ) : (
                    <div className="space-y-3">
                      {[...data.paymentMethods].sort((a, b) => b.revenue - a.revenue).map((pm, i) => {
                        const pct = data.totalRevenue > 0 ? (pm.revenue / data.totalRevenue) * 100 : 0;
                        return (
                          <div key={pm.method}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-700 dark:text-gray-300">{pm.method || "Ej angiven"}</span>
                              <span className="font-medium text-gray-900 dark:text-white">{pm.revenue.toFixed(0)} kr ({pct.toFixed(0)}%)</span>
                            </div>
                            <div className="h-5 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${(pm.revenue / maxPaymentRevenue) * 100}%`,
                                  backgroundColor: PERIOD_COLORS[i % PERIOD_COLORS.length],
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Hourly Sales Heatmap */}
                <div className="rounded-xl border border-indigo-400/20 dark:border-white/10 shadow-lg bg-white/80 dark:bg-white/5 backdrop-blur-sm p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Forsaljning per timme</h3>
                  <div className="grid grid-cols-6 gap-1">
                    {(data.hourlySales || []).map((h) => {
                      const intensity = maxHourlyCount > 0 ? h.count / maxHourlyCount : 0;
                      const bg = intensity === 0
                        ? "bg-gray-100 dark:bg-white/5"
                        : intensity < 0.25
                        ? "bg-indigo-100 dark:bg-indigo-900/30"
                        : intensity < 0.5
                        ? "bg-indigo-200 dark:bg-indigo-800/40"
                        : intensity < 0.75
                        ? "bg-indigo-400 dark:bg-indigo-600/60"
                        : "bg-indigo-600 dark:bg-indigo-500/80";
                      return (
                        <div
                          key={h.hour}
                          className={`${bg} rounded p-2 text-center cursor-default transition-colors`}
                          title={`${h.hour}:00 - ${h.count} ordrar, ${h.revenue.toFixed(0)} kr`}
                        >
                          <div className="text-[10px] text-gray-500 dark:text-gray-400">{String(h.hour).padStart(2, "0")}:00</div>
                          <div className={`text-xs font-bold ${intensity > 0.5 ? "text-white" : "text-gray-900 dark:text-white"}`}>
                            {h.count}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-[10px] text-gray-400">
                    <span>Farre</span>
                    <div className="flex gap-0.5">
                      <div className="w-3 h-3 rounded bg-gray-100 dark:bg-white/5" />
                      <div className="w-3 h-3 rounded bg-indigo-100 dark:bg-indigo-900/30" />
                      <div className="w-3 h-3 rounded bg-indigo-200 dark:bg-indigo-800/40" />
                      <div className="w-3 h-3 rounded bg-indigo-400 dark:bg-indigo-600/60" />
                      <div className="w-3 h-3 rounded bg-indigo-600 dark:bg-indigo-500/80" />
                    </div>
                    <span>Fler</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="products">
              {/* Top Sellers + ABC Analysis */}
              <div className="rounded-xl border border-indigo-400/20 dark:border-white/10 shadow-lg bg-white/80 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
                <div className="p-4 border-b border-indigo-100 dark:border-white/10 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900 dark:text-white">Produktprestanda (ABC-analys)</h2>
                  <div className="flex gap-2">
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">A = Top 80%</Badge>
                    <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">B = 80-95%</Badge>
                    <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">C = 95-100%</Badge>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-indigo-50/50 dark:bg-white/10">
                      <TableHead className="font-semibold w-12">#</TableHead>
                      <TableHead className="font-semibold">Produkt</TableHead>
                      <TableHead className="font-semibold text-right">Antal salda</TableHead>
                      <TableHead className="font-semibold text-right">Intakt</TableHead>
                      <TableHead className="font-semibold text-center">ABC</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {abcProducts.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">Ingen forsaljningsdata annu</TableCell></TableRow>
                    ) : (
                      abcProducts.map((product, i) => (
                        <TableRow key={product.name} className="hover:bg-indigo-50/30 dark:hover:bg-white/5">
                          <TableCell className="font-medium text-gray-500">{i + 1}</TableCell>
                          <TableCell className="font-medium text-gray-900 dark:text-white">{product.name}</TableCell>
                          <TableCell className="text-right text-gray-600 dark:text-gray-400">{product.count}</TableCell>
                          <TableCell className="text-right font-semibold text-gray-900 dark:text-white">{product.revenue.toFixed(0)} kr</TableCell>
                          <TableCell className="text-center">
                            <Badge className={
                              product.grade === "A" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                              product.grade === "B" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                              "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }>
                              {product.grade}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="details">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* VAT Report */}
                <div className="rounded-xl border border-indigo-400/20 dark:border-white/10 shadow-lg bg-white/80 dark:bg-white/5 backdrop-blur-sm p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Momsrapport</h3>
                  {(data.vatBreakdown || []).length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">Ingen momsdata</p>
                  ) : (
                    <div className="space-y-3">
                      {data.vatBreakdown.map(vat => (
                        <div key={vat.rate} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Moms {vat.rate}%</p>
                            <p className="text-xs text-gray-500">Netto: {vat.netAmount.toFixed(2)} kr</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900 dark:text-white">{vat.vatAmount.toFixed(2)} kr</p>
                            <p className="text-xs text-gray-500">Brutto: {vat.totalAmount.toFixed(2)} kr</p>
                          </div>
                        </div>
                      ))}
                      <div className="border-t border-gray-200 dark:border-white/10 pt-3 mt-3">
                        <div className="flex justify-between font-bold text-gray-900 dark:text-white">
                          <span>Total moms</span>
                          <span>{data.vatBreakdown.reduce((s, v) => s + v.vatAmount, 0).toFixed(2)} kr</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Return Report */}
                <div className="rounded-xl border border-indigo-400/20 dark:border-white/10 shadow-lg bg-white/80 dark:bg-white/5 backdrop-blur-sm p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Returrapport</h3>
                  <div className="text-center mb-4">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{data.returnReport?.count || 0}</p>
                    <p className="text-sm text-gray-500">returer under perioden</p>
                  </div>
                  {(data.returnReport?.reasons || []).length > 0 ? (
                    <div className="space-y-2">
                      {data.returnReport.reasons.map(r => (
                        <div key={r.reason} className="flex justify-between p-2 rounded-lg bg-gray-50 dark:bg-white/5">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{r.reason}</span>
                          <Badge variant="secondary">{r.count}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">Inga returer registrerade</p>
                  )}
                </div>

                {/* Inventory Report Placeholder */}
                <div className="rounded-xl border border-indigo-400/20 dark:border-white/10 shadow-lg bg-white/80 dark:bg-white/5 backdrop-blur-sm p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Lagerrapport</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Svinn & justeringar</span>
                      <span className="text-sm text-gray-500">Se Lager-sidan</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Inleveranser</span>
                      <span className="text-sm text-gray-500">Se Lager-sidan</span>
                    </div>
                    <p className="text-xs text-gray-400 text-center mt-2">
                      Detaljerad lagerrapport finns under Lagerplatser
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">Kunde inte ladda rapport</div>
      )}
    </div>
  );
}
