/**
 * ContactBubble Component
 * Chat bubble style display for emergency contacts
 * 
 * Requirements: 9.2
 * 
 * Features:
 * - Chat bubble style display for contacts
 * - Avatar/initials display
 * - Contact name and relationship fields
 * - Phone number and email fields
 * - Notes field
 * - Add/Edit/Delete functionality
 * - Visual styling similar to messaging apps
 */

import React, { useState, useCallback } from 'react';
import type { PlatformType, ContactData } from '../types/platform';
import { platformBranding } from './PlatformCard';

/**
 * ContactBubble component props
 */
export interface ContactBubbleProps {
  /** Contact data */
  contact: ContactData;
  /** Order number in the notification list */
  order: number;
  /** Callback when contact is edited */
  onEdit: (contact: ContactData) => void;
  /** Callback when contact is deleted */
  onDelete: () => void;
  /** Whether the bubble is in edit mode */
  isEditing?: boolean;
  /** Callback to toggle edit mode */
  onToggleEdit?: () => void;
  /** Custom class name */
  className?: string;
  /** Whether the component is disabled */
  disabled?: boolean;
}

/**
 * Props for the ContactBubbleForm component
 */
export interface ContactBubbleFormProps {
  /** Initial contact data (for editing) */
  initialData?: Partial<ContactData>;
  /** Callback when form is submitted */
  onSubmit: (contact: ContactData) => void;
  /** Callback when form is cancelled */
  onCancel: () => void;
  /** Custom class name */
  className?: string;
  /** Whether the form is disabled */
  disabled?: boolean;
}

/**
 * Props for the ContactBubbleList component
 */
export interface ContactBubbleListProps {
  /** List of contacts */
  contacts: ContactData[];
  /** Callback when contacts list changes */
  onChange: (contacts: ContactData[]) => void;
  /** Custom class name */
  className?: string;
  /** Whether the list is disabled */
  disabled?: boolean;
}

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
 * Platform icon component for contact bubbles
 */
const PlatformBadge: React.FC<{ platform: PlatformType; className?: string }> = ({
  platform,
  className = '',
}) => {
  const branding = platformBranding[platform];
  
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{
        backgroundColor: branding.primaryColor,
        color: '#ffffff',
      }}
      data-testid="contact-platform-badge"
    >
      {branding.name}
    </span>
  );
};

/**
 * Avatar component for contact bubbles
 */
const ContactAvatar: React.FC<{
  name: string;
  platform: PlatformType;
  className?: string;
}> = ({ name, platform, className = '' }) => {
  const branding = platformBranding[platform];
  const initials = getInitials(name);

  return (
    <div
      className={`flex items-center justify-center rounded-full text-white font-semibold ${className}`}
      style={{
        backgroundColor: branding.primaryColor,
        width: '48px',
        height: '48px',
        fontSize: '18px',
      }}
      data-testid="contact-avatar"
      aria-label={`${name} avatar`}
    >
      {initials}
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
      aria-label="编辑联系人"
      data-testid="contact-edit-button"
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
      aria-label="删除联系人"
      data-testid="contact-delete-button"
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
 * Order badge component
 */
const OrderBadge: React.FC<{ order: number }> = ({ order }) => (
  <div
    className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-sm font-semibold"
    data-testid="contact-order-badge"
  >
    {order}
  </div>
);

/**
 * ContactBubble component
 * Displays a single contact in chat bubble style
 */
export const ContactBubble: React.FC<ContactBubbleProps> = ({
  contact,
  order,
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
      <ContactBubbleForm
        initialData={contact}
        onSubmit={(updatedContact) => {
          onEdit(updatedContact);
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
      className={`flex items-start gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow ${className}`}
      data-testid="contact-bubble"
      data-contact-name={contact.name}
    >
      {/* Order Badge */}
      <OrderBadge order={order} />

      {/* Avatar */}
      <ContactAvatar name={contact.name} platform={contact.platform} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 truncate" data-testid="contact-name">
            {contact.name}
          </h3>
          <PlatformBadge platform={contact.platform} />
        </div>

        {contact.contactInfo && (
          <p className="text-sm text-gray-600 truncate" data-testid="contact-info">
            {contact.contactInfo}
          </p>
        )}

        {contact.notes && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2" data-testid="contact-notes">
            {contact.notes}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <ActionButtons onEdit={handleEdit} onDelete={onDelete} disabled={disabled} />
    </div>
  );
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
];

/**
 * ContactBubbleForm component
 * Form for adding or editing a contact
 */
export const ContactBubbleForm: React.FC<ContactBubbleFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  className = '',
  disabled = false,
}) => {
  const [formData, setFormData] = useState<Partial<ContactData>>({
    platform: 'imessage',
    name: '',
    contactInfo: '',
    notes: '',
    ...initialData,
  });

  const handleChange = useCallback(
    (field: keyof ContactData, value: string | PlatformType) => {
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
        platform: formData.platform || 'imessage',
        name: formData.name.trim(),
        contactInfo: formData.contactInfo?.trim(),
        notes: formData.notes?.trim(),
        order: initialData?.order,
      });
    },
    [formData, initialData?.order, onSubmit]
  );

  const isValid = formData.name?.trim() !== '';

  return (
    <form
      onSubmit={handleSubmit}
      className={`p-4 bg-blue-50 rounded-2xl border-2 border-blue-200 ${className}`}
      data-testid="contact-bubble-form"
    >
      <div className="space-y-3">
        {/* Platform Selection */}
        <div>
          <label
            htmlFor="contact-platform"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            联系平台
          </label>
          <select
            id="contact-platform"
            value={formData.platform}
            onChange={(e) => handleChange('platform', e.target.value as PlatformType)}
            disabled={disabled}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="contact-platform-select"
          >
            {contactPlatforms.map((platform) => (
              <option key={platform} value={platform}>
                {platformBranding[platform].name}
              </option>
            ))}
          </select>
        </div>

        {/* Name Input */}
        <div>
          <label
            htmlFor="contact-name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            姓名 <span className="text-red-500">*</span>
          </label>
          <input
            id="contact-name"
            type="text"
            value={formData.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="例如：张三、Brother"
            disabled={disabled}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="contact-name-input"
            required
          />
        </div>

        {/* Contact Info Input */}
        <div>
          <label
            htmlFor="contact-info"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            联系方式
          </label>
          <input
            id="contact-info"
            type="text"
            value={formData.contactInfo || ''}
            onChange={(e) => handleChange('contactInfo', e.target.value)}
            placeholder="电话号码、用户名或邮箱"
            disabled={disabled}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="contact-info-input"
          />
        </div>

        {/* Notes Input */}
        <div>
          <label
            htmlFor="contact-notes"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            备注
          </label>
          <textarea
            id="contact-notes"
            value={formData.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="例如：电话号码在我手机里"
            disabled={disabled}
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            data-testid="contact-notes-input"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={disabled}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="contact-cancel-button"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={disabled || !isValid}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="contact-submit-button"
          >
            {initialData?.name ? '保存' : '添加'}
          </button>
        </div>
      </div>
    </form>
  );
};

/**
 * ContactBubbleList component
 * Manages a list of contacts with add/edit/delete functionality
 */
export const ContactBubbleList: React.FC<ContactBubbleListProps> = ({
  contacts,
  onChange,
  className = '',
  disabled = false,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = useCallback(
    (contact: ContactData) => {
      const newContact = {
        ...contact,
        order: contacts.length + 1,
      };
      onChange([...contacts, newContact]);
      setIsAdding(false);
    },
    [contacts, onChange]
  );

  const handleEdit = useCallback(
    (index: number, contact: ContactData) => {
      const updatedContacts = [...contacts];
      updatedContacts[index] = {
        ...contact,
        order: index + 1,
      };
      onChange(updatedContacts);
      setEditingIndex(null);
    },
    [contacts, onChange]
  );

  const handleDelete = useCallback(
    (index: number) => {
      const updatedContacts = contacts
        .filter((_, i) => i !== index)
        .map((contact, i) => ({
          ...contact,
          order: i + 1,
        }));
      onChange(updatedContacts);
    },
    [contacts, onChange]
  );

  return (
    <div className={`space-y-4 ${className}`} data-testid="contact-bubble-list">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">📱 紧急联系人通知列表</h2>
          <p className="text-sm text-gray-500 mt-1">
            当我离开后，请按以下顺序通知这些人：
          </p>
        </div>
      </div>

      {/* Contact List */}
      <div className="space-y-3">
        {contacts.map((contact, index) => (
          <ContactBubble
            key={`${contact.name}-${index}`}
            contact={contact}
            order={index + 1}
            onEdit={(updatedContact) => handleEdit(index, updatedContact)}
            onDelete={() => handleDelete(index)}
            isEditing={editingIndex === index}
            onToggleEdit={() =>
              setEditingIndex(editingIndex === index ? null : index)
            }
            disabled={disabled}
          />
        ))}
      </div>

      {/* Add Contact Form or Button */}
      {isAdding ? (
        <ContactBubbleForm
          onSubmit={handleAdd}
          onCancel={() => setIsAdding(false)}
          disabled={disabled}
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          disabled={disabled}
          className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="add-contact-button"
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
            添加联系人
          </span>
        </button>
      )}
    </div>
  );
};

export default ContactBubble;
