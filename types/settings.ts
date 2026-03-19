export interface KioskSettings {
  id: string;
  swishNumber: string;
  bubbleText1: string;
  bubbleText2: string;
  bubbleVisible: boolean;
  selectButtonVisible: boolean;
  userId: string;
}

export interface UpdateSettingsInput {
  swishNumber?: string;
  bubbleText1?: string;
  bubbleText2?: string;
  bubbleVisible?: boolean;
  selectButtonVisible?: boolean;
}
