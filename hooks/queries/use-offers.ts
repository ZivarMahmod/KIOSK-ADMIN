import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys, invalidateAllRelatedQueries } from "@/lib/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Offer, CreateOfferInput, UpdateOfferInput } from "@/types";

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

export function useOffers() {
  return useQuery<Offer[]>({
    queryKey: queryKeys.offers.lists(),
    queryFn: () => apiFetch("/offers"),
  });
}

export function useCreateOffer() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: CreateOfferInput) => apiFetch("/offers", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: (d) => { invalidateAllRelatedQueries(qc); toast({ title: "Erbjudande skapat", description: `"${d.title}" har skapats` }); },
    onError: (e) => { toast({ title: "Fel", description: String(e), variant: "destructive" }); },
  });
}

export function useUpdateOffer() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: UpdateOfferInput) => apiFetch(`/offers/${data.id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { invalidateAllRelatedQueries(qc); toast({ title: "Erbjudande uppdaterat" }); },
    onError: (e) => { toast({ title: "Fel", description: String(e), variant: "destructive" }); },
  });
}

export function useDeleteOffer() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/offers/${id}`, { method: "DELETE" }),
    onSuccess: () => { invalidateAllRelatedQueries(qc); toast({ title: "Erbjudande raderat" }); },
    onError: (e) => { toast({ title: "Fel", description: String(e), variant: "destructive" }); },
  });
}
