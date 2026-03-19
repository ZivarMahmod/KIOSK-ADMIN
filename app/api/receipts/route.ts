/**
 * Receipts API Route Handler
 * GET: List receipts with optional filters
 * POST: Create receipt
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { receiptsCol, queryToArray } from "@/lib/firestore";
import { FieldValue } from "firebase-admin/firestore";

/**
 * GET /api/receipts
 * Query params: ?status=registered|unregistered|tagged&tagType=string
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const tagType = searchParams.get("tagType");

    // Fetch all receipts for user, filter in JS to avoid composite indexes
    const snapshot = await receiptsCol.where("userId", "==", session.uid).get();
    let receipts = queryToArray(snapshot) as any[];

    // Apply filters in JS
    if (status === "registered") {
      receipts = receipts.filter((r: any) => r.status === "registrerad");
    } else if (status === "unregistered") {
      receipts = receipts.filter((r: any) => r.status === "ej_registrerad");
    } else if (status === "tagged") {
      receipts = receipts.filter((r: any) => r.tagged === true);
    }

    if (tagType) {
      receipts = receipts.filter((r: any) => r.tagType === tagType);
    }

    // Sort by datum desc
    receipts.sort((a: any, b: any) => (b.datum || "").localeCompare(a.datum || ""));

    return NextResponse.json(receipts);
  } catch (error) {
    console.error("Error fetching receipts:", error);
    return NextResponse.json(
      { error: "Failed to fetch receipts" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/receipts
 * Create a new receipt
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { kvittoNummer, datum, tid, items, total, status, tagged, tagType, betalning } = body;

    if (!kvittoNummer || !datum || !tid || !items || total === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const docRef = await receiptsCol.add({
      kvittoNummer,
      datum,
      tid,
      items: items || [],
      total: Number(total),
      status: status || "ej_registrerad",
      tagged: tagged || false,
      tagType: tagType || null,
      betalning: betalning || "",
      userId: session.uid,
      createdAt: FieldValue.serverTimestamp(),
    });

    const doc = await docRef.get();
    return NextResponse.json({ id: doc.id, ...doc.data() }, { status: 201 });
  } catch (error) {
    console.error("Error creating receipt:", error);
    return NextResponse.json(
      { error: "Failed to create receipt" },
      { status: 500 },
    );
  }
}
