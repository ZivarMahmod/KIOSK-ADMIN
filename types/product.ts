/**
 * Product-related type definitions
 */

/**
 * Product status types
 */
export type ProductStatus = "Available" | "Stock Low" | "Stock Out";

/**
 * Product interface
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
}

/**
 * Product creation input (without generated fields)
 */
export interface CreateProductInput {
  name: string;
  sku: string;
  price: number;
  quantity: number;
  status: ProductStatus;
  categoryId: string;
  supplierId?: string;
  userId?: string;
  imageUrl?: string;
  imageFileId?: string;
  expirationDate?: string;
  description?: string;
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
  status?: ProductStatus;
  categoryId?: string;
  supplierId?: string;
  userId?: string;
  imageUrl?: string;
  imageFileId?: string;
  expirationDate?: string | null;
  description?: string;
}
