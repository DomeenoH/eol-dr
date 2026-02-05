/**
 * Utility functions and constants for SubscriptionCard
 */

import { SubscriptionAction } from '../types/platform';

/**
 * Action configuration for styling
 */
export const actionConfig: Record<SubscriptionAction, {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  hoverBgColor: string;
}> = {
  keep: {
    label: '保留',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-300',
    hoverBgColor: 'hover:bg-green-200',
  },
  cancel: {
    label: '取消',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-300',
    hoverBgColor: 'hover:bg-red-200',
  },
  transfer: {
    label: '转让',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-300',
    hoverBgColor: 'hover:bg-blue-200',
  },
};

/**
 * Common subscription services with their icons
 */
export const commonServices: { name: string; icon: string }[] = [
  { name: 'YouTube Premium', icon: '📺' },
  { name: 'Netflix', icon: '🎬' },
  { name: 'Spotify', icon: '🎵' },
  { name: 'Discord Nitro', icon: '💬' },
  { name: 'NordVPN', icon: '🔒' },
  { name: 'Hulu', icon: '📺' },
  { name: 'Disney+', icon: '🏰' },
  { name: 'Amazon Prime', icon: '📦' },
  { name: 'Apple Music', icon: '🎵' },
  { name: 'HBO Max', icon: '🎬' },
  { name: 'Adobe Creative Cloud', icon: '🎨' },
  { name: 'Microsoft 365', icon: '📊' },
  { name: 'Dropbox', icon: '📁' },
  { name: 'iCloud+', icon: '☁️' },
  { name: 'Google One', icon: '🔵' },
];

/**
 * Get icon for a service (from common services or default)
 */
export const getServiceIcon = (serviceName: string, customIcon?: string): string => {
  if (customIcon) return customIcon;
  const found = commonServices.find(
    (s) => s.name.toLowerCase() === serviceName.toLowerCase()
  );
  return found?.icon || '📱';
};
