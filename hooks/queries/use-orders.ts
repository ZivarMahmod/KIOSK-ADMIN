/**
 * Order query hooks — stub.
 * Returns empty data until a data source is wired up.
 */

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query";
import type { Order } from "@/types";

export function useOrders() {
  return useQuery<Order[]>({
    queryKey: queryKeys.orders.lists(),
    queryFn: async () => [],
  });
}
