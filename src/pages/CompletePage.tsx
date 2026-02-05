/**
 * CompletePage Component
 * Completion page displayed when users finish all sections of the checklist
 * 
 * Features:
 * - Display congratulations message
 * - Provide export options (JSON, Markdown, HTML)
 * - Provide preview entry
 * - Celebratory and visually appealing design
 * 
 * @validates Requirements 10.5
 */

import React, { useState, useCallback } from 'react';
import { useChecklist } from '../context/ChecklistContext';
import { exportService } from '../services/ExportService';

/**
 * Props for CompletePage component
 */
export interface CompletePageProps {
  /** Callback when user wants to preview the checklist */
  onPreview?: () => void;
  /** Callback when user wants to go back to editing */
  onBackToEdit?: () => void;
  /** Custom class name */
  className?: string;
}

/**
 * CompletePage component
 * Displays completion congratulations and provides export/preview options
 */
export const CompletePage: React.FC<CompletePageProps> = ({
  onPreview,
  onBackToEdit,
  className = '',
}) => {
  const { state } = useChecklist();
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  /**
   * Handle export to JSON
   */
  const handleExportJSON = useCallback(() => {
    try {
      const json = exportService.toJSON(state.checklistData, state.progressState);
      const timestamp = new Date().toISOString().slice(0, 10);
      exportService.downloadFile(json, `eol-checklist-${timestamp}.json`, 'application/json');
      setExportSuccess('JSON');
      setShowExportMenu(false);
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (error) {
      console.error('Export JSON failed:', error);
    }
  }, [state.checklistData, state.progressState]);

  /**
   * Handle export to Markdown
   */
  const handleExportMarkdown = useCallback(() => {
    try {
      const markdown = exportService.toMarkdown(state.checklistData);
      const timestamp = new Date().toISOString().slice(0, 10);
      exportService.downloadFile(markdown, `eol-checklist-${timestamp}.md`, 'text/markdown');
      setExportSuccess('Markdown');
      setShowExportMenu(false);
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (error) {
      console.error('Export Markdown failed:', error);
    }
  }, [state.checklistData]);

  /**
   * Handle export to HTML
   */
  const handleExportHTML = useCallback(() => {
    try {
      const html = exportService.toHTML(state.checklistData);
      const timestamp = new Date().toISOString().slice(0, 10);
      exportService.downloadFile(html, `eol-checklist-${timestamp}.html`, 'text/html');
      setExportSuccess('HTML');
      setShowExportMenu(false);
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (error) {
      console.error('Export HTML failed:', error);
    }
  }, [state.checklistData]);

  /**
   * Close export menu when clicking outside
   */
  const handleExportMenuBlur = useCallback(() => {
    setTimeout(() => setShowExportMenu(false), 200);
  }, []);

  return (
    <div 
      className={`min-h-screen bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)] ${className}`}
      data-testid="complete-page"
    >
      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 lg:py-20">
        {/* Celebration Animation */}
        <div className="text-center mb-8">
          <div 
            className="inline-flex items-center justify-center w-24 h-24 bg-green-500/20 rounded-full mb-6 animate-bounce border border-green-500/30"
            aria-hidden="true"
          >
            <TrophyIcon className="w-12 h-12 text-green-400" />
          </div>
          
          {/* Confetti decoration */}
          <div className="relative" aria-hidden="true">
            <span className="absolute -top-16 left-1/4 text-3xl animate-pulse">🎉</span>
            <span className="absolute -top-12 right-1/4 text-2xl animate-pulse delay-100">✨</span>
            <span className="absolute -top-20 left-1/3 text-2xl animate-pulse delay-200">🎊</span>
            <span className="absolute -top-14 right-1/3 text-3xl animate-pulse delay-300">🌟</span>
          </div>
        </div>

        {/* Congratulations Message */}
        <header className="text-center mb-10">
          <h1 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] mb-4"
            id="complete-title"
          >
            恭喜您完成了清单！
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-xl mx-auto">
            您已经成功完成了身后事清单的填写。这份清单将帮助您的家人在需要时获取重要信息。
          </p>
        </header>

        {/* Progress Summary Card */}
        <div 
          className="bg-[var(--bg-card)] backdrop-blur-sm rounded-2xl shadow-lg border border-[var(--border-card)] p-6 sm:p-8 mb-8"
          role="region"
          aria-labelledby="summary-title"
        >
          <h2 id="summary-title" className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <CheckCircleIcon className="w-6 h-6 text-green-500" />
            完成摘要
          </h2>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm text-[var(--text-secondary)] mb-1">
                <span>整体进度</span>
                <span className="font-medium text-green-500">
                  {Math.round(state.progressState.overall)}%
                </span>
              </div>
              <div className="w-full bg-[var(--bg-surface)] rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${state.progressState.overall}%` }}
                  role="progressbar"
                  aria-valuenow={state.progressState.overall}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`已完成 ${Math.round(state.progressState.overall)}%`}
                />
              </div>
            </div>
          </div>

          <p className="text-sm text-[var(--text-muted)] flex items-center gap-2">
            <InfoIcon className="w-4 h-4" />
            请务必导出并妥善保存您的数据，以便在需要时使用。
          </p>
        </div>

        {/* Export Success Message */}
        {exportSuccess && (
          <div 
            className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 text-center animate-fade-in"
            role="alert"
            aria-live="polite"
          >
            <span className="flex items-center justify-center gap-2">
              <CheckCircleIcon className="w-5 h-5" />
              {exportSuccess} 文件已成功导出！
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div 
          className="space-y-4"
          role="group"
          aria-label="操作按钮"
        >
          {/* Primary Actions Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Preview Button */}
            <button
              type="button"
              onClick={onPreview}
              className="flex-1 inline-flex items-center justify-center gap-3 px-6 py-4 text-lg font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg"
              aria-label="预览清单"
            >
              <PreviewIcon className="w-6 h-6" />
              预览清单
            </button>

            {/* Export Dropdown */}
            <div className="relative flex-1">
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                onBlur={handleExportMenuBlur}
                className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 text-lg font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg"
                aria-label="导出数据"
                aria-expanded={showExportMenu}
                aria-haspopup="menu"
              >
                <ExportIcon className="w-6 h-6" />
                导出数据
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
              </button>

              {showExportMenu && (
                <div 
                  className="absolute left-0 right-0 mt-2 bg-slate-800 rounded-xl shadow-xl border border-slate-600 py-2 z-20"
                  role="menu"
                  aria-label="导出选项"
                >
                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="w-full px-4 py-3 text-left text-slate-200 hover:bg-slate-700 focus:outline-none focus:bg-slate-700 flex items-center gap-3"
                    role="menuitem"
                  >
                    <JSONIcon className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="font-medium">导出为 JSON</div>
                      <div className="text-xs text-slate-400">用于数据备份和迁移</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportMarkdown}
                    className="w-full px-4 py-3 text-left text-slate-200 hover:bg-slate-700 focus:outline-none focus:bg-slate-700 flex items-center gap-3"
                    role="menuitem"
                  >
                    <MarkdownIcon className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="font-medium">导出为 Markdown</div>
                      <div className="text-xs text-slate-400">可读的文档格式</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportHTML}
                    className="w-full px-4 py-3 text-left text-slate-200 hover:bg-slate-700 focus:outline-none focus:bg-slate-700 flex items-center gap-3"
                    role="menuitem"
                  >
                    <HTMLIcon className="w-5 h-5 text-orange-400" />
                    <div>
                      <div className="font-medium">导出为 HTML</div>
                      <div className="text-xs text-slate-400">适合打印的网页格式</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Secondary Action - Back to Edit */}
          {onBackToEdit && (
            <button
              type="button"
              onClick={onBackToEdit}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-slate-200 bg-slate-800 border border-slate-600 rounded-xl hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-colors"
              aria-label="返回编辑"
            >
              <EditIcon className="w-5 h-5" />
              返回继续编辑
            </button>
          )}
        </div>

        {/* Important Reminder */}
        <div 
          className="mt-10 p-6 bg-amber-500/10 border border-amber-500/30 rounded-xl"
          role="alert"
          aria-labelledby="reminder-title"
        >
          <h3 id="reminder-title" className="text-lg font-semibold text-amber-300 mb-2 flex items-center gap-2">
            <WarningIcon className="w-5 h-5" />
            重要提醒
          </h3>
          <ul className="text-amber-200/80 space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5">•</span>
              <span>请导出并妥善保存您的数据，建议保存多份备份</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5">•</span>
              <span>告知您信任的家人或朋友这份清单的存放位置</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5">•</span>
              <span>定期更新清单内容，确保信息的准确性</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5">•</span>
              <span>您的数据仅保存在本地浏览器中，清除浏览器数据会导致数据丢失</span>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-slate-400">
          <p>感谢您使用身后事清单应用</p>
          <p className="mt-1">愿这份清单能为您的家人带来帮助 ❤️</p>
        </footer>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .delay-100 {
          animation-delay: 100ms;
        }
        .delay-200 {
          animation-delay: 200ms;
        }
        .delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// Icons
// ============================================================================

const TrophyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PreviewIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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

const WarningIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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

export default CompletePage;
