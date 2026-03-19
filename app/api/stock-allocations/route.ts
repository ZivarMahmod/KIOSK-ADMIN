/**
 * Stock Allocations API Route Handler
 * GET: List allocations (optionally filter by productId or warehouseId)
 * POST: Create/update allocation
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { stockAllocationsCol, productsCol, warehousesCol, docToObject, queryToArray } from "@/lib/firestore";
import { FieldValue } from "firebase-admin/firestore";

/**
 * GET /api/stock-allocations
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const warehouseId = searchParams.get("warehouseId");

    let query: FirebaseFirestore.Query = stockAllocationsCol.where("userId", "==", session.uid);

    if (productId) {
      query = query.where("productId", "==", productId);
    }
    if (warehouseId) {
      query = query.where("warehouseId", "==", warehouseId);
    }

    const snapshot = await query.orderBy("createdAt", "desc").get();
    const allocations = queryToArray(snapshot);

    // Fetch product and warehouse names
    const productIds = [...new Set(allocations.map((a: any) => a.productId).filter(Boolean))];
    const warehouseIds = [...new Set(allocations.map((a: any) => a.warehouseId).filter(Boolean))];

    const productMap = new Map<string, { name: string; sku: string }>();
    const warehouseMap = new Map<string, string>();

    // Fetch products in batches of 30
    for (let i = 0; i < productIds.length; i += 30) {
      const batch = productIds.slice(i, i + 30);
      const snap = await productsCol.where("__name__", "in", batch).get();
      snap.docs.forEach((doc) => {
        const data = doc.data();
        productMap.set(doc.id, { name: data.name, sku: data.sku });
      });
    }

    // Fetch warehouses in batches of 30
    for (let i = 0; i < warehouseIds.length; i += 30) {
      const batch = warehouseIds.slice(i, i + 30);
      const snap = await warehousesCol.where("__name__", "in", batch).get();
      snap.docs.forEach((doc) => {
        warehouseMap.set(doc.id, doc.data().name);
      });
    }

    const result = allocations.map((a: any) => ({
      id: a.id,
      productId: a.productId,
      warehouseId: a.warehouseId,
      quantity: Number(a.quantity || 0),
      reservedQuantity: Number(a.reservedQuantity || 0),
      userId: a.userId,
      createdAt: a.createdAt?.toDate?.()?.toISOString?.() || a.createdAt || null,
      updatedAt: a.updatedAt?.toDate?.()?.toISOString?.() || a.updatedAt || null,
      product: productMap.has(a.productId)
        ? { id: a.productId, ...productMap.get(a.productId)! }
        : undefined,
      warehouse: warehouseMap.has(a.warehouseId)
        ? { id: a.warehouseId, name: warehouseMap.get(a.warehouseId)! }
        : undefined,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching stock allocations:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock allocations" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/stock-allocations
 * Create or update a stock allocation
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, warehouseId, quantity } = body;

    if (!productId || !warehouseId || quantity === undefined) {
      return NextResponse.json(
        { error: "productId, warehouseId, and quantity are required" },
        { status: 400 },
      );
    }

    // Verify product belongs to user
    const productDoc = await productsCol.doc(productId).get();
    if (!productDoc.exists || productDoc.data()?.userId !== session.uid) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Verify warehouse belongs to user
    const warehouseDoc = await warehousesCol.doc(warehouseId).get();
    if (!warehouseDoc.exists || warehouseDoc.data()?.userId !== session.uid) {
      return NextResponse.json({ error: "Warehouse not found" }, { status: 404 });
    }

    // Check if allocation already exists for this product+warehouse combo
    const existingSnap = await stockAllocationsCol
      .where("productId", "==", productId)
      .where("warehouseId", "==", warehouseId)
      .where("userId", "==", session.uid)
      .limit(1)
      .get();

    let allocationId: string;

    if (!existingSnap.empty) {
      // Update existing allocation
      const existingDoc = existingSnap.docs[0]!;
      allocationId = existingDoc.id;
      await stockAllocationsCol.doc(allocationId).update({
        quantity: Number(quantity),
        updatedAt: new Date(),
      });
    } else {
      // Create new allocation
      const now = FieldValue.serverTimestamp();
      const docRef = await stockAllocationsCol.add({
        productId,
        warehouseId,
        quantity: Number(quantity),
        reservedQuantity: 0,
        userId: session.uid,
        createdAt: now,
        updatedAt: null,
      });
      allocationId = docRef.id;
    }

    const allocDoc = await stockAllocationsCol.doc(allocationId).get();
    const allocation = docToObject(allocDoc) as any;

    const productData = productDoc.data();
    const warehouseData = warehouseDoc.data();

    const result = {
      id: allocation.id,
      productId: allocation.productId,
      warehouseId: allocation.warehouseId,
      quantity: Number(allocation.quantity || 0),
      reservedQuantity: Number(allocation.reservedQuantity || 0),
      userId: allocation.userId,
      createdAt: allocation.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
      updatedAt: allocation.updatedAt?.toDate?.()?.toISOString?.() || null,
      product: { id: productId, name: productData?.name, sku: productData?.sku },
      warehouse: { id: warehouseId, name: warehouseData?.name },
    };

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating stock allocation:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create stock allocation",
      },
      { status: 500 },
    );
  }
}
