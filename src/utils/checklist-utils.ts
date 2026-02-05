import type { ItemDefinition } from '../types/checklist-structure';
import type { ItemValue, CategoryData } from '../types/checklist-data';

/**
 * Get default value for an item based on its type
 */
export const getDefaultValue = (item: ItemDefinition): ItemValue => {
  switch (item.type) {
    case 'checkbox':
      return false;
    case 'number':
      return 0;
    case 'group':
      // For group types, create an object with default values for each field
      if (item.fields) {
        const groupValue: Record<string, ItemValue> = {};
        item.fields.forEach((field) => {
          groupValue[field.id] = getDefaultValue(field);
        });
        return groupValue;
      }
      return {};
    default:
      return '';
  }
};

/**
 * Get the value for an item from category data
 */
export const getItemValue = (
  data: CategoryData,
  itemId: string,
  isRepeatable: boolean
): ItemValue | ItemValue[] => {
  const value = data.items[itemId];
  
  if (isRepeatable) {
    // For repeatable items, ensure we return an array
    if (Array.isArray(value)) {
      return value;
    }
    // If no value exists, return empty array
    return [];
  }
  
  // For non-repeatable items, return the value or empty string
  return value ?? '';
};
