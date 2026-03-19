import { getSession } from "@/lib/auth-server";
import { getWarehousesForUser } from "@/lib/server/warehouses-data";
import WarehousesPage from "@/components/Pages/WarehousesPage";

export default async function AdminWarehousesPage() {
  const user = await getSession();
  if (!user) return null;
  const initialWarehouses = await getWarehousesForUser(user.uid);
  return <WarehousesPage initialWarehouses={initialWarehouses} />;
}
