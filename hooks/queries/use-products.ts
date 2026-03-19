import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys, invalidateAllRelatedQueries } from "@/lib/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Product, CreateProductInput, UpdateProductInput } from "@/types";

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

export function useProducts() {
  return useQuery<Product[]>({
    queryKey: queryKeys.products.lists(),
    queryFn: () => apiFetch("/products"),
  });
}

export function useProduct(productId: string) {
  return useQuery<Product>({
    queryKey: queryKeys.products.detail(productId),
    queryFn: () => apiFetch(`/products/${productId}`),
    enabled: !!productId,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: CreateProductInput) => apiFetch("/products", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: (p) => { invalidateAllRelatedQueries(qc); toast({ title: "Produkt skapad", description: `"${p.name}" har skapats` }); },
    onError: (e) => { toast({ title: "Fel", description: String(e), variant: "destructive" }); },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: UpdateProductInput) => apiFetch(`/products/${data.id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: (p) => { invalidateAllRelatedQueries(qc); toast({ title: "Produkt uppdaterad", description: `"${p.name}" har uppdaterats` }); },
    onError: (e) => { toast({ title: "Fel", description: String(e), variant: "destructive" }); },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/products/${id}`, { method: "DELETE" }),
    onSuccess: () => { invalidateAllRelatedQueries(qc); toast({ title: "Produkt raderad" }); },
    onError: (e) => { toast({ title: "Fel", description: String(e), variant: "destructive" }); },
  });
}
