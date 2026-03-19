/**
 * Reports API Route Handler
 * GET: Sales statistics from registered receipts
 * Enhanced with daily sales, hourly heatmap, VAT breakdown, payment methods
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { receiptsCol, queryToArray } from "@/lib/firestore";

/**
 * GET /api/reports
 * Query params: ?period=today|7days|30days|90days|year|all|custom&from=YYYY-MM-DD&to=YYYY-MM-DD
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "all";
    const customFrom = searchParams.get("from");
    const customTo = searchParams.get("to");

    // Fetch all receipts then filter in JS to avoid composite index requirement
    const snapshot = await receiptsCol
      .where("userId", "==", session.uid)
      .get();
    let allReceipts = queryToArray(snapshot) as any[];
    let receipts = [...allReceipts];

    // Calculate date range
    let fromDate: string | null = null;
    let toDate: string | null = null;
    const now = new Date();

    if (period === "today") {
      fromDate = now.toISOString().split("T")[0]!;
      toDate = fromDate;
    } else if (period === "7days" || period === "week") {
      const d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      fromDate = d.toISOString().split("T")[0]!;
    } else if (period === "30days") {
      const d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      fromDate = d.toISOString().split("T")[0]!;
    } else if (period === "90days") {
      const d = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      fromDate = d.toISOString().split("T")[0]!;
    } else if (period === "year") {
      fromDate = `${now.getFullYear()}-01-01`;
    } else if (period === "custom" && customFrom) {
      fromDate = customFrom;
      toDate = customTo || null;
    }

    if (fromDate) {
      receipts = receipts.filter((r: any) => (r.datum || "") >= fromDate!);
    }
    if (toDate) {
      receipts = receipts.filter((r: any) => (r.datum || "") <= toDate!);
    }

    // Previous period for comparison
    let prevReceipts: any[] = [];
    if (fromDate) {
      const fromMs = new Date(fromDate).getTime();
      const toMs = toDate ? new Date(toDate).getTime() : now.getTime();
      const periodMs = toMs - fromMs;
      const prevFrom = new Date(fromMs - periodMs).toISOString().split("T")[0]!;
      const prevTo = new Date(fromMs - 1).toISOString().split("T")[0]!;
      prevReceipts = allReceipts.filter(
        (r: any) => (r.datum || "") >= prevFrom && (r.datum || "") <= prevTo
      );
    }

    let totalSales = 0;
    let totalItems = 0;
    let totalRevenue = 0;
    const categoryMap = new Map<string, { count: number; revenue: number }>();
    const productMap = new Map<string, { count: number; revenue: number }>();
    const dailySalesMap = new Map<string, { count: number; revenue: number }>();
    const hourlyMap = new Map<number, { count: number; revenue: number }>();
    const paymentMethodMap = new Map<string, { count: number; revenue: number }>();
    const vatMap = new Map<number, { netAmount: number; vatAmount: number }>();
    let returnCount = 0;
    const returnReasons = new Map<string, number>();

    for (const receipt of receipts) {
      totalSales++;
      const receiptTotal = Number(receipt.total || 0);
      totalRevenue += receiptTotal;

      // Daily sales
      const date = receipt.datum || "";
      const dayEntry = dailySalesMap.get(date) || { count: 0, revenue: 0 };
      dayEntry.count++;
      dayEntry.revenue += receiptTotal;
      dailySalesMap.set(date, dayEntry);

      // Hourly heatmap
      const timeParts = (receipt.tid || "00:00").split(":");
      const hour = parseInt(timeParts[0] || "0", 10);
      const hourEntry = hourlyMap.get(hour) || { count: 0, revenue: 0 };
      hourEntry.count++;
      hourEntry.revenue += receiptTotal;
      hourlyMap.set(hour, hourEntry);

      // Payment method
      const pm = receipt.betalning || "Okand";
      const pmEntry = paymentMethodMap.get(pm) || { count: 0, revenue: 0 };
      pmEntry.count++;
      pmEntry.revenue += receiptTotal;
      paymentMethodMap.set(pm, pmEntry);

      // Returns
      if (receipt.status === "retur" || receipt.returnStatus) {
        returnCount++;
        const reason = receipt.returnReason || "Okand";
        returnReasons.set(reason, (returnReasons.get(reason) || 0) + 1);
      }

      if (Array.isArray(receipt.items)) {
        for (const item of receipt.items) {
          const qty = Number(item.antal || item.qty || 0);
          const sum = Number(item.prisTotal || item.sum || (item.prisStyck || item.price || 0) * qty || 0);
          totalItems += qty;

          // VAT calculation (default 25%)
          const vatRate = Number(item.vatRate || 25);
          const netAmount = sum / (1 + vatRate / 100);
          const vatAmount = sum - netAmount;
          const vatEntry = vatMap.get(vatRate) || { netAmount: 0, vatAmount: 0 };
          vatEntry.netAmount += netAmount;
          vatEntry.vatAmount += vatAmount;
          vatMap.set(vatRate, vatEntry);

          // Aggregate by product name
          const productName = item.namn || item.name || "Okand";
          const existing = productMap.get(productName) || { count: 0, revenue: 0 };
          existing.count += qty;
          existing.revenue += sum;
          productMap.set(productName, existing);

          // Use tagType as category if available
          const category = receipt.tagType || "Okategoriserat";
          const catExisting = categoryMap.get(category) || { count: 0, revenue: 0 };
          catExisting.count += qty;
          catExisting.revenue += sum;
          categoryMap.set(category, catExisting);
        }
      }
    }

    // Previous period totals
    let prevTotalRevenue = 0;
    let prevTotalSales = 0;
    for (const r of prevReceipts) {
      prevTotalSales++;
      prevTotalRevenue += Number(r.total || 0);
    }

    const salesByCategory = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      count: data.count,
      revenue: data.revenue,
    }));

    const salesByProduct = Array.from(productMap.entries()).map(([name, data]) => ({
      name,
      count: data.count,
      revenue: data.revenue,
    }));

    const dailySales = Array.from(dailySalesMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const hourlySales = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: hourlyMap.get(hour)?.count || 0,
      revenue: hourlyMap.get(hour)?.revenue || 0,
    }));

    const paymentMethods = Array.from(paymentMethodMap.entries()).map(([method, data]) => ({
      method,
      count: data.count,
      revenue: data.revenue,
    }));

    const vatBreakdown = Array.from(vatMap.entries())
      .map(([rate, data]) => ({
        rate,
        netAmount: Math.round(data.netAmount * 100) / 100,
        vatAmount: Math.round(data.vatAmount * 100) / 100,
        totalAmount: Math.round((data.netAmount + data.vatAmount) * 100) / 100,
      }))
      .sort((a, b) => a.rate - b.rate);

    const returnReport = {
      count: returnCount,
      reasons: Array.from(returnReasons.entries()).map(([reason, count]) => ({ reason, count })),
    };

    return NextResponse.json({
      totalSales,
      totalItems,
      totalRevenue,
      avgOrderValue: totalSales > 0 ? totalRevenue / totalSales : 0,
      prevTotalRevenue,
      prevTotalSales,
      prevAvgOrderValue: prevTotalSales > 0 ? prevTotalRevenue / prevTotalSales : 0,
      salesByCategory,
      salesByProduct,
      dailySales,
      hourlySales,
      paymentMethods,
      vatBreakdown,
      returnReport,
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 },
    );
  }
}
