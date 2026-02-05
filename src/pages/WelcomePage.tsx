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
import { Typography, GlassCard, PageContainer } from '../components/DesignSystem';
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
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
      setCurrentCategory({ sectionId: 'emergency-contacts', categoryId: 'contact-list' });
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
    <div className={`min-h-screen bg-[var(--bg-primary)] dark:bg-card-gradient transition-colors duration-300 ${className}`}>
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <ThemeSwitcher />
        <LanguageSwitcher />
      </div>
      <PageContainer className="max-w-5xl mx-auto px-4 py-12 sm:py-16 lg:py-20">
        {/* Header Section */}
        <header className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/10 rounded-2xl mb-6 ring-1 ring-white/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <ChecklistIcon className="w-10 h-10 text-blue-400" />
          </div>
          <Typography.h1 className="mb-2">
            家庭应急响应清单
          </Typography.h1>
          <Typography.h3 className="text-[var(--text-secondary)] font-normal">
            End-of-life Disaster Response Checklist
          </Typography.h3>
          <Typography.body className="max-w-xl mx-auto mt-4 text-[var(--text-muted)]">
            一份给家人的终极交接指南。当不可抗力发生时，确保您的数字资产、财务信息与生活设施能被妥善照料与接管。
          </Typography.body>
        </header>

        {/* Continue from Last Session Card */}
        {savedDataInfo.hasSavedData && (
          <div className="mb-12">
            <GlassCard 
              className="max-w-2xl mx-auto transform transition-all duration-300 hover:scale-[1.02]"
              hoverEffect={true}
              role="region"
              aria-label="继续上次填写"
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <ContinueIcon className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <Typography.h2 className="mb-2 flex items-center gap-2">
                    继续上次填写
                    <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/20">
                      上次访问: {savedDataInfo.lastVisited ? formatLastVisited(savedDataInfo.lastVisited) : 'Unknown'}
                    </span>
                  </Typography.h2>
                  
                  {/* Progress bar */}
                  <div className="mt-4 mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[var(--text-muted)]">完成进度</span>
                      <span className="text-blue-500 font-medium">{Math.round(savedDataInfo.progress)}%</span>
                    </div>
                    <div className="w-full bg-[var(--bg-surface)] rounded-full h-2 overflow-hidden border border-[var(--border-subtle)]">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                        style={{ width: `${savedDataInfo.progress}%` }}
                        role="progressbar"
                        aria-valuenow={savedDataInfo.progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleModeSelect(state.progressState.mode, true)}
                    className="mt-4 inline-flex items-center px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg shadow-lg shadow-blue-900/40 transition-all duration-200 hover:-translate-y-0.5"
                    aria-label="继续上次填写"
                  >
                    <ContinueIcon className="w-4 h-4 mr-2" />
                    继续填写
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Mode Selection Section */}
        <section aria-labelledby="mode-selection-title">
          <Typography.h2 
            id="mode-selection-title" 
            className="text-center mb-8 !text-[var(--text-primary)]"
          >
            {savedDataInfo.hasSavedData ? '或者重新开始' : '选择填写模式'}
          </Typography.h2>
          
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 cursor-default">
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
        <section className="mt-16 text-center" aria-labelledby="info-title">
          <h3 id="info-title" className="sr-only">关于数据安全</h3>
          <div className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-4 py-2 rounded-full backdrop-blur-sm">
            <LockIcon className="w-4 h-4 text-emerald-400" />
            <span>您的数据仅保存在本地浏览器中，不会上传到任何服务器</span>
          </div>
        </section>

        {/* Features Overview */}
        <section className="mt-20" aria-labelledby="features-title">
          <Typography.h3 id="features-title" className="text-center mb-10 !text-[var(--text-secondary)]">
            主要功能
          </Typography.h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureItem
              icon={<SaveIcon className="w-6 h-6" />}
              title="本地存储"
              description="数据加密存储于本地浏览器，完全由您掌控写入时机"
            />
            <FeatureItem
              icon={<ExportIcon className="w-6 h-6" />}
              title="自由导出"
              description="支持一键导出 JSON 或 Markdown，数据归权于您，随时迁移"
            />
            <FeatureItem
              icon={<PreviewIcon className="w-6 h-6" />}
              title="所见即所得"
              description="优雅的排版预览，支持一键生成 PDF 或纸质打印备份"
            />
            <FeatureItem
              icon={<LockIcon className="w-6 h-6" />}
              title="离线隐私"
              description="零服务器交互，零数据上传。拔掉网线也能正常使用，绝对安全"
            />
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-20 text-center text-[var(--text-muted)] text-sm pb-8">
          <p>
            源自开源项目 <a href="https://github.com/potatoqualitee/eol-dr" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors border-b border-blue-400/30 hover:border-blue-300">EOL DR</a>
          </p>
        </footer>
      </PageContainer>
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
  const isGuided = mode === 'guided';
  
  return (
    <GlassCard 
      onClick={onSelect}
      className={`
        h-full flex flex-col items-center text-center !p-8
        ${recommended ? 'ring-2 ring-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)] bg-[var(--bg-surface)]' : 'bg-[var(--bg-surface)]'}
      `}
      role="article"
      aria-label={`${title} - ${subtitle}`}
    >
      {recommended && (
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full shadow-lg shadow-blue-900/50">
            推荐
          </span>
        </div>
      )}
      
      <div className={`
        inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-inner
        ${isGuided ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}
      `}>
        {icon}
      </div>
      
      <Typography.h3 className="mb-1 text-[var(--text-primary)]">{title}</Typography.h3>
      <p className="text-sm text-[var(--text-muted)] mb-6 font-medium uppercase tracking-wider">{subtitle}</p>
      
      <Typography.body className="mb-8 flex-grow opacity-80">
        {description}
      </Typography.body>
      
      <ul className="space-y-3 mb-8 w-full text-left bg-[var(--bg-card)] p-4 rounded-xl">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-sm text-[var(--text-secondary)]">
            <CheckIcon className="w-4 h-4 text-emerald-500 mr-3 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
      
      <button
        type="button"
        className={`
          w-full py-3 px-4 rounded-lg font-medium transition-all duration-300
          shadow-lg hover:shadow-xl hover:-translate-y-0.5
          ${isGuided 
            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 shadow-blue-500/20 hover:shadow-blue-500/30' 
            : 'bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-500 hover:to-purple-400 shadow-purple-500/20 hover:shadow-purple-500/30'
          }
        `}
        aria-label={`选择${title}`}
      >
        选择{title}
      </button>
    </GlassCard>
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
    <GlassCard className="text-center !p-6 !bg-[var(--bg-surface)] hover:!bg-[var(--bg-card)] transition-colors" hoverEffect={true}>
      <div className="inline-flex items-center justify-center w-12 h-12 bg-[var(--bg-card)] rounded-xl mb-4 text-[var(--text-secondary)] ring-1 ring-[var(--border-subtle)]">
        {icon}
      </div>
      <h4 className="font-semibold text-[var(--text-primary)] mb-2">{title}</h4>
      <p className="text-sm text-[var(--text-muted)] leading-relaxed">{description}</p>
    </GlassCard>
  );
};

// ============================================================================
// Icons (Updated with currentColor compatible logic)
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
