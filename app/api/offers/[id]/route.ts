/**
 * Offer Detail API Route Handler
 * GET: Get single offer
 * PATCH: Update offer
 * DELETE: Delete offer
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { offersCol, docToObject } from "@/lib/firestore";

/**
 * GET /api/offers/:id
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
    const doc = await offersCol.doc(id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    const offer = docToObject(doc) as any;

    if (offer.userId !== session.uid) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    return NextResponse.json(offer);
  } catch (error) {
    console.error("Error fetching offer:", error);
    return NextResponse.json(
      { error: "Failed to fetch offer" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/offers/:id
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
    const docRef = offersCol.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    const existing = doc.data() as any;
    if (existing.userId !== session.uid) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    const body = await request.json();
    const updateData: Record<string, any> = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.products !== undefined) updateData.products = body.products;
    if (body.discount !== undefined) updateData.discount = Number(body.discount);
    if (body.offerPrice !== undefined) updateData.offerPrice = Number(body.offerPrice);
    if (body.isMainOffer !== undefined) updateData.isMainOffer = body.isMainOffer;

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    const offer = docToObject(updatedDoc);

    return NextResponse.json(offer);
  } catch (error) {
    console.error("Error updating offer:", error);
    return NextResponse.json(
      { error: "Failed to update offer" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/offers/:id
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
    const docRef = offersCol.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    const existing = doc.data() as any;
    if (existing.userId !== session.uid) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    await docRef.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting offer:", error);
    return NextResponse.json(
      { error: "Failed to delete offer" },
      { status: 500 },
    );
  }
}
