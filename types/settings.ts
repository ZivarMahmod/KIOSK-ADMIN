export interface OpeningHours {
  from: string; // "HH:mm"
  to: string;   // "HH:mm"
  closed: boolean;
}

export interface KioskSettings {
  id: string;
  userId: string;

  // Butiksinformation
  storeName: string;
  storeSubtitle: string;
  companyAddress: string;
  orgNumber: string;       // organisationsnummer
  vatNumber: string;       // momsregistreringsnummer
  logoUrl: string;

  // Betalning
  swishNumber: string;
  paymentSwish: boolean;
  paymentCard: boolean;
  paymentCash: boolean;
  paymentQR: boolean;
  receiptPrefix: string;

  // Utseende / Tema
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  buttonRadius: number;      // 0-20px
  fontFamily: string;
  productCardStyle: string;  // "style1" | "style2" | "style3"
  productsPerRow: number;    // 2 | 3 | 4
  themeMode: string;         // "light" | "dark" | "auto"
  animationsEnabled: boolean;

  // Kiosk-display
  welcomeText: string;
  screensaverEnabled: boolean;
  screensaverDelay: number;  // minutes
  screensaverText: string;
  bubbleText1: string;
  bubbleText2: string;
  bubbleVisible: boolean;
  selectButtonVisible: boolean;

  // Drift
  openingHours: Record<string, OpeningHours>; // mon..sun
  autoRestartTime: string;   // "HH:mm"
  ordersPaused: boolean;
  pauseMessage: string;
  emergencyMessage: string;

  // Ljud & Tillganglighet
  soundEffects: boolean;
  soundVolume: number;       // 0-100
  largeTextMode: boolean;
  highContrast: boolean;

  // Funktioner
  offersEnabled: boolean;
  wishesEnabled: boolean;
  kioskLocked: boolean;
  tippingEnabled: boolean;
  tipAmount1: number;
  tipAmount2: number;
  tipAmount3: number;
  orderQueueEnabled: boolean;
  orderQueueFormat: string;

  // Kvittodesign
  receiptLogoUrl: string;
  receiptThankYou: string;
  receiptFooter: string;
  receiptShowOrderNumber: boolean;
  receiptShowDateTime: boolean;
  receiptShowVat: boolean;
  receiptFontSize: number;     // 8-16
  receiptPaperWidth: string;   // "58mm" | "80mm"

  // Sakerhet
  kioskPassword: string;
  sessionTimeout: number;      // 5-120 min
}

export interface UpdateSettingsInput {
  // Butiksinformation
  storeName?: string;
  storeSubtitle?: string;
  companyAddress?: string;
  orgNumber?: string;
  vatNumber?: string;
  logoUrl?: string;

  // Betalning
  swishNumber?: string;
  paymentSwish?: boolean;
  paymentCard?: boolean;
  paymentCash?: boolean;
  paymentQR?: boolean;
  receiptPrefix?: string;

  // Utseende / Tema
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonRadius?: number;
  fontFamily?: string;
  productCardStyle?: string;
  productsPerRow?: number;
  themeMode?: string;
  animationsEnabled?: boolean;

  // Kiosk-display
  welcomeText?: string;
  screensaverEnabled?: boolean;
  screensaverDelay?: number;
  screensaverText?: string;
  bubbleText1?: string;
  bubbleText2?: string;
  bubbleVisible?: boolean;
  selectButtonVisible?: boolean;

  // Drift
  openingHours?: Record<string, OpeningHours>;
  autoRestartTime?: string;
  ordersPaused?: boolean;
  pauseMessage?: string;
  emergencyMessage?: string;

  // Ljud & Tillganglighet
  soundEffects?: boolean;
  soundVolume?: number;
  largeTextMode?: boolean;
  highContrast?: boolean;

  // Funktioner
  offersEnabled?: boolean;
  wishesEnabled?: boolean;
  kioskLocked?: boolean;
  tippingEnabled?: boolean;
  tipAmount1?: number;
  tipAmount2?: number;
  tipAmount3?: number;
  orderQueueEnabled?: boolean;
  orderQueueFormat?: string;

  // Kvittodesign
  receiptLogoUrl?: string;
  receiptThankYou?: string;
  receiptFooter?: string;
  receiptShowOrderNumber?: boolean;
  receiptShowDateTime?: boolean;
  receiptShowVat?: boolean;
  receiptFontSize?: number;
  receiptPaperWidth?: string;

  // Sakerhet
  kioskPassword?: string;
  sessionTimeout?: number;
}
