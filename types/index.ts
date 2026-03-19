/**
 * Centralized type exports
 */

export type {
  Product, ProductStatus, CreateProductInput, UpdateProductInput,
} from "./product";

export type {
  Category, CreateCategoryInput, UpdateCategoryInput,
} from "./category";

export type {
  Warehouse, CreateWarehouseInput, UpdateWarehouseInput,
} from "./warehouse";

export type { User, AuthContextType, LoginInput } from "./auth";

export type {
  DashboardStats, DashboardCounts,
} from "./dashboard";

export type {
  StockTransferStatus, StockAllocation, StockTransfer,
  CreateStockAllocationInput, UpdateStockAllocationInput,
  CreateStockTransferInput, WarehouseStockSummary,
} from "./stock-allocation";

export type {
  Receipt, ReceiptItem, CreateReceiptInput, UpdateReceiptInput,
} from "./receipt";

export type {
  Offer, OfferProduct, CreateOfferInput, UpdateOfferInput,
} from "./offer";

export type { Wish } from "./wish";

export type { KioskSettings, UpdateSettingsInput } from "./settings";

export type { Tag, CreateTagInput } from "./tag";

// Legacy types (still referenced by existing components)
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
