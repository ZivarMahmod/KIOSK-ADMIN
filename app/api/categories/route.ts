/**
 * Categories API Route Handler
 * GET: List categories
 * POST: Create category
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { categoriesCol, docToObject, queryToArray } from "@/lib/firestore";
import { FieldValue } from "firebase-admin/firestore";

/**
 * GET /api/categories
 * Fetch all categories for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snapshot = await categoriesCol
      .where("userId", "==", session.uid)
      .get();

    const categories = queryToArray(snapshot).sort((a: any, b: any) => {
      // Sort by sortOrder first, then by createdAt
      const aOrder = a.sortOrder ?? 999;
      const bOrder = b.sortOrder ?? 999;
      if (aOrder !== bOrder) return aOrder - bOrder;
      const aTime = a.createdAt?._seconds || 0;
      const bTime = b.createdAt?._seconds || 0;
      return bTime - aTime;
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/categories
 * Create a new category
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name, status, description, notes, emoji, color, subtitle,
      parentId, visibleFrom, visibleTo, bannerImageUrl, sortOrder, showOnKiosk,
    } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 },
      );
    }

    const now = FieldValue.serverTimestamp();
    const docRef = await categoriesCol.add({
      name: name.trim(),
      userId: session.uid,
      status: status !== undefined ? Boolean(status) : true,
      description: description && typeof description === "string" ? description.trim() || null : null,
      notes: notes && typeof notes === "string" ? notes.trim() || null : null,
      emoji: emoji && typeof emoji === "string" ? emoji.trim() : "",
      color: color && typeof color === "string" ? color.trim() : "",
      subtitle: subtitle && typeof subtitle === "string" ? subtitle.trim() : "",
      parentId: parentId && typeof parentId === "string" ? parentId.trim() : null,
      visibleFrom: visibleFrom && typeof visibleFrom === "string" ? visibleFrom.trim() : null,
      visibleTo: visibleTo && typeof visibleTo === "string" ? visibleTo.trim() : null,
      bannerImageUrl: bannerImageUrl && typeof bannerImageUrl === "string" ? bannerImageUrl.trim() : null,
      sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
      showOnKiosk: showOnKiosk !== undefined ? Boolean(showOnKiosk) : true,
      createdAt: now,
      updatedAt: null,
    });

    const doc = await docRef.get();
    const category = docToObject(doc);

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 },
    );
  }
}
