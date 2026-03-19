/**
 * Warehouse Detail API Route Handler
 * GET: Get single warehouse
 * PUT/PATCH: Update warehouse
 * DELETE: Delete warehouse
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { warehousesCol, docToObject } from "@/lib/firestore";

/**
 * GET /api/warehouses/:id
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const doc = await warehousesCol.doc(id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Warehouse not found" }, { status: 404 });
    }

    const warehouse = docToObject(doc) as any;

    if (warehouse.userId !== session.uid) {
      return NextResponse.json({ error: "Warehouse not found" }, { status: 404 });
    }

    return NextResponse.json(warehouse);
  } catch (error) {
    console.error("Error fetching warehouse:", error);
    return NextResponse.json(
      { error: "Failed to fetch warehouse" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/warehouses/:id
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const docRef = warehousesCol.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Warehouse not found" }, { status: 404 });
    }

    const existing = doc.data() as any;
    if (existing.userId !== session.uid) {
      return NextResponse.json({ error: "Warehouse not found or unauthorized" }, { status: 404 });
    }

    const body = await request.json();
    const { name, address, type, status } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Warehouse name is required" },
        { status: 400 },
      );
    }

    const updateData: Record<string, any> = {
      name: name.trim(),
      updatedAt: new Date(),
    };
    if (address !== undefined) {
      updateData.address = address && typeof address === "string" ? address.trim() || null : null;
    }
    if (type !== undefined) {
      updateData.type = type && typeof type === "string" ? type.trim() || null : null;
    }
    if (status !== undefined) {
      updateData.status = Boolean(status);
    }

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    const warehouse = docToObject(updatedDoc);

    return NextResponse.json(warehouse);
  } catch (error) {
    console.error("Error updating warehouse:", error);
    return NextResponse.json(
      { error: "Failed to update warehouse" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/warehouses/:id
 */
export { PUT as PATCH };

/**
 * DELETE /api/warehouses/:id
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const docRef = warehousesCol.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Warehouse not found" }, { status: 404 });
    }

    const existing = doc.data() as any;
    if (existing.userId !== session.uid) {
      return NextResponse.json({ error: "Warehouse not found or unauthorized" }, { status: 404 });
    }

    await docRef.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting warehouse:", error);
    return NextResponse.json(
      { error: "Failed to delete warehouse" },
      { status: 500 },
    );
  }
}
