import type { PlatformType } from '../types/platform';

/**
 * Get initials from a name
 */
export const getInitials = (name: string): string => {
  if (!name || name.trim() === '') return '?';
  
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

/**
 * Available platforms for contact selection
 */
export const contactPlatforms: PlatformType[] = [
  'imessage',
  'whatsapp',
  'facebook',
  'skype',
  'discord',
  'google',
  'instagram',
  'email',
  'other',
];
