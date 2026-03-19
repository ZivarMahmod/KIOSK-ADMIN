/**
 * Category Detail API Route Handler
 * GET: Get single category
 * PUT/PATCH: Update category
 * DELETE: Delete category
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { categoriesCol, productsCol, docToObject, queryToArray } from "@/lib/firestore";

/**
 * GET /api/categories/:id
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
    const doc = await categoriesCol.doc(id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const category = docToObject(doc) as any;

    if (category.userId !== session.uid) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Fetch products in this category
    const productsSnap = await productsCol
      .where("categoryId", "==", id)
      .where("userId", "==", session.uid)
      .get();

    const products = queryToArray(productsSnap);

    const totalProducts = products.length;
    const totalValue = products.reduce(
      (sum: number, p: any) => sum + Number(p.price || 0) * Number(p.quantity || 0),
      0,
    );

    const transformedCategory = {
      id: category.id,
      name: category.name,
      status: category.status,
      description: category.description || null,
      notes: category.notes || null,
      emoji: category.emoji || "",
      color: category.color || "",
      subtitle: category.subtitle || "",
      parentId: category.parentId || null,
      visibleFrom: category.visibleFrom || null,
      visibleTo: category.visibleTo || null,
      bannerImageUrl: category.bannerImageUrl || null,
      sortOrder: category.sortOrder ?? 0,
      showOnKiosk: category.showOnKiosk !== false,
      userId: category.userId,
      createdAt: category.createdAt?.toDate?.()?.toISOString?.() || category.createdAt || null,
      updatedAt: category.updatedAt?.toDate?.()?.toISOString?.() || category.updatedAt || null,
      statistics: {
        totalProducts,
        totalValue,
      },
      products: products.map((p: any) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        price: Number(p.price || 0),
        quantity: Number(p.quantity || 0),
        status: p.status,
        imageUrl: p.imageUrl || null,
      })),
    };

    return NextResponse.json(transformedCategory);
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/categories/:id
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
    const docRef = categoriesCol.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const existing = doc.data() as any;
    if (existing.userId !== session.uid) {
      return NextResponse.json({ error: "Category not found or unauthorized" }, { status: 404 });
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

    const updateData: Record<string, any> = {
      name: name.trim(),
      updatedAt: new Date(),
    };
    if (status !== undefined) updateData.status = Boolean(status);
    if (description !== undefined) {
      updateData.description = description && typeof description === "string" ? description.trim() || null : null;
    }
    if (notes !== undefined) {
      updateData.notes = notes && typeof notes === "string" ? notes.trim() || null : null;
    }
    if (emoji !== undefined) updateData.emoji = typeof emoji === "string" ? emoji.trim() : "";
    if (color !== undefined) updateData.color = typeof color === "string" ? color.trim() : "";
    if (subtitle !== undefined) updateData.subtitle = typeof subtitle === "string" ? subtitle.trim() : "";
    if (parentId !== undefined) updateData.parentId = parentId && typeof parentId === "string" ? parentId.trim() : null;
    if (visibleFrom !== undefined) updateData.visibleFrom = visibleFrom && typeof visibleFrom === "string" ? visibleFrom.trim() : null;
    if (visibleTo !== undefined) updateData.visibleTo = visibleTo && typeof visibleTo === "string" ? visibleTo.trim() : null;
    if (bannerImageUrl !== undefined) updateData.bannerImageUrl = bannerImageUrl && typeof bannerImageUrl === "string" ? bannerImageUrl.trim() : null;
    if (sortOrder !== undefined) updateData.sortOrder = typeof sortOrder === "number" ? sortOrder : 0;
    if (showOnKiosk !== undefined) updateData.showOnKiosk = Boolean(showOnKiosk);

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    const category = docToObject(updatedDoc);

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/categories/:id
 */
export { PUT as PATCH };

/**
 * DELETE /api/categories/:id
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
    const docRef = categoriesCol.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const existing = doc.data() as any;
    if (existing.userId !== session.uid) {
      return NextResponse.json({ error: "Category not found or unauthorized" }, { status: 404 });
    }

    await docRef.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 },
    );
  }
}
