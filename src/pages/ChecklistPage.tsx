/**
 * ChecklistPage Component
 * Main page with bidirectional scroll sync between navigation and content
 */

import React, { useEffect, useCallback, useMemo, useState, useRef } from 'react';
import { useChecklist, useSaveStatus } from '../context/ChecklistContext';
import { useChecklistStructure } from '../hooks/useChecklistStructure';
import { Layout } from '../components/Layout';
import { Navigation } from '../components/Navigation';
import { CategoryForm } from '../components/CategoryForm';
import { SaveStatus, SaveStatusBadge, SaveButton } from '../components/SaveStatus';
import { ZenModeView } from '../components/ZenModeView';

import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import { Typography, GlassCard, PageContainer, Section as PageSection } from '../components/DesignSystem';
import type { Section, Category } from '../types/checklist-structure';
import type { CategoryData } from '../types/checklist-data';


export interface ChecklistPageProps {
  onBack?: () => void;
  onComplete?: () => void;
  onPreview?: () => void;
  className?: string;
}



export const ChecklistPage: React.FC<ChecklistPageProps> = ({
  onBack,
  onComplete,
  onPreview,
  className = '',
}) => {
  const {
    state,
    updateItem,
    setMode,
    setCurrentCategory,
    goToNextCategory,
    saveAll,
    isCategoryDirty,
  } = useChecklist();
  
  const { status: saveStatus, lastSaved, error: saveError, hasPendingChanges, pendingCount } = useSaveStatus();
  const { structure } = useChecklistStructure();
  const { currentPosition, mode } = state.progressState;
  
  // Prevent accidental navigation when there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasPendingChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasPendingChanges]);
  
  // Refs for scroll sync
  const categoryRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const isScrollingFromClick = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  
  // Track visible category from scroll
  const [visibleCategoryPath, setVisibleCategoryPath] = useState<string>('');
  
  // Current path for navigation highlight
  const currentPath = useMemo(() => {
    // Use visible category if scrolling, otherwise use state position
    if (visibleCategoryPath && !isScrollingFromClick.current) {
      return visibleCategoryPath;
    }
    return `${currentPosition.sectionId}/${currentPosition.categoryId}`;
  }, [currentPosition, visibleCategoryPath]);

  // Scroll detection - update navigation highlight based on visible category
  useEffect(() => {
    if (mode === 'guided') return;
    
    const handleScroll = () => {
      if (isScrollingFromClick.current) return;
      
      const headerHeight = 56; // Fixed header height
      const viewportTop = window.scrollY + headerHeight + 100; // Add some offset
      
      let closestCategory = '';
      let closestDistance = Infinity;
      
      categoryRefs.current.forEach((element, path) => {
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + window.scrollY;
        const distance = Math.abs(elementTop - viewportTop);
        
        if (distance < closestDistance && rect.top < window.innerHeight / 2) {
          closestDistance = distance;
          closestCategory = path;
        }
      });
      
      if (closestCategory && closestCategory !== visibleCategoryPath) {
        setVisibleCategoryPath(closestCategory);
        // Update context position
        const parts = closestCategory.split('/');
        const sectionId = parts[0];
        const categoryId = parts[1];
        if (sectionId && categoryId) {
          setCurrentCategory({ sectionId, categoryId });
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mode, visibleCategoryPath, setCurrentCategory]);

  // Handle navigation click - scroll to category
  const handleNavigate = useCallback((path: string) => {
    const element = categoryRefs.current.get(path);
    if (element) {
      isScrollingFromClick.current = true;
      
      const headerHeight = 56;
      const elementTop = element.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
      
      window.scrollTo({
        top: elementTop,
        behavior: 'smooth'
      });
      
      // Reset flag after scroll completes
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingFromClick.current = false;
      }, 1000);
    }
    
    const [sectionId, categoryId] = path.split('/');
    if (sectionId && categoryId) {
      setCurrentCategory({ sectionId, categoryId });
      setVisibleCategoryPath(path);
    }
  }, [setCurrentCategory]);

  // Register category ref
  const setCategoryRef = useCallback((path: string, element: HTMLDivElement | null) => {
    if (element) {
      categoryRefs.current.set(path, element);
    } else {
      categoryRefs.current.delete(path);
    }
  }, []);

  // Handle data change for a specific section/category
  const handleDataChange = useCallback((sectionId: string, categoryId: string, data: CategoryData) => {
    const currentCategoryData = state.checklistData.sections?.[sectionId]?.categories?.[categoryId];
    
    Object.entries(data.items).forEach(([itemId, value]) => {
      const currentValue = currentCategoryData?.items?.[itemId];
      if (JSON.stringify(currentValue) !== JSON.stringify(value)) {
        updateItem(sectionId, categoryId, itemId, value);
      }
    });
  }, [state.checklistData.sections, updateItem]);

  // Get category data
  const getCategoryData = useCallback((sectionId: string, categoryId: string): CategoryData => {
    return state.checklistData.sections?.[sectionId]?.categories?.[categoryId] ?? { items: {} };
  }, [state.checklistData.sections]);

  // Guided mode handlers
  const currentSection = useMemo((): Section | null => {
    if (!currentPosition.sectionId) return structure.sections[0] || null;
    return structure.sections.find(s => s.id === currentPosition.sectionId) 
      || structure.sections[0] || null;
  }, [structure.sections, currentPosition.sectionId]);

  const currentCategory = useMemo((): Category | null => {
    if (!currentSection) return null;
    if (!currentPosition.categoryId) {
      return currentSection.categories[0] || null;
    }
    return currentSection.categories.find(c => c.id === currentPosition.categoryId) 
      || currentSection.categories[0] || null;
  }, [currentSection, currentPosition.categoryId]);

  const currentCategoryData = useMemo((): CategoryData => {
    if (!currentSection || !currentCategory) return { items: {} };
    return getCategoryData(currentSection.id, currentCategory.id);
  }, [currentSection, currentCategory, getCategoryData]);

  const handleNext = useCallback(() => {
    const hasNext = goToNextCategory();
    if (!hasNext && onComplete) onComplete();
  }, [goToNextCategory, onComplete]);

  const handleModeToggle = useCallback(() => {
    setMode(mode === 'guided' ? 'free' : 'guided');
  }, [mode, setMode]);

  const handleExitZenMode = useCallback(() => {
    setMode('free');
  }, [setMode]);

  const isAllComplete = state.progressState.overall === 100;

  // Zen Mode (Guided Mode)
  if (mode === 'guided' && currentSection && currentCategory) {
    // Header content for zen mode (synced with free mode)
    const zenHeaderContent = (
      <>
        <LanguageSwitcher className="hidden sm:block" />
        <SaveStatusBadge status={saveStatus} lastSaved={lastSaved} errorMessage={saveError} className="hidden sm:flex" />
        <SaveStatus status={saveStatus} lastSaved={lastSaved} compact className="sm:hidden" />
        <SaveButton 
          onSave={saveAll} 
          pendingCount={pendingCount} 
          status={saveStatus}
          className="hidden sm:flex"
        />
      </>
    );

    return (
      <ZenModeView
        sections={structure.sections}
        currentSection={currentSection}
        currentCategory={currentCategory}
        categoryData={currentCategoryData}
        onDataChange={(catId, data) => handleDataChange(currentSection.id, catId, data)}
        onNext={handleNext}
        onExitZenMode={handleExitZenMode}
        onComplete={onComplete}
        headerContent={zenHeaderContent}
        className={className}
      />
    );
  }

  // Free Mode - Show all sections and categories
  const headerContent = (
    <div className="flex items-center justify-between w-full h-full">
      {/* Left: Branding & Navigation */}
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="p-2 -ml-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] rounded-full transition-all duration-200"
            aria-label="返回首页"
          >
            <BackIcon className="w-5 h-5" />
          </button>
        )}
        <div className="flex flex-col">
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent transform translate-y-0.5">
            身后事清单
          </h1>
          <span className="text-[10px] text-[var(--text-muted)] font-medium tracking-wider uppercase">Legacy Checklist</span>
        </div>
      </div>
      
      {/* Right: Actions & Tools */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Save Status (Always visible) */}
        <div className="hidden sm:block">
           <SaveStatusBadge status={saveStatus} lastSaved={lastSaved} errorMessage={saveError} />
        </div>

        <div className="h-6 w-px bg-[var(--border-subtle)] hidden sm:block" />

        {/* Primary Actions Group */}
        <div className="flex items-center gap-2">
          {onPreview && (
            <button
              type="button"
              onClick={onPreview}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--primary-600)] bg-[var(--primary-50)] hover:bg-[var(--primary-100)] border border-[var(--primary-200)] rounded-lg transition-all duration-200 hover:-translate-y-0.5"
              title="预览清单"
              aria-label="预览清单"
            >
              <PreviewIcon className="w-4 h-4" />
              <span>预览</span>
            </button>
          )}
          
          <button
            type="button"
            onClick={handleModeToggle}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg transition-all duration-200"
            title="切换到专注模式"
            aria-label="切换到专注模式"
          >
            <ZenModeIcon className="w-4 h-4" />
            <span>专注</span>
          </button>
        </div>

        {/* Settings Group (Collapsed on mobile) */}
        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeSwitcher />
          <LanguageSwitcher className="hidden sm:block" />
          
          {/* Mobile Only Actions Menu Trigger could go here if needed, but keeping it simple for now */}
          <SaveButton 
            onSave={saveAll} 
            pendingCount={pendingCount} 
            status={saveStatus}
            className="sm:hidden"
          />
        </div>
      </div>
    </div>
  );
  
  const sidebarContent = (
    <div className="flex-1 overflow-hidden">
      <Navigation
        sections={structure.sections}
        currentPath={currentPath}
        progress={state.progressState}
        onNavigate={handleNavigate}
      />
    </div>
  );
  
  const footerContent = (
    <div className="flex items-center justify-between">
      <SaveStatus status={saveStatus} lastSaved={lastSaved} errorMessage={saveError} />
      <div className="flex items-center gap-3">
        {/* 移动端操作栏 */}
        <div className="flex sm:hidden items-center gap-2">
           {onPreview && (
            <button
              type="button"
              onClick={onPreview}
              className="p-2 text-[var(--primary-600)] bg-[var(--primary-50)] rounded-lg"
              title="预览"
              aria-label="预览清单"
            >
              <PreviewIcon className="w-5 h-5" />
            </button>
          )}
          <button
            type="button"
            onClick={handleModeToggle}
             className="p-2 text-[var(--text-secondary)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg"
             title="专注模式"
             aria-label="切换到专注模式"
          >
            <ZenModeIcon className="w-5 h-5" />
          </button>
        </div>

        {isAllComplete && onComplete && (
          <button
            type="button"
            onClick={onComplete}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 shadow-lg shadow-emerald-900/40 transition-all duration-200 hover:-translate-y-0.5"
          >
            <CheckIcon className="w-4 h-4" />
            完成并预览
          </button>
        )}
      </div>
    </div>
  );
  
  return (
    <Layout 
      header={headerContent} 
      sidebar={sidebarContent} 
      footer={footerContent} 
      className={className}
      showDefaultActions={false}
    >
      <PageContainer data-testid="checklist-page" className="md:pr-4">
        {/* Render ALL sections and categories */}
        {structure.sections.map(section => (
          <PageSection key={section.id}>
            {/* Section Header */}
            <div 
              id={`section-${section.id}`}
              data-testid="section-view"
              className="glass-card bg-[var(--bg-card)] rounded-xl p-5 border border-[var(--border-subtle)] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-emerald-500/5 opacity-50" />
              <div className="relative z-10">
                <Typography.h2 className="!text-xl mb-1 text-[var(--text-primary)]">{section.name}</Typography.h2>
                {section.description && (
                  <Typography.body className="!text-sm opacity-80 text-[var(--text-secondary)]">{section.description}</Typography.body>
                )}
                {state.progressState.sections?.[section.id] && (
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1 bg-[var(--bg-surface)] rounded-full h-1.5 overflow-hidden border border-[var(--border-subtle)]">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${state.progressState.sections[section.id].progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-blue-400 min-w-[32px] text-right">
                      {state.progressState.sections[section.id].progress}%
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Categories */}
            <div className="space-y-6 lg:pl-4">
              {section.categories.map(category => {
                const path = `${section.id}/${category.id}`;
                const isActive = currentPath === path;
                const isDirty = isCategoryDirty(section.id, category.id);
                
                return (
                  <div
                    key={category.id}
                    ref={(el) => setCategoryRef(path, el)}
                    id={`category-${section.id}-${category.id}`}
                    className={`
                      transition-all duration-300 relative rounded-xl
                      ${isActive 
                        ? 'bg-[var(--bg-surface)] shadow-lg shadow-black/5 ring-1 ring-blue-500/30' 
                        : 'hover:bg-[var(--bg-surface)]'
                      }
                      ${isDirty && !isActive ? 'ring-1 ring-amber-500/50 bg-amber-500/5' : ''}
                    `}
                  >
                    {/* 未保存指示器 */}
                    {isDirty && (
                      <div className="absolute top-4 right-4 z-10">
                        <span 
                          className="flex h-2.5 w-2.5"
                          title="未保存的更改"
                        >
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                        </span>
                      </div>
                    )}
                    <CategoryForm
                      category={category}
                      data={getCategoryData(section.id, category.id)}
                      onChange={(data) => handleDataChange(section.id, category.id, data)}
                    />
                  </div>
                );
              })}
            </div>
          </PageSection>
        ))}
        
        {/* Completion Message */}
        {isAllComplete && (
          <GlassCard className="!bg-gradient-to-br from-emerald-900/20 to-emerald-800/20 !border-emerald-500/30 p-8 text-center mt-12">
            <div className="flex justify-center mb-6">
              <div className="bg-emerald-500/10 rounded-full p-6 ring-1 ring-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <TrophyIcon className="w-12 h-12 text-emerald-400" />
              </div>
            </div>
            <Typography.h2 className="mb-3 flex items-center justify-center gap-2">
              <CelebrationIcon className="w-6 h-6 text-emerald-400" />
              恭喜！您已完成所有部分！
            </Typography.h2>
            <Typography.body className="mb-8 max-w-lg mx-auto">
              您可以预览并导出您的清单，或继续编辑任何部分。
            </Typography.body>
            {onPreview && (
              <button
                type="button"
                onClick={onPreview}
                className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-500 shadow-lg shadow-emerald-900/40 transition-all duration-200 hover:-translate-y-0.5"
              >
                <PreviewIcon className="w-5 h-5" />
                预览清单
              </button>
            )}
          </GlassCard>
        )}
      </PageContainer>
    </Layout>
  );
};

// Icons with updated styling options
const BackIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const ZenModeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const PreviewIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const TrophyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const CelebrationIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default ChecklistPage;
