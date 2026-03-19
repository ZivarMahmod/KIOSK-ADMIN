import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import ProductsPage from "@/components/Pages/ProductsPage";
import {
  getProductsForUser,
  type ProductForHome,
} from "@/lib/server/home-data";

/**
 * Products route — server component.
 * If user is not logged in, redirect to login.
 */
export default async function ProductsRoute({
  searchParams,
}: {
  searchParams: Promise<{ ownerId?: string }>;
}) {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }
  const params = await searchParams;
  const initialOwnerId = params?.ownerId ?? "";
  const initialProducts: ProductForHome[] = await getProductsForUser(user.uid);
  return (
    <ProductsPage
      initialProducts={initialProducts}
      initialOwnerId={initialOwnerId}
    />
  );
}
