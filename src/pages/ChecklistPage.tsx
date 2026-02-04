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
import type { Section, Category } from '../types/checklist-structure';
import type { CategoryData } from '../types/checklist-data';
import type { AppMode } from '../types/progress';

export interface ChecklistPageProps {
  onBack?: () => void;
  onComplete?: () => void;
  onPreview?: () => void;
  className?: string;
}

const ModeToggle: React.FC<{ mode: AppMode; onToggle: () => void }> = ({ mode, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
  >
    {mode === 'guided' ? (
      <>
        <ZenModeIcon className="w-4 h-4" />
        <span className="hidden sm:inline">专注模式</span>
      </>
    ) : (
      <>
        <FreeModeIcon className="w-4 h-4" />
        <span className="hidden sm:inline">自由模式</span>
      </>
    )}
  </button>
);

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
    goToPrevCategory,
    saveAll,
    isCategoryDirty,
  } = useChecklist();
  
  const { status: saveStatus, lastSaved, error: saveError, hasPendingChanges, pendingCount } = useSaveStatus();
  const { structure } = useChecklistStructure();
  const { currentPosition, mode } = state.progressState;
  
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

  const handlePrevious = useCallback(() => {
    goToPrevCategory();
  }, [goToPrevCategory]);

  const handleSkip = useCallback(() => {
    goToNextCategory();
  }, [goToNextCategory]);

  const handleModeToggle = useCallback(() => {
    setMode(mode === 'guided' ? 'free' : 'guided');
  }, [mode, setMode]);

  const handleExitZenMode = useCallback(() => {
    setMode('free');
  }, [setMode]);

  const isAllComplete = state.progressState.overall === 100;

  // Zen Mode (Guided Mode)
  if (mode === 'guided' && currentSection && currentCategory) {
    return (
      <ZenModeView
        sections={structure.sections}
        currentSection={currentSection}
        currentCategory={currentCategory}
        categoryData={currentCategoryData}
        onDataChange={(catId, data) => handleDataChange(currentSection.id, catId, data)}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSkip={handleSkip}
        onExitZenMode={handleExitZenMode}
        onComplete={onComplete}
        className={className}
      />
    );
  }

  // Free Mode - Show all sections and categories
  const headerContent = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
          >
            <BackIcon className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-lg font-semibold text-gray-900">身后事清单</h1>
      </div>
      
      <div className="flex items-center gap-3">
        <LanguageSwitcher className="hidden sm:block" />
        <SaveStatusBadge status={saveStatus} lastSaved={lastSaved} errorMessage={saveError} className="hidden sm:flex" />
        <SaveStatus status={saveStatus} lastSaved={lastSaved} compact className="sm:hidden" />
        <SaveButton 
          onSave={saveAll} 
          pendingCount={pendingCount} 
          status={saveStatus}
          className="hidden sm:flex"
        />
        <ModeToggle mode={mode} onToggle={handleModeToggle} />
        {onPreview && (
          <button
            type="button"
            onClick={onPreview}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <PreviewIcon className="w-4 h-4" />
            <span className="hidden sm:inline">预览</span>
          </button>
        )}
      </div>
    </div>
  );
  
  const sidebarContent = (
    <Navigation
      sections={structure.sections}
      currentPath={currentPath}
      progress={state.progressState}
      onNavigate={handleNavigate}
    />
  );
  
  const footerContent = (
    <div className="flex items-center justify-between">
      <SaveStatus status={saveStatus} lastSaved={lastSaved} errorMessage={saveError} />
      <div className="flex items-center gap-3">
        {/* 移动端保存按钮 */}
        {hasPendingChanges && (
          <SaveButton 
            onSave={saveAll} 
            pendingCount={pendingCount} 
            status={saveStatus}
            className="sm:hidden"
          />
        )}
        {isAllComplete && onComplete && (
          <button
            type="button"
            onClick={onComplete}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            <CheckIcon className="w-4 h-4" />
            完成并预览
          </button>
        )}
      </div>
    </div>
  );
  
  return (
    <Layout header={headerContent} sidebar={sidebarContent} footer={footerContent} className={className}>
      <div className="space-y-8" data-testid="checklist-page">
        {/* Render ALL sections and categories */}
        {structure.sections.map(section => (
          <div key={section.id} className="space-y-4">
            {/* Section Header */}
            <div 
              id={`section-${section.id}`}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100"
            >
              <h2 className="text-xl font-bold text-gray-900">{section.name}</h2>
              {section.description && (
                <p className="mt-1 text-gray-600 text-sm">{section.description}</p>
              )}
              {state.progressState.sections?.[section.id] && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 bg-white/50 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${state.progressState.sections[section.id].progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-blue-700">
                    {state.progressState.sections[section.id].progress}%
                  </span>
                </div>
              )}
            </div>
            
            {/* Categories */}
            <div className="space-y-4">
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
                      transition-all duration-200 relative
                      ${isActive ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
                      ${isDirty && !isActive ? 'ring-2 ring-amber-400/60 ring-offset-1' : ''}
                    `}
                  >
                    {/* 未保存指示器 */}
                    {isDirty && (
                      <div className="absolute -top-1 -right-1 z-10">
                        <span 
                          className="flex h-3 w-3"
                          title="未保存的更改"
                        >
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
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
          </div>
        ))}
        
        {/* Completion Message */}
        {isAllComplete && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 rounded-full p-4">
                <TrophyIcon className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">
              <CelebrationIcon className="w-6 h-6 inline mr-2" />恭喜！您已完成所有部分！
            </h2>
            <p className="text-green-700 mb-6">您可以预览并导出您的清单，或继续编辑任何部分。</p>
            {onPreview && (
              <button
                type="button"
                onClick={onPreview}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
              >
                <PreviewIcon className="w-5 h-5" />
                预览清单
              </button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

// Icons
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

const FreeModeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
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
