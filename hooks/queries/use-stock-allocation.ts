import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys, invalidateAllRelatedQueries } from "@/lib/react-query";
import { useToast } from "@/hooks/use-toast";
import type { StockAllocation, CreateStockAllocationInput, WarehouseStockSummary } from "@/types";

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

export function useStockAllocations() {
  return useQuery<StockAllocation[]>({
    queryKey: queryKeys.stockAllocation.lists(),
    queryFn: () => apiFetch("/stock-allocations"),
  });
}

export function useWarehouseStockSummary() {
  return useQuery<WarehouseStockSummary[]>({
    queryKey: queryKeys.stockAllocation.summary(),
    queryFn: () => apiFetch("/stock-allocations?summary=true"),
  });
}

export function useStockByWarehouse(warehouseId: string) {
  return useQuery<StockAllocation[]>({
    queryKey: queryKeys.stockAllocation.byWarehouse(warehouseId),
    queryFn: () => apiFetch(`/stock-allocations?warehouseId=${warehouseId}`),
    enabled: !!warehouseId,
  });
}

export function useCreateStockAllocation() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: CreateStockAllocationInput) => apiFetch("/stock-allocations", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { invalidateAllRelatedQueries(qc); toast({ title: "Lagerallokering skapad" }); },
    onError: (e) => { toast({ title: "Fel", description: String(e), variant: "destructive" }); },
  });
}

export function useAdjustStock() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: { productId: string; warehouseId: string; quantityChange: number; reason: string; notes?: string }) =>
      apiFetch("/stock-allocations", { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => { invalidateAllRelatedQueries(qc); toast({ title: "Lagerjustering sparad" }); },
    onError: (e) => { toast({ title: "Fel", description: String(e), variant: "destructive" }); },
  });
}

export function useTransferStock() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: { productId: string; fromWarehouseId: string; toWarehouseId: string; quantity: number }) =>
      apiFetch("/stock-allocations", { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { invalidateAllRelatedQueries(qc); toast({ title: "Lagerflytt genomford" }); },
    onError: (e) => { toast({ title: "Fel", description: String(e), variant: "destructive" }); },
  });
}

export interface StockAdjustmentLog {
  id: string;
  productId: string;
  warehouseId: string;
  oldQuantity: number;
  newQuantity: number;
  quantityChange: number;
  reason: string;
  notes: string | null;
  userId: string;
  createdAt: string;
}

export function useStockAdjustmentLog() {
  return useQuery<StockAdjustmentLog[]>({
    queryKey: [...queryKeys.stockAllocation.all, "adjustments"],
    queryFn: () => apiFetch("/stock-allocations?adjustments=true"),
  });
}
