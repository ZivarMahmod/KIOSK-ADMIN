import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query";
import { useToast } from "@/hooks/use-toast";

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

export function useSession() {
  return useQuery({
    queryKey: queryKeys.auth.session(),
    queryFn: () => apiFetch("/auth/session"),
    retry: false,
  });
}

export function useLogin() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase");
      const credential = await signInWithEmailAndPassword(auth, data.email, data.password);
      return { uid: credential.user.uid, email: credential.user.email };
    },
    onError: (e) => { toast({ title: "Inloggning misslyckades", description: String(e), variant: "destructive" }); },
  });
}

export function useRegister() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (_data: { email: string; password: string; name: string }) => {
      throw new Error("Registration disabled");
    },
    onError: (e) => { toast({ title: "Fel", description: String(e), variant: "destructive" }); },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async () => {
      const { signOut } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase");
      await signOut(auth);
    },
    onSuccess: () => { qc.clear(); toast({ title: "Utloggad" }); },
    onError: (e) => { toast({ title: "Fel", description: String(e), variant: "destructive" }); },
  });
}
