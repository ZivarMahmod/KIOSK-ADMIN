/**
 * Products API Route Handler
 * GET: List products filtered by userId
 * POST: Create product with all enhanced kiosk fields
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { productsCol, categoriesCol, docToObject, queryToArray } from "@/lib/firestore";
import { FieldValue } from "firebase-admin/firestore";

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

function pickExtra(body: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const key of EXTRA_FIELDS) {
    if (body[key] !== undefined) {
      out[key] = body[key];
    }
  }
  return out;
}

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
  // Copy all extra fields if they exist on the doc
  for (const key of EXTRA_FIELDS) {
    if (product[key] !== undefined) {
      base[key] = product[key];
    }
  }
  return base;
}

/**
 * GET /api/products
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snapshot = await productsCol
      .where("userId", "==", session.uid)
      .get();

    const products = queryToArray(snapshot).sort((a: any, b: any) => {
      const aTime = a.createdAt?._seconds || 0;
      const bTime = b.createdAt?._seconds || 0;
      return bTime - aTime;
    });

    // Fetch category names for display
    const categoryIds = [...new Set(products.map((p: any) => p.categoryId).filter(Boolean))];
    const categoryMap = new Map<string, string>();

    if (categoryIds.length > 0) {
      for (let i = 0; i < categoryIds.length; i += 30) {
        const batch = categoryIds.slice(i, i + 30);
        const catSnap = await categoriesCol.where("__name__", "in", batch).get();
        catSnap.docs.forEach((doc) => {
          categoryMap.set(doc.id, doc.data().name || "Unknown");
        });
      }
    }

    const transformedProducts = products.map((product: any) =>
      transformProduct(product, categoryMap.get(product.categoryId) || "Unknown")
    );

    return NextResponse.json(transformedProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/products
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      sku,
      price,
      quantity,
      status,
      categoryId,
      imageUrl,
      expirationDate,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 },
      );
    }

    // Check if SKU already exists for this user (only if sku provided)
    if (sku) {
      const existingSnap = await productsCol
        .where("sku", "==", sku)
        .where("userId", "==", session.uid)
        .limit(1)
        .get();

      if (!existingSnap.empty) {
        return NextResponse.json(
          { error: "SKU must be unique" },
          { status: 400 },
        );
      }
    }

    const now = FieldValue.serverTimestamp();
    const docData: Record<string, any> = {
      name,
      sku: sku || null,
      price: Number(price) || 0,
      quantity: Number(quantity) || 0,
      status: status ?? "active",
      userId: session.uid,
      categoryId: categoryId || null,
      imageUrl: imageUrl || null,
      expirationDate: expirationDate ? new Date(expirationDate) : null,
      createdAt: now,
      updatedAt: null,
      ...pickExtra(body),
    };

    const docRef = await productsCol.add(docData);
    const doc = await docRef.get();
    const product = docToObject(doc);

    // Fetch category name
    let categoryName = "Unknown";
    if (categoryId) {
      const catDoc = await categoriesCol.doc(categoryId).get();
      if (catDoc.exists) {
        categoryName = catDoc.data()?.name || "Unknown";
      }
    }

    return NextResponse.json(transformProduct(product, categoryName), { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}
