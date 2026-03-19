/**
 * Seed script: Import products + categories from CSV into Firestore
 * Run with: npx tsx scripts/seed-products.ts
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import * as fs from "fs";
import * as path from "path";

// Load service account from env or file
const serviceAccountPath = path.join(__dirname, "..", "service-account.json");
let serviceAccount: any;

if (fs.existsSync(serviceAccountPath)) {
  serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));
} else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
} else {
  console.error("No service account found. Place service-account.json in project root or set FIREBASE_SERVICE_ACCOUNT_KEY env var.");
  process.exit(1);
}

const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);

// The admin user ID (from Firebase Auth)
const USER_ID = process.argv[2];
if (!USER_ID) {
  console.error("Usage: npx tsx scripts/seed-products.ts <USER_ID>");
  console.error("Find your user ID in Firebase Console > Authentication > Users");
  process.exit(1);
}

// Categories with colors and emojis
const CATEGORIES = [
  { name: "Dryck", emoji: "🥤", color: "#3b82f6", description: "Läsk, energidryck, kaffe, vatten" },
  { name: "Snacks", emoji: "🍿", color: "#f59e0b", description: "Chips, choklad, bars" },
  { name: "Mellanmål", emoji: "🍮", color: "#8b5cf6", description: "Pudding, proteinbars, bakverk" },
  { name: "Mat", emoji: "🍕", color: "#ef4444", description: "Pizza, nudlar, varm mat" },
];

// Products from CSV with prices and category assignment
const PRODUCTS = [
  // Dryck
  { name: "Coca-Cola Zero", brand: "Coca Cola", qty: 40, price: 15, category: "Dryck" },
  { name: "Pepsi Regular Burk", brand: "Pepsi", qty: 20, price: 15, category: "Dryck" },
  { name: "Pepsi Max Burk", brand: "Pepsi", qty: 40, price: 15, category: "Dryck" },
  { name: "Fanta Orange", brand: "Fanta", qty: 20, price: 15, category: "Dryck" },
  { name: "Trocadero", brand: "Trocadero", qty: 20, price: 15, category: "Dryck" },
  { name: "Päron", brand: "Bonaqua", qty: 24, price: 15, category: "Dryck" },
  { name: "Citron & Lime", brand: "Bonaqua", qty: 24, price: 15, category: "Dryck" },
  { name: "Red Bull Original", brand: "Red Bull", qty: 48, price: 25, category: "Dryck" },
  { name: "Strawberry Lemonade", brand: "Celsius", qty: 24, price: 25, category: "Dryck" },
  { name: "Monster Energy", brand: "Monster", qty: 24, price: 25, category: "Dryck" },
  { name: "Ice Espresso+milk", brand: "Löfbergs", qty: 12, price: 20, category: "Dryck" },
  { name: "Ice Cappucino Vanilla", brand: "Löfbergs", qty: 12, price: 20, category: "Dryck" },
  { name: "Raspberry Blast Focus 3", brand: "NOCCO", qty: 24, price: 25, category: "Dryck" },
  { name: "Ramonade FOCUS", brand: "NOCCO", qty: 24, price: 25, category: "Dryck" },
  { name: "Kiwi Guava", brand: "Celsius", qty: 24, price: 25, category: "Dryck" },
  { name: "Citron & Lime", brand: "Celsius", qty: 24, price: 25, category: "Dryck" },
  { name: "Raspberry (COOP 2x25kr)", brand: "NOCCO", qty: 24, price: 25, category: "Dryck" },

  // Snacks
  { name: "Kexchoklad", brand: "Cloetta", qty: 48, price: 15, category: "Snacks" },
  { name: "Sportlunch Dubbel", brand: "Cloetta", qty: 30, price: 15, category: "Snacks" },
  { name: "Chips Sour Cream & Onion", brand: "Pringles", qty: 12, price: 30, category: "Snacks" },
  { name: "Chips Original", brand: "Pringles", qty: 12, price: 30, category: "Snacks" },
  { name: "Saltade Chips", brand: "Svenska LantChips", qty: 20, price: 25, category: "Snacks" },

  // Mellanmål
  { name: "Risifrutti Jordgubb", brand: "Risifrutti", qty: 12, price: 20, category: "Mellanmål" },
  { name: "Risifrutti Hallon", brand: "Risifrutti", qty: 12, price: 20, category: "Mellanmål" },
  { name: "Protein Choklad Pudding", brand: "Arla", qty: 6, price: 25, category: "Mellanmål" },
  { name: "Protein Vanilla Cookie Pudding", brand: "Arla", qty: 6, price: 25, category: "Mellanmål" },
  { name: "Proteinbar Choklad", brand: "ProBrands", qty: 24, price: 25, category: "Mellanmål" },
  { name: "Proteinbar Toffee & Caramel", brand: "ProBrands", qty: 24, price: 25, category: "Mellanmål" },
  { name: "Caramel", brand: "Flapjack", qty: 20, price: 20, category: "Mellanmål" },
  { name: "BIG Chocolate Bar", brand: "Corny BIG", qty: 24, price: 15, category: "Mellanmål" },
  { name: "BIG Salted Caramel Bar", brand: "Corny BIG", qty: 24, price: 15, category: "Mellanmål" },
  { name: "Punschrulle Singel", brand: "Delicato", qty: 25, price: 20, category: "Mellanmål" },
  { name: "Delicatoboll Singel", brand: "Delicato", qty: 25, price: 20, category: "Mellanmål" },

  // Mat
  { name: "Nudlar Shin Ramyum Påse", brand: "Nongshim", qty: 20, price: 20, category: "Mat" },
  { name: "Kimchi Påse", brand: "Nongshim", qty: 20, price: 20, category: "Mat" },
  { name: "Billys Pan Pizza Original", brand: "Billys", qty: 20, price: 25, category: "Mat" },
  { name: "Billys Pan Pizza Veggie", brand: "Billys", qty: 20, price: 25, category: "Mat" },
  { name: "Billys Pan Pizza Hawaii", brand: "Billys", qty: 20, price: 25, category: "Mat" },
];

async function seed() {
  console.log(`\n🌱 Seeding data for user: ${USER_ID}\n`);

  // 1. Create categories
  console.log("📁 Creating categories...");
  const categoryMap: Record<string, string> = {};

  for (const cat of CATEGORIES) {
    // Check if category already exists
    const existing = await db.collection("categories")
      .where("userId", "==", USER_ID)
      .where("name", "==", cat.name)
      .limit(1)
      .get();

    if (!existing.empty) {
      categoryMap[cat.name] = existing.docs[0].id;
      console.log(`  ✅ ${cat.emoji} ${cat.name} (exists)`);
    } else {
      const ref = await db.collection("categories").add({
        name: cat.name,
        emoji: cat.emoji,
        color: cat.color,
        description: cat.description,
        status: true,
        userId: USER_ID,
        createdBy: USER_ID,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: null,
      });
      categoryMap[cat.name] = ref.id;
      console.log(`  ✅ ${cat.emoji} ${cat.name} (created)`);
    }
  }

  // 2. Create products
  console.log("\n📦 Creating products...");
  let created = 0;
  let skipped = 0;

  for (const prod of PRODUCTS) {
    // Check if product already exists
    const existing = await db.collection("products")
      .where("userId", "==", USER_ID)
      .where("name", "==", prod.name)
      .limit(1)
      .get();

    if (!existing.empty) {
      console.log(`  ⏭️  ${prod.name} (exists)`);
      skipped++;
      continue;
    }

    const categoryId = categoryMap[prod.category] || "";

    await db.collection("products").add({
      name: prod.name,
      sku: prod.brand.toUpperCase().slice(0, 3) + "-" + prod.name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6),
      price: prod.price,
      quantity: prod.qty,
      status: true,
      categoryId,
      userId: USER_ID,
      imageUrl: null,
      brand: prod.brand,
      expirationDate: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: null,
    });

    console.log(`  ✅ ${prod.name} (${prod.brand}) — ${prod.price}kr × ${prod.qty}st → ${prod.category}`);
    created++;
  }

  // 3. Create default settings if not exist
  console.log("\n⚙️  Checking settings...");
  const settingsDoc = await db.collection("settings").doc(USER_ID).get();
  if (!settingsDoc.exists) {
    await db.collection("settings").doc(USER_ID).set({
      swishNumber: "",
      bubbleText1: "Välkommen till Zivert Holm!",
      bubbleText2: "Bläddra bland våra produkter",
      bubbleVisible: true,
      selectButtonVisible: true,
      userId: USER_ID,
    });
    console.log("  ✅ Default settings created");
  } else {
    console.log("  ✅ Settings already exist");
  }

  // 4. Create default warehouse
  console.log("\n🏠 Checking warehouses...");
  const warehouseSnap = await db.collection("warehouses")
    .where("userId", "==", USER_ID)
    .limit(1)
    .get();

  if (warehouseSnap.empty) {
    await db.collection("warehouses").add({
      name: "Kyl (Butik)",
      address: "Butiken",
      type: "Store",
      status: true,
      userId: USER_ID,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: null,
    });
    await db.collection("warehouses").add({
      name: "Förråd (Garage)",
      address: "Garaget",
      type: "Storage",
      status: true,
      userId: USER_ID,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: null,
    });
    console.log("  ✅ Created 'Kyl (Butik)' + 'Förråd (Garage)'");
  } else {
    console.log("  ✅ Warehouses already exist");
  }

  console.log(`\n✨ Done! Created ${created} products, skipped ${skipped}.`);
  console.log(`   Categories: ${CATEGORIES.length}`);
  console.log(`   Warehouses: 2 (Kyl + Förråd)`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
