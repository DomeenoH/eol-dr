/**
 * Platform Types
 * Types for visual form design with platform-specific styling
 */

/**
 * Supported platform types for visual form cards
 */
export type PlatformType =
  | 'imessage'
  | 'whatsapp'
  | 'facebook'
  | 'skype'
  | 'discord'
  | 'google'
  | 'instagram'
  | 'twitter'
  | 'github'
  | 'linkedin'
  | 'email'
  | 'bank'
  | 'paypal'
  | 'crypto'
  | 'other';

/**
 * Platform branding configuration
 */
export interface PlatformBrand {
  /** Display name */
  name: string;
  /** Primary brand color (hex) */
  primaryColor: string;
  /** Background color (hex) */
  backgroundColor: string;
  /** Text color (hex) */
  textColor: string;
}

/**
 * Device types for hardware cards
 */
export type DeviceType = 'server' | 'computer' | 'phone' | 'network' | 'iot';

/**
 * Subscription action types
 */
export type SubscriptionAction = 'keep' | 'cancel' | 'transfer';

/**
 * Bank account types
 */
export type BankAccountType = 'checking' | 'savings' | 'both';

/**
 * Data for a subscription service
 */
export interface SubscriptionData {
  /** Service name */
  service: string;
  /** Service icon URL (optional) */
  icon?: string;
  /** Action to take */
  action: SubscriptionAction;
  /** Person to transfer to (if action is 'transfer') */
  transferTo?: string;
  /** Additional notes */
  notes?: string;
}

/**
 * Data for a device/hardware item
 */
export interface DeviceData {
  /** Device type */
  type: DeviceType;
  /** Device name/description */
  name: string;
  /** Person who will inherit the device */
  inheritor?: string;
  /** Whether the device needs to be formatted before transfer */
  needsFormatting?: boolean;
  /** Special instructions */
  specialInstructions?: string;
}

/**
 * Data for a bank account
 */
export interface BankAccountData {
  /** Bank name */
  bankName: string;
  /** Account type */
  accountType: BankAccountType;
  /** PIN code (sensitive) */
  pin?: string;
  /** Purpose/description */
  purpose?: string;
}

/**
 * Data for a contact
 */
export interface ContactData {
  /** Contact platform */
  platform: PlatformType;
  /** Contact name */
  name: string;
  /** Contact details (phone, email, username, etc.) */
  contactInfo?: string;
  /** Additional notes */
  notes?: string;
  /** Order in notification list */
  order?: number;
}
