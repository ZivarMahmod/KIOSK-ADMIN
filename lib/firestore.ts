import { adminDb } from "./firebase-admin";

// Collection references
export const productsCol = adminDb.collection("products");
export const categoriesCol = adminDb.collection("categories");
export const warehousesCol = adminDb.collection("warehouses");
export const stockAllocationsCol = adminDb.collection("stockAllocations");
export const receiptsCol = adminDb.collection("receipts");
export const offersCol = adminDb.collection("offers");
export const wishesCol = adminDb.collection("wishes");
export const settingsCol = adminDb.collection("settings");
export const tagsCol = adminDb.collection("tags");

// Helper: Convert Firestore doc to plain object with id
export function docToObject<T>(doc: FirebaseFirestore.DocumentSnapshot): T & { id: string } {
  return { id: doc.id, ...doc.data() } as T & { id: string };
}

// Helper: Convert Firestore QuerySnapshot to array
export function queryToArray<T>(snapshot: FirebaseFirestore.QuerySnapshot): (T & { id: string })[] {
  return snapshot.docs.map((doc) => docToObject<T>(doc));
}
