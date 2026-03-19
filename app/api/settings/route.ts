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
        storeName: "Zivert Holms hörna",
        storeSubtitle: "",
        screensaverEnabled: true,
        screensaverText: "Välkommen!",
        screensaverDelay: 120,
        receiptPrefix: "ZH",
        primaryColor: "#2d6b5a",
        secondaryColor: "#d4a574",
        accentColor: "#f5a623",
        offersEnabled: true,
        wishesEnabled: true,
        kioskLocked: true,
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

    // All supported settings fields
    const stringFields = [
      "swishNumber", "bubbleText1", "bubbleText2",
      "storeName", "storeSubtitle",
      "screensaverText", "receiptPrefix",
      "primaryColor", "secondaryColor", "accentColor",
    ];
    const booleanFields = [
      "bubbleVisible", "selectButtonVisible",
      "screensaverEnabled", "offersEnabled", "wishesEnabled", "kioskLocked",
    ];
    const numberFields = ["screensaverDelay"];

    for (const field of stringFields) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }
    for (const field of booleanFields) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }
    for (const field of numberFields) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }

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
