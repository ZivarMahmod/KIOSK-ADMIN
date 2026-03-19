/**
 * Reports API Route Handler
 * GET: Sales statistics from registered receipts
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { receiptsCol, queryToArray } from "@/lib/firestore";

/**
 * GET /api/reports
 * Query params: ?period=7days|week|all
 * Returns: { totalSales, totalItems, totalRevenue, salesByCategory, salesByProduct }
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "all";

    // Fetch all receipts then filter in JS to avoid composite index requirement
    const snapshot = await receiptsCol
      .where("userId", "==", session.uid)
      .get();
    let receipts = queryToArray(snapshot) as any[];

    // Filter by period in JS
    if (period === "today") {
      const todayStr = new Date().toISOString().split("T")[0]!;
      receipts = receipts.filter((r: any) => r.datum === todayStr);
    } else if (period === "7days" || period === "week") {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const dateStr = sevenDaysAgo.toISOString().split("T")[0]!;
      receipts = receipts.filter((r: any) => (r.datum || "") >= dateStr);
    } else if (period === "30days") {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const dateStr = thirtyDaysAgo.toISOString().split("T")[0]!;
      receipts = receipts.filter((r: any) => (r.datum || "") >= dateStr);
    }

    let totalSales = 0;
    let totalItems = 0;
    let totalRevenue = 0;
    const categoryMap = new Map<string, { count: number; revenue: number }>();
    const productMap = new Map<string, { count: number; revenue: number }>();

    for (const receipt of receipts) {
      totalSales++;
      totalRevenue += Number(receipt.total || 0);

      if (Array.isArray(receipt.items)) {
        for (const item of receipt.items) {
          const qty = Number(item.qty || 0);
          const sum = Number(item.sum || item.price * qty || 0);
          totalItems += qty;

          // Aggregate by product name
          const productName = item.name || "Unknown";
          const existing = productMap.get(productName) || { count: 0, revenue: 0 };
          existing.count += qty;
          existing.revenue += sum;
          productMap.set(productName, existing);

          // Use tagType as category if available, otherwise "Uncategorized"
          const category = receipt.tagType || "Uncategorized";
          const catExisting = categoryMap.get(category) || { count: 0, revenue: 0 };
          catExisting.count += qty;
          catExisting.revenue += sum;
          categoryMap.set(category, catExisting);
        }
      }
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

    return NextResponse.json({
      totalSales,
      totalItems,
      totalRevenue,
      salesByCategory,
      salesByProduct,
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 },
    );
  }
}
