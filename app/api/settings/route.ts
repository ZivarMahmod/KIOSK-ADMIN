/**
 * Settings API Route Handler
 * GET: Get settings for current user
 * PATCH: Update settings
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { settingsCol } from "@/lib/firestore";

/**
 * GET /api/settings
 * Get settings document for the authenticated user (doc id = userId)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doc = await settingsCol.doc(session.uid).get();

    if (!doc.exists) {
      // Return default settings if none exist
      return NextResponse.json({
        id: session.uid,
        swishNumber: "",
        bubbleText1: "",
        bubbleText2: "",
        bubbleVisible: true,
        selectButtonVisible: true,
        userId: session.uid,
      });
    }

    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/settings
 * Update settings for the authenticated user (upsert)
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const updateData: Record<string, any> = {
      userId: session.uid,
    };

    if (body.swishNumber !== undefined) updateData.swishNumber = body.swishNumber;
    if (body.bubbleText1 !== undefined) updateData.bubbleText1 = body.bubbleText1;
    if (body.bubbleText2 !== undefined) updateData.bubbleText2 = body.bubbleText2;
    if (body.bubbleVisible !== undefined) updateData.bubbleVisible = body.bubbleVisible;
    if (body.selectButtonVisible !== undefined) updateData.selectButtonVisible = body.selectButtonVisible;

    await settingsCol.doc(session.uid).set(updateData, { merge: true });

    const updatedDoc = await settingsCol.doc(session.uid).get();
    return NextResponse.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 },
    );
  }
}
