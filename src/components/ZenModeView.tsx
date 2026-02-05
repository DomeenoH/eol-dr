/**
 * ZenModeView Component
 * 
 * A focused, distraction-free guided mode experience.
 * Shows only the current category with minimal UI elements.
 * 
 * Features:
 * - Full-screen immersive experience
 * - Simple progress indicator (e.g., "2/12")
 * - Clean navigation (Previous/Next/Skip)
 * - No sidebar or navigation menu
 * - Zen-like calm visual design
 */

import React, { useMemo, useId } from 'react';
import type { Section, Category } from '../types/checklist-structure';
import type { CategoryData, ItemValue } from '../types/checklist-data';
import { ItemForm } from './ItemForm';
import { RepeatableItemList } from './RepeatableItemList';

export interface ZenModeViewProps {
  /** All sections in the checklist */
  sections: Section[];
  /** Current section */
  currentSection: Section;
  /** Current category */
  currentCategory: Category;
  /** Data for the current category */
  categoryData: CategoryData;
  /** Callback when category data changes */
  onDataChange: (categoryId: string, data: CategoryData) => void;
  /** Callback for "Next" button */
  onNext: () => void;
  /** Callback to exit zen mode */
  onExitZenMode: () => void;
  /** Callback when all complete */
  onComplete?: () => void;
  /** Header content (language switcher, save status, etc.) */
  headerContent?: React.ReactNode;
  /** Whether form is disabled */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * Calculate the current position and total categories
 */
export const calculatePosition = (
  sections: Section[],
  currentSectionId: string,
  currentCategoryId: string
): { current: number; total: number; sectionIndex: number; categoryIndex: number } => {
  let total = 0;
  let current = 0;
  let sectionIndex = 0;
  let categoryIndex = 0;
  let found = false;

  sections.forEach((section, sIdx) => {
    section.categories.forEach((category, cIdx) => {
      total++;
      if (!found) {
        current++;
        if (section.id === currentSectionId && category.id === currentCategoryId) {
          found = true;
          sectionIndex = sIdx;
          categoryIndex = cIdx;
        }
      }
    });
  });

  return { current, total, sectionIndex, categoryIndex };
};


export const ZenModeView: React.FC<ZenModeViewProps> = ({
  sections,
  currentSection,
  currentCategory,
  categoryData,
  onDataChange,
  onNext,
  onExitZenMode,
  onComplete,
  headerContent,
  disabled = false,
  className = '',
}) => {
  const uniqueId = useId();
  
  // Calculate position
  const position = useMemo(
    () => calculatePosition(sections, currentSection.id, currentCategory.id),
    [sections, currentSection.id, currentCategory.id]
  );
  
  const isLast = position.current === position.total;

  // Handle item value change
  const handleItemChange = (itemId: string, newValue: ItemValue | ItemValue[]) => {
    const newData: CategoryData = {
      ...categoryData,
      items: {
        ...categoryData.items,
        [itemId]: newValue,
      },
    };
    onDataChange(currentCategory.id, newData);
  };

  // Get item value
  const getItemValue = (itemId: string, isRepeatable: boolean): ItemValue | ItemValue[] => {
    const value = categoryData.items[itemId];
    if (isRepeatable) {
      return Array.isArray(value) ? value : [];
    }
    return value ?? '';
  };

  // Handle next/complete
  const handleNext = () => {
    if (isLast && onComplete) {
      onComplete();
    } else {
      onNext();
    }
  };

  // Progress percentage
  const progressPercent = Math.round((position.current / position.total) * 100);

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)] flex flex-col ${className}`}
      data-testid="zen-mode-view"
    >
      {/* Header - synced with free mode */}
      {headerContent ? (
        // Use custom header if provided (Unified UI)
        <header className="fixed top-0 left-0 right-0 h-14 bg-[var(--bg-secondary)]/80 backdrop-blur-md border-b border-[var(--border-subtle)] z-30 shadow-sm px-4">
          {headerContent}
        </header>
      ) : (
        // Default Zen Header (Fallback)
        <header className="fixed top-0 left-0 right-0 h-14 bg-[var(--bg-secondary)]/80 backdrop-blur-md border-b border-[var(--border-subtle)] z-30 shadow-sm px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between h-full"> 
            {/* Left: Exit button + Progress */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={onExitZenMode}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] rounded-lg transition-colors"
                aria-label="退出专注模式"
              >
                <ExitIcon className="w-4 h-4" />
                <span className="hidden sm:inline">退出专注模式</span>
              </button>
              
              {/* Progress Indicator */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[var(--text-secondary)]">
                  {position.current} / {position.total}
                </span>
                <div className="w-20 sm:w-24 h-1.5 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area - Added top padding for fixed header */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 sm:px-6 py-8 sm:py-12 mt-14 overflow-y-auto">
        <div className="w-full max-w-2xl">
          {/* Section Badge */}
          <div className="text-center mb-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {currentSection.name}
            </span>
          </div>

          {/* Category Card */}
          <div className="bg-[var(--bg-card)] backdrop-blur-sm rounded-2xl shadow-lg border border-[var(--border-card)] overflow-hidden">
            {/* Category Header */}
            <div className="px-6 sm:px-8 py-6 border-b border-[var(--border-subtle)]">
              <h1
                id={`category-title-${uniqueId}`}
                className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] text-center"
              >
                {currentCategory.name}
              </h1>
              
              {currentCategory.description && (
                <p className="mt-3 text-[var(--text-secondary)] text-center text-sm sm:text-base">
                  {currentCategory.description}
                </p>
              )}
              
              {currentCategory.helpText && (
                <p className="mt-2 text-xs text-[var(--text-muted)] text-center italic flex items-center justify-center gap-1">
                  <LightbulbIcon className="w-3.5 h-3.5" />{currentCategory.helpText}
                </p>
              )}
            </div>

            {/* Category Items */}
            <div className="px-6 sm:px-8 py-6 space-y-6">
              {currentCategory.items.length === 0 ? (
                <p className="text-center text-[var(--text-muted)] py-8">
                  此分类暂无可填写的项目
                </p>
              ) : (
                currentCategory.items.map((item) => {
                  const isRepeatable = item.repeatable ?? false;
                  const value = getItemValue(item.id, isRepeatable);

                  if (isRepeatable) {
                    return (
                      <RepeatableItemList
                        key={item.id}
                        item={item}
                        values={value as ItemValue[]}
                        onChange={(newValues) => handleItemChange(item.id, newValues)}
                        disabled={disabled}
                      />
                    );
                  }

                  return (
                    <ItemForm
                      key={item.id}
                      item={item}
                      value={value as ItemValue}
                      onChange={(newValue) => handleItemChange(item.id, newValue)}
                      disabled={disabled}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Navigation Footer - Single centered button */}
      <footer className="bg-[var(--bg-secondary)]/80 backdrop-blur-sm border-t border-[var(--border-subtle)] px-4 sm:px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-center">
          <button
            type="button"
            onClick={handleNext}
            disabled={disabled}
            className={`inline-flex items-center gap-2 px-8 py-3 text-base font-medium rounded-xl transition-all disabled:opacity-50 ${
              isLast
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/20'
                : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-lg shadow-blue-500/20'
            }`}
            aria-label={isLast ? '完成' : '下一步'}
          >
            <span>{isLast ? '完成' : '下一步'}</span>
            {isLast ? (
              <CheckIcon className="w-5 h-5" />
            ) : (
              <ChevronRightIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </footer>
    </div>
  );
};

// Icons
const ExitIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);



const ChevronRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const LightbulbIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

export default ZenModeView;
