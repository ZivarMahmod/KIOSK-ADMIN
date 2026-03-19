import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys, invalidateAllRelatedQueries } from "@/lib/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Receipt, UpdateReceiptInput } from "@/types";

async function apiFetch(url: string, options?: RequestInit) {
  const { getAuth } = await import("firebase/auth");
  const auth = getAuth();
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(`/api${url}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options?.headers },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function useReceipts() {
  return useQuery<Receipt[]>({
    queryKey: queryKeys.receipts.lists(),
    queryFn: () => apiFetch("/receipts"),
  });
}

export function useUpdateReceipt() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: UpdateReceiptInput) => {
      return apiFetch(`/receipts/${data.id}`, { method: "PATCH", body: JSON.stringify(data) });
    },
    onSuccess: () => { invalidateAllRelatedQueries(qc); toast({ title: "Kvitto uppdaterat" }); },
    onError: (e) => { toast({ title: "Fel", description: String(e), variant: "destructive" }); },
  });
}

export function useDeleteReceipt() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      return apiFetch(`/receipts/${id}`, { method: "DELETE" });
    },
    onSuccess: () => { invalidateAllRelatedQueries(qc); toast({ title: "Kvitto raderat" }); },
    onError: (e) => { toast({ title: "Fel", description: String(e), variant: "destructive" }); },
  });
}
