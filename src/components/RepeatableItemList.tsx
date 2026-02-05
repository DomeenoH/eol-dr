/**
 * RepeatableItemList Component
 * Generic component for managing repeatable items with dynamic add/delete functionality
 * 
 * Requirements: 8.3
 * 
 * Features:
 * - Render a list of ItemForm components for each value in the array
 * - Provide an "Add" button to add new items
 * - Provide delete functionality for each item
 * - Maintain data consistency when items are added/removed
 * - Accessible and styled with Tailwind CSS
 */

import React, { useCallback, useId } from 'react';
import type { ItemDefinition } from '../types/checklist-structure';
import type { ItemValue } from '../types/checklist-data';
import { ItemForm } from './ItemForm';

/**
 * RepeatableItemList component props
 */
export interface RepeatableItemListProps {
  /** Item definition containing field configuration */
  item: ItemDefinition;
  /** Array of values for the repeatable items */
  values: ItemValue[];
  /** Callback when values change */
  onChange: (values: ItemValue[]) => void;
  /** Custom class name */
  className?: string;
  /** Whether the list is disabled */
  disabled?: boolean;
  /** Minimum number of items required */
  minItems?: number;
  /** Maximum number of items allowed */
  maxItems?: number;
  /** Custom label for the add button */
  addButtonLabel?: string;
  /** Custom empty state message */
  emptyMessage?: string;
}

/**
 * Get default value for an item based on its type
 */
import { getDefaultValue } from '../utils/checklist-utils';

/**
 * Plus icon for add button
 */
const PlusIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
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
      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
    />
  </svg>
);

/**
 * Empty state component
 */
const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div
    className="text-center py-6 text-slate-400"
    data-testid="repeatable-empty-state"
  >
    <p className="text-sm text-[var(--text-muted)]">{message}</p>
  </div>
);

/**
 * Item wrapper component with index display
 */
const ItemWrapper: React.FC<{
  index: number;
  children: React.ReactNode;
  className?: string;
}> = ({ index, children, className = '' }) => (
  <div
    className={`relative p-4 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] shadow-sm ${className}`}
    data-testid="repeatable-item-wrapper"
    data-item-index={index}
  >
    {/* Index badge */}
    <div
      className="absolute -top-2 -left-2 w-6 h-6 flex items-center justify-center bg-blue-500 text-white text-xs font-semibold rounded-full shadow-lg"
      data-testid="repeatable-item-index"
      aria-label={`项目 ${index + 1}`}
    >
      {index + 1}
    </div>
    {children}
  </div>
);

/**
 * RepeatableItemList component
 * Manages a list of repeatable items with add/delete functionality
 */
export const RepeatableItemList: React.FC<RepeatableItemListProps> = ({
  item,
  values,
  onChange,
  className = '',
  disabled = false,
  minItems = 0,
  maxItems = Infinity,
  addButtonLabel,
  emptyMessage,
}) => {
  // Generate unique ID for accessibility
  const uniqueId = useId();
  const listId = `repeatable-list-${item.id}-${uniqueId}`;

  // Determine if we can add more items
  const canAdd = values.length < maxItems && !disabled;
  
  // Determine if we can delete items (must have more than minItems)
  const canDelete = values.length > minItems && !disabled;

  // Handle adding a new item
  const handleAdd = useCallback(() => {
    if (!canAdd) return;
    
    const newValue = getDefaultValue(item);
    const newValues = [...values, newValue];
    onChange(newValues);
  }, [canAdd, item, values, onChange]);

  // Handle updating an item at a specific index
  const handleChange = useCallback(
    (index: number, newValue: ItemValue) => {
      const newValues = [...values];
      newValues[index] = newValue;
      onChange(newValues);
    },
    [values, onChange]
  );

  // Handle deleting an item at a specific index
  const handleDelete = useCallback(
    (index: number) => {
      if (!canDelete) return;
      
      const newValues = values.filter((_, i) => i !== index);
      onChange(newValues);
    },
    [canDelete, values, onChange]
  );

  // Default labels
  const defaultAddLabel = addButtonLabel || `添加${item.label}`;
  const defaultEmptyMessage = emptyMessage || `暂无${item.label}，点击下方按钮添加`;

  return (
    <div
      className={`space-y-4 ${className}`}
      data-testid="repeatable-item-list"
      data-item-id={item.id}
      role="region"
      aria-labelledby={`${listId}-label`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3
            id={`${listId}-label`}
            className="text-sm font-medium text-[var(--text-primary)]"
          >
            {item.label}
            {item.required && <span className="text-red-400 ml-1">*</span>}
            <span
              className="ml-2 text-xs text-[var(--text-muted)]"
              data-testid="repeatable-item-count"
            >
              ({values.length} 项)
            </span>
          </h3>
          {item.helpText && (
            <p
              className="text-xs text-[var(--text-muted)] mt-1"
              data-testid="repeatable-help-text"
            >
              {item.helpText}
            </p>
          )}
        </div>
      </div>

      {/* Items List */}
      <div
        className="space-y-3"
        data-testid="repeatable-items-container"
        role="list"
        aria-label={`${item.label}列表`}
      >
        {values.length === 0 ? (
          <EmptyState message={defaultEmptyMessage} />
        ) : (
          values.map((value, index) => (
            <ItemWrapper
              key={`${item.id}-${index}`}
              index={index}
              className="hover:shadow-md transition-shadow"
            >
              <div role="listitem">
                <ItemForm
                  item={item}
                  value={value}
                  onChange={(newValue) => handleChange(index, newValue)}
                  onDelete={canDelete ? () => handleDelete(index) : undefined}
                  disabled={disabled}
                />
              </div>
            </ItemWrapper>
          ))
        )}
      </div>

      {/* Add Button */}
      <button
        type="button"
        onClick={handleAdd}
        disabled={!canAdd}
        className="w-full py-3 px-4 border-2 border-dashed border-[var(--border-subtle)] rounded-lg text-[var(--text-muted)] hover:border-blue-500 hover:text-blue-500 hover:bg-blue-500/10 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-[var(--border-subtle)] disabled:hover:text-[var(--text-muted)] disabled:hover:bg-transparent"
        data-testid="repeatable-add-button"
        aria-label={defaultAddLabel}
      >
        <span className="flex items-center justify-center gap-2">
          <PlusIcon />
          {defaultAddLabel}
        </span>
      </button>

      {/* Max items reached message */}
      {values.length >= maxItems && (
        <p
          className="text-xs text-amber-400 text-center"
          data-testid="repeatable-max-reached"
          role="status"
        >
          已达到最大数量限制 ({maxItems} 项)
        </p>
      )}
    </div>
  );
};

export default RepeatableItemList;
