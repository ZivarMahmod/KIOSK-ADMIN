/**
 * Dashboard type definitions
 * Used by the admin dashboard overview.
 */

export interface DashboardCounts {
  products: number;
  users: number;
  suppliers: number;
  categories: number;
  orders: number;
  invoices: number;
  warehouses: number;
  tickets: number;
  reviews: number;
}

export interface DashboardRevenue {
  fromOrders: number;
  fromInvoices: number;
}

export interface DashboardTrendPoint {
  month: string;
  label: string;
  orders: number;
  revenue: number;
  products: number;
  invoices: number;
}

export interface DashboardRecentOrder {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
}

export interface DashboardRecentTicket {
  id: string;
  subject: string;
  status: string;
  createdAt: string;
}

export interface DashboardRecentReview {
  id: string;
  productName: string;
  rating: number;
  status: string;
  createdAt: string;
}

export interface DashboardRecentImport {
  id: string;
  importType: string;
  fileName: string;
  status: string;
  successRows: number;
  failedRows: number;
  createdAt: string;
}

export interface DashboardRecent {
  orders: DashboardRecentOrder[];
  tickets: DashboardRecentTicket[];
  reviews: DashboardRecentReview[];
  imports: DashboardRecentImport[];
}

export interface DashboardOrderStatusDist {
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

export interface DashboardTopProduct {
  productId: string;
  productName: string;
  sku: string;
  orderCount: number;
  totalQuantity: number;
  totalRevenue: number;
}

export interface DashboardOrderAnalytics {
  statusDistribution: DashboardOrderStatusDist;
  topProducts: DashboardTopProduct[];
  averageOrderValue: number;
  totalRevenue: number;
  totalRevenueExcludingCancelled: number;
  pendingOrderAmount: number;
  paidOrderAmount: number;
  refundedAmount: number;
  refundedCount: number;
  cancelledOrderAmount: number;
}

export interface DashboardInvoiceStatusDist {
  draft: number;
  sent: number;
  paid: number;
  overdue: number;
  cancelled: number;
}

export interface DashboardInvoiceAnalytics {
  statusDistribution: DashboardInvoiceStatusDist;
  totalRevenue: number;
  totalExcludingCancelled: number;
  cancelledInvoiceSum: number;
  paidRevenue: number;
  outstandingAmount: number;
  overdueAmount: number;
  averageInvoiceValue: number;
  averageInvoiceValueExcludingCancelled: number;
}

export interface DashboardWarehouseAnalytics {
  totalWarehouses: number;
  activeWarehouses: number;
  inactiveWarehouses: number;
  typeDistribution: { type: string; count: number }[];
}

export interface DashboardProductStatusBreakdown {
  available: number;
  stockLow: number;
  stockOut: number;
}

export interface DashboardUserRoleBreakdown {
  admin: number;
  client: number;
  supplier: number;
}

export interface DashboardSupplierStatusBreakdown {
  active: number;
  inactive: number;
}

export interface DashboardCategoryStatusBreakdown {
  active: number;
  inactive: number;
}

export interface DashboardTicketStatusBreakdown {
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
}

export interface DashboardReviewStatusBreakdown {
  pending: number;
  approved: number;
  rejected: number;
}

export interface DashboardSelfOthersBreakdown {
  orderSelfCount: number;
  orderOthersCount: number;
  invoiceSelfCount: number;
  invoiceOthersCount: number;
  revenueSelf: number;
  revenueOthers: number;
}

export interface DashboardStats {
  totalProducts?: number;
  totalCategories?: number;
  totalWarehouses?: number;
  totalStock?: number;
  lowStockCount?: number;
  counts?: DashboardCounts;
  revenue?: DashboardRevenue;
  trends?: DashboardTrendPoint[];
  recent?: DashboardRecent;
  orderAnalytics?: DashboardOrderAnalytics;
  invoiceAnalytics?: DashboardInvoiceAnalytics;
  warehouseAnalytics?: DashboardWarehouseAnalytics;
  totalInventoryValue?: number;
  productStatusBreakdown?: DashboardProductStatusBreakdown;
  userRoleBreakdown?: DashboardUserRoleBreakdown;
  supplierStatusBreakdown?: DashboardSupplierStatusBreakdown;
  categoryStatusBreakdown?: DashboardCategoryStatusBreakdown;
  ticketStatusBreakdown?: DashboardTicketStatusBreakdown;
  reviewStatusBreakdown?: DashboardReviewStatusBreakdown;
  selfOthersBreakdown?: DashboardSelfOthersBreakdown;
}
