/**
 * Email Preferences Utilities — stub.
 * Prisma removed; returns defaults until new data source is wired up.
 */

import type { EmailPreferences, EmailNotificationType } from "@/types/legacy";
import { DEFAULT_EMAIL_PREFERENCES } from "@/types/legacy";

export async function getUserEmailPreferences(
  _userId: string,
): Promise<EmailPreferences> {
  return DEFAULT_EMAIL_PREFERENCES;
}

export async function updateUserEmailPreferences(
  _userId: string,
  preferences: Partial<EmailPreferences>,
): Promise<EmailPreferences> {
  return { ...DEFAULT_EMAIL_PREFERENCES, ...preferences } as EmailPreferences;
}

export async function isEmailNotificationEnabled(
  _userId: string,
  _notificationType: EmailNotificationType,
): Promise<boolean> {
  return true;
}

export function mapNotificationTypeToPreference(
  notificationType: string,
): EmailNotificationType | null {
  const mapping: Record<string, EmailNotificationType> = {
    low_stock_alert: "lowStockAlerts",
    stock_out_notification: "stockOutNotifications",
    inventory_report: "inventoryReports",
    product_expiration_warning: "productExpirationWarnings",
    order_confirmation: "orderConfirmations",
    invoice_email: "invoiceEmails",
    shipping_notification: "shippingNotifications",
    order_status_update: "orderStatusUpdates",
  };
  return mapping[notificationType] || null;
}
