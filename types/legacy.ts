/**
 * Legacy type stubs
 * These types existed in the Stockly codebase and are referenced by
 * remaining components / API client code. They are defined as minimal
 * interfaces so the build compiles. Replace with real types as features
 * are re-implemented for the kiosk admin.
 */

// --- Supplier ---
export interface Supplier {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  status: boolean;
  userId: string;
  createdAt: string;
  updatedAt?: string | null;
  [key: string]: unknown;
}
export interface CreateSupplierInput {
  name: string;
  [key: string]: unknown;
}
export interface UpdateSupplierInput {
  name?: string;
  [key: string]: unknown;
}

// --- Auth extras ---
export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  [key: string]: unknown;
}
export interface LoginResponse {
  token: string;
  user: { id: string; email: string; name?: string };
  [key: string]: unknown;
}
export interface EmailPreferences {
  lowStockAlerts: boolean;
  stockOutNotifications: boolean;
  inventoryReports: boolean;
  productExpirationWarnings: boolean;
  orderConfirmations: boolean;
  invoiceEmails: boolean;
  shippingNotifications: boolean;
  orderStatusUpdates: boolean;
  [key: string]: boolean;
}
export type EmailNotificationType = keyof EmailPreferences;
export const DEFAULT_EMAIL_PREFERENCES: EmailPreferences = {
  lowStockAlerts: true,
  stockOutNotifications: true,
  inventoryReports: true,
  productExpirationWarnings: true,
  orderConfirmations: true,
  invoiceEmails: true,
  shippingNotifications: true,
  orderStatusUpdates: true,
};
export interface UpdateEmailPreferencesInput {
  preferences: Partial<EmailPreferences>;
}

// --- Order ---
export interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  paymentStatus?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}
export interface CreateOrderInput {
  [key: string]: unknown;
}
export interface UpdateOrderInput {
  [key: string]: unknown;
}

// --- Notification ---
export type NotificationType =
  | "info"
  | "warning"
  | "error"
  | "success"
  | "order"
  | "invoice"
  | "stock"
  | "system"
  | "low_stock"
  | "stock_out"
  | "order_confirmation"
  | "order_status_update"
  | "client_order_received"
  | "product_review_submitted"
  | "shipping_notification"
  | "invoice_ready"
  | "invoice_sent"
  | "support_ticket_created"
  | "support_ticket_replied"
  | "import_complete"
  | (string & {});

export interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  read?: boolean;
  type: NotificationType | string;
  createdAt: string;
  linkUrl?: string;
  link?: string;
}
export interface UpdateNotificationInput {
  id: string;
  isRead?: boolean;
  read?: boolean;
}
export interface NotificationFilters {
  limit?: number;
  offset?: number;
  isRead?: boolean;
  read?: boolean;
  type?: string[];
}

// --- Invoice ---
export interface Invoice {
  id: string;
  invoiceNumber: string;
  total: number;
  status: string;
  [key: string]: unknown;
}
export interface CreateInvoiceInput {
  [key: string]: unknown;
}
export interface UpdateInvoiceInput {
  [key: string]: unknown;
}
export interface InvoiceFilters {
  searchTerm?: string;
  status?: string[];
  orderId?: string;
  clientId?: string;
  startDate?: string;
  endDate?: string;
  dueDateStart?: string;
  dueDateEnd?: string;
}

// --- Import History ---
export interface ImportHistoryForPage {
  id: string;
  importType: string;
  fileName: string;
  status: string;
  successRows: number;
  failedRows: number;
  createdAt: string;
  [key: string]: unknown;
}

// --- Support Tickets ---
export interface SupportTicket {
  id: string;
  subject: string;
  status: string;
  [key: string]: unknown;
}
export interface SupportTicketReply {
  id: string;
  ticketId: string;
  message: string;
  [key: string]: unknown;
}
export interface CreateSupportTicketInput {
  [key: string]: unknown;
}
export interface CreateSupportTicketReplyInput {
  [key: string]: unknown;
}
export interface UpdateSupportTicketInput {
  [key: string]: unknown;
}

// --- Product Reviews ---
export interface ProductReview {
  id: string;
  productId: string;
  productName: string;
  rating: number;
  status: string;
  [key: string]: unknown;
}
export interface CreateProductReviewInput {
  [key: string]: unknown;
}
export interface UpdateProductReviewInput {
  [key: string]: unknown;
}
export interface ReviewEligibilitySlot {
  orderId: string;
  canReview: boolean;
  existingReviewId?: string;
  [key: string]: unknown;
}

// --- User Management ---
export interface UserForAdmin {
  id: string;
  email: string;
  name?: string;
  role?: string;
  [key: string]: unknown;
}
export interface UpdateUserAdminInput {
  [key: string]: unknown;
}
export interface CreateUserAdminInput {
  [key: string]: unknown;
}

// --- Portal ---
export interface ClientPortalStats {
  [key: string]: unknown;
}
export interface SupplierPortalStats {
  [key: string]: unknown;
}
export interface ForecastingSummary {
  [key: string]: unknown;
}
export interface SupplierPortalDashboard {
  [key: string]: unknown;
}
export interface ClientPortalDashboard {
  [key: string]: unknown;
}
export interface ClientCatalogOverview {
  [key: string]: unknown;
}
export interface ClientBrowseMeta {
  [key: string]: unknown;
}
export interface ClientBrowseProductsResponse {
  [key: string]: unknown;
}

// --- Payments ---
export interface CreateCheckoutInput {
  [key: string]: unknown;
}
export interface CheckoutSessionResponse {
  [key: string]: unknown;
}

// --- Shipping ---
export interface GenerateLabelInput {
  [key: string]: unknown;
}
export interface GenerateLabelResponse {
  [key: string]: unknown;
}
export interface AddTrackingInput {
  [key: string]: unknown;
}
export interface GetRatesInput {
  [key: string]: unknown;
}
export interface GetRatesResponse {
  [key: string]: unknown;
}

// --- System Config ---
export interface SystemConfig {
  [key: string]: unknown;
}
export interface UpdateSystemConfigInput {
  [key: string]: unknown;
}

// --- Audit Logs ---
export interface AuditLog {
  id: string;
  action: string;
  createdAt: string;
  [key: string]: unknown;
}
export interface AuditLogFilters {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  period?: string;
}

// --- Admin ---
export interface AdminCounts {
  [key: string]: number;
}
