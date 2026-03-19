/**
 * Wishes API Route Handler
 * GET: List all wishes (ordered by timestamp desc)
 * POST: Create wish
 * DELETE: Delete all wishes (bulk clear)
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { wishesCol, queryToArray } from "@/lib/firestore";
import { FieldValue } from "firebase-admin/firestore";

/**
 * GET /api/wishes
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snapshot = await wishesCol
      .where("userId", "==", session.uid)
      .orderBy("timestamp", "desc")
      .get();

    const wishes = queryToArray(snapshot);

    return NextResponse.json(wishes);
  } catch (error) {
    console.error("Error fetching wishes:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishes" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/wishes
 * Create a new wish
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { category, text } = body;

    if (!text) {
      return NextResponse.json(
        { error: "Missing required field: text" },
        { status: 400 },
      );
    }

    const docRef = await wishesCol.add({
      category: category || "",
      text,
      timestamp: FieldValue.serverTimestamp(),
      userId: session.uid,
    });

    const doc = await docRef.get();
    return NextResponse.json({ id: doc.id, ...doc.data() }, { status: 201 });
  } catch (error) {
    console.error("Error creating wish:", error);
    return NextResponse.json(
      { error: "Failed to create wish" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/wishes
 * Delete all wishes for the authenticated user
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snapshot = await wishesCol
      .where("userId", "==", session.uid)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ success: true, deletedCount: 0 });
    }

    const db = wishesCol.firestore;
    const batch = db.batch();

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    return NextResponse.json({ success: true, deletedCount: snapshot.size });
  } catch (error) {
    console.error("Error deleting wishes:", error);
    return NextResponse.json(
      { error: "Failed to delete wishes" },
      { status: 500 },
    );
  }
}
