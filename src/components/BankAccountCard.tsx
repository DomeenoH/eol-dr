/**
 * BankAccountCard Component
 * Bank card style display for bank account information
 * 
 * Requirements: 9.5
 * 
 * Features:
 * - Bank card styling with bank icon
 * - Account type selection (checking/savings/both)
 * - PIN code hidden display with show/hide toggle
 * - Purpose/description field
 * - Add/Edit/Delete functionality
 * - Visual styling similar to bank cards
 */

import React, { useState, useCallback } from 'react';
import type { BankAccountData, BankAccountType } from '../types/platform';

/**
 * BankAccountCard component props
 */
export interface BankAccountCardProps {
  /** Bank account data */
  account: BankAccountData;
  /** Callback when account is edited */
  onEdit: (account: BankAccountData) => void;
  /** Callback when account is deleted */
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
 * Props for the BankAccountCardForm component
 */
export interface BankAccountCardFormProps {
  /** Initial account data (for editing) */
  initialData?: Partial<BankAccountData>;
  /** Callback when form is submitted */
  onSubmit: (account: BankAccountData) => void;
  /** Callback when form is cancelled */
  onCancel: () => void;
  /** Custom class name */
  className?: string;
  /** Whether the form is disabled */
  disabled?: boolean;
}

/**
 * Props for the BankAccountCardList component
 */
export interface BankAccountCardListProps {
  /** List of bank accounts */
  accounts: BankAccountData[];
  /** Callback when accounts list changes */
  onChange: (accounts: BankAccountData[]) => void;
  /** Custom class name */
  className?: string;
  /** Whether the list is disabled */
  disabled?: boolean;
}

/**
 * Account type configuration for styling and display
 */
export const accountTypeConfig: Record<BankAccountType, {
  label: string;
  labelEn: string;
}> = {
  checking: {
    label: '支票账户',
    labelEn: 'Checking',
  },
  savings: {
    label: '储蓄账户',
    labelEn: 'Savings',
  },
  both: {
    label: '两者都有',
    labelEn: 'Both',
  },
};

/**
 * Available account types for selection
 */
export const accountTypes: BankAccountType[] = ['checking', 'savings', 'both'];

/**
 * Get label for an account type
 */
export const getAccountTypeLabel = (type: BankAccountType): string => {
  return accountTypeConfig[type]?.label || '未知类型';
};

/**
 * Get English label for an account type
 */
export const getAccountTypeLabelEn = (type: BankAccountType): string => {
  return accountTypeConfig[type]?.labelEn || 'Unknown';
};

/**
 * Account type badge component
 */
const AccountTypeBadge: React.FC<{ type: BankAccountType }> = ({ type }) => {
  const config = accountTypeConfig[type];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700"
      data-testid="account-type-badge"
    >
      {config.labelEn}
    </span>
  );
};

/**
 * Account type selector component (radio buttons)
 */
const AccountTypeSelector: React.FC<{
  value: BankAccountType;
  onChange: (type: BankAccountType) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled }) => {
  return (
    <div className="flex flex-wrap gap-4" role="radiogroup" aria-label="选择账户类型">
      {accountTypes.map((type) => {
        const config = accountTypeConfig[type];
        const isSelected = value === type;
        return (
          <label
            key={type}
            className={`
              flex items-center gap-2 cursor-pointer
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input
              type="radio"
              name="accountType"
              value={type}
              checked={isSelected}
              onChange={() => onChange(type)}
              disabled={disabled}
              className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid={`account-type-radio-${type}`}
            />
            <span className={`text-sm ${isSelected ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
              {config.labelEn}
            </span>
          </label>
        );
      })}
    </div>
  );
};

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
 * PIN display component with show/hide toggle
 */
const PinDisplay: React.FC<{
  pin?: string;
  visible: boolean;
  onToggle: () => void;
  disabled?: boolean;
}> = ({ pin, visible, onToggle, disabled }) => {
  if (!pin) {
    return (
      <span className="text-gray-400 text-sm" data-testid="pin-display">
        未设置
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className="font-mono text-gray-900"
        data-testid="pin-display"
      >
        {visible ? pin : '••••'}
      </span>
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className="p-1 rounded text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={visible ? '隐藏 PIN 码' : '显示 PIN 码'}
        data-testid="pin-toggle-button"
      >
        <EyeIcon visible={visible} className="w-4 h-4" />
      </button>
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
      className="p-1.5 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="编辑银行账户"
      data-testid="account-edit-button"
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
      aria-label="删除银行账户"
      data-testid="account-delete-button"
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
 * Bank icon component
 */
const BankIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    className={`w-8 h-8 ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z"
    />
  </svg>
);

/**
 * BankAccountCard component
 * Displays a single bank account card with bank card styling
 */
export const BankAccountCard: React.FC<BankAccountCardProps> = ({
  account,
  onEdit,
  onDelete,
  isEditing = false,
  onToggleEdit,
  className = '',
  disabled = false,
}) => {
  const [pinVisible, setPinVisible] = useState(false);

  const handleEdit = useCallback(() => {
    if (onToggleEdit) {
      onToggleEdit();
    }
  }, [onToggleEdit]);

  const togglePinVisibility = useCallback(() => {
    setPinVisible((prev) => !prev);
  }, []);

  if (isEditing) {
    return (
      <BankAccountCardForm
        initialData={account}
        onSubmit={(updatedAccount) => {
          onEdit(updatedAccount);
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

  return (
    <div
      className={`
        relative p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl shadow-sm border-2
        border-emerald-300 hover:shadow-md transition-shadow
        ${className}
      `}
      data-testid="bank-account-card"
      data-bank-name={account.bankName}
    >
      {/* Header with icon, name, and actions */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <BankIcon className="text-emerald-600" />
          </div>
          <div>
            <h3
              className="font-semibold text-gray-900"
              data-testid="bank-name"
            >
              {account.bankName}
            </h3>
            <AccountTypeBadge type={account.accountType} />
          </div>
        </div>
        <ActionButtons onEdit={handleEdit} onDelete={onDelete} disabled={disabled} />
      </div>

      {/* Account details */}
      <div className="space-y-3 text-sm">
        {/* Account Type */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600 flex items-center gap-1">
            <span aria-hidden="true">💳</span> 账户类型:
          </span>
          <span
            className="font-medium text-gray-900"
            data-testid="account-type-display"
          >
            {getAccountTypeLabel(account.accountType)}
          </span>
        </div>

        {/* PIN Code */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600 flex items-center gap-1">
            <span aria-hidden="true">🔢</span> PIN 码:
          </span>
          <PinDisplay
            pin={account.pin}
            visible={pinVisible}
            onToggle={togglePinVisibility}
            disabled={disabled}
          />
        </div>

        {/* Purpose */}
        {account.purpose && (
          <div className="pt-2 border-t border-emerald-200">
            <span className="text-gray-600 flex items-center gap-1 mb-1">
              <span aria-hidden="true">📝</span> 用途说明:
            </span>
            <p
              className="text-gray-700 text-sm"
              data-testid="account-purpose"
            >
              {account.purpose}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * BankAccountCardForm component
 * Form for adding or editing a bank account
 */
export const BankAccountCardForm: React.FC<BankAccountCardFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  className = '',
  disabled = false,
}) => {
  const [formData, setFormData] = useState<Partial<BankAccountData>>({
    bankName: '',
    accountType: 'checking',
    pin: '',
    purpose: '',
    ...initialData,
  });

  const [pinVisible, setPinVisible] = useState(false);

  const handleChange = useCallback(
    (field: keyof BankAccountData, value: string | BankAccountType) => {
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
      if (!formData.bankName?.trim()) return;

      onSubmit({
        bankName: formData.bankName.trim(),
        accountType: formData.accountType || 'checking',
        pin: formData.pin?.trim() || undefined,
        purpose: formData.purpose?.trim() || undefined,
      });
    },
    [formData, onSubmit]
  );

  const togglePinVisibility = useCallback(() => {
    setPinVisible((prev) => !prev);
  }, []);

  const isValid = formData.bankName?.trim() !== '';

  return (
    <form
      onSubmit={handleSubmit}
      className={`p-4 bg-emerald-50 rounded-xl border-2 border-emerald-200 ${className}`}
      data-testid="bank-account-card-form"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 pb-2 border-b border-emerald-200">
          <div className="p-1.5 bg-emerald-100 rounded-lg">
            <BankIcon className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="font-medium text-gray-900">银行账户</span>
        </div>

        {/* Bank Name Input */}
        <div>
          <label
            htmlFor="bank-name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            <span aria-hidden="true">🏦</span> 银行名称 <span className="text-red-500">*</span>
          </label>
          <input
            id="bank-name"
            type="text"
            value={formData.bankName || ''}
            onChange={(e) => handleChange('bankName', e.target.value)}
            placeholder="例如：Fak Bank、中国银行"
            disabled={disabled}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="bank-name-input"
            required
          />
        </div>

        {/* Account Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span aria-hidden="true">💳</span> 账户类型
          </label>
          <AccountTypeSelector
            value={formData.accountType || 'checking'}
            onChange={(type) => handleChange('accountType', type)}
            disabled={disabled}
          />
        </div>

        {/* PIN Code Input */}
        <div>
          <label
            htmlFor="bank-pin"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            <span aria-hidden="true">🔢</span> PIN 码
          </label>
          <div className="relative">
            <input
              id="bank-pin"
              type={pinVisible ? 'text' : 'password'}
              value={formData.pin || ''}
              onChange={(e) => handleChange('pin', e.target.value)}
              placeholder="••••"
              disabled={disabled}
              className="w-full px-3 py-2 pr-10 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed font-mono"
              data-testid="bank-pin-input"
            />
            <button
              type="button"
              onClick={togglePinVisibility}
              disabled={disabled}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-gray-500 hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={pinVisible ? '隐藏 PIN 码' : '显示 PIN 码'}
              data-testid="bank-pin-toggle"
            >
              <EyeIcon visible={pinVisible} />
            </button>
          </div>
        </div>

        {/* Purpose Input */}
        <div>
          <label
            htmlFor="bank-purpose"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            <span aria-hidden="true">📝</span> 用途说明
          </label>
          <textarea
            id="bank-purpose"
            value={formData.purpose || ''}
            onChange={(e) => handleChange('purpose', e.target.value)}
            placeholder="例如：主要账户，可支付国际账单"
            disabled={disabled}
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            data-testid="bank-purpose-input"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={disabled}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="bank-cancel-button"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={disabled || !isValid}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="bank-submit-button"
          >
            {initialData?.bankName ? '保存' : '添加'}
          </button>
        </div>
      </div>
    </form>
  );
};

/**
 * BankAccountCardList component
 * Manages a list of bank account cards with add/edit/delete functionality
 */
export const BankAccountCardList: React.FC<BankAccountCardListProps> = ({
  accounts,
  onChange,
  className = '',
  disabled = false,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = useCallback(
    (account: BankAccountData) => {
      onChange([...accounts, account]);
      setIsAdding(false);
    },
    [accounts, onChange]
  );

  const handleEdit = useCallback(
    (index: number, account: BankAccountData) => {
      const updatedAccounts = [...accounts];
      updatedAccounts[index] = account;
      onChange(updatedAccounts);
      setEditingIndex(null);
    },
    [accounts, onChange]
  );

  const handleDelete = useCallback(
    (index: number) => {
      const updatedAccounts = accounts.filter((_, i) => i !== index);
      onChange(updatedAccounts);
    },
    [accounts, onChange]
  );

  return (
    <div className={`space-y-4 ${className}`} data-testid="bank-account-card-list">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">🏦 银行账户</h2>
          <p className="text-sm text-gray-500 mt-1">
            管理您的银行账户信息，包括账户类型和 PIN 码
          </p>
        </div>
      </div>

      {/* Account List */}
      <div
        className="space-y-3"
        data-testid="bank-account-list"
      >
        {accounts.map((account, index) => (
          <BankAccountCard
            key={`${account.bankName}-${index}`}
            account={account}
            onEdit={(updatedAccount) => handleEdit(index, updatedAccount)}
            onDelete={() => handleDelete(index)}
            isEditing={editingIndex === index}
            onToggleEdit={() =>
              setEditingIndex(editingIndex === index ? null : index)
            }
            disabled={disabled}
          />
        ))}
      </div>

      {/* Add Account Form or Button */}
      {isAdding ? (
        <BankAccountCardForm
          onSubmit={handleAdd}
          onCancel={() => setIsAdding(false)}
          disabled={disabled}
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          disabled={disabled}
          className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="add-bank-account-button"
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
            添加另一个银行账户
          </span>
        </button>
      )}
    </div>
  );
};

export default BankAccountCard;
