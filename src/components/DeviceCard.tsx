/**
 * DeviceCard Component
 * Device icon cards for homelab and hardware management
 * 
 * Requirements: 9.4
 * 
 * Features:
 * - Device icon cards with type-specific icons
 * - Inheritor field for device inheritance
 * - Formatting requirement toggle
 * - Special instructions/warning prompts display
 * - Add/Edit/Delete functionality
 * - Visual styling with device-specific colors
 */

import React, { useState, useCallback } from 'react';
import type { DeviceData, DeviceType } from '../types/platform';

/**
 * DeviceCard component props
 */
export interface DeviceCardProps {
  /** Device data */
  device: DeviceData;
  /** Callback when device is edited */
  onEdit: (device: DeviceData) => void;
  /** Callback when device is deleted */
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
 * Props for the DeviceCardForm component
 */
export interface DeviceCardFormProps {
  /** Initial device data (for editing) */
  initialData?: Partial<DeviceData>;
  /** Callback when form is submitted */
  onSubmit: (device: DeviceData) => void;
  /** Callback when form is cancelled */
  onCancel: () => void;
  /** Custom class name */
  className?: string;
  /** Whether the form is disabled */
  disabled?: boolean;
}

/**
 * Props for the DeviceCardList component
 */
export interface DeviceCardListProps {
  /** List of devices */
  devices: DeviceData[];
  /** Callback when devices list changes */
  onChange: (devices: DeviceData[]) => void;
  /** Custom class name */
  className?: string;
  /** Whether the list is disabled */
  disabled?: boolean;
  /** Warning message to display at the top */
  warningMessage?: string;
}

/**
 * Device type configuration for styling and display
 */
export const deviceTypeConfig: Record<DeviceType, {
  label: string;
  icon: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}> = {
  server: {
    label: '服务器',
    icon: '🖥️',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    textColor: 'text-purple-700',
  },
  computer: {
    label: '电脑',
    icon: '💻',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    textColor: 'text-blue-700',
  },
  phone: {
    label: '手机/平板',
    icon: '📱',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    textColor: 'text-green-700',
  },
  network: {
    label: '网络设备',
    icon: '🌐',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    textColor: 'text-orange-700',
  },
  iot: {
    label: 'IoT 设备',
    icon: '🏠',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-300',
    textColor: 'text-teal-700',
  },
};

/**
 * Get icon for a device type
 */
export const getDeviceIcon = (type: DeviceType): string => {
  return deviceTypeConfig[type]?.icon || '📦';
};

/**
 * Get label for a device type
 */
export const getDeviceTypeLabel = (type: DeviceType): string => {
  return deviceTypeConfig[type]?.label || '未知设备';
};

/**
 * Device type badge component
 */
const DeviceTypeBadge: React.FC<{ type: DeviceType }> = ({ type }) => {
  const config = deviceTypeConfig[type];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.bgColor} ${config.textColor}`}
      data-testid="device-type-badge"
    >
      {config.label}
    </span>
  );
};

/**
 * Formatting status indicator component
 */
const FormattingIndicator: React.FC<{ needsFormatting: boolean }> = ({ needsFormatting }) => (
  <span
    className={`inline-flex items-center text-sm ${needsFormatting ? 'text-green-600' : 'text-gray-500'}`}
    data-testid="device-formatting-indicator"
  >
    {needsFormatting ? '✅ 是' : '❌ 否'}
  </span>
);

/**
 * Warning message component
 */
const WarningMessage: React.FC<{ message: string }> = ({ message }) => (
  <div
    className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm"
    data-testid="device-warning-message"
    role="alert"
  >
    <span className="text-amber-500 flex-shrink-0" aria-hidden="true">⚠️</span>
    <span>{message}</span>
  </div>
);

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
      className="p-1.5 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="编辑设备"
      data-testid="device-edit-button"
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
      className="p-1.5 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="删除设备"
      data-testid="device-delete-button"
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
 * DeviceCard component
 * Displays a single device card with icon, inheritor, and formatting info
 */
export const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
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
      <DeviceCardForm
        initialData={device}
        onSubmit={(updatedDevice) => {
          onEdit(updatedDevice);
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

  const config = deviceTypeConfig[device.type];
  const icon = getDeviceIcon(device.type);

  return (
    <div
      className={`
        relative p-4 bg-white rounded-xl shadow-sm border-2
        ${config.borderColor} hover:shadow-md transition-shadow
        ${className}
      `}
      data-testid="device-card"
      data-device-name={device.name}
    >
      {/* Header with icon, name, and actions */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span
            className="text-3xl"
            data-testid="device-icon"
            aria-hidden="true"
          >
            {icon}
          </span>
          <div>
            <h3
              className="font-semibold text-gray-900"
              data-testid="device-name"
            >
              {device.name}
            </h3>
            <DeviceTypeBadge type={device.type} />
          </div>
        </div>
        <ActionButtons onEdit={handleEdit} onDelete={onDelete} disabled={disabled} />
      </div>

      {/* Device details */}
      <div className="space-y-2 text-sm">
        {/* Inheritor */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">继承人:</span>
          <span
            className="font-medium text-gray-900"
            data-testid="device-inheritor"
          >
            {device.inheritor || '未指定'}
          </span>
        </div>

        {/* Formatting requirement */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">需要格式化:</span>
          <FormattingIndicator needsFormatting={device.needsFormatting || false} />
        </div>
      </div>

      {/* Special instructions warning */}
      {device.specialInstructions && (
        <div className="mt-3">
          <WarningMessage message={device.specialInstructions} />
        </div>
      )}
    </div>
  );
};

/**
 * Available device types for selection
 */
export const deviceTypes: DeviceType[] = ['server', 'computer', 'phone', 'network', 'iot'];

/**
 * DeviceCardForm component
 * Form for adding or editing a device
 */
export const DeviceCardForm: React.FC<DeviceCardFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  className = '',
  disabled = false,
}) => {
  const [formData, setFormData] = useState<Partial<DeviceData>>({
    type: 'computer',
    name: '',
    inheritor: '',
    needsFormatting: false,
    specialInstructions: '',
    ...initialData,
  });

  const handleChange = useCallback(
    (field: keyof DeviceData, value: string | boolean | DeviceType) => {
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
      if (!formData.name?.trim()) return;

      onSubmit({
        type: formData.type || 'computer',
        name: formData.name.trim(),
        inheritor: formData.inheritor?.trim() || undefined,
        needsFormatting: formData.needsFormatting || false,
        specialInstructions: formData.specialInstructions?.trim() || undefined,
      });
    },
    [formData, onSubmit]
  );

  const isValid = formData.name?.trim() !== '';

  return (
    <form
      onSubmit={handleSubmit}
      className={`p-4 bg-blue-50 rounded-xl border-2 border-blue-200 ${className}`}
      data-testid="device-card-form"
    >
      <div className="space-y-3">
        {/* Device Type Selection */}
        <div>
          <label
            htmlFor="device-type"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            设备类型
          </label>
          <select
            id="device-type"
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value as DeviceType)}
            disabled={disabled}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="device-type-select"
          >
            {deviceTypes.map((type) => (
              <option key={type} value={type}>
                {deviceTypeConfig[type].icon} {deviceTypeConfig[type].label}
              </option>
            ))}
          </select>
        </div>

        {/* Device Name Input */}
        <div>
          <label
            htmlFor="device-name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            设备名称 <span className="text-red-500">*</span>
          </label>
          <input
            id="device-name"
            type="text"
            value={formData.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="例如：大黑盒子、NUC 小黑盒"
            disabled={disabled}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="device-name-input"
            required
          />
        </div>

        {/* Inheritor Input */}
        <div>
          <label
            htmlFor="device-inheritor"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            继承人
          </label>
          <input
            id="device-inheritor"
            type="text"
            value={formData.inheritor || ''}
            onChange={(e) => handleChange('inheritor', e.target.value)}
            placeholder="例如：Janet、Peter"
            disabled={disabled}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="device-inheritor-input"
          />
        </div>

        {/* Needs Formatting Checkbox */}
        <div className="flex items-center gap-2">
          <input
            id="device-needs-formatting"
            type="checkbox"
            checked={formData.needsFormatting || false}
            onChange={(e) => handleChange('needsFormatting', e.target.checked)}
            disabled={disabled}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="device-needs-formatting-checkbox"
          />
          <label
            htmlFor="device-needs-formatting"
            className="text-sm font-medium text-gray-700"
          >
            需要格式化硬盘
          </label>
        </div>

        {/* Special Instructions Input */}
        <div>
          <label
            htmlFor="device-special-instructions"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            特殊说明 (警告提示)
          </label>
          <textarea
            id="device-special-instructions"
            value={formData.specialInstructions || ''}
            onChange={(e) => handleChange('specialInstructions', e.target.value)}
            placeholder="例如：需要从 Find My 注销"
            disabled={disabled}
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            data-testid="device-special-instructions-input"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={disabled}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="device-cancel-button"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={disabled || !isValid}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="device-submit-button"
          >
            {initialData?.name ? '保存' : '添加'}
          </button>
        </div>
      </div>
    </form>
  );
};

/**
 * DeviceCardList component
 * Manages a list of device cards with add/edit/delete functionality
 */
export const DeviceCardList: React.FC<DeviceCardListProps> = ({
  devices,
  onChange,
  className = '',
  disabled = false,
  warningMessage,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = useCallback(
    (device: DeviceData) => {
      onChange([...devices, device]);
      setIsAdding(false);
    },
    [devices, onChange]
  );

  const handleEdit = useCallback(
    (index: number, device: DeviceData) => {
      const updatedDevices = [...devices];
      updatedDevices[index] = device;
      onChange(updatedDevices);
      setEditingIndex(null);
    },
    [devices, onChange]
  );

  const handleDelete = useCallback(
    (index: number) => {
      const updatedDevices = devices.filter((_, i) => i !== index);
      onChange(updatedDevices);
    },
    [devices, onChange]
  );

  return (
    <div className={`space-y-4 ${className}`} data-testid="device-card-list">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">🖥️ 家庭实验室设备</h2>
          <p className="text-sm text-gray-500 mt-1">
            管理您的设备，指定继承人和格式化要求
          </p>
        </div>
      </div>

      {/* Warning Message */}
      {warningMessage && (
        <div
          className="flex items-start gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800"
          data-testid="device-list-warning"
          role="alert"
        >
          <span className="text-amber-500 flex-shrink-0 text-lg" aria-hidden="true">⚠️</span>
          <span className="font-medium">{warningMessage}</span>
        </div>
      )}

      {/* Device List */}
      <div
        className="space-y-3"
        data-testid="device-list"
      >
        {devices.map((device, index) => (
          <DeviceCard
            key={`${device.name}-${index}`}
            device={device}
            onEdit={(updatedDevice) => handleEdit(index, updatedDevice)}
            onDelete={() => handleDelete(index)}
            isEditing={editingIndex === index}
            onToggleEdit={() =>
              setEditingIndex(editingIndex === index ? null : index)
            }
            disabled={disabled}
          />
        ))}
      </div>

      {/* Add Device Form or Button */}
      {isAdding ? (
        <DeviceCardForm
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
          data-testid="add-device-button"
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
            添加设备
          </span>
        </button>
      )}
    </div>
  );
};

export default DeviceCard;
