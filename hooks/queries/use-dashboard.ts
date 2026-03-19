import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query";
import { useAuth } from "@/contexts/auth-context";

async function apiFetch(url: string) {
  const { auth } = await import("@/lib/firebase");
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(`/api${url}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function useDashboard() {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.dashboard.overview(user?.id),
    queryFn: () => apiFetch("/dashboard"),
    enabled: !!user,
  });
}
