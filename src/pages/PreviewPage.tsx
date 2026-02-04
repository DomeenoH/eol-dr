/**
 * PreviewPage Component
 * Preview page for displaying all filled content in document format
 * 
 * Features:
 * - Display all filled content in document format (similar to original checklist.md)
 * - Toggle sensitive information visibility
 * - Print functionality with print-friendly styles
 * - Export to JSON, Markdown, HTML
 * - Return to editing button
 * 
 * @validates Requirements 5.1-5.6
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useChecklist } from '../context/ChecklistContext';
import { previewService, type PreviewDocument, type PreviewSection, type PreviewCategory, type PreviewItem } from '../services/PreviewService';
import { exportService } from '../services/ExportService';

/**
 * Props for PreviewPage component
 */
export interface PreviewPageProps {
  /** Callback when user wants to return to editing */
  onBack?: () => void;
  /** Custom class name */
  className?: string;
}

/**
 * Format a date to a readable string
 */
function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return isoString;
  }
}

/**
 * Mask sensitive values for display
 */
function maskSensitiveValue(value: string): string {
  if (!value || value.length === 0) {
    return '';
  }
  return '*'.repeat(Math.min(value.length, 10));
}

/**
 * PreviewPage component
 * Displays all filled content in a document format
 */
export const PreviewPage: React.FC<PreviewPageProps> = ({
  onBack,
  className = '',
}) => {
  const { state } = useChecklist();
  // useSaveStatus is available if needed for future enhancements
  
  // State for sensitive information visibility
  const [showSensitive, setShowSensitive] = useState(false);
  
  // State for export dropdown
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // Generate preview document
  const previewDocument = useMemo((): PreviewDocument => {
    return previewService.generatePreview(state.checklistData);
  }, [state.checklistData]);
  
  // Check if there's any content to display
  const hasContent = previewDocument.sections.length > 0;
  
  /**
   * Toggle sensitive information visibility
   * @validates Requirement 5.3 - Toggle sensitive information visibility
   */
  const handleToggleSensitive = useCallback(() => {
    setShowSensitive(prev => !prev);
  }, []);
  
  /**
   * Handle print functionality
   * @validates Requirement 5.4 - Print functionality
   */
  const handlePrint = useCallback(() => {
    window.print();
  }, []);
  
  /**
   * Handle export to JSON
   * @validates Requirement 5.5 - Export to JSON
   */
  const handleExportJSON = useCallback(() => {
    const json = exportService.toJSON(state.checklistData, state.progressState);
    const timestamp = new Date().toISOString().slice(0, 10);
    exportService.downloadFile(json, `eol-checklist-${timestamp}.json`, 'application/json');
    setShowExportMenu(false);
  }, [state.checklistData, state.progressState]);
  
  /**
   * Handle export to Markdown
   * @validates Requirement 5.5 - Export to Markdown
   */
  const handleExportMarkdown = useCallback(() => {
    const markdown = exportService.toMarkdown(state.checklistData);
    const timestamp = new Date().toISOString().slice(0, 10);
    exportService.downloadFile(markdown, `eol-checklist-${timestamp}.md`, 'text/markdown');
    setShowExportMenu(false);
  }, [state.checklistData]);
  
  /**
   * Handle export to HTML
   * @validates Requirement 5.6 - Export to HTML
   */
  const handleExportHTML = useCallback(() => {
    const html = exportService.toHTML(state.checklistData);
    const timestamp = new Date().toISOString().slice(0, 10);
    exportService.downloadFile(html, `eol-checklist-${timestamp}.html`, 'text/html');
    setShowExportMenu(false);
  }, [state.checklistData]);
  
  /**
   * Close export menu when clicking outside
   */
  const handleExportMenuBlur = useCallback(() => {
    // Delay to allow click on menu items
    setTimeout(() => setShowExportMenu(false), 200);
  }, []);

  return (
    <div 
      className={`min-h-screen bg-gray-50 ${className}`}
      data-testid="preview-page"
    >
      {/* Header - Fixed on top */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Title and back button */}
            <div className="flex items-center gap-3">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="返回编辑"
                >
                  <BackIcon className="w-5 h-5" />
                </button>
              )}
              <h1 className="text-xl font-semibold text-gray-900">
                预览清单
              </h1>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Toggle sensitive info button */}
              <button
                type="button"
                onClick={handleToggleSensitive}
                className={`
                  inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
                  ${showSensitive 
                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
                aria-label={showSensitive ? '隐藏敏感信息' : '显示敏感信息'}
                aria-pressed={showSensitive}
              >
                {showSensitive ? (
                  <EyeOffIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {showSensitive ? '隐藏敏感信息' : '显示敏感信息'}
                </span>
              </button>
              
              {/* Print button */}
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                aria-label="打印"
              >
                <PrintIcon className="w-4 h-4" />
                <span className="hidden sm:inline">打印</span>
              </button>
              
              {/* Export dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  onBlur={handleExportMenuBlur}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  aria-label="导出"
                  aria-expanded={showExportMenu}
                  aria-haspopup="menu"
                >
                  <ExportIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">导出</span>
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
                
                {showExportMenu && (
                  <div 
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20"
                    role="menu"
                    aria-label="导出选项"
                  >
                    <button
                      type="button"
                      onClick={handleExportJSON}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                      role="menuitem"
                    >
                      <span className="flex items-center gap-2">
                        <JSONIcon className="w-4 h-4 text-green-600" />
                        导出为 JSON
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportMarkdown}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                      role="menuitem"
                    >
                      <span className="flex items-center gap-2">
                        <MarkdownIcon className="w-4 h-4 text-purple-600" />
                        导出为 Markdown
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportHTML}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                      role="menuitem"
                    >
                      <span className="flex items-center gap-2">
                        <HTMLIcon className="w-4 h-4 text-orange-600" />
                        导出为 HTML
                      </span>
                    </button>
                  </div>
                )}
              </div>
              
              {/* Return to edit button */}
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  aria-label="返回编辑"
                >
                  <EditIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">返回编辑</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content - Document format */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Document container */}
        <article 
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:shadow-none print:border-none print:rounded-none"
          aria-label="清单预览"
        >
          {/* Document header */}
          <div className="border-b border-gray-200 p-6 sm:p-8 print:border-b-2 print:border-gray-800">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full print:bg-gray-200">
                <ChecklistIcon className="w-8 h-8 text-blue-600 print:text-gray-800" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  📋 {previewDocument.title}
                </h2>
                <p className="text-sm text-gray-500">
                  生成时间: {formatDate(previewDocument.generatedAt)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Document body */}
          <div className="p-6 sm:p-8">
            {hasContent ? (
              <div className="space-y-8">
                {previewDocument.sections.map((section, sectionIndex) => (
                  <PreviewSectionComponent
                    key={section.name}
                    section={section}
                    showSensitive={showSensitive}
                    isFirst={sectionIndex === 0}
                  />
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </div>
        </article>
        
        {/* Footer actions - Print friendly hidden */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 print:hidden">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <EditIcon className="w-5 h-5" />
              返回编辑
            </button>
          )}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <PrintIcon className="w-5 h-5" />
            打印清单
          </button>
        </div>
      </main>
      
      {/* Print styles */}
      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-none {
            border: none !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          .print\\:border-b-2 {
            border-bottom-width: 2px !important;
          }
          .print\\:border-gray-800 {
            border-color: #1f2937 !important;
          }
          .print\\:bg-gray-200 {
            background-color: #e5e7eb !important;
          }
          .print\\:text-gray-800 {
            color: #1f2937 !important;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Preview section component
 */
interface PreviewSectionComponentProps {
  section: PreviewSection;
  showSensitive: boolean;
  isFirst: boolean;
}

const PreviewSectionComponent: React.FC<PreviewSectionComponentProps> = ({
  section,
  showSensitive,
  isFirst,
}) => {
  return (
    <section 
      className={`${!isFirst ? 'pt-6 border-t border-gray-200' : ''}`}
      aria-labelledby={`section-${section.name}`}
    >
      <h3 
        id={`section-${section.name}`}
        className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"
      >
        <span className="w-1.5 h-6 bg-blue-600 rounded-full" aria-hidden="true" />
        {section.name}
      </h3>
      
      {section.description && (
        <p className="text-gray-600 italic mb-4 pl-4 border-l-2 border-blue-200 bg-blue-50 py-2 pr-2 rounded-r">
          {section.description}
        </p>
      )}
      
      <div className="space-y-6 ml-4">
        {section.categories.map((category) => (
          <PreviewCategoryComponent
            key={category.name}
            category={category}
            showSensitive={showSensitive}
          />
        ))}
      </div>
    </section>
  );
};

/**
 * Preview category component
 */
interface PreviewCategoryComponentProps {
  category: PreviewCategory;
  showSensitive: boolean;
}

const PreviewCategoryComponent: React.FC<PreviewCategoryComponentProps> = ({
  category,
  showSensitive,
}) => {
  return (
    <div className="space-y-3">
      <h4 className="text-lg font-semibold text-gray-800">
        {category.name}
      </h4>
      
      {category.description && (
        <p className="text-sm text-gray-500 italic">
          {category.description}
        </p>
      )}
      
      <div className="space-y-2">
        {category.items.map((item, index) => (
          <PreviewItemComponent
            key={`${item.label}-${index}`}
            item={item}
            showSensitive={showSensitive}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Preview item component
 */
interface PreviewItemComponentProps {
  item: PreviewItem;
  showSensitive: boolean;
}

const PreviewItemComponent: React.FC<PreviewItemComponentProps> = ({
  item,
  showSensitive,
}) => {
  const renderValue = () => {
    if (Array.isArray(item.value)) {
      return (
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          {item.value.map((v, i) => (
            <li key={i} className="text-sm">
              {item.sensitive && !showSensitive ? maskSensitiveValue(v) : v}
            </li>
          ))}
        </ul>
      );
    }
    
    const displayValue = item.sensitive && !showSensitive 
      ? maskSensitiveValue(item.value) 
      : item.value;
    
    return (
      <span className={`text-gray-700 ${item.sensitive ? 'font-mono' : ''}`}>
        {displayValue}
      </span>
    );
  };
  
  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
        <span className="font-medium text-gray-900 flex items-center gap-1">
          {item.label}
          {item.sensitive && (
            <span 
              className="text-amber-500 text-xs" 
              title="敏感信息"
              aria-label="敏感信息"
            >
              🔒
            </span>
          )}
          :
        </span>
        <div className="flex-1">
          {renderValue()}
        </div>
      </div>
    </div>
  );
};

/**
 * Empty state component
 */
const EmptyState: React.FC = () => {
  return (
    <div 
      className="text-center py-12"
      role="status"
      aria-label="暂无填写内容"
    >
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
        <EmptyIcon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        暂无填写内容
      </h3>
      <p className="text-gray-500 max-w-sm mx-auto">
        您还没有填写任何内容。请返回编辑页面开始填写您的清单。
      </p>
    </div>
  );
};

// ============================================================================
// Icons
// ============================================================================

const BackIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const PrintIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
  </svg>
);

const ExportIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const ChecklistIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const EmptyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const JSONIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const MarkdownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const HTMLIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

export default PreviewPage;
