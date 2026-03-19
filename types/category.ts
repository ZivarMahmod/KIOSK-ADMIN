/**
 * Category-related type definitions
 */

/**
 * Category interface matching Firestore schema
 */
export interface Category {
  id: string;
  name: string;
  userId: string;
  status: boolean;
  description?: string | null;
  notes?: string | null;
  emoji?: string;
  color?: string;
  subtitle?: string;
  // New enhanced fields
  parentId?: string | null;       // subcategory support
  visibleFrom?: string | null;    // "HH:mm" schedule visibility
  visibleTo?: string | null;      // "HH:mm" schedule visibility
  bannerImageUrl?: string | null; // banner image
  sortOrder?: number;             // sort order
  showOnKiosk?: boolean;          // show on kiosk toggle

  createdAt: Date;
  updatedAt?: Date | null;
  createdBy: string;
  updatedBy?: string | null;
  /** Extended by API for detail page */
  creator?: { name: string; email: string } | null;
  updater?: { name: string; email: string } | null;
  products?: Array<{
    id: string;
    name: string;
    imageUrl?: string | null;
    sku?: string | null;
    quantity?: number;
    price?: number;
  }> | null;
  statistics?: {
    totalProducts: number;
    totalQuantitySold: number;
    totalRevenue: number;
    uniqueOrders: number;
    totalValue: number;
  } | null;
  recentOrders?: Array<{
    id: string;
    orderId: string;
    orderNumber: string;
    productName: string;
    productSku?: string | null;
    quantity: number;
    price: number;
    orderDate: string;
    subtotal: number;
    proportionalAmount?: number;
    orderTotal?: number;
    orderStatus: string;
  }> | null;
}

/**
 * Category creation input
 */
export interface CreateCategoryInput {
  name: string;
  userId: string;
  status?: boolean;
  description?: string | null;
  notes?: string | null;
  emoji?: string;
  color?: string;
  subtitle?: string;
  parentId?: string | null;
  visibleFrom?: string | null;
  visibleTo?: string | null;
  bannerImageUrl?: string | null;
  sortOrder?: number;
  showOnKiosk?: boolean;
}

/**
 * Category update input
 */
export interface UpdateCategoryInput {
  id: string;
  name: string;
  status?: boolean;
  description?: string | null;
  notes?: string | null;
  emoji?: string;
  color?: string;
  subtitle?: string;
  parentId?: string | null;
  visibleFrom?: string | null;
  visibleTo?: string | null;
  bannerImageUrl?: string | null;
  sortOrder?: number;
  showOnKiosk?: boolean;
}
