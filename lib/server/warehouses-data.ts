/**
 * Server-side data fetching stubs for warehouses page SSR.
 * Prisma has been removed — returns empty arrays until
 * a new data source is wired up.
 */

export type WarehouseForPage = {
  id: string;
  name: string;
  address: string | null;
  type: string | null;
  status: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
};

export async function getWarehousesForUser(
  _userId: string,
): Promise<WarehouseForPage[]> {
  return [];
}
