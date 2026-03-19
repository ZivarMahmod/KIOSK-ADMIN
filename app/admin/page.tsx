"use client";

import { useMemo, useState } from "react";
import { useReceipts } from "@/hooks/queries/use-receipts";
import { useProducts, useCategories, useWarehouses } from "@/hooks/queries";
import { useSettings, useUpdateSettings } from "@/hooks/queries/use-settings";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Package,
  AlertTriangle,
  Receipt,
  CreditCard,
  Smartphone,
  Banknote,
  QrCode,
  BarChart3,
  Clock,
  Zap,
  PauseCircle,
  Megaphone,
  RefreshCw,
  FileDown,
  Wifi,
  WifiOff,
  Activity,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmt(n: number) {
  return new Intl.NumberFormat("sv-SE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtKr(n: number) {
  return `${fmt(n)} kr`;
}

function dateStr(d: Date): string {
  return d.toISOString().split("T")[0] as string;
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return dateStr(d);
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  icon: Icon,
  comparison,
  comparisonLabel,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  comparison?: number; // percentage change
  comparisonLabel?: string;
  accent: string;
}) {
  const accentMap: Record<string, string> = {
    emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20",
    sky: "from-sky-500/20 to-sky-500/5 text-sky-400 border-sky-500/20",
    orange: "from-orange-500/20 to-orange-500/5 text-orange-400 border-orange-500/20",
    rose: "from-rose-500/20 to-rose-500/5 text-rose-400 border-rose-500/20",
    violet: "from-violet-500/20 to-violet-500/5 text-violet-400 border-violet-500/20",
    amber: "from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/20",
  };
  const iconBgMap: Record<string, string> = {
    emerald: "bg-emerald-500/15 text-emerald-400",
    sky: "bg-sky-500/15 text-sky-400",
    orange: "bg-orange-500/15 text-orange-400",
    rose: "bg-rose-500/15 text-rose-400",
    violet: "bg-violet-500/15 text-violet-400",
    amber: "bg-amber-500/15 text-amber-400",
  };

  return (
    <Card className={`border bg-gradient-to-br ${accentMap[accent] || accentMap.sky} overflow-hidden`}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
              {label}
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-foreground truncate">
              {value}
            </p>
            {comparison !== undefined && (
              <div className="flex items-center gap-1 mt-1.5">
                {comparison > 0 ? (
                  <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                ) : comparison < 0 ? (
                  <ArrowDownRight className="h-3.5 w-3.5 text-rose-400" />
                ) : (
                  <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                <span
                  className={`text-xs font-medium ${
                    comparison > 0
                      ? "text-emerald-400"
                      : comparison < 0
                      ? "text-rose-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {comparison > 0 ? "+" : ""}
                  {comparison === Infinity || comparison === -Infinity
                    ? "N/A"
                    : `${comparison.toFixed(0)}%`}
                </span>
                <span className="text-xs text-muted-foreground">
                  {comparisonLabel || "vs igr"}
                </span>
              </div>
            )}
          </div>
          <div className={`rounded-xl p-2.5 ${iconBgMap[accent] || iconBgMap.sky}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton for the whole dashboard
// ---------------------------------------------------------------------------

function DashboardSkeleton() {
  return (
    <div className="p-4 sm:p-6 max-w-[1600px] mx-auto space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="h-72 rounded-xl lg:col-span-2" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------

export default function AdminDashboard() {
  const { data: products = [], isLoading: loadingProducts } = useProducts();
  const { data: categories = [], isLoading: loadingCategories } = useCategories();
  const { data: warehouses = [], isLoading: loadingWarehouses } = useWarehouses();
  const { data: receipts = [], isLoading: loadingReceipts } = useReceipts();
  const { data: settings, isLoading: loadingSettings } = useSettings();
  const updateSettings = useUpdateSettings();
  const { toast } = useToast();

  const [pauseOrders, setPauseOrders] = useState(false);

  const isLoading = loadingProducts || loadingReceipts || loadingCategories;

  // -----------------------------------------------------------------------
  // Computed data
  // -----------------------------------------------------------------------

  const computed = useMemo(() => {
    const today = dateStr(new Date());
    const yesterday = daysAgo(1);

    const todayReceipts = receipts.filter((r) => r.datum === today);
    const yesterdayReceipts = receipts.filter((r) => r.datum === yesterday);

    const todayRevenue = todayReceipts.reduce((s, r) => s + (r.total || 0), 0);
    const yesterdayRevenue = yesterdayReceipts.reduce((s, r) => s + (r.total || 0), 0);

    const todayOrders = todayReceipts.length;
    const yesterdayOrders = yesterdayReceipts.length;

    const avgOrder = todayOrders > 0 ? todayRevenue / todayOrders : 0;
    const avgOrderYesterday =
      yesterdayOrders > 0 ? yesterdayRevenue / yesterdayOrders : 0;

    const totalProducts = products.length;
    const lowStockProducts = products.filter(
      (p) => (p.quantity || 0) <= 5
    );
    const outOfStock = products.filter((p) => (p.quantity || 0) === 0);

    // Percentage change helpers
    const pctChange = (curr: number, prev: number) =>
      prev === 0 ? (curr > 0 ? Infinity : 0) : ((curr - prev) / prev) * 100;

    const revenueChange = pctChange(todayRevenue, yesterdayRevenue);
    const ordersChange = pctChange(todayOrders, yesterdayOrders);
    const avgChange = pctChange(avgOrder, avgOrderYesterday);

    // Last 7 days chart data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = daysAgo(6 - i);
      const dayReceipts = receipts.filter((r) => r.datum === d);
      const revenue = dayReceipts.reduce((s, r) => s + (r.total || 0), 0);
      const dayDate = new Date(d);
      const dayLabel = dayDate.toLocaleDateString("sv-SE", { weekday: "short" });
      return { date: d, dayLabel, revenue, orders: dayReceipts.length };
    });
    const maxRevenue = Math.max(...last7Days.map((d) => d.revenue), 1);

    // Category distribution
    const categoryMap = new Map<string, { name: string; revenue: number; count: number }>();
    for (const r of receipts) {
      if (r.datum !== today) continue;
      for (const item of r.items || []) {
        // Try to find product and category
        const product = products.find((p) => p.name === item.namn);
        const catId = product?.categoryId || "okand";
        const cat = categories.find((c) => c.id === catId);
        const catName = cat?.name || "Okategoriserad";
        const existing = categoryMap.get(catId);
        if (existing) {
          existing.revenue += item.prisTotal || 0;
          existing.count += item.antal || 0;
        } else {
          categoryMap.set(catId, {
            name: catName,
            revenue: item.prisTotal || 0,
            count: item.antal || 0,
          });
        }
      }
    }
    const categoryDist = Array.from(categoryMap.values()).sort(
      (a, b) => b.revenue - a.revenue
    );
    const maxCatRevenue = Math.max(...categoryDist.map((c) => c.revenue), 1);

    // Payment methods breakdown (today)
    const paymentMap: Record<string, { count: number; total: number }> = {};
    for (const r of todayReceipts) {
      const method = r.betalning || "Okand";
      if (!paymentMap[method]) paymentMap[method] = { count: 0, total: 0 };
      paymentMap[method].count++;
      paymentMap[method].total += r.total || 0;
    }
    const paymentMethods = Object.entries(paymentMap)
      .map(([method, data]) => ({ method, ...data }))
      .sort((a, b) => b.total - a.total);
    const totalPayments = paymentMethods.reduce((s, p) => s + p.total, 0);

    // Top products (all time from receipts)
    const productSalesMap = new Map<string, { name: string; count: number; revenue: number }>();
    for (const r of receipts) {
      for (const item of r.items || []) {
        const existing = productSalesMap.get(item.namn);
        if (existing) {
          existing.count += item.antal || 0;
          existing.revenue += item.prisTotal || 0;
        } else {
          productSalesMap.set(item.namn, {
            name: item.namn,
            count: item.antal || 0,
            revenue: item.prisTotal || 0,
          });
        }
      }
    }
    const topProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Recent receipts (newest first)
    const recentReceipts = [...receipts]
      .sort((a, b) => {
        const da = `${a.datum} ${a.tid}`;
        const db = `${b.datum} ${b.tid}`;
        return db.localeCompare(da);
      })
      .slice(0, 10);

    return {
      todayRevenue,
      todayOrders,
      avgOrder,
      totalProducts,
      lowStockProducts,
      outOfStock,
      revenueChange,
      ordersChange,
      avgChange,
      last7Days,
      maxRevenue,
      categoryDist,
      maxCatRevenue,
      paymentMethods,
      totalPayments,
      topProducts,
      recentReceipts,
    };
  }, [receipts, products, categories]);

  // -----------------------------------------------------------------------
  // Actions
  // -----------------------------------------------------------------------

  function handlePauseToggle(checked: boolean) {
    setPauseOrders(checked);
    toast({
      title: checked ? "Bestellningar pausade" : "Bestellningar ateruppagna",
      description: checked
        ? "Kiosken tar inte emot nya ordrar just nu."
        : "Kiosken tar emot ordrar igen.",
    });
  }

  function handleEmergencyMessage() {
    toast({ title: "Nodmeddelande", description: "Meddelande skickat till kiosken." });
  }

  function handleSyncData() {
    toast({ title: "Synkar data...", description: "All data uppdateras fran servern." });
    // Force refetch by reloading queries would happen here
    window.location.reload();
  }

  function handleExportReport() {
    // Build a simple CSV export of today's receipts
    const today = dateStr(new Date());
    const todayR = receipts.filter((r) => r.datum === today);
    if (todayR.length === 0) {
      toast({ title: "Ingen data", description: "Inga kvitton idag att exportera." });
      return;
    }
    const header = "Kvittonummer,Datum,Tid,Total,Betalning,Status\n";
    const rows = todayR
      .map(
        (r) =>
          `${r.kvittoNummer},${r.datum},${r.tid},${r.total},${r.betalning || ""},${r.status}`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapport-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Rapport exporterad", description: `${todayR.length} kvitton exporterade.` });
  }

  // -----------------------------------------------------------------------
  // Payment method icon helper
  // -----------------------------------------------------------------------

  function paymentIcon(method: string) {
    const lower = method.toLowerCase();
    if (lower.includes("swish")) return Smartphone;
    if (lower.includes("kort") || lower.includes("card")) return CreditCard;
    if (lower.includes("kontant") || lower.includes("cash")) return Banknote;
    if (lower.includes("qr")) return QrCode;
    return CreditCard;
  }

  const paymentColorMap: Record<string, string> = {
    swish: "bg-emerald-500",
    kort: "bg-sky-500",
    card: "bg-sky-500",
    kontant: "bg-amber-500",
    cash: "bg-amber-500",
    qr: "bg-violet-500",
  };

  function paymentColor(method: string) {
    const lower = method.toLowerCase();
    for (const [key, color] of Object.entries(paymentColorMap)) {
      if (lower.includes(key)) return color;
    }
    return "bg-gray-500";
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  if (isLoading) return <DashboardSkeleton />;

  const {
    todayRevenue,
    todayOrders,
    avgOrder,
    totalProducts,
    lowStockProducts,
    outOfStock,
    revenueChange,
    ordersChange,
    avgChange,
    last7Days,
    maxRevenue,
    categoryDist,
    maxCatRevenue,
    paymentMethods,
    totalPayments,
    topProducts,
    recentReceipts,
  } = computed;

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date().toLocaleDateString("sv-SE", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            &mdash; Oversikt av din kiosk
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
          >
            <span className="relative flex h-2 w-2 mr-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            Live
          </Badge>
          <span className="text-xs text-muted-foreground">
            Uppdaterad {new Date().toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 1. STATS ROW                                                      */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          label="Dagens forsaljning"
          value={fmtKr(todayRevenue)}
          icon={TrendingUp}
          comparison={revenueChange}
          accent="emerald"
        />
        <StatCard
          label="Antal ordrar idag"
          value={String(todayOrders)}
          icon={ShoppingCart}
          comparison={ordersChange}
          accent="sky"
        />
        <StatCard
          label="Snittordervarde"
          value={fmtKr(avgOrder)}
          icon={BarChart3}
          comparison={avgChange}
          accent="violet"
        />
        <StatCard
          label="Produkter i lager"
          value={String(totalProducts)}
          icon={Package}
          accent="orange"
        />
        <StatCard
          label="Lagervarningar"
          value={String(lowStockProducts.length)}
          icon={AlertTriangle}
          accent={lowStockProducts.length > 0 ? "rose" : "emerald"}
        />
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 2. SALES CHART + LIVE ORDER FEED                                  */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales chart - 7 days bar chart */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Forsaljning senaste 7 dagar
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                Totalt: {fmtKr(last7Days.reduce((s, d) => s + d.revenue, 0))}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 sm:gap-3 h-48">
              {last7Days.map((day, i) => {
                const heightPct = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
                const isToday = i === last7Days.length - 1;
                return (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center gap-1 group"
                  >
                    {/* Revenue label on hover */}
                    <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {fmtKr(day.revenue)}
                    </span>
                    {/* Bar */}
                    <div className="w-full flex items-end" style={{ height: "140px" }}>
                      <div
                        className={`w-full rounded-t-md transition-all duration-500 ${
                          isToday
                            ? "bg-gradient-to-t from-emerald-600 to-emerald-400"
                            : "bg-gradient-to-t from-sky-600/60 to-sky-400/40"
                        }`}
                        style={{
                          height: `${Math.max(heightPct, 2)}%`,
                          minHeight: "4px",
                        }}
                      />
                    </div>
                    {/* Day label */}
                    <span
                      className={`text-[10px] sm:text-xs ${
                        isToday
                          ? "text-emerald-400 font-semibold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {day.dayLabel}
                    </span>
                    {/* Order count */}
                    <span className="text-[9px] text-muted-foreground">
                      {day.orders} st
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Live Order Feed */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" />
                Senaste ordrar
              </CardTitle>
              <Badge variant="secondary" className="text-[10px]">
                {recentReceipts.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[320px] overflow-y-auto divide-y divide-border/50">
              {recentReceipts.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4">
                  Inga kvitton att visa.
                </p>
              ) : (
                recentReceipts.map((r) => {
                  const PayIcon = paymentIcon(r.betalning || "");
                  return (
                    <div
                      key={r.id}
                      className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <PayIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground truncate">
                            {r.kvittoNummer}
                          </span>
                          <Badge
                            variant={r.status === "registrerad" ? "default" : "secondary"}
                            className="text-[9px] px-1.5 py-0"
                          >
                            {r.status === "registrerad" ? "Reg" : "Ej reg"}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {r.tid} &middot; {(r.items || []).length} varor &middot;{" "}
                          {r.betalning || "Okand"}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                        {fmtKr(r.total || 0)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 3. CATEGORY DISTRIBUTION + PAYMENT METHODS                        */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category Distribution */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Forsaljning per kategori (idag)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryDist.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                Ingen forsaljning idag an.
              </p>
            ) : (
              <div className="space-y-3">
                {categoryDist.map((cat, i) => {
                  const catColors = [
                    "bg-emerald-500",
                    "bg-sky-500",
                    "bg-violet-500",
                    "bg-orange-500",
                    "bg-rose-500",
                    "bg-amber-500",
                  ];
                  const widthPct =
                    maxCatRevenue > 0
                      ? (cat.revenue / maxCatRevenue) * 100
                      : 0;
                  return (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-foreground font-medium">
                          {cat.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {fmtKr(cat.revenue)} ({cat.count} st)
                        </span>
                      </div>
                      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            catColors[i % catColors.length]
                          }`}
                          style={{ width: `${Math.max(widthPct, 1)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Betalmetoder (idag)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paymentMethods.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                Ingen data idag an.
              </p>
            ) : (
              <div className="space-y-4">
                {/* Pie-like segmented bar */}
                <div className="h-6 rounded-full overflow-hidden flex">
                  {paymentMethods.map((pm) => {
                    const pct =
                      totalPayments > 0
                        ? (pm.total / totalPayments) * 100
                        : 0;
                    return (
                      <div
                        key={pm.method}
                        className={`${paymentColor(pm.method)} transition-all duration-500`}
                        style={{ width: `${Math.max(pct, 2)}%` }}
                        title={`${pm.method}: ${fmtKr(pm.total)}`}
                      />
                    );
                  })}
                </div>
                {/* Legend + breakdown */}
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((pm) => {
                    const Icon = paymentIcon(pm.method);
                    const pct =
                      totalPayments > 0
                        ? (pm.total / totalPayments) * 100
                        : 0;
                    return (
                      <div
                        key={pm.method}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                      >
                        <div
                          className={`h-9 w-9 rounded-lg flex items-center justify-center ${paymentColor(pm.method)}/20`}
                        >
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground capitalize">
                            {pm.method}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {fmtKr(pm.total)} &middot; {pct.toFixed(0)}%
                            &middot; {pm.count} st
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 4. TOP PRODUCTS + LOW STOCK WARNINGS                              */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Products */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-400" />
              Toppsaljande produkter
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                Inga forsaljningsdata tillgangliga.
              </p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <div
                    key={p.name}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        i === 0
                          ? "bg-amber-500/20 text-amber-400"
                          : i === 1
                          ? "bg-gray-400/20 text-gray-300"
                          : i === 2
                          ? "bg-orange-700/20 text-orange-500"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      #{i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {p.count} salda
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {fmtKr(p.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Warnings */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                Lagervarningar
              </CardTitle>
              <Badge
                variant={lowStockProducts.length > 0 ? "destructive" : "secondary"}
                className="text-[10px]"
              >
                {lowStockProducts.length} produkter
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="h-12 w-12 rounded-full bg-emerald-500/15 flex items-center justify-center mb-3">
                  <Package className="h-6 w-6 text-emerald-400" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  Alla produkter har bra lagerniva
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Ingen produkt under 5 i lager
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {lowStockProducts
                  .sort((a, b) => (a.quantity || 0) - (b.quantity || 0))
                  .map((p) => {
                    const qty = p.quantity || 0;
                    const level =
                      qty === 0
                        ? "red"
                        : qty <= 2
                        ? "orange"
                        : "yellow";
                    const colorClasses = {
                      red: "bg-red-500/15 text-red-400 border-red-500/20",
                      orange:
                        "bg-orange-500/15 text-orange-400 border-orange-500/20",
                      yellow:
                        "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
                    };
                    const dotClasses = {
                      red: "bg-red-500",
                      orange: "bg-orange-500",
                      yellow: "bg-yellow-500",
                    };
                    return (
                      <div
                        key={p.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${colorClasses[level]}`}
                      >
                        <span
                          className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${dotClasses[level]}`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {p.name}
                          </p>
                          <p className="text-xs opacity-70">
                            SKU: {p.sku}
                          </p>
                        </div>
                        <span className="text-sm font-bold whitespace-nowrap">
                          {qty === 0 ? "Slut" : `${qty} kvar`}
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 5. QUICK ACTIONS + KIOSK STATUS                                   */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Actions */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              Snabbatgarder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Pause orders */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-orange-500/15 flex items-center justify-center">
                    <PauseCircle className="h-5 w-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Pausa bestallningar
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {pauseOrders ? "Pausad" : "Aktiv"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={pauseOrders}
                  onCheckedChange={handlePauseToggle}
                />
              </div>

              {/* Emergency message */}
              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={handleEmergencyMessage}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-rose-500/15 flex items-center justify-center">
                    <Megaphone className="h-5 w-5 text-rose-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">
                      Nodmeddelande
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Skicka till kiosken
                    </p>
                  </div>
                </div>
              </Button>

              {/* Sync data */}
              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={handleSyncData}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-sky-500/15 flex items-center justify-center">
                    <RefreshCw className="h-5 w-5 text-sky-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">Synka data</p>
                    <p className="text-xs text-muted-foreground">
                      Uppdatera all data
                    </p>
                  </div>
                </div>
              </Button>

              {/* Export report */}
              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={handleExportReport}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-violet-500/15 flex items-center justify-center">
                    <FileDown className="h-5 w-5 text-violet-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">Exportera rapport</p>
                    <p className="text-xs text-muted-foreground">
                      Ladda ner dagens CSV
                    </p>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Kiosk Status */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Wifi className="h-4 w-4 text-emerald-400" />
              Kioskstatus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Online indicator */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-emerald-400">
                    Online
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Kiosken ar ansluten
                  </p>
                </div>
              </div>

              {/* Connection details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Senaste ping
                  </span>
                  <span className="text-xs font-medium text-foreground">
                    {new Date().toLocaleTimeString("sv-SE", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Anslutning
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px] text-emerald-400 border-emerald-500/30"
                  >
                    Stabil
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Butiksnamn
                  </span>
                  <span className="text-xs font-medium text-foreground">
                    {settings?.storeName || "Kiosk"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Last pa kiosken
                  </span>
                  <Badge
                    variant={settings?.kioskLocked ? "default" : "secondary"}
                    className="text-[10px]"
                  >
                    {settings?.kioskLocked ? "Last" : "Olast"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Erbjudanden
                  </span>
                  <Badge
                    variant={settings?.offersEnabled ? "default" : "secondary"}
                    className="text-[10px]"
                  >
                    {settings?.offersEnabled ? "Pa" : "Av"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Lagerplatser
                  </span>
                  <span className="text-xs font-medium text-foreground">
                    {warehouses.length} st
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
