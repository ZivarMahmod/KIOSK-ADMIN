/**
 * Receipts Bulk Operations API Route Handler
 * POST: Bulk tag, delete, or confirm receipts
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { receiptsCol } from "@/lib/firestore";
import { FieldValue } from "firebase-admin/firestore";

/**
 * POST /api/receipts/bulk
 * Body: { action: "tag"|"delete"|"confirm", receiptIds: string[], tagType?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, receiptIds, tagType } = body;

    if (!action || !receiptIds || !Array.isArray(receiptIds) || receiptIds.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: action, receiptIds" },
        { status: 400 },
      );
    }

    if (!["tag", "delete", "confirm"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'tag', 'delete', or 'confirm'" },
        { status: 400 },
      );
    }

    const db = receiptsCol.firestore;
    const batch = db.batch();
    let processedCount = 0;

    for (const receiptId of receiptIds) {
      const docRef = receiptsCol.doc(receiptId);
      const doc = await docRef.get();

      if (!doc.exists) continue;

      const data = doc.data() as any;
      if (data.userId !== session.uid) continue;

      if (action === "tag") {
        if (!tagType) {
          return NextResponse.json(
            { error: "tagType is required for 'tag' action" },
            { status: 400 },
          );
        }
        batch.update(docRef, { tagged: true, tagType });
      } else if (action === "delete") {
        batch.delete(docRef);
      } else if (action === "confirm") {
        batch.update(docRef, { status: "registrerad" });
      }

      processedCount++;
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      action,
      processedCount,
    });
  } catch (error) {
    console.error("Error processing bulk operation:", error);
    return NextResponse.json(
      { error: "Failed to process bulk operation" },
      { status: 500 },
    );
  }
}
