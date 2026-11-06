import { previewInventoryMode } from "../stock/inventory-mode";

/** Applies to application email and Web Push only, never Clerk OTP or inbound test mail. */
export const notificationsDisabled = previewInventoryMode;

export class NotificationDeliveryDisabledError extends Error {
  readonly code = "PREVIEW_NOTIFICATIONS_DISABLED";

  constructor() {
    super("Real email and push delivery is disabled in preview");
    this.name = "NotificationDeliveryDisabledError";
  }
}

/** Check at send time, including after a production provider client has been cached. */
export function assertNotificationDeliveryEnabled(): void {
  if (notificationsDisabled()) throw new NotificationDeliveryDisabledError();
}
