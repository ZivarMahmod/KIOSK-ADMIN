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
      categoriesCol.where("userId", "==", userId).get(),
      productsCol.where("userId", "==", userId).where("status", "==", true).get(),
      offersCol.where("userId", "==", userId).get(),
      settingsCol.doc(userId).get(),
    ]);

    const categories = queryToArray(categoriesSnap).sort((a: any, b: any) => {
      return (a.name || "").localeCompare(b.name || "");
    });
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

    // Settings with defaults — expose ALL fields so the kiosk has full config
    const raw = settingsDoc.exists ? settingsDoc.data() : {};
    const s = { ...raw } as Record<string, any>;

    const defaultOpeningHours = {
      mon: { from: "08:00", to: "18:00", closed: false },
      tue: { from: "08:00", to: "18:00", closed: false },
      wed: { from: "08:00", to: "18:00", closed: false },
      thu: { from: "08:00", to: "18:00", closed: false },
      fri: { from: "08:00", to: "18:00", closed: false },
      sat: { from: "10:00", to: "16:00", closed: false },
      sun: { from: "00:00", to: "00:00", closed: true },
    };

    const kioskConfig = {
      // Butiksinformation
      storeName: s.storeName || "Zivert Holms hörna",
      storeSubtitle: s.storeSubtitle || "",
      logoUrl: s.logoUrl || "",
      companyAddress: s.companyAddress || "",
      orgNumber: s.orgNumber || "",
      vatNumber: s.vatNumber || "",

      // Betalning
      swishNumber: s.swishNumber || "",
      paymentSwish: s.paymentSwish !== false,
      paymentCard: s.paymentCard === true,
      paymentCash: s.paymentCash === true,
      paymentQR: s.paymentQR === true,
      receiptPrefix: s.receiptPrefix || "ZH",

      // Utseende / Tema
      primaryColor: s.primaryColor || "#2d6b5a",
      secondaryColor: s.secondaryColor || "#d4a574",
      accentColor: s.accentColor || "#f5a623",
      backgroundColor: s.backgroundColor || "#ffffff",
      textColor: s.textColor || "#1a1a1a",
      buttonRadius: s.buttonRadius ?? 8,
      fontFamily: s.fontFamily || "Inter",
      productCardStyle: s.productCardStyle || "style1",
      productsPerRow: s.productsPerRow ?? 3,
      themeMode: s.themeMode || "light",
      animationsEnabled: s.animationsEnabled !== false,

      // Kiosk-display
      welcomeText: s.welcomeText || "Välkommen till vår kiosk!",
      screensaverEnabled: s.screensaverEnabled !== false,
      screensaverDelay: s.screensaverDelay || 5,
      screensaverDelayMs: (s.screensaverDelay || 5) * 60 * 1000,
      screensaverText: s.screensaverText || "Välkommen!",
      bubbleText1: s.bubbleText1 || "",
      bubbleText2: s.bubbleText2 || "",
      bubbleVisible: s.bubbleVisible !== false,
      selectButtonVisible: s.selectButtonVisible !== false,

      // Drift
      openingHours: s.openingHours || defaultOpeningHours,
      autoRestartTime: s.autoRestartTime || "03:00",
      ordersPaused: s.ordersPaused === true,
      pauseMessage: s.pauseMessage || "",
      emergencyMessage: s.emergencyMessage || "",

      // Ljud & Tillganglighet
      soundEffects: s.soundEffects !== false,
      soundVolume: s.soundVolume ?? 70,
      largeTextMode: s.largeTextMode === true,
      highContrast: s.highContrast === true,

      // Funktioner
      offersEnabled: s.offersEnabled !== false,
      wishesEnabled: s.wishesEnabled !== false,
      kioskLocked: s.kioskLocked !== false,
      tippingEnabled: s.tippingEnabled === true,
      tipAmount1: s.tipAmount1 ?? 10,
      tipAmount2: s.tipAmount2 ?? 20,
      tipAmount3: s.tipAmount3 ?? 50,
      orderQueueEnabled: s.orderQueueEnabled !== false,
      orderQueueFormat: s.orderQueueFormat || "ZH-####",

      // Kvittodesign
      receiptLogoUrl: s.receiptLogoUrl || "",
      receiptThankYou: s.receiptThankYou || "Tack för ditt köp!",
      receiptFooter: s.receiptFooter || "",
      receiptShowOrderNumber: s.receiptShowOrderNumber !== false,
      receiptShowDateTime: s.receiptShowDateTime !== false,
      receiptShowVat: s.receiptShowVat !== false,
      receiptFontSize: s.receiptFontSize ?? 12,
      receiptPaperWidth: s.receiptPaperWidth || "80mm",

      // Sakerhet
      kioskPassword: s.kioskPassword || "",
      sessionTimeout: s.sessionTimeout ?? 30,

      // Metadata — lets the kiosk know when settings last changed
      updatedAt: s.updatedAt || null,
    };

    return NextResponse.json({
      catalog,
      offers: activeOffers,
      config: kioskConfig,
      lastUpdated: new Date().toISOString(),
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=5",
      },
    });
  } catch (error) {
    console.error("Error fetching kiosk config:", error);
    return NextResponse.json({ error: "Failed to fetch kiosk config" }, { status: 500 });
  }
}
