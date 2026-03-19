/**
 * Product review query hooks — stub.
 * Returns empty data until a data source is wired up.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query";
import type { ProductReview, ReviewEligibilitySlot } from "@/types";

export function useReviewsByProduct(
  productId: string,
  options?: { status?: string },
) {
  return useQuery<(ProductReview & { userId?: string })[]>({
    queryKey: queryKeys.productReviews.byProduct(productId, options?.status),
    queryFn: async () => [],
    enabled: !!productId,
  });
}

export function useReviewEligibility(productId: string, orderId?: string) {
  return useQuery<{ eligible: boolean; slots?: ReviewEligibilitySlot[] } | null>({
    queryKey: queryKeys.productReviews.eligibility(productId, orderId),
    queryFn: async () => null,
    enabled: !!productId,
  });
}

export function useDeleteProductReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_id: string) => {},
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.productReviews.all,
      });
    },
  });
}
