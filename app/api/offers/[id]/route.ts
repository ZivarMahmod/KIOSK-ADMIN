import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { offersCol } from "@/lib/firestore";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const doc = await offersCol.doc(id).get();
    if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const data = doc.data() as any;
    if (data.userId !== session.uid) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ id: doc.id, ...data });
  } catch {
    return NextResponse.json({ error: "Failed to fetch offer" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const doc = await offersCol.doc(id).get();
    if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const existing = doc.data() as any;
    if (existing.userId !== session.uid) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const body = await request.json();
    const updateData: Record<string, any> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.products !== undefined) updateData.products = body.products;
    if (body.discount !== undefined) updateData.discount = Number(body.discount);
    if (body.offerPrice !== undefined) updateData.offerPrice = Number(body.offerPrice);
    if (body.isMainOffer !== undefined) updateData.isMainOffer = body.isMainOffer;
    await offersCol.doc(id).update(updateData);
    const updated = await offersCol.doc(id).get();
    return NextResponse.json({ id: updated.id, ...updated.data() });
  } catch {
    return NextResponse.json({ error: "Failed to update offer" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const doc = await offersCol.doc(id).get();
    if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const existing = doc.data() as any;
    if (existing.userId !== session.uid) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await offersCol.doc(id).delete();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete offer" }, { status: 500 });
  }
}
