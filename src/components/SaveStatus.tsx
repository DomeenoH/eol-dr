/**
 * SaveStatus Component
 * Displays save status indicator with last saved time
 * 
 * Requirements: 3.4
 * 
 * Features:
 * - Display save status (saved/saving/error) with icons
 * - Display last saved time with relative formatting
 * - Visual indicators (icons, colors) for different states
 * - Error message display when save fails
 */

import React, { useMemo } from 'react';

/**
 * Save status type
 */
export type SaveStatusType = 'saved' | 'saving' | 'error' | 'unsaved';

/**
 * SaveStatus component props
 */
export interface SaveStatusProps {
  /** Current save status */
  status: SaveStatusType;
  /** Last saved timestamp */
  lastSaved?: Date | null;
  /** Error message when status is 'error' */
  errorMessage?: string | null;
  /** Custom class name for the container */
  className?: string;
  /** Whether to use compact mode (default: false) */
  compact?: boolean;
}

/**
 * Format relative time in Chinese
 * @param date - The date to format
 * @returns Relative time string in Chinese
 */
export function formatRelativeTime(date: Date | null | undefined): string {
  if (!date) {
    return '';
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Handle future dates (shouldn't happen, but just in case)
  if (diffMs < 0) {
    return '刚刚';
  }

  // Less than 10 seconds
  if (diffSeconds < 10) {
    return '刚刚';
  }

  // Less than 1 minute
  if (diffSeconds < 60) {
    return `${diffSeconds}秒前`;
  }

  // Less than 1 hour
  if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`;
  }

  // Less than 24 hours
  if (diffHours < 24) {
    return `${diffHours}小时前`;
  }

  // Less than 7 days
  if (diffDays < 7) {
    return `${diffDays}天前`;
  }

  // More than 7 days - show date
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  // If same year, don't show year
  if (year === now.getFullYear()) {
    return `${month}月${day}日 ${hours}:${minutes}`;
  }

  return `${year}年${month}月${day}日 ${hours}:${minutes}`;
}

/**
 * Saved status icon (checkmark)
 */
const SavedIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    className={`w-4 h-4 ${className}`}
    fill="currentColor"
    viewBox="0 0 20 20"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

/**
 * Saving status icon (spinner)
 */
const SavingIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    className={`w-4 h-4 animate-spin ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

/**
 * Error status icon (exclamation)
 */
const ErrorIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    className={`w-4 h-4 ${className}`}
    fill="currentColor"
    viewBox="0 0 20 20"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
      clipRule="evenodd"
    />
  </svg>
);

/**
 * Unsaved status icon (dot/circle)
 */
const UnsavedIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    className={`w-4 h-4 ${className}`}
    fill="currentColor"
    viewBox="0 0 20 20"
    aria-hidden="true"
  >
    <circle cx="10" cy="10" r="6" />
  </svg>
);

/**
 * Get status configuration based on save status
 */
function getStatusConfig(status: SaveStatusType) {
  switch (status) {
    case 'saved':
      return {
        icon: SavedIcon,
        text: '已保存',
        colorClass: 'text-green-400',
        bgClass: 'bg-green-500/10',
        borderClass: 'border-green-500/30',
      };
    case 'saving':
      return {
        icon: SavingIcon,
        text: '保存中...',
        colorClass: 'text-blue-400',
        bgClass: 'bg-blue-500/10',
        borderClass: 'border-blue-500/30',
      };
    case 'error':
      return {
        icon: ErrorIcon,
        text: '保存失败',
        colorClass: 'text-red-400',
        bgClass: 'bg-red-500/10',
        borderClass: 'border-red-500/30',
      };
    case 'unsaved':
      return {
        icon: UnsavedIcon,
        text: '未保存',
        colorClass: 'text-amber-400',
        bgClass: 'bg-amber-500/10',
        borderClass: 'border-amber-500/30',
      };
    default:
      return {
        icon: SavedIcon,
        text: '已保存',
        colorClass: 'text-green-400',
        bgClass: 'bg-green-500/10',
        borderClass: 'border-green-500/30',
      };
  }
}

/**
 * SaveStatus component
 * Displays save status indicator with last saved time
 */
export const SaveStatus: React.FC<SaveStatusProps> = ({
  status,
  lastSaved,
  errorMessage,
  className = '',
  compact = false,
}) => {
  const config = useMemo(() => getStatusConfig(status), [status]);
  const relativeTime = useMemo(() => formatRelativeTime(lastSaved), [lastSaved]);
  
  const Icon = config.icon;

  // Compact mode - just icon and minimal text
  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 ${className}`}
        data-testid="save-status"
        role="status"
        aria-live="off"
      >
        <Icon className={config.colorClass} />
        <span className={`text-xs ${config.colorClass}`}>
          {config.text}
        </span>
      </div>
    );
  }

  // Full mode with time and error message
  return (
    <div
      className={`inline-flex flex-col ${className}`}
      data-testid="save-status"
      role="status"
      aria-live="off"
    >
      {/* Main status row */}
      <div className="flex items-center gap-2">
        <Icon className={config.colorClass} />
        <span className={`text-sm font-medium ${config.colorClass}`}>
          {config.text}
        </span>
        {/* Show relative time for saved status */}
        {status === 'saved' && relativeTime && (
          <span className="text-xs text-slate-400">
            · {relativeTime}
          </span>
        )}
      </div>

      {/* Error message row */}
      {status === 'error' && errorMessage && (
        <div className="mt-1 text-xs text-red-500" data-testid="save-error-message">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

/**
 * SaveStatusBadge component
 * A badge-style variant of SaveStatus for use in headers/toolbars
 */
export const SaveStatusBadge: React.FC<SaveStatusProps> = ({
  status,
  lastSaved,
  errorMessage,
  className = '',
}) => {
  const config = useMemo(() => getStatusConfig(status), [status]);
  const relativeTime = useMemo(() => formatRelativeTime(lastSaved), [lastSaved]);
  
  const Icon = config.icon;

  return (
    <div
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-full
        ${config.bgClass} ${config.borderClass} border
        ${className}
      `}
      data-testid="save-status-badge"
      role="status"
      aria-live="off"
    >
      <Icon className={config.colorClass} />
      <span className={`text-sm ${config.colorClass}`}>
        {config.text}
      </span>
      {status === 'saved' && relativeTime && (
        <span className="text-xs text-slate-400">
          {relativeTime}
        </span>
      )}
      {status === 'error' && errorMessage && (
        <span 
          className="text-xs text-red-500 max-w-[150px] truncate" 
          title={errorMessage}
          data-testid="save-error-message"
        >
          {errorMessage}
        </span>
      )}
    </div>
  );
};

/**
 * Save button props
 */
export interface SaveButtonProps {
  /** Callback when save button is clicked */
  onSave: () => void;
  /** Number of pending changes */
  pendingCount?: number;
  /** Current save status */
  status?: SaveStatusType;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * Save icon
 */
const SaveIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
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
      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
    />
  </svg>
);

/**
 * SaveButton component
 * A button to manually save changes
 */
export const SaveButton: React.FC<SaveButtonProps> = ({
  onSave,
  pendingCount = 0,
  status = 'saved',
  disabled = false,
  className = '',
}) => {
  const hasPendingChanges = pendingCount > 0;
  const isSaving = status === 'saving';
  const isDisabled = disabled || isSaving || !hasPendingChanges;

  return (
    <button
      type="button"
      onClick={onSave}
      disabled={isDisabled}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
        transition-all duration-200
        ${hasPendingChanges 
          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg' 
          : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-subtle)] cursor-not-allowed'
        }
        ${isSaving ? 'opacity-75 cursor-wait' : ''}
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      data-testid="save-button"
      aria-label={hasPendingChanges ? `保存 ${pendingCount} 项更改` : '无更改需要保存'}
    >
      {isSaving ? (
        <SavingIcon className="text-white" />
      ) : (
        <SaveIcon />
      )}
      <span>
        {isSaving ? '保存中...' : hasPendingChanges ? `保存 (${pendingCount})` : '已保存'}
      </span>
    </button>
  );
};

export default SaveStatus;
