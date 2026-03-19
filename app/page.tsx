import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";

/**
 * Root route — redirect to /admin if logged in, otherwise to /login.
 */
export default async function HomeRoute() {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }
  redirect("/admin");
}
