/**
 * Product Detail API Route Handler
 * GET: Get single product by id
 * PUT/PATCH: Update product with all enhanced kiosk fields
 * DELETE: Delete product
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { productsCol, categoriesCol, docToObject } from "@/lib/firestore";

/** All enhanced kiosk fields that can be stored on a product */
const EXTRA_FIELDS = [
  "brand",
  "descriptionShort",
  "descriptionLong",
  "campaignPrice",
  "campaignFrom",
  "campaignTo",
  "backgroundColor",
  "textColor",
  "badgeLabel",
  "badgeColor",
  "stockStatus",
  "minStockLevel",
  "sortWeight",
  "showOnKiosk",
  "allergens",
  "nutritionInfo",
  "vatRate",
  "costPrice",
  "supplierName",
  "internalNote",
] as const;

function transformProduct(product: any, categoryName: string) {
  const base: Record<string, any> = {
    id: product.id,
    name: product.name,
    sku: product.sku || null,
    price: Number(product.price || 0),
    quantity: Number(product.quantity || 0),
    status: product.status,
    categoryId: product.categoryId || null,
    category: categoryName,
    userId: product.userId,
    createdAt: product.createdAt?.toDate?.()?.toISOString?.() || product.createdAt || null,
    updatedAt: product.updatedAt?.toDate?.()?.toISOString?.() || product.updatedAt || null,
    imageUrl: product.imageUrl || null,
    expirationDate: product.expirationDate?.toDate?.()?.toISOString?.() || product.expirationDate || null,
  };
  for (const key of EXTRA_FIELDS) {
    if (product[key] !== undefined) {
      base[key] = product[key];
    }
  }
  return base;
}

/**
 * GET /api/products/:id
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
    const doc = await productsCol.doc(id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = docToObject(doc) as any;

    if (product.userId !== session.uid) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Fetch category
    let categoryName = "Unknown";
    if (product.categoryId) {
      const catDoc = await categoriesCol.doc(product.categoryId).get();
      if (catDoc.exists) {
        categoryName = catDoc.data()?.name || "Unknown";
      }
    }

    return NextResponse.json(transformProduct(product, categoryName));
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/products/:id
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
    const docRef = productsCol.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const existing = doc.data() as any;
    if (existing.userId !== session.uid) {
      return NextResponse.json({ error: "Product not found or unauthorized" }, { status: 404 });
    }

    const body = await request.json();
    const { name, sku, price, quantity, status, categoryId, imageUrl, expirationDate } = body;

    // Check SKU uniqueness if changing
    if (sku && sku !== existing.sku) {
      const skuSnap = await productsCol
        .where("sku", "==", sku)
        .where("userId", "==", session.uid)
        .limit(1)
        .get();
      if (!skuSnap.empty) {
        return NextResponse.json({ error: "SKU must be unique" }, { status: 400 });
      }
    }

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    // Core fields
    if (name !== undefined) updateData.name = name;
    if (sku !== undefined) updateData.sku = sku;
    if (price !== undefined) updateData.price = Number(price);
    if (quantity !== undefined) updateData.quantity = Number(quantity);
    if (status !== undefined) updateData.status = status;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl === "" ? null : imageUrl;
    if (expirationDate !== undefined) {
      updateData.expirationDate =
        expirationDate === "" || expirationDate === null ? null : new Date(expirationDate);
    }

    // All enhanced kiosk fields
    for (const key of EXTRA_FIELDS) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    const product = docToObject(updatedDoc) as any;

    // Fetch category name
    let categoryName = "Unknown";
    if (product.categoryId) {
      const catDoc = await categoriesCol.doc(product.categoryId).get();
      if (catDoc.exists) {
        categoryName = catDoc.data()?.name || "Unknown";
      }
    }

    return NextResponse.json(transformProduct(product, categoryName));
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/products/:id
 */
export { PUT as PATCH };

/**
 * DELETE /api/products/:id
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
    const docRef = productsCol.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const existing = doc.data() as any;
    if (existing.userId !== session.uid) {
      return NextResponse.json({ error: "Product not found or unauthorized" }, { status: 404 });
    }

    await docRef.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
