import { NextRequest, NextResponse } from "next/server";
import { productsCol, categoriesCol, offersCol, settingsCol, queryToArray } from "@/lib/firestore";

/**
 * GET /api/kiosk-config?userId=xxx
 * Public endpoint for kiosk APK to fetch all config
 * Returns: categories with products, offers, settings
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    // Fetch all data in parallel
    const [categoriesSnap, productsSnap, offersSnap, settingsDoc] = await Promise.all([
      categoriesCol.where("userId", "==", userId).orderBy("name").get(),
      productsCol.where("userId", "==", userId).where("status", "==", true).get(),
      offersCol.where("userId", "==", userId).get(),
      settingsCol.doc(userId).get(),
    ]);

    const categories = queryToArray(categoriesSnap);
    const products = queryToArray(productsSnap);
    const offers = queryToArray(offersSnap);

    // Build kiosk-friendly catalog structure
    const catalog = categories
      .filter((cat: any) => cat.status !== false)
      .map((cat: any) => ({
        key: cat.id,
        title: cat.name,
        subtitle: cat.subtitle || cat.description || "",
        emoji: cat.emoji || "",
        color: cat.color || "#000000",
        items: products
          .filter((p: any) => p.categoryId === cat.id)
          .map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price || 0,
            brand: p.brand || "",
            note: p.note || "",
            imageUrl: p.imageUrl || null,
            quantity: p.quantity || 0,
            stock: p.stock || 0,
          })),
      }));

    // Build offers array
    const activeOffers = offers
      .filter((o: any) => o.isMainOffer || o.offerPrice > 0)
      .map((o: any) => ({
        id: o.id,
        title: o.title,
        description: o.description || "",
        price: o.offerPrice || 0,
        products: o.products || [],
        isMain: o.isMainOffer || false,
      }));

    // Settings with defaults
    const settings = settingsDoc.exists ? settingsDoc.data() : {};
    const kioskConfig = {
      storeName: settings?.storeName || "Zivert Holms hörna",
      storeSubtitle: settings?.storeSubtitle || "",
      swishNumber: settings?.swishNumber || "",
      bubbleText1: settings?.bubbleText1 || "",
      bubbleText2: settings?.bubbleText2 || "",
      bubbleVisible: settings?.bubbleVisible !== false,
      selectButtonVisible: settings?.selectButtonVisible !== false,
      screensaverEnabled: settings?.screensaverEnabled !== false,
      screensaverText: settings?.screensaverText || "Välkommen!",
      screensaverDelay: settings?.screensaverDelay || 120,
      receiptPrefix: settings?.receiptPrefix || "ZH",
      primaryColor: settings?.primaryColor || "#2d6b5a",
      secondaryColor: settings?.secondaryColor || "#d4a574",
      accentColor: settings?.accentColor || "#f5a623",
      offersEnabled: settings?.offersEnabled !== false,
      wishesEnabled: settings?.wishesEnabled !== false,
      kioskLocked: settings?.kioskLocked !== false,
    };

    return NextResponse.json({
      catalog,
      offers: activeOffers,
      config: kioskConfig,
      lastUpdated: new Date().toISOString(),
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=30",
      },
    });
  } catch (error) {
    console.error("Error fetching kiosk config:", error);
    return NextResponse.json({ error: "Failed to fetch kiosk config" }, { status: 500 });
  }
}
