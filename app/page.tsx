import { redirect } from "next/navigation";

/**
 * Root route — always redirect to /admin.
 * Auth check is handled client-side by the admin layout.
 */
export default function HomeRoute() {
  redirect("/admin");
}
