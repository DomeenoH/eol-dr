/**
 * Form Input Utilities
 * Helper functions for form input handling
 */

import type { ItemType } from '../types/checklist-structure';

/**
 * Maps ItemType to HTML5 input type
 * Validates: Requirements 8.4
 */
export const getInputType = (
  itemType: ItemType,
  sensitive: boolean,
  isVisible: boolean
): string => {
  // Sensitive fields use password type when hidden
  // Validates: Requirements 6.2
  if (sensitive && !isVisible) {
    return 'password';
  }

  // Map item types to HTML5 input types
  // Validates: Requirements 8.4
  switch (itemType) {
    case 'email':
      return 'email';
    case 'tel':
      return 'tel';
    case 'url':
      return 'url';
    case 'number':
      return 'number';
    case 'date':
      return 'date';
    case 'password':
      return isVisible ? 'text' : 'password';
    case 'text':
    default:
      return 'text';
  }
};

/**
 * Get icon for field type
 */
export const getFieldIcon = (type: ItemType, sensitive: boolean): string => {
  if (sensitive) return '🔒';
  switch (type) {
    case 'email':
      return '📧';
    case 'tel':
      return '📞';
    case 'url':
      return '🔗';
    case 'password':
      return '🔒';
    case 'textarea':
      return '📝';
    case 'number':
      return '🔢';
    case 'date':
      return '📅';
    default:
      return '📋';
  }
};
