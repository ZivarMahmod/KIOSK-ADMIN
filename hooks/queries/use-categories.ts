import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys, invalidateAllRelatedQueries } from "@/lib/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Category, CreateCategoryInput, UpdateCategoryInput } from "@/types";

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

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: queryKeys.categories.lists(),
    queryFn: () => apiFetch("/categories"),
  });
}

export function useCategory(categoryId: string) {
  return useQuery<Category>({
    queryKey: queryKeys.categories.detail(categoryId),
    queryFn: () => apiFetch(`/categories/${categoryId}`),
    enabled: !!categoryId,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: CreateCategoryInput) => apiFetch("/categories", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: (newCat) => { invalidateAllRelatedQueries(qc); toast({ title: "Kategori skapad", description: `"${newCat.name}" har skapats` }); },
    onError: (e) => { toast({ title: "Fel", description: String(e), variant: "destructive" }); },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: UpdateCategoryInput) => apiFetch(`/categories/${data.id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: (updated) => { invalidateAllRelatedQueries(qc); toast({ title: "Kategori uppdaterad", description: `"${updated.name}" har uppdaterats` }); },
    onError: (e) => { toast({ title: "Fel", description: String(e), variant: "destructive" }); },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/categories/${id}`, { method: "DELETE" }),
    onSuccess: () => { invalidateAllRelatedQueries(qc); toast({ title: "Kategori raderad" }); },
    onError: (e) => { toast({ title: "Fel", description: String(e), variant: "destructive" }); },
  });
}
