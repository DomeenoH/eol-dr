/**
 * WelcomePage Component
 * Landing page for the EOL Checklist Webapp
 * 
 * Features:
 * - Display welcome message
 * - Provide Guided Mode and Free Mode selection
 * - Detect saved data and offer "Continue from last session" option
 * 
 * @validates Requirements 1.1, 3.3
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useChecklist } from '../context/ChecklistContext';
import { storageService } from '../services/StorageService';
import type { AppMode } from '../types/progress';

/**
 * Props for WelcomePage component
 */
export interface WelcomePageProps {
  /** Callback when user selects a mode and starts */
  onStart?: (mode: AppMode, continueFromLast?: boolean) => void;
  /** Custom class name */
  className?: string;
}

/**
 * Information about saved data
 */
interface SavedDataInfo {
  hasSavedData: boolean;
  lastVisited: string | null;
  progress: number;
  currentSection: string | null;
}

/**
 * WelcomePage component
 * The landing page that allows users to choose their filling mode
 */
export const WelcomePage: React.FC<WelcomePageProps> = ({
  onStart,
  className = '',
}) => {
  const { state, setMode, setCurrentCategory } = useChecklist();
  const [savedDataInfo, setSavedDataInfo] = useState<SavedDataInfo>({
    hasSavedData: false,
    lastVisited: null,
    progress: 0,
    currentSection: null,
  });

  // Check for saved data on mount
  useEffect(() => {
    const checkSavedData = () => {
      try {
        if (!storageService.isAvailable()) {
          return;
        }

        const savedProgress = storageService.loadProgress();
        const savedData = storageService.load();

        if (savedData && savedProgress) {
          // Check if there's any actual data filled
          const hasData = Object.keys(savedData.sections || {}).length > 0;
          
          if (hasData || savedProgress.overall > 0) {
            setSavedDataInfo({
              hasSavedData: true,
              lastVisited: savedProgress.lastVisited,
              progress: savedProgress.overall,
              currentSection: savedProgress.currentPosition?.sectionId || null,
            });
          }
        }
      } catch (error) {
        console.error('Error checking saved data:', error);
      }
    };

    checkSavedData();
  }, []);

  /**
   * Handle mode selection
   */
  const handleModeSelect = useCallback((mode: AppMode, continueFromLast: boolean = false) => {
    setMode(mode);
    
    if (!continueFromLast) {
      // Start from the beginning
      setCurrentCategory({ sectionId: 'emergency-contacts', categoryId: 'contacts' });
    }
    // If continuing from last, the position is already loaded from storage
    
    onStart?.(mode, continueFromLast);
  }, [setMode, setCurrentCategory, onStart]);

  /**
   * Format the last visited date
   */
  const formatLastVisited = (isoString: string | null): string => {
    if (!isoString) return '';
    
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return '今天';
      } else if (diffDays === 1) {
        return '昨天';
      } else if (diffDays < 7) {
        return `${diffDays} 天前`;
      } else {
        return date.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
    } catch {
      return '';
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 ${className}`}>
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 lg:py-20">
        {/* Header Section */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <ChecklistIcon className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            身后事清单
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            End-of-life Disaster Response Checklist
          </p>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            为您的家人准备一份完整的信息清单，帮助他们在紧急情况下获取所需的所有重要信息。
          </p>
        </header>

        {/* Continue from Last Session Card */}
        {savedDataInfo.hasSavedData && (
          <div className="mb-8">
            <div 
              className="bg-white rounded-xl shadow-md border border-blue-200 p-6 hover:shadow-lg transition-shadow"
              role="region"
              aria-label="继续上次填写"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <ContinueIcon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    继续上次填写
                  </h2>
                  <p className="text-sm text-gray-500 mb-3">
                    {savedDataInfo.lastVisited && (
                      <span>上次访问: {formatLastVisited(savedDataInfo.lastVisited)}</span>
                    )}
                    {savedDataInfo.progress > 0 && (
                      <span className="ml-2">• 已完成 {Math.round(savedDataInfo.progress)}%</span>
                    )}
                  </p>
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${savedDataInfo.progress}%` }}
                      role="progressbar"
                      aria-valuenow={savedDataInfo.progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`已完成 ${Math.round(savedDataInfo.progress)}%`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleModeSelect(state.progressState.mode, true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    aria-label="继续上次填写"
                  >
                    <ContinueIcon className="w-5 h-5 mr-2" />
                    继续填写
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mode Selection Section */}
        <section aria-labelledby="mode-selection-title">
          <h2 
            id="mode-selection-title" 
            className="text-xl font-semibold text-gray-900 text-center mb-6"
          >
            {savedDataInfo.hasSavedData ? '或者重新开始' : '选择填写模式'}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Guided Mode Card */}
            <ModeCard
              mode="guided"
              title="引导模式"
              subtitle="Guided Mode"
              description="按照预设顺序逐步引导您填写所有信息，适合首次使用或希望系统性完成的用户。"
              icon={<GuidedModeIcon className="w-8 h-8" />}
              features={[
                '按顺序逐步引导',
                '可随时跳过当前部分',
                '清晰的进度追踪',
              ]}
              onSelect={() => handleModeSelect('guided', false)}
              recommended={!savedDataInfo.hasSavedData}
            />

            {/* Free Mode Card */}
            <ModeCard
              mode="free"
              title="自由模式"
              subtitle="Free Mode"
              description="自由选择想要填写的部分，适合已经熟悉清单内容或只想更新特定信息的用户。"
              icon={<FreeModeIcon className="w-8 h-8" />}
              features={[
                '自由选择填写顺序',
                '快速定位特定部分',
                '灵活的导航体验',
              ]}
              onSelect={() => handleModeSelect('free', false)}
            />
          </div>
        </section>

        {/* Info Section */}
        <section className="mt-12 text-center" aria-labelledby="info-title">
          <h3 id="info-title" className="sr-only">关于数据安全</h3>
          <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
            <LockIcon className="w-4 h-4" />
            <span>您的数据仅保存在本地浏览器中，不会上传到任何服务器</span>
          </div>
        </section>

        {/* Features Overview */}
        <section className="mt-16" aria-labelledby="features-title">
          <h3 id="features-title" className="text-lg font-semibold text-gray-900 text-center mb-8">
            主要功能
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureItem
              icon={<SaveIcon className="w-6 h-6" />}
              title="自动保存"
              description="填写内容自动保存，随时可以中断继续"
            />
            <FeatureItem
              icon={<ExportIcon className="w-6 h-6" />}
              title="多格式导出"
              description="支持导出为 JSON、Markdown 等格式"
            />
            <FeatureItem
              icon={<PreviewIcon className="w-6 h-6" />}
              title="预览打印"
              description="预览填写内容并支持打印输出"
            />
            <FeatureItem
              icon={<LockIcon className="w-6 h-6" />}
              title="隐私保护"
              description="敏感信息加密显示，本地存储"
            />
          </div>
        </section>
      </div>
    </div>
  );
};

/**
 * Mode selection card component
 */
interface ModeCardProps {
  mode: AppMode;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  onSelect: () => void;
  recommended?: boolean;
}

const ModeCard: React.FC<ModeCardProps> = ({
  mode,
  title,
  subtitle,
  description,
  icon,
  features,
  onSelect,
  recommended = false,
}) => {
  return (
    <div
      className={`
        relative bg-white rounded-xl shadow-md border-2 p-6
        hover:shadow-lg hover:border-blue-300 transition-all duration-200
        ${recommended ? 'border-blue-200' : 'border-gray-100'}
      `}
      role="article"
      aria-label={`${title} - ${subtitle}`}
    >
      {recommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
            推荐
          </span>
        </div>
      )}
      
      <div className="text-center mb-4">
        <div className={`
          inline-flex items-center justify-center w-16 h-16 rounded-full mb-4
          ${mode === 'guided' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}
        `}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
      
      <p className="text-gray-600 text-sm mb-4 text-center">
        {description}
      </p>
      
      <ul className="space-y-2 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-sm text-gray-600">
            <CheckIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
      
      <button
        type="button"
        onClick={onSelect}
        className={`
          w-full py-3 px-4 rounded-lg font-medium transition-colors
          focus:outline-none focus:ring-2 focus:ring-offset-2
          ${mode === 'guided' 
            ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500' 
            : 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500'
          }
        `}
        aria-label={`选择${title}`}
      >
        选择{title}
      </button>
    </div>
  );
};

/**
 * Feature item component
 */
interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, description }) => {
  return (
    <div className="text-center p-4">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3 text-gray-600">
        {icon}
      </div>
      <h4 className="font-medium text-gray-900 mb-1">{title}</h4>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
};

// ============================================================================
// Icons
// ============================================================================

const ChecklistIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const ContinueIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const GuidedModeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const FreeModeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const SaveIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
);

const ExportIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const PreviewIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

export default WelcomePage;
