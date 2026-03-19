/**
 * Query hooks exports
 */

export { useProducts, useProduct, useCreateProduct, useUpdateProduct, useDeleteProduct } from "./use-products";
export { useCategories, useCategory, useCreateCategory, useUpdateCategory, useDeleteCategory } from "./use-categories";
export { useSuppliers, useSupplier } from "./use-suppliers";
export { useOrders } from "./use-orders";
export { useWarehouses, useWarehouse, useCreateWarehouse, useUpdateWarehouse, useDeleteWarehouse } from "./use-warehouses";
export { useNotifications, useUnreadNotificationCount, useUpdateNotification, useMarkAllNotificationsAsRead, useDeleteNotification } from "./use-notifications";
export { useReviewsByProduct, useReviewEligibility, useDeleteProductReview } from "./use-product-reviews";
export { useStockAllocations, useWarehouseStockSummary, useStockByWarehouse, useCreateStockAllocation } from "./use-stock-allocation";
export { useDashboard } from "./use-dashboard";
export { useSupplierPortalDashboard, useClientBrowseMeta, useClientBrowseProducts } from "./use-portal";
export { useSession, useLogin, useRegister, useLogout } from "./use-auth";

// New kiosk-specific hooks
export { useReceipts, useUpdateReceipt, useDeleteReceipt } from "./use-receipts";
export { useOffers, useCreateOffer, useUpdateOffer, useDeleteOffer } from "./use-offers";
export { useWishes, useClearWishes } from "./use-wishes";
export { useSettings, useUpdateSettings } from "./use-settings";
export { useTags, useCreateTag, useDeleteTag } from "./use-tags";
