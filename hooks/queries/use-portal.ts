/**
 * Portal query hooks — stub.
 * Returns empty data until a data source is wired up.
 */

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query";

export function useSupplierPortalDashboard() {
  return useQuery<Record<string, unknown> | null>({
    queryKey: queryKeys.portal.supplier(),
    queryFn: async () => null,
  });
}

export function useClientBrowseMeta() {
  return useQuery<Record<string, unknown> | null>({
    queryKey: queryKeys.portal.clientBrowseMeta(),
    queryFn: async () => null,
  });
}

export function useClientBrowseProducts(params: {
  ownerId: string;
  supplierId?: string;
  categoryId?: string;
}) {
  return useQuery<Record<string, unknown> | null>({
    queryKey: queryKeys.portal.clientBrowseProducts(params),
    queryFn: async () => null,
    enabled: !!params.ownerId,
  });
}
