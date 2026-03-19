/**
 * Settings API Route Handler
 * GET: Get settings for current user
 * PATCH: Update settings
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { settingsCol } from "@/lib/firestore";

const defaultOpeningHours = {
  mon: { from: "08:00", to: "18:00", closed: false },
  tue: { from: "08:00", to: "18:00", closed: false },
  wed: { from: "08:00", to: "18:00", closed: false },
  thu: { from: "08:00", to: "18:00", closed: false },
  fri: { from: "08:00", to: "18:00", closed: false },
  sat: { from: "10:00", to: "16:00", closed: false },
  sun: { from: "00:00", to: "00:00", closed: true },
};

const defaultSettings = {
  // Butiksinformation
  storeName: "Zivert Holms hörna",
  storeSubtitle: "",
  companyAddress: "",
  orgNumber: "",
  vatNumber: "",
  logoUrl: "",

  // Betalning
  swishNumber: "",
  paymentSwish: true,
  paymentCard: false,
  paymentCash: false,
  paymentQR: false,
  receiptPrefix: "ZH",

  // Utseende / Tema
  primaryColor: "#2d6b5a",
  secondaryColor: "#d4a574",
  accentColor: "#f5a623",
  backgroundColor: "#ffffff",
  textColor: "#1a1a1a",
  buttonRadius: 8,
  fontFamily: "Inter",
  productCardStyle: "style1",
  productsPerRow: 3,
  themeMode: "light",
  animationsEnabled: true,

  // Kiosk-display
  welcomeText: "Välkommen till vår kiosk!",
  screensaverEnabled: true,
  screensaverDelay: 5,
  screensaverText: "Välkommen!",
  bubbleText1: "",
  bubbleText2: "",
  bubbleVisible: true,
  selectButtonVisible: true,

  // Drift
  openingHours: defaultOpeningHours,
  autoRestartTime: "03:00",
  ordersPaused: false,
  pauseMessage: "",
  emergencyMessage: "",

  // Ljud & Tillganglighet
  soundEffects: true,
  soundVolume: 70,
  largeTextMode: false,
  highContrast: false,

  // Funktioner
  offersEnabled: true,
  wishesEnabled: true,
  kioskLocked: true,
  tippingEnabled: false,
  tipAmount1: 10,
  tipAmount2: 20,
  tipAmount3: 50,
  orderQueueEnabled: true,
  orderQueueFormat: "ZH-####",

  // Kvittodesign
  receiptLogoUrl: "",
  receiptThankYou: "Tack för ditt köp!",
  receiptFooter: "",
  receiptShowOrderNumber: true,
  receiptShowDateTime: true,
  receiptShowVat: true,
  receiptFontSize: 12,
  receiptPaperWidth: "80mm",

  // Sakerhet
  kioskPassword: "",
  sessionTimeout: 30,
};

/**
 * GET /api/settings
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doc = await settingsCol.doc(session.uid).get();

    if (!doc.exists) {
      return NextResponse.json({
        id: session.uid,
        userId: session.uid,
        ...defaultSettings,
      });
    }

    return NextResponse.json({ id: doc.id, ...defaultSettings, ...doc.data() });
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

    const stringFields = [
      "storeName", "storeSubtitle", "companyAddress", "orgNumber", "vatNumber", "logoUrl",
      "swishNumber", "receiptPrefix",
      "primaryColor", "secondaryColor", "accentColor", "backgroundColor", "textColor",
      "fontFamily", "productCardStyle", "themeMode",
      "welcomeText", "screensaverText", "bubbleText1", "bubbleText2",
      "autoRestartTime", "pauseMessage", "emergencyMessage",
      "orderQueueFormat",
      "receiptLogoUrl", "receiptThankYou", "receiptFooter", "receiptPaperWidth",
      "kioskPassword",
    ];
    const booleanFields = [
      "paymentSwish", "paymentCard", "paymentCash", "paymentQR",
      "animationsEnabled",
      "screensaverEnabled", "bubbleVisible", "selectButtonVisible",
      "ordersPaused",
      "soundEffects", "largeTextMode", "highContrast",
      "offersEnabled", "wishesEnabled", "kioskLocked", "tippingEnabled", "orderQueueEnabled",
      "receiptShowOrderNumber", "receiptShowDateTime", "receiptShowVat",
    ];
    const numberFields = [
      "buttonRadius", "productsPerRow",
      "screensaverDelay",
      "soundVolume",
      "tipAmount1", "tipAmount2", "tipAmount3",
      "receiptFontSize",
      "sessionTimeout",
    ];

    for (const field of stringFields) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }
    for (const field of booleanFields) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }
    for (const field of numberFields) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }
    // Object field: openingHours
    if (body.openingHours !== undefined) {
      updateData.openingHours = body.openingHours;
    }

    await settingsCol.doc(session.uid).set(updateData, { merge: true });

    const updatedDoc = await settingsCol.doc(session.uid).get();
    return NextResponse.json({ id: updatedDoc.id, ...defaultSettings, ...updatedDoc.data() });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 },
    );
  }
}
