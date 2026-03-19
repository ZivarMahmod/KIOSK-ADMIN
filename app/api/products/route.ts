/**
 * Products API Route Handler
 * GET: List products filtered by userId
 * POST: Create product
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { productsCol, categoriesCol, docToObject, queryToArray } from "@/lib/firestore";
import { FieldValue } from "firebase-admin/firestore";

/**
 * GET /api/products
 * Fetch all products for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snapshot = await productsCol
      .where("userId", "==", session.uid)
      .orderBy("createdAt", "desc")
      .get();

    const products = queryToArray(snapshot);

    // Fetch category names for display
    const categoryIds = [...new Set(products.map((p: any) => p.categoryId).filter(Boolean))];
    const categoryMap = new Map<string, string>();

    if (categoryIds.length > 0) {
      // Firestore 'in' queries support max 30 items
      for (let i = 0; i < categoryIds.length; i += 30) {
        const batch = categoryIds.slice(i, i + 30);
        const catSnap = await categoriesCol.where("__name__", "in", batch).get();
        catSnap.docs.forEach((doc) => {
          categoryMap.set(doc.id, doc.data().name || "Unknown");
        });
      }
    }

    const transformedProducts = products.map((product: any) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: Number(product.price || 0),
      quantity: Number(product.quantity || 0),
      status: product.status,
      categoryId: product.categoryId || null,
      category: categoryMap.get(product.categoryId) || "Unknown",
      userId: product.userId,
      createdAt: product.createdAt?.toDate?.()?.toISOString?.() || product.createdAt || null,
      updatedAt: product.updatedAt?.toDate?.()?.toISOString?.() || product.updatedAt || null,
      imageUrl: product.imageUrl || null,
      expirationDate: product.expirationDate?.toDate?.()?.toISOString?.() || product.expirationDate || null,
    }));

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
 * Create a new product
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

    // Validate required fields
    if (!name || !sku || price === undefined || quantity === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if SKU already exists for this user
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

    const now = FieldValue.serverTimestamp();
    const docRef = await productsCol.add({
      name,
      sku,
      price: Number(price),
      quantity: Number(quantity),
      status: status || "active",
      userId: session.uid,
      categoryId: categoryId || null,
      imageUrl: imageUrl || null,
      expirationDate: expirationDate ? new Date(expirationDate) : null,
      createdAt: now,
      updatedAt: null,
    });

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

    const transformedProduct = {
      id: product.id,
      name: (product as any).name,
      sku: (product as any).sku,
      price: Number((product as any).price || 0),
      quantity: Number((product as any).quantity || 0),
      status: (product as any).status,
      categoryId: (product as any).categoryId || null,
      category: categoryName,
      userId: (product as any).userId,
      createdAt: (product as any).createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
      updatedAt: null,
      imageUrl: (product as any).imageUrl || null,
      expirationDate: (product as any).expirationDate?.toDate?.()?.toISOString?.() || null,
    };

    return NextResponse.json(transformedProduct, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}
