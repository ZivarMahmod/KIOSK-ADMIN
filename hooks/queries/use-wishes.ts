import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys, invalidateAllRelatedQueries } from "@/lib/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Wish } from "@/types";

async function apiFetch(url: string, options?: RequestInit) {
  const { auth } = await import("@/lib/firebase");
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(`/api${url}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options?.headers },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function useWishes() {
  return useQuery<Wish[]>({
    queryKey: queryKeys.wishes.lists(),
    queryFn: () => apiFetch("/wishes"),
  });
}

export function useClearWishes() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: () => apiFetch("/wishes", { method: "DELETE" }),
    onSuccess: (d) => { invalidateAllRelatedQueries(qc); toast({ title: "Önskningar rensade", description: `${d.deletedCount} önskningar togs bort` }); },
    onError: (e) => { toast({ title: "Fel", description: String(e), variant: "destructive" }); },
  });
}
