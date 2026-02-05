import type { PlatformType, PlatformBrand } from '../types/platform';

/**
 * Platform branding configuration
 */
export const platformBranding: Record<PlatformType, PlatformBrand> = {
  discord: {
    name: 'Discord',
    primaryColor: '#5865F2',
    backgroundColor: '#36393f',
    textColor: '#ffffff',
  },
  whatsapp: {
    name: 'WhatsApp',
    primaryColor: '#25D366',
    backgroundColor: '#ffffff',
    textColor: '#000000',
  },
  facebook: {
    name: 'Facebook',
    primaryColor: '#1877F2',
    backgroundColor: '#ffffff',
    textColor: '#000000',
  },
  imessage: {
    name: 'iMessage',
    primaryColor: '#34C759',
    backgroundColor: '#ffffff',
    textColor: '#000000',
  },
  skype: {
    name: 'Skype',
    primaryColor: '#00AFF0',
    backgroundColor: '#ffffff',
    textColor: '#000000',
  },
  google: {
    name: 'Google',
    primaryColor: '#4285F4',
    backgroundColor: '#ffffff',
    textColor: '#000000',
  },
  instagram: {
    name: 'Instagram',
    primaryColor: '#E4405F',
    backgroundColor: '#ffffff',
    textColor: '#000000',
  },
  twitter: {
    name: 'Twitter',
    primaryColor: '#1DA1F2',
    backgroundColor: '#ffffff',
    textColor: '#000000',
  },
  github: {
    name: 'GitHub',
    primaryColor: '#181717',
    backgroundColor: '#ffffff',
    textColor: '#000000',
  },
  linkedin: {
    name: 'LinkedIn',
    primaryColor: '#0A66C2',
    backgroundColor: '#ffffff',
    textColor: '#000000',
  },
  email: {
    name: 'Email',
    primaryColor: '#6B7280',
    backgroundColor: '#ffffff',
    textColor: '#000000',
  },
  bank: {
    name: 'Bank',
    primaryColor: '#059669',
    backgroundColor: '#ffffff',
    textColor: '#000000',
  },
  paypal: {
    name: 'PayPal',
    primaryColor: '#003087',
    backgroundColor: '#ffffff',
    textColor: '#000000',
  },
  crypto: {
    name: 'Crypto',
    primaryColor: '#F7931A',
    backgroundColor: '#ffffff',
    textColor: '#000000',
  },
  other: {
    name: 'Other',
    primaryColor: '#6B7280',
    backgroundColor: '#ffffff',
    textColor: '#000000',
  },
};
