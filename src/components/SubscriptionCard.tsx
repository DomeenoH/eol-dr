/**
 * SubscriptionCard Component
 * Service Logo grid layout with keep/cancel/transfer status selection
 * 
 * Requirements: 9.3
 * 
 * Features:
 * - Service Logo grid layout
 * - Keep/Cancel/Transfer status selection
 * - Service icons and status labels
 * - Add/Edit/Delete functionality
 * - Visual styling with status-specific colors
 */

import React, { useState, useCallback } from 'react';
import type { SubscriptionData, SubscriptionAction } from '../types/platform';

/**
 * SubscriptionCard component props
 */
export interface SubscriptionCardProps {
  /** Subscription data */
  subscription: SubscriptionData;
  /** Callback when subscription is edited */
  onEdit: (subscription: SubscriptionData) => void;
  /** Callback when subscription is deleted */
  onDelete: () => void;
  /** Whether the card is in edit mode */
  isEditing?: boolean;
  /** Callback to toggle edit mode */
  onToggleEdit?: () => void;
  /** Custom class name */
  className?: string;
  /** Whether the component is disabled */
  disabled?: boolean;
}

/**
 * Props for the SubscriptionCardForm component
 */
export interface SubscriptionCardFormProps {
  /** Initial subscription data (for editing) */
  initialData?: Partial<SubscriptionData>;
  /** Callback when form is submitted */
  onSubmit: (subscription: SubscriptionData) => void;
  /** Callback when form is cancelled */
  onCancel: () => void;
  /** Custom class name */
  className?: string;
  /** Whether the form is disabled */
  disabled?: boolean;
}

/**
 * Props for the SubscriptionCardList component
 */
export interface SubscriptionCardListProps {
  /** List of subscriptions */
  subscriptions: SubscriptionData[];
  /** Callback when subscriptions list changes */
  onChange: (subscriptions: SubscriptionData[]) => void;
  /** Custom class name */
  className?: string;
  /** Whether the list is disabled */
  disabled?: boolean;
}

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

/**
 * Action badge component
 */
const ActionBadge: React.FC<{ action: SubscriptionAction }> = ({ action }) => {
  const config = actionConfig[action];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.bgColor} ${config.textColor}`}
      data-testid="subscription-action-badge"
    >
      {config.label}
    </span>
  );
};

/**
 * Action selector component
 */
const ActionSelector: React.FC<{
  value: SubscriptionAction;
  onChange: (action: SubscriptionAction) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled }) => {
  const actions: SubscriptionAction[] = ['keep', 'cancel', 'transfer'];

  return (
    <div className="flex gap-1" role="radiogroup" aria-label="选择操作">
      {actions.map((action) => {
        const config = actionConfig[action];
        const isSelected = value === action;
        return (
          <button
            key={action}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(action)}
            disabled={disabled}
            className={`
              px-2 py-1 text-xs font-medium rounded border transition-colors
              ${isSelected
                ? `${config.bgColor} ${config.textColor} ${config.borderColor}`
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            data-testid={`action-button-${action}`}
          >
            {config.label}
          </button>
        );
      })}
    </div>
  );
};

/**
 * Edit/Delete action buttons
 */
const ActionButtons: React.FC<{
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
}> = ({ onEdit, onDelete, disabled }) => (
  <div className="flex items-center gap-1">
    <button
      type="button"
      onClick={onEdit}
      disabled={disabled}
      className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="编辑订阅"
      data-testid="subscription-edit-button"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
        />
      </svg>
    </button>
    <button
      type="button"
      onClick={onDelete}
      disabled={disabled}
      className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="删除订阅"
      data-testid="subscription-delete-button"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    </button>
  </div>
);

/**
 * SubscriptionCard component
 * Displays a single subscription service card
 */
export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  onEdit,
  onDelete,
  isEditing = false,
  onToggleEdit,
  className = '',
  disabled = false,
}) => {
  const handleEdit = useCallback(() => {
    if (onToggleEdit) {
      onToggleEdit();
    }
  }, [onToggleEdit]);

  if (isEditing) {
    return (
      <SubscriptionCardForm
        initialData={subscription}
        onSubmit={(updatedSubscription) => {
          onEdit(updatedSubscription);
          if (onToggleEdit) {
            onToggleEdit();
          }
        }}
        onCancel={() => {
          if (onToggleEdit) {
            onToggleEdit();
          }
        }}
        className={className}
        disabled={disabled}
      />
    );
  }

  const config = actionConfig[subscription.action];
  const icon = getServiceIcon(subscription.service, subscription.icon);

  return (
    <div
      className={`
        relative flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border-2
        ${config.borderColor} hover:shadow-md transition-shadow
        ${className}
      `}
      data-testid="subscription-card"
      data-service={subscription.service}
    >
      {/* Action buttons (top right) */}
      <div className="absolute top-2 right-2">
        <ActionButtons onEdit={handleEdit} onDelete={onDelete} disabled={disabled} />
      </div>

      {/* Service Icon */}
      <div
        className="text-4xl mb-2"
        data-testid="subscription-icon"
        aria-hidden="true"
      >
        {icon}
      </div>

      {/* Service Name */}
      <h3
        className="font-medium text-gray-900 text-center text-sm mb-1 line-clamp-2"
        data-testid="subscription-service-name"
      >
        {subscription.service}
      </h3>

      {/* Action Badge */}
      <ActionBadge action={subscription.action} />

      {/* Transfer To (if applicable) */}
      {subscription.action === 'transfer' && subscription.transferTo && (
        <p
          className="text-xs text-gray-500 mt-1 text-center"
          data-testid="subscription-transfer-to"
        >
          → {subscription.transferTo}
        </p>
      )}

      {/* Notes (if applicable) */}
      {subscription.notes && (
        <p
          className="text-xs text-gray-400 mt-1 text-center line-clamp-2"
          data-testid="subscription-notes"
        >
          {subscription.notes}
        </p>
      )}
    </div>
  );
};

/**
 * SubscriptionCardForm component
 * Form for adding or editing a subscription
 */
export const SubscriptionCardForm: React.FC<SubscriptionCardFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  className = '',
  disabled = false,
}) => {
  const [formData, setFormData] = useState<Partial<SubscriptionData>>({
    service: '',
    action: 'keep',
    transferTo: '',
    notes: '',
    ...initialData,
  });

  const handleChange = useCallback(
    (field: keyof SubscriptionData, value: string | SubscriptionAction) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.service?.trim()) return;

      onSubmit({
        service: formData.service.trim(),
        icon: formData.icon?.trim() || undefined,
        action: formData.action || 'keep',
        transferTo: formData.action === 'transfer' ? formData.transferTo?.trim() : undefined,
        notes: formData.notes?.trim() || undefined,
      });
    },
    [formData, onSubmit]
  );

  const isValid = formData.service?.trim() !== '';

  return (
    <form
      onSubmit={handleSubmit}
      className={`p-4 bg-blue-50 rounded-xl border-2 border-blue-200 ${className}`}
      data-testid="subscription-card-form"
    >
      <div className="space-y-3">
        {/* Service Name */}
        <div>
          <label
            htmlFor="subscription-service"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            服务名称 <span className="text-red-500">*</span>
          </label>
          <input
            id="subscription-service"
            type="text"
            value={formData.service || ''}
            onChange={(e) => handleChange('service', e.target.value)}
            placeholder="例如：Netflix、Spotify"
            disabled={disabled}
            list="common-services"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="subscription-service-input"
            required
          />
          <datalist id="common-services">
            {commonServices.map((service) => (
              <option key={service.name} value={service.name} />
            ))}
          </datalist>
        </div>

        {/* Custom Icon (optional) */}
        <div>
          <label
            htmlFor="subscription-icon"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            自定义图标 (可选)
          </label>
          <input
            id="subscription-icon"
            type="text"
            value={formData.icon || ''}
            onChange={(e) => handleChange('icon', e.target.value)}
            placeholder="例如：🎬 或留空使用默认图标"
            disabled={disabled}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="subscription-icon-input"
          />
        </div>

        {/* Action Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            处理方式
          </label>
          <ActionSelector
            value={formData.action || 'keep'}
            onChange={(action) => handleChange('action', action)}
            disabled={disabled}
          />
        </div>

        {/* Transfer To (conditional) */}
        {formData.action === 'transfer' && (
          <div>
            <label
              htmlFor="subscription-transfer-to"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              转让给
            </label>
            <input
              id="subscription-transfer-to"
              type="text"
              value={formData.transferTo || ''}
              onChange={(e) => handleChange('transferTo', e.target.value)}
              placeholder="例如：张三"
              disabled={disabled}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="subscription-transfer-to-input"
            />
          </div>
        )}

        {/* Notes */}
        <div>
          <label
            htmlFor="subscription-notes"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            备注
          </label>
          <textarea
            id="subscription-notes"
            value={formData.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="例如：家庭计划，需要通知其他成员"
            disabled={disabled}
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            data-testid="subscription-notes-input"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={disabled}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="subscription-cancel-button"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={disabled || !isValid}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="subscription-submit-button"
          >
            {initialData?.service ? '保存' : '添加'}
          </button>
        </div>
      </div>
    </form>
  );
};

/**
 * SubscriptionCardList component
 * Manages a grid of subscription cards with add/edit/delete functionality
 */
export const SubscriptionCardList: React.FC<SubscriptionCardListProps> = ({
  subscriptions,
  onChange,
  className = '',
  disabled = false,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = useCallback(
    (subscription: SubscriptionData) => {
      onChange([...subscriptions, subscription]);
      setIsAdding(false);
    },
    [subscriptions, onChange]
  );

  const handleEdit = useCallback(
    (index: number, subscription: SubscriptionData) => {
      const updatedSubscriptions = [...subscriptions];
      updatedSubscriptions[index] = subscription;
      onChange(updatedSubscriptions);
      setEditingIndex(null);
    },
    [subscriptions, onChange]
  );

  const handleDelete = useCallback(
    (index: number) => {
      const updatedSubscriptions = subscriptions.filter((_, i) => i !== index);
      onChange(updatedSubscriptions);
    },
    [subscriptions, onChange]
  );

  return (
    <div className={`space-y-4 ${className}`} data-testid="subscription-card-list">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">📺 订阅服务管理</h2>
          <p className="text-sm text-gray-500 mt-1">
            管理您的订阅服务，选择保留、取消或转让
          </p>
        </div>
      </div>

      {/* Subscription Grid */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        data-testid="subscription-grid"
      >
        {subscriptions.map((subscription, index) => (
          <SubscriptionCard
            key={`${subscription.service}-${index}`}
            subscription={subscription}
            onEdit={(updatedSubscription) => handleEdit(index, updatedSubscription)}
            onDelete={() => handleDelete(index)}
            isEditing={editingIndex === index}
            onToggleEdit={() =>
              setEditingIndex(editingIndex === index ? null : index)
            }
            disabled={disabled}
          />
        ))}
      </div>

      {/* Add Subscription Form or Button */}
      {isAdding ? (
        <SubscriptionCardForm
          onSubmit={handleAdd}
          onCancel={() => setIsAdding(false)}
          disabled={disabled}
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          disabled={disabled}
          className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="add-subscription-button"
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            添加订阅服务
          </span>
        </button>
      )}
    </div>
  );
};

export default SubscriptionCard;
