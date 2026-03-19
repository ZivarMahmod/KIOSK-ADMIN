/**
 * Dashboard API Route Handler
 * GET /api/dashboard - Return simple stats
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { productsCol, categoriesCol, warehousesCol, stockAllocationsCol, queryToArray } from "@/lib/firestore";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const uid = session.uid;

    // Fetch counts in parallel
    const [productsSnap, categoriesSnap, warehousesSnap, allocationsSnap] = await Promise.all([
      productsCol.where("userId", "==", uid).get(),
      categoriesCol.where("userId", "==", uid).get(),
      warehousesCol.where("userId", "==", uid).get(),
      stockAllocationsCol.where("userId", "==", uid).get(),
    ]);

    const products = queryToArray(productsSnap);
    const allocations = queryToArray(allocationsSnap);

    const productCount = products.length;
    const categoryCount = categoriesSnap.size;
    const warehouseCount = warehousesSnap.size;

    // Total stock from products
    const totalStock = products.reduce(
      (sum: number, p: any) => sum + Number(p.quantity || 0),
      0,
    );

    // Low stock count (products with quantity <= 10)
    const lowStockCount = products.filter(
      (p: any) => Number(p.quantity || 0) <= 10,
    ).length;

    // Total allocated stock
    const totalAllocatedStock = allocations.reduce(
      (sum: number, a: any) => sum + Number(a.quantity || 0),
      0,
    );

    return NextResponse.json({
      productCount,
      categoryCount,
      warehouseCount,
      totalStock,
      lowStockCount,
      totalAllocatedStock,
    });
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard" },
      { status: 500 },
    );
  }
}
