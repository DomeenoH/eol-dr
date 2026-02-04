/**
 * SectionView Component
 * Displays a Section with all its Categories, navigation buttons for guided mode,
 * and section completion summary.
 * 
 * Requirements: 1.4, 2.2, 2.5
 * 
 * Features:
 * - Display section name and description
 * - Render all categories using CategoryForm
 * - In guided mode, show "Next" and "Skip" buttons
 * - Show section completion summary when all categories are done
 * - Accessible and styled with Tailwind CSS
 */

import React, { useCallback, useMemo, useId } from 'react';
import type { Section } from '../types/checklist-structure';
import type { SectionData, CategoryData } from '../types/checklist-data';
import type { SectionProgress } from '../types/progress';
import { CategoryForm } from './CategoryForm';

/**
 * SectionView component props
 */
export interface SectionViewProps {
  /** Section definition containing all category configurations */
  section: Section;
  /** Current data for the section */
  data: SectionData;
  /** Callback when category data changes */
  onDataChange: (categoryId: string, data: CategoryData) => void;
  /** Current application mode */
  mode: 'guided' | 'free';
  /** Callback for "Next" button in guided mode */
  onNext?: () => void;
  /** Callback for "Skip" button in guided mode */
  onSkip?: () => void;
  /** Progress data for the section (optional, for completion summary) */
  progress?: SectionProgress;
  /** Custom class name */
  className?: string;
  /** Whether the form is disabled */
  disabled?: boolean;
  /** Current category ID being viewed in guided mode */
  currentCategoryId?: string;
  /** Callback to navigate to next section */
  onNextSection?: () => void;
}

/**
 * Check icon for completed items
 */
const CheckIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    className={`w-5 h-5 ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

/**
 * Arrow right icon for navigation
 */
const ArrowRightIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    className={`w-5 h-5 ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 7l5 5m0 0l-5 5m5-5H6"
    />
  </svg>
);

/**
 * Skip icon for skip button
 */
const SkipIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    className={`w-5 h-5 ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 5l7 7-7 7M5 5l7 7-7 7"
    />
  </svg>
);

/**
 * Trophy icon for completion
 */
const TrophyIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    className={`w-12 h-12 ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
    />
  </svg>
);

/**
 * Calculate if section is complete based on progress data
 */
const isSectionComplete = (progress?: SectionProgress): boolean => {
  if (!progress) return false;
  return progress.status === 'completed';
};

/**
 * Get completion statistics for the section
 */
const getCompletionStats = (progress?: SectionProgress): { completed: number; total: number } => {
  if (!progress || !progress.categories) {
    return { completed: 0, total: 0 };
  }
  
  const categories = Object.values(progress.categories);
  const total = categories.length;
  const completed = categories.filter(c => c.status === 'completed').length;
  
  return { completed, total };
};

/**
 * Section completion summary component
 */
const SectionCompletionSummary: React.FC<{
  section: Section;
  progress?: SectionProgress;
  onNextSection?: () => void;
}> = ({ section, progress, onNextSection }) => {
  const stats = getCompletionStats(progress);
  
  return (
    <div
      className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-8 text-center"
      data-testid="section-completion-summary"
      role="status"
      aria-live="polite"
    >
      <div className="flex justify-center mb-4">
        <div className="bg-green-100 rounded-full p-4">
          <TrophyIcon className="text-green-600" />
        </div>
      </div>
      
      <h3
        className="text-xl font-bold text-green-800 mb-2"
        data-testid="completion-title"
      >
        🎉 {section.name} 已完成！
      </h3>
      
      <p
        className="text-green-700 mb-4"
        data-testid="completion-message"
      >
        您已完成此部分的所有 {stats.total} 个分类。
      </p>
      
      <div
        className="flex flex-wrap justify-center gap-2 mb-6"
        data-testid="completion-categories"
      >
        {section.categories.map((category) => (
          <span
            key={category.id}
            className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
          >
            <CheckIcon className="w-4 h-4" />
            {category.name}
          </span>
        ))}
      </div>
      
      {onNextSection && (
        <button
          type="button"
          onClick={onNextSection}
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          data-testid="next-section-button"
        >
          进入下一部分
          <ArrowRightIcon />
        </button>
      )}
    </div>
  );
};

/**
 * Navigation buttons for guided mode
 * Validates: Requirements 1.4, 2.2
 */
const GuidedModeNavigation: React.FC<{
  onNext?: () => void;
  onSkip?: () => void;
  disabled?: boolean;
  isLastCategory?: boolean;
}> = ({ onNext, onSkip, disabled = false, isLastCategory = false }) => {
  return (
    <div
      className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t border-gray-200"
      data-testid="guided-mode-navigation"
      role="navigation"
      aria-label="表单导航"
    >
      {/* Skip button - Validates: Requirement 1.4 */}
      {onSkip && (
        <button
          type="button"
          onClick={onSkip}
          disabled={disabled}
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="skip-button"
          aria-label="跳过此部分"
        >
          <SkipIcon />
          跳过此部分
        </button>
      )}
      
      {/* Spacer when no skip button */}
      {!onSkip && <div />}
      
      {/* Next button - Validates: Requirement 2.2 */}
      {onNext && (
        <button
          type="button"
          onClick={onNext}
          disabled={disabled}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="next-button"
          aria-label={isLastCategory ? "完成此部分" : "下一步"}
        >
          {isLastCategory ? '完成此部分' : '下一步'}
          <ArrowRightIcon />
        </button>
      )}
    </div>
  );
};

/**
 * SectionView component
 * Renders a complete section view with all categories and navigation
 */
export const SectionView: React.FC<SectionViewProps> = ({
  section,
  data,
  onDataChange,
  mode,
  onNext,
  onSkip,
  progress,
  className = '',
  disabled = false,
  currentCategoryId,
  onNextSection,
}) => {
  // Generate unique ID for accessibility
  const uniqueId = useId();
  const sectionId = `section-${section.id}-${uniqueId}`;
  const descriptionId = `section-description-${section.id}-${uniqueId}`;

  // Check if section is complete
  const isComplete = useMemo(() => isSectionComplete(progress), [progress]);

  // Get category data helper
  const getCategoryData = useCallback(
    (categoryId: string): CategoryData => {
      return data?.categories?.[categoryId] ?? { items: {} };
    },
    [data]
  );

  // Handle category data change
  const handleCategoryChange = useCallback(
    (categoryId: string, categoryData: CategoryData) => {
      onDataChange(categoryId, categoryData);
    },
    [onDataChange]
  );

  // Determine if current category is the last one in the section
  const isLastCategory = useMemo(() => {
    if (!currentCategoryId || section.categories.length === 0) return false;
    const lastCategory = section.categories[section.categories.length - 1];
    return lastCategory.id === currentCategoryId;
  }, [currentCategoryId, section.categories]);

  // In guided mode, only show the current category
  const categoriesToRender = useMemo(() => {
    if (mode === 'guided' && currentCategoryId) {
      const currentCategory = section.categories.find(c => c.id === currentCategoryId);
      return currentCategory ? [currentCategory] : section.categories;
    }
    return section.categories;
  }, [mode, currentCategoryId, section.categories]);

  // Show completion summary if section is complete
  if (isComplete) {
    return (
      <div
        className={`space-y-6 ${className}`}
        data-testid="section-view"
        data-section-id={section.id}
        data-mode={mode}
      >
        {/* Section Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
            <h1
              id={sectionId}
              className="text-2xl font-bold text-gray-900 flex items-center gap-2"
              data-testid="section-name"
            >
              <CheckIcon className="text-green-600" />
              {section.name}
            </h1>
            {section.description && (
              <p
                id={descriptionId}
                className="mt-2 text-gray-600"
                data-testid="section-description"
              >
                {section.description}
              </p>
            )}
          </div>
        </div>

        {/* Completion Summary - Validates: Requirement 2.5 */}
        <SectionCompletionSummary
          section={section}
          progress={progress}
          onNextSection={onNextSection}
        />
      </div>
    );
  }

  return (
    <div
      className={`space-y-6 ${className}`}
      data-testid="section-view"
      data-section-id={section.id}
      data-mode={mode}
      role="region"
      aria-labelledby={sectionId}
    >
      {/* Section Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <h1
            id={sectionId}
            className="text-2xl font-bold text-gray-900"
            data-testid="section-name"
          >
            {section.name}
          </h1>
          {section.description && (
            <p
              id={descriptionId}
              className="mt-2 text-gray-600"
              data-testid="section-description"
            >
              {section.description}
            </p>
          )}
          
          {/* Progress indicator */}
          {progress && (
            <div
              className="mt-4 flex items-center gap-3"
              data-testid="section-progress"
            >
              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress.progress}%` }}
                  role="progressbar"
                  aria-valuenow={progress.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${section.name} 完成进度`}
                />
              </div>
              <span className="text-sm font-medium text-gray-600">
                {progress.progress}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Categories */}
      <div
        className="space-y-6"
        data-testid="section-categories"
        aria-describedby={section.description ? descriptionId : undefined}
      >
        {categoriesToRender.length === 0 ? (
          <div
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center"
            data-testid="section-empty"
          >
            <p className="text-gray-500">此部分暂无可填写的分类</p>
          </div>
        ) : (
          categoriesToRender.map((category) => (
            <CategoryForm
              key={category.id}
              category={category}
              data={getCategoryData(category.id)}
              onChange={(categoryData) => handleCategoryChange(category.id, categoryData)}
              disabled={disabled}
            />
          ))
        )}
      </div>

      {/* Guided Mode Navigation - Validates: Requirements 1.4, 2.2 */}
      {mode === 'guided' && (onNext || onSkip) && (
        <GuidedModeNavigation
          onNext={onNext}
          onSkip={onSkip}
          disabled={disabled}
          isLastCategory={isLastCategory}
        />
      )}
    </div>
  );
};

export default SectionView;
