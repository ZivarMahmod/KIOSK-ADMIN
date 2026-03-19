"use client";

import React from "react";

interface OrderDialogProps {
  children?: React.ReactNode;
  defaultOwnerId?: string;
}

/** Stub — order dialog removed during kiosk migration. */
export default function OrderDialog({ children }: OrderDialogProps) {
  return <>{children}</>;
}
