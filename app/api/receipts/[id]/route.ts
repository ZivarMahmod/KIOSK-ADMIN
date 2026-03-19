/**
 * Receipt Detail API Route Handler
 * GET: Get single receipt
 * PATCH: Update receipt (tag/untag, confirm status)
 * DELETE: Delete receipt
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { receiptsCol, docToObject } from "@/lib/firestore";

/**
 * GET /api/receipts/:id
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
    const doc = await receiptsCol.doc(id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    const receipt = docToObject(doc) as any;

    if (receipt.userId !== session.uid) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    return NextResponse.json(receipt);
  } catch (error) {
    console.error("Error fetching receipt:", error);
    return NextResponse.json(
      { error: "Failed to fetch receipt" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/receipts/:id
 * Update receipt fields (tag/untag, confirm status, etc.)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const docRef = receiptsCol.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    const existing = doc.data() as any;
    if (existing.userId !== session.uid) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    const body = await request.json();
    const updateData: Record<string, any> = {};

    if (body.status !== undefined) updateData.status = body.status;
    if (body.tagged !== undefined) updateData.tagged = body.tagged;
    if (body.tagType !== undefined) updateData.tagType = body.tagType;
    if (body.kvittoNummer !== undefined) updateData.kvittoNummer = body.kvittoNummer;
    if (body.datum !== undefined) updateData.datum = body.datum;
    if (body.tid !== undefined) updateData.tid = body.tid;
    if (body.items !== undefined) updateData.items = body.items;
    if (body.total !== undefined) updateData.total = Number(body.total);
    if (body.betalning !== undefined) updateData.betalning = body.betalning;

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    const receipt = docToObject(updatedDoc);

    return NextResponse.json(receipt);
  } catch (error) {
    console.error("Error updating receipt:", error);
    return NextResponse.json(
      { error: "Failed to update receipt" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/receipts/:id
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
    const docRef = receiptsCol.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    const existing = doc.data() as any;
    if (existing.userId !== session.uid) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    await docRef.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting receipt:", error);
    return NextResponse.json(
      { error: "Failed to delete receipt" },
      { status: 500 },
    );
  }
}
