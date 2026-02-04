/**
 * SettingsPage Component
 * Settings and data management page for the EOL Checklist Webapp
 * 
 * Features:
 * - Import JSON backup files
 * - Clear all data with confirmation dialog
 * - Data management options
 * 
 * @validates Requirements 4.5, 6.4, 6.5
 */

import React, { useState, useCallback, useRef } from 'react';
import { useChecklist } from '../context/ChecklistContext';
import { exportService, ExportError } from '../services/ExportService';

/**
 * Props for SettingsPage component
 */
export interface SettingsPageProps {
  /** Callback when user wants to go back */
  onBack?: () => void;
  /** Custom class name */
  className?: string;
}

/**
 * SettingsPage component
 * Provides settings and data management options
 */
export const SettingsPage: React.FC<SettingsPageProps> = ({
  onBack,
  className = '',
}) => {
  const { state, clearData, importData } = useChecklist();
  
  // State for confirmation dialog
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearConfirmText, setClearConfirmText] = useState('');
  
  // State for import
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle file selection for import
   */
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError(null);
    setImportSuccess(false);

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const exportedData = exportService.fromJSON(content);
        
        // Import the data
        importData(exportedData.data, exportedData.progress);
        
        setImportSuccess(true);
        setImportError(null);
        
        // Clear success message after 5 seconds
        setTimeout(() => setImportSuccess(false), 5000);
      } catch (error) {
        if (error instanceof ExportError) {
          setImportError(error.message);
        } else {
          setImportError('导入失败：文件格式无效或已损坏');
        }
      } finally {
        setIsImporting(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.onerror = () => {
      setImportError('读取文件失败，请重试');
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
  }, [importData]);

  /**
   * Trigger file input click
   */
  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /**
   * Open clear confirmation dialog
   */
  const handleClearClick = useCallback(() => {
    setShowClearConfirm(true);
    setClearConfirmText('');
  }, []);

  /**
   * Close clear confirmation dialog
   */
  const handleCancelClear = useCallback(() => {
    setShowClearConfirm(false);
    setClearConfirmText('');
  }, []);

  /**
   * Confirm and execute clear all data
   */
  const handleConfirmClear = useCallback(() => {
    if (clearConfirmText === '确认删除') {
      clearData();
      setShowClearConfirm(false);
      setClearConfirmText('');
    }
  }, [clearConfirmText, clearData]);

  /**
   * Check if clear button should be enabled
   */
  const isClearEnabled = clearConfirmText === '确认删除';

  /**
   * Calculate storage usage info
   */
  const hasData = Object.keys(state.checklistData.sections || {}).length > 0 || 
                  state.progressState.overall > 0;

  return (
    <div 
      className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 ${className}`}
      data-testid="settings-page"
    >
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="返回"
              >
                <BackIcon className="w-6 h-6" />
              </button>
            )}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <SettingsIcon className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  设置
                </h1>
                <p className="text-sm text-gray-500">数据管理与备份</p>
              </div>
            </div>
          </div>
        </header>

        {/* Import Section */}
        <section 
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
          aria-labelledby="import-title"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <ImportIcon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 id="import-title" className="text-lg font-semibold text-gray-900 mb-1">
                导入数据
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                从 JSON 备份文件恢复您的数据。导入将覆盖当前所有数据。
              </p>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileSelect}
                className="hidden"
                aria-label="选择 JSON 文件"
                data-testid="import-file-input"
              />
              
              {/* Import button */}
              <button
                type="button"
                onClick={handleImportClick}
                disabled={isImporting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="选择 JSON 文件导入"
              >
                {isImporting ? (
                  <>
                    <LoadingIcon className="w-5 h-5 animate-spin" />
                    导入中...
                  </>
                ) : (
                  <>
                    <UploadIcon className="w-5 h-5" />
                    选择 JSON 文件
                  </>
                )}
              </button>

              {/* Import success message */}
              {importSuccess && (
                <div 
                  className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm flex items-center gap-2"
                  role="alert"
                  aria-live="polite"
                >
                  <SuccessIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>数据导入成功！</span>
                </div>
              )}

              {/* Import error message */}
              {importError && (
                <div 
                  className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm flex items-center gap-2"
                  role="alert"
                  aria-live="polite"
                >
                  <ErrorIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <span>{importError}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Clear Data Section */}
        <section 
          className="bg-white rounded-xl shadow-sm border border-red-200 p-6"
          aria-labelledby="clear-title"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <TrashIcon className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 id="clear-title" className="text-lg font-semibold text-gray-900 mb-1">
                清除所有数据
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                永久删除所有已填写的数据和进度。此操作无法撤销。
              </p>
              
              {/* Data status indicator */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">当前状态:</span>
                  {hasData ? (
                    <span className="text-amber-600 font-medium flex items-center gap-1">
                      <DataIcon className="w-4 h-4" />
                      有已保存的数据 ({Math.round(state.progressState.overall)}% 完成)
                    </span>
                  ) : (
                    <span className="text-gray-500 flex items-center gap-1">
                      <EmptyIcon className="w-4 h-4" />
                      暂无数据
                    </span>
                  )}
                </div>
              </div>
              
              {/* Clear button */}
              <button
                type="button"
                onClick={handleClearClick}
                disabled={!hasData}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="清除所有数据"
              >
                <TrashIcon className="w-5 h-5" />
                清除所有数据
              </button>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
            <LockIcon className="w-4 h-4" />
            <span>您的数据仅保存在本地浏览器中</span>
          </div>
        </div>
      </div>

      {/* Clear Confirmation Dialog */}
      {showClearConfirm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          data-testid="clear-confirm-dialog"
        >
          <div 
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            role="document"
          >
            {/* Dialog Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <WarningIcon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 id="confirm-dialog-title" className="text-lg font-semibold text-gray-900">
                  确认清除所有数据？
                </h3>
                <p className="text-sm text-gray-500">此操作无法撤销</p>
              </div>
            </div>

            {/* Warning Message */}
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 mb-2">
                <strong>警告：</strong>这将永久删除以下内容：
              </p>
              <ul className="text-sm text-red-700 space-y-1 ml-4 list-disc">
                <li>所有已填写的清单数据</li>
                <li>填写进度和状态</li>
                <li>所有本地保存的信息</li>
              </ul>
            </div>

            {/* Confirmation Input */}
            <div className="mb-6">
              <label 
                htmlFor="confirm-input" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                请输入 <span className="font-bold text-red-600">确认删除</span> 以继续：
              </label>
              <input
                id="confirm-input"
                type="text"
                value={clearConfirmText}
                onChange={(e) => setClearConfirmText(e.target.value)}
                placeholder="确认删除"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                autoComplete="off"
                data-testid="confirm-input"
              />
            </div>

            {/* Dialog Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancelClear}
                className="flex-1 px-4 py-2 text-gray-700 font-medium bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                aria-label="取消"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmClear}
                disabled={!isClearEnabled}
                className="flex-1 px-4 py-2 text-white font-medium bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="确认清除"
                data-testid="confirm-clear-button"
              >
                确认清除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Icons
// ============================================================================

const BackIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ImportIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const LoadingIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const SuccessIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ErrorIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const WarningIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const DataIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);

const EmptyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
  </svg>
);

export default SettingsPage;
