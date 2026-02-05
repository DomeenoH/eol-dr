/**
 * ItemForm Component
 * Generic form component for rendering individual checklist items
 * 
 * Requirements: 6.2, 6.3, 8.2, 8.4
 * 
 * Features:
 * - Support for various input types (text, email, tel, url, password, textarea, date)
 * - Sensitive field show/hide toggle
 * - Help text and placeholder support
 * - Conditional field display (showWhen)
 * - Accessible form controls
 */

import React, { useState, useCallback, useId } from 'react';
import type { ItemDefinition } from '../types/checklist-structure';
import type { ItemValue } from '../types/checklist-data';
import { getInputType, getFieldIcon } from './formUtils';

/**
 * ItemForm component props
 */
export interface ItemFormProps {
  /** Item definition containing field configuration */
  item: ItemDefinition;
  /** Current value of the item */
  value: ItemValue;
  /** Callback when value changes */
  onChange: (value: ItemValue) => void;
  /** Callback when item is deleted (for repeatable items) */
  onDelete?: () => void;
  /** Override sensitive flag from item definition */
  sensitive?: boolean;
  /** Custom class name */
  className?: string;
  /** Whether the form is disabled */
  disabled?: boolean;
}

/**
 * Eye icon for show/hide toggle
 */
const EyeIcon: React.FC<{ visible: boolean; className?: string }> = ({
  visible,
  className = '',
}) => (
  <svg
    className={`w-5 h-5 ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    {visible ? (
      <>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </>
    ) : (
      <>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
        />
      </>
    )}
  </svg>
);

/**
 * Delete icon for removable items
 */
const DeleteIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    className={`w-4 h-4 ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

/**
 * Help icon for tooltips
 */
const HelpIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    className={`w-4 h-4 ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

/**
 * ItemForm component
 * Renders a form field based on the item definition
 */
export const ItemForm: React.FC<ItemFormProps> = ({
  item,
  value,
  onChange,
  onDelete,
  sensitive: sensitiveProp,
  className = '',
  disabled = false,
}) => {
  // Use prop override or item definition for sensitive flag
  const isSensitive = sensitiveProp ?? item.sensitive ?? false;
  
  // Track visibility state for sensitive fields
  // Validates: Requirements 6.3
  const [isVisible, setIsVisible] = useState(false);
  
  // Generate unique ID for accessibility
  const uniqueId = useId();
  const inputId = `item-${item.id}-${uniqueId}`;
  const helpTextId = `help-${item.id}-${uniqueId}`;

  // Toggle visibility of sensitive field
  const toggleVisibility = useCallback(() => {
    setIsVisible((prev) => !prev);
  }, []);

  // Handle value change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const newValue = e.target.value;
      onChange(newValue);
    },
    [onChange]
  );

  // Handle checkbox change
  const handleCheckboxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.checked);
    },
    [onChange]
  );

  // Get the string value for display
  const stringValue = typeof value === 'string' ? value : 
                      typeof value === 'number' ? String(value) : 
                      typeof value === 'boolean' ? '' : '';

  // Render checkbox type
  if (item.type === 'checkbox') {
    const isChecked = typeof value === 'boolean' ? value : false;
    return (
      <div className={`flex items-start gap-3 ${className}`} data-testid="item-form">
        <div className="flex items-center h-5">
          <input
            id={inputId}
            type="checkbox"
            checked={isChecked}
            onChange={handleCheckboxChange}
            disabled={disabled}
            className="w-4 h-4 text-blue-500 bg-[var(--bg-surface)] border-[var(--border-subtle)] rounded focus:ring-blue-500 focus:ring-offset-[var(--bg-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="item-input"
            aria-describedby={item.helpText ? helpTextId : undefined}
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor={inputId}
            className={`text-sm font-medium ${disabled ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}
          >
            {item.label}
            {item.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {item.helpText && (
            <p
              id={helpTextId}
              className="mt-1 text-xs text-[var(--text-muted)]"
              data-testid="item-help-text"
            >
              {item.helpText}
            </p>
          )}
        </div>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={disabled}
            className="p-1.5 rounded-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`删除 ${item.label}`}
            data-testid="item-delete-button"
          >
            <DeleteIcon />
          </button>
        )}
      </div>
    );
  }

  // Render select type
  if (item.type === 'select' && item.options) {
    return (
      <div className={`space-y-1 ${className}`} data-testid="item-form">
        <div className="flex items-center justify-between">
          <label
            htmlFor={inputId}
            className={`block text-sm font-medium ${disabled ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}
          >
            <span className="mr-1" aria-hidden="true">
              {getFieldIcon(item.type, isSensitive)}
            </span>
            {item.label}
            {item.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={disabled}
                className="p-1.5 rounded-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`删除 ${item.label}`}
              data-testid="item-delete-button"
            >
              <DeleteIcon />
            </button>
          )}
        </div>
        <select
          id={inputId}
          value={stringValue}
          onChange={handleChange}
          disabled={disabled}
          className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="item-input"
          aria-describedby={item.helpText ? helpTextId : undefined}
        >
          <option value="">请选择...</option>
          {item.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {item.helpText && (
          <p
            id={helpTextId}
            className="mt-1 text-xs text-[var(--text-muted)] flex items-center gap-1"
            data-testid="item-help-text"
          >
            <HelpIcon className="flex-shrink-0" />
            {item.helpText}
          </p>
        )}
      </div>
    );
  }

  // Render textarea type
  if (item.type === 'textarea') {
    return (
      <div className={`space-y-1 ${className}`} data-testid="item-form">
        <div className="flex items-center justify-between">
          <label
            htmlFor={inputId}
            className={`block text-sm font-medium ${disabled ? 'text-slate-500' : 'text-slate-200'}`}
          >
            <span className="mr-1" aria-hidden="true">
              {getFieldIcon(item.type, isSensitive)}
            </span>
            {item.label}
            {item.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={disabled}
                className="p-1.5 rounded-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`删除 ${item.label}`}
              data-testid="item-delete-button"
            >
              <DeleteIcon />
            </button>
          )}
        </div>
        <textarea
          id={inputId}
          value={stringValue}
          onChange={handleChange}
          placeholder={item.placeholder}
          disabled={disabled}
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          data-testid="item-input"
          aria-describedby={item.helpText ? helpTextId : undefined}
        />
        {item.helpText && (
          <p
            id={helpTextId}
            className="mt-1 text-xs text-slate-400 flex items-center gap-1"
            data-testid="item-help-text"
          >
            <HelpIcon className="flex-shrink-0" />
            {item.helpText}
          </p>
        )}
      </div>
    );
  }

  // Render group type (composite fields)
  if (item.type === 'group' && item.fields) {
    // Get the group value as an object
    const groupValue = (typeof value === 'object' && value !== null && !Array.isArray(value)) 
      ? value as Record<string, ItemValue>
      : {};

    // Handle field change within the group
    const handleFieldChange = (fieldId: string, fieldValue: ItemValue) => {
      const newGroupValue = {
        ...groupValue,
        [fieldId]: fieldValue,
      };
      onChange(newGroupValue);
    };

    // 检查字段是否应该显示（基于 showWhen 条件）
    const shouldShowField = (field: ItemDefinition): boolean => {
      if (!field.showWhen) return true;
      
      const { fieldId, value: targetValue } = field.showWhen;
      const currentValue = groupValue[fieldId];
      
      // 如果当前值不存在，不显示
      if (currentValue === undefined || currentValue === '') return false;
      
      // 检查值是否匹配
      if (Array.isArray(targetValue)) {
        return targetValue.includes(String(currentValue));
      }
      return String(currentValue) === targetValue;
    };

    return (
      <div className={`space-y-4 ${className}`} data-testid="item-form">
        {/* Group header with delete button */}
        {onDelete && (
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={onDelete}
              disabled={disabled}
              className="p-1.5 rounded-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`删除 ${item.label}`}
              data-testid="item-delete-button"
            >
              <DeleteIcon />
            </button>
          </div>
        )}
        
        {/* Render each field in the group (with conditional display) */}
        <div className="space-y-4">
          {item.fields.filter(shouldShowField).map((field) => (
            <ItemForm
              key={field.id}
              item={field}
              value={groupValue[field.id] ?? ''}
              onChange={(newValue) => handleFieldChange(field.id, newValue)}
              disabled={disabled}
            />
          ))}
        </div>
      </div>
    );
  }

  // Render standard input types (text, email, tel, url, password, number)
  const inputType = getInputType(item.type, isSensitive, isVisible);

  return (
    <div className={`space-y-1 ${className}`} data-testid="item-form">
      <div className="flex items-center justify-between">
        <label
          htmlFor={inputId}
          className={`block text-sm font-medium ${disabled ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}
        >
          <span className="mr-1" aria-hidden="true">
            {getFieldIcon(item.type, isSensitive)}
          </span>
          {item.label}
          {item.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={disabled}
              className="p-1.5 rounded-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`删除 ${item.label}`}
            data-testid="item-delete-button"
          >
            <DeleteIcon />
          </button>
        )}
      </div>
      <div className="relative">
        <input
          id={inputId}
          type={inputType}
          value={stringValue}
          onChange={handleChange}
          placeholder={item.placeholder}
          disabled={disabled}
          required={item.required}
          className={`
            w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)]
            focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isSensitive ? 'pr-10 font-mono' : ''}
          `}
          data-testid="item-input"
          aria-describedby={item.helpText ? helpTextId : undefined}
        />
        {/* Show/Hide toggle for sensitive fields */}
        {/* Validates: Requirements 6.3 */}
        {isSensitive && (
          <button
            type="button"
            onClick={toggleVisibility}
            disabled={disabled}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-[var(--text-muted)] hover:text-blue-500 hover:bg-blue-500/10 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={isVisible ? '隐藏内容' : '显示内容'}
            data-testid="item-visibility-toggle"
          >
            <EyeIcon visible={isVisible} />
          </button>
        )}
      </div>
      {/* Help text display */}
      {/* Validates: Requirements 8.2 */}
      {item.helpText && (
        <p
          id={helpTextId}
          className="mt-1 text-xs text-slate-400 flex items-center gap-1"
          data-testid="item-help-text"
        >
          <HelpIcon className="flex-shrink-0" />
          {item.helpText}
        </p>
      )}
    </div>
  );
};

export default ItemForm;
