/**
 * Centralized type exports
 * Re-export all types from organized type files
 */

// Product types
export type {
  Product,
  ProductStatus,
  CreateProductInput,
  UpdateProductInput,
} from "./product";

// Category types
export type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./category";

// Warehouse types
export type {
  Warehouse,
  CreateWarehouseInput,
  UpdateWarehouseInput,
} from "./warehouse";

// Auth types
export type {
  User,
  AuthContextType,
  LoginInput,
} from "./auth";

// Dashboard types
export type {
  DashboardStats,
  DashboardCounts,
  DashboardRevenue,
  DashboardTrendPoint,
  DashboardRecent,
  DashboardRecentOrder,
  DashboardRecentTicket,
  DashboardRecentReview,
  DashboardRecentImport,
  DashboardOrderAnalytics,
  DashboardOrderStatusDist,
  DashboardTopProduct,
  DashboardInvoiceAnalytics,
  DashboardInvoiceStatusDist,
  DashboardWarehouseAnalytics,
  DashboardProductStatusBreakdown,
  DashboardUserRoleBreakdown,
  DashboardSupplierStatusBreakdown,
  DashboardCategoryStatusBreakdown,
  DashboardTicketStatusBreakdown,
  DashboardReviewStatusBreakdown,
  DashboardSelfOthersBreakdown,
} from "./dashboard";

// Stock Allocation types
export type {
  StockTransferStatus,
  StockAllocation,
  StockTransfer,
  CreateStockAllocationInput,
  UpdateStockAllocationInput,
  CreateStockTransferInput,
  WarehouseStockSummary,
} from "./stock-allocation";

// Legacy types (stubs from Stockly migration)
export type {
  Supplier,
  CreateSupplierInput,
  UpdateSupplierInput,
  RegisterInput,
  LoginResponse,
  EmailPreferences,
  UpdateEmailPreferencesInput,
  Order,
  CreateOrderInput,
  UpdateOrderInput,
  NotificationType,
  Notification,
  UpdateNotificationInput,
  NotificationFilters,
  Invoice,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  InvoiceFilters,
  ImportHistoryForPage,
  SupportTicket,
  SupportTicketReply,
  CreateSupportTicketInput,
  CreateSupportTicketReplyInput,
  UpdateSupportTicketInput,
  ProductReview,
  CreateProductReviewInput,
  UpdateProductReviewInput,
  ReviewEligibilitySlot,
  UserForAdmin,
  UpdateUserAdminInput,
  CreateUserAdminInput,
  ClientPortalStats,
  SupplierPortalStats,
  ForecastingSummary,
  SupplierPortalDashboard,
  ClientPortalDashboard,
  ClientCatalogOverview,
  ClientBrowseMeta,
  ClientBrowseProductsResponse,
  CreateCheckoutInput,
  CheckoutSessionResponse,
  GenerateLabelInput,
  GenerateLabelResponse,
  AddTrackingInput,
  GetRatesInput,
  GetRatesResponse,
  SystemConfig,
  UpdateSystemConfigInput,
  AuditLog,
  AuditLogFilters,
  AdminCounts,
} from "./legacy";
