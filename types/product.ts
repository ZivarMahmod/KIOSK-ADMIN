/**
 * Product-related type definitions
 * Enhanced with full kiosk card editor fields
 */

/**
 * Product status types (legacy)
 */
export type ProductStatus = "Available" | "Stock Low" | "Stock Out";

/**
 * Stock status for kiosk display
 */
export type StockStatus = "i_lager" | "slut" | "dold" | "kommande";

/**
 * VAT rates available in Sweden
 */
export type VatRate = 0 | 6 | 12 | 25;

/**
 * Allergen keys
 */
export type Allergen =
  | "gluten"
  | "laktos"
  | "notter"
  | "agg"
  | "fisk"
  | "soja"
  | "selleri"
  | "senap"
  | "sesam"
  | "lupin"
  | "blotdjur"
  | "sulfiter";

export const ALLERGEN_LABELS: Record<Allergen, string> = {
  gluten: "Gluten",
  laktos: "Laktos",
  notter: "Notter",
  agg: "Agg",
  fisk: "Fisk",
  soja: "Soja",
  selleri: "Selleri",
  senap: "Senap",
  sesam: "Sesam",
  lupin: "Lupin",
  blotdjur: "Blotdjur",
  sulfiter: "Sulfiter",
};

export const BADGE_PRESETS = [
  "Nyhet",
  "Popular",
  "Slut snart",
  "Vegetarisk",
  "Vegan",
  "Glutenfri",
] as const;

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  i_lager: "I lager",
  slut: "Slut",
  dold: "Dold",
  kommande: "Kommande",
};

/**
 * Product interface - full model
 */
export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  status?: ProductStatus;
  createdAt: Date;
  updatedAt?: Date | null;
  categoryId: string;
  category?: string | { id: string; name: string } | null;
  supplierId?: string;
  supplier?: string | { id: string; name: string } | null;
  qrCodeUrl?: string;
  qrCodeFileId?: string;
  imageUrl?: string;
  imageFileId?: string;
  expirationDate?: Date | null;
  userId?: string;
  description?: string;
  productOwnerName?: string;
  reservedQuantity?: number;
  creator?: { name?: string; email?: string } | null;
  updater?: { name?: string; email?: string } | null;
  recentOrders?: Array<{
    id: string;
    orderId: string;
    orderNumber: string;
    quantity: number;
    price: number;
    orderDate: string;
    subtotal?: number;
    proportionalAmount?: number;
    status?: string;
    orderStatus?: string;
  }>;
  statistics?: {
    totalQuantitySold?: number;
    totalRevenue?: number;
    uniqueOrders?: number;
    totalValue?: number;
  };

  // --- Enhanced kiosk fields ---
  brand?: string;
  descriptionShort?: string;
  descriptionLong?: string;
  campaignPrice?: number | null;
  campaignFrom?: string | null;
  campaignTo?: string | null;
  backgroundColor?: string;
  textColor?: string;
  badgeLabel?: string;
  badgeColor?: string;
  stockStatus?: StockStatus;
  minStockLevel?: number;
  sortWeight?: number;
  showOnKiosk?: boolean;
  allergens?: Allergen[];
  nutritionInfo?: string;
  vatRate?: VatRate;
  costPrice?: number | null;
  supplierName?: string;
  internalNote?: string;
}

/**
 * Product creation input (without generated fields)
 */
export interface CreateProductInput {
  name: string;
  sku?: string;
  price: number;
  quantity: number;
  status?: ProductStatus | boolean;
  categoryId?: string;
  supplierId?: string;
  userId?: string;
  imageUrl?: string;
  imageFileId?: string;
  expirationDate?: string;
  description?: string;

  // Enhanced kiosk fields
  brand?: string;
  descriptionShort?: string;
  descriptionLong?: string;
  campaignPrice?: number | null;
  campaignFrom?: string | null;
  campaignTo?: string | null;
  backgroundColor?: string;
  textColor?: string;
  badgeLabel?: string;
  badgeColor?: string;
  stockStatus?: StockStatus;
  minStockLevel?: number;
  sortWeight?: number;
  showOnKiosk?: boolean;
  allergens?: Allergen[];
  nutritionInfo?: string;
  vatRate?: VatRate;
  costPrice?: number | null;
  supplierName?: string;
  internalNote?: string;
}

/**
 * Product update input (all fields optional except id)
 */
export interface UpdateProductInput {
  id: string;
  name?: string;
  sku?: string;
  price?: number;
  quantity?: number;
  status?: ProductStatus | boolean;
  categoryId?: string;
  supplierId?: string;
  userId?: string;
  imageUrl?: string;
  imageFileId?: string;
  expirationDate?: string | null;
  description?: string;

  // Enhanced kiosk fields
  brand?: string;
  descriptionShort?: string;
  descriptionLong?: string;
  campaignPrice?: number | null;
  campaignFrom?: string | null;
  campaignTo?: string | null;
  backgroundColor?: string;
  textColor?: string;
  badgeLabel?: string;
  badgeColor?: string;
  stockStatus?: StockStatus;
  minStockLevel?: number;
  sortWeight?: number;
  showOnKiosk?: boolean;
  allergens?: Allergen[];
  nutritionInfo?: string;
  vatRate?: VatRate;
  costPrice?: number | null;
  supplierName?: string;
  internalNote?: string;
}
