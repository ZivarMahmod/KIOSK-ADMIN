/**
 * Warehouses API Route Handler
 * GET: List warehouses
 * POST: Create warehouse
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { warehousesCol, docToObject, queryToArray } from "@/lib/firestore";
import { FieldValue } from "firebase-admin/firestore";

/**
 * GET /api/warehouses
 * Fetch all warehouses for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snapshot = await warehousesCol
      .where("userId", "==", session.uid)
      .get();

    const warehouses = queryToArray(snapshot).sort((a: any, b: any) => {
      const aTime = a.createdAt?._seconds || 0;
      const bTime = b.createdAt?._seconds || 0;
      return bTime - aTime;
    });

    return NextResponse.json(warehouses);
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    return NextResponse.json(
      { error: "Failed to fetch warehouses" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/warehouses
 * Create a new warehouse
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, address, type, status } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Warehouse name is required" },
        { status: 400 },
      );
    }

    const now = FieldValue.serverTimestamp();
    const docRef = await warehousesCol.add({
      name: name.trim(),
      userId: session.uid,
      address: address && typeof address === "string" ? address.trim() || null : null,
      type: type && typeof type === "string" ? type.trim() || null : null,
      status: status !== undefined ? Boolean(status) : true,
      createdAt: now,
      updatedAt: null,
    });

    const doc = await docRef.get();
    const warehouse = docToObject(doc);

    return NextResponse.json(warehouse, { status: 201 });
  } catch (error) {
    console.error("Error creating warehouse:", error);
    return NextResponse.json(
      { error: "Failed to create warehouse" },
      { status: 500 },
    );
  }
}
