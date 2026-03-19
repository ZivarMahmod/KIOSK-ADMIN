import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys, invalidateAllRelatedQueries } from "@/lib/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Tag, CreateTagInput } from "@/types";

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

export function useTags() {
  return useQuery<Tag[]>({
    queryKey: queryKeys.tags.lists(),
    queryFn: () => apiFetch("/tags"),
  });
}

export function useCreateTag() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: CreateTagInput) => apiFetch("/tags", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: (d) => { invalidateAllRelatedQueries(qc); toast({ title: "Tagg skapad", description: `"${d.name}" har skapats` }); },
    onError: (e) => { toast({ title: "Fel", description: String(e), variant: "destructive" }); },
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => apiFetch("/tags", { method: "DELETE", body: JSON.stringify({ id }) }),
    onSuccess: () => { invalidateAllRelatedQueries(qc); toast({ title: "Tagg raderad" }); },
    onError: (e) => { toast({ title: "Fel", description: String(e), variant: "destructive" }); },
  });
}
