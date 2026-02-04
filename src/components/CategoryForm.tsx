/**
 * CategoryForm Component
 * Renders a Category with all its fields, description, and help text
 * 
 * Requirements: 8.1
 * 
 * Features:
 * - Display category name and description
 * - Render all items using ItemForm or RepeatableItemList
 * - Handle data changes and propagate via onChange
 * - Accessible and styled with Tailwind CSS
 */

import React, { useCallback, useId } from 'react';
import type { Category, ItemDefinition } from '../types/checklist-structure';
import type { CategoryData, ItemValue } from '../types/checklist-data';
import { ItemForm } from './ItemForm';
import { RepeatableItemList } from './RepeatableItemList';

/**
 * CategoryForm component props
 */
export interface CategoryFormProps {
  /** Category definition containing all field configurations */
  category: Category;
  /** Current data for the category */
  data: CategoryData;
  /** Callback when data changes */
  onChange: (data: CategoryData) => void;
  /** Optional description override */
  description?: string;
  /** Custom class name */
  className?: string;
  /** Whether the form is disabled */
  disabled?: boolean;
}

/**
 * Info icon for description/help text
 */
const InfoIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    className={`w-5 h-5 ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

/**
 * Get the value for an item from category data
 */
const getItemValue = (
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

/**
 * CategoryForm component
 * Renders a complete category form with all its items
 */
export const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  data,
  onChange,
  description: descriptionOverride,
  className = '',
  disabled = false,
}) => {
  // Generate unique ID for accessibility
  const uniqueId = useId();
  const categoryId = `category-${category.id}-${uniqueId}`;
  const descriptionId = `description-${category.id}-${uniqueId}`;

  // Use override description or category description
  const displayDescription = descriptionOverride ?? category.description;

  // Handle item value change
  const handleItemChange = useCallback(
    (itemId: string, newValue: ItemValue | ItemValue[]) => {
      const newData: CategoryData = {
        ...data,
        items: {
          ...data.items,
          [itemId]: newValue,
        },
      };
      onChange(newData);
    },
    [data, onChange]
  );

  // Render a single item (either ItemForm or RepeatableItemList)
  const renderItem = (item: ItemDefinition) => {
    const isRepeatable = item.repeatable ?? false;
    const value = getItemValue(data, item.id, isRepeatable);

    if (isRepeatable) {
      // Render repeatable item list
      return (
        <RepeatableItemList
          key={item.id}
          item={item}
          values={value as ItemValue[]}
          onChange={(newValues) => handleItemChange(item.id, newValues)}
          disabled={disabled}
          className="mb-4"
        />
      );
    }

    // Render single item form
    return (
      <ItemForm
        key={item.id}
        item={item}
        value={value as ItemValue}
        onChange={(newValue) => handleItemChange(item.id, newValue)}
        disabled={disabled}
        className="mb-4"
      />
    );
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}
      data-testid="category-form"
      data-category-id={category.id}
      role="region"
      aria-labelledby={categoryId}
    >
      {/* Category Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <h2
          id={categoryId}
          className="text-lg font-semibold text-gray-900"
          data-testid="category-name"
        >
          {category.name}
        </h2>
        
        {/* Description - Validates: Requirements 8.1 */}
        {displayDescription && (
          <div
            id={descriptionId}
            className="mt-2 flex items-start gap-2 text-sm text-gray-600"
            data-testid="category-description"
          >
            <InfoIcon className="flex-shrink-0 text-blue-500 mt-0.5" />
            <p>{displayDescription}</p>
          </div>
        )}
        
        {/* Help Text */}
        {category.helpText && (
          <p
            className="mt-2 text-xs text-gray-500 italic"
            data-testid="category-help-text"
          >
            💡 {category.helpText}
          </p>
        )}
      </div>

      {/* Category Items */}
      <div
        className="p-6 space-y-6"
        data-testid="category-items"
        aria-describedby={displayDescription ? descriptionId : undefined}
      >
        {category.items.length === 0 ? (
          <p
            className="text-center text-gray-500 py-4"
            data-testid="category-empty"
          >
            此分类暂无可填写的项目
          </p>
        ) : (
          category.items.map(renderItem)
        )}
      </div>
    </div>
  );
};

export default CategoryForm;
