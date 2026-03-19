import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys, invalidateAllRelatedQueries } from "@/lib/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Warehouse, CreateWarehouseInput, UpdateWarehouseInput } from "@/types";

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

export function useWarehouses() {
  return useQuery<Warehouse[]>({
    queryKey: queryKeys.warehouses.lists(),
    queryFn: () => apiFetch("/warehouses"),
  });
}

export function useWarehouse(warehouseId: string) {
  return useQuery<Warehouse>({
    queryKey: queryKeys.warehouses.detail(warehouseId),
    queryFn: () => apiFetch(`/warehouses/${warehouseId}`),
    enabled: !!warehouseId,
  });
}

export function useCreateWarehouse() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: CreateWarehouseInput) => apiFetch("/warehouses", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: (w) => { invalidateAllRelatedQueries(qc); toast({ title: "Lagerplats skapad", description: `"${w.name}" har skapats` }); },
    onError: (e) => { toast({ title: "Fel", description: String(e), variant: "destructive" }); },
  });
}

export function useUpdateWarehouse() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: UpdateWarehouseInput) => apiFetch(`/warehouses/${data.id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: (w) => { invalidateAllRelatedQueries(qc); toast({ title: "Lagerplats uppdaterad", description: `"${w.name}" har uppdaterats` }); },
    onError: (e) => { toast({ title: "Fel", description: String(e), variant: "destructive" }); },
  });
}

export function useDeleteWarehouse() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/warehouses/${id}`, { method: "DELETE" }),
    onSuccess: () => { invalidateAllRelatedQueries(qc); toast({ title: "Lagerplats raderad" }); },
    onError: (e) => { toast({ title: "Fel", description: String(e), variant: "destructive" }); },
  });
}
