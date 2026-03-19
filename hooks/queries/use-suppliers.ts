/**
 * Supplier query hooks — stub.
 * Returns empty data until a data source is wired up.
 */

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query";
import type { Supplier } from "@/types";

export function useSuppliers() {
  return useQuery<Supplier[]>({
    queryKey: queryKeys.suppliers.lists(),
    queryFn: async () => [],
  });
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: queryKeys.suppliers.detail(id),
    queryFn: async () => null,
    enabled: !!id,
  });
}
