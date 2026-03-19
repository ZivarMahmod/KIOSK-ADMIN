/**
 * Query hooks exports
 * Centralized export point for all TanStack Query hooks
 */

// Product hooks
export {
  useProducts,
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "./use-products";

// Category hooks
export {
  useCategories,
  useCategory,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "./use-categories";

// Supplier hooks
export { useSuppliers, useSupplier } from "./use-suppliers";

// Order hooks
export { useOrders } from "./use-orders";

// Warehouse hooks
export {
  useWarehouses,
  useWarehouse,
  useCreateWarehouse,
  useUpdateWarehouse,
  useDeleteWarehouse,
} from "./use-warehouses";

// Notification hooks
export {
  useNotifications,
  useUnreadNotificationCount,
  useUpdateNotification,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from "./use-notifications";

// Product Review hooks
export {
  useReviewsByProduct,
  useReviewEligibility,
  useDeleteProductReview,
} from "./use-product-reviews";

// Stock Allocation hooks
export {
  useStockAllocations,
  useWarehouseStockSummary,
  useStockByWarehouse,
  useCreateStockAllocation,
} from "./use-stock-allocation";

// Dashboard (admin overview) hooks
export { useDashboard } from "./use-dashboard";

// Portal hooks
export {
  useSupplierPortalDashboard,
  useClientBrowseMeta,
  useClientBrowseProducts,
} from "./use-portal";

// Auth hooks
export { useSession, useLogin, useRegister, useLogout } from "./use-auth";
