import { getSession } from "@/lib/auth-server";
import { getProductsForUser } from "@/lib/server/home-data";
import ProductsPage from "@/components/Pages/ProductsPage";

export default async function AdminProductsPage() {
  const user = await getSession();
  if (!user) return null;
  const initialProducts = await getProductsForUser(user.uid);
  return <ProductsPage initialProducts={initialProducts} />;
}
