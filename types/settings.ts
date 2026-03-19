export interface KioskSettings {
  id: string;
  // Existing
  swishNumber: string;
  bubbleText1: string;
  bubbleText2: string;
  bubbleVisible: boolean;
  selectButtonVisible: boolean;
  userId: string;
  // NEW: Store info
  storeName: string;
  storeSubtitle: string;
  // NEW: Kiosk display
  screensaverEnabled: boolean;
  screensaverText: string;
  screensaverDelay: number; // seconds before screensaver
  // NEW: Receipt settings
  receiptPrefix: string; // e.g. "ZH" for ZH-2024-0001
  // NEW: Theme colors (kiosk reads these)
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  // NEW: Feature toggles
  offersEnabled: boolean;
  wishesEnabled: boolean;
  // NEW: Kiosk mode
  kioskLocked: boolean; // lock kiosk in fullscreen mode
}

export interface UpdateSettingsInput {
  swishNumber?: string;
  bubbleText1?: string;
  bubbleText2?: string;
  bubbleVisible?: boolean;
  selectButtonVisible?: boolean;
  storeName?: string;
  storeSubtitle?: string;
  screensaverEnabled?: boolean;
  screensaverText?: string;
  screensaverDelay?: number;
  receiptPrefix?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  offersEnabled?: boolean;
  wishesEnabled?: boolean;
  kioskLocked?: boolean;
}
