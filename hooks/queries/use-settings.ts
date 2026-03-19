import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys, invalidateAllRelatedQueries } from "@/lib/react-query";
import { useToast } from "@/hooks/use-toast";
import type { KioskSettings, UpdateSettingsInput } from "@/types";

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

export function useSettings() {
  return useQuery<KioskSettings>({
    queryKey: queryKeys.settings.current(),
    queryFn: () => apiFetch("/settings"),
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: UpdateSettingsInput) => apiFetch("/settings", { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { invalidateAllRelatedQueries(qc); toast({ title: "Inställningar sparade" }); },
    onError: (e) => { toast({ title: "Fel", description: String(e), variant: "destructive" }); },
  });
}
