/**
 * Server-side data fetching stubs for home page SSR.
 * Prisma has been removed — these return empty arrays until
 * a new data source (e.g. Supabase / REST API) is wired up.
 */

export type ProductForHome = {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  status: string;
  imageUrl: string | null;
  categoryName: string | null;
  supplierName: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string | null;
};

export type CategoryForHome = {
  id: string;
  name: string;
  description: string | null;
  status: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string | null;
};

export type SupplierForHome = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string | null;
};

export async function getProductsForUser(
  _userId: string,
): Promise<ProductForHome[]> {
  return [];
}

export async function getProductsBySupplierId(
  _supplierId: string,
): Promise<ProductForHome[]> {
  return [];
}

export async function getCategoriesForUser(
  _userId: string,
): Promise<CategoryForHome[]> {
  return [];
}

export async function getSuppliersForUser(
  _userId: string,
): Promise<SupplierForHome[]> {
  return [];
}
