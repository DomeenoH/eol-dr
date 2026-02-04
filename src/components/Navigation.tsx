/**
 * Navigation Component
 * Fixed sidebar navigation with auto-scroll to current item
 */

import React, { useState, useEffect, useRef } from 'react';
import type { Section, Category } from '../types/checklist-structure';
import type { ProgressState, ProgressStatus, SectionProgress } from '../types/progress';

export interface NavigationProps {
  sections: Section[];
  currentPath: string;
  progress: ProgressState;
  onNavigate: (path: string) => void;
}

const StatusDot: React.FC<{ status: ProgressStatus }> = ({ status }) => {
  const colors = {
    completed: 'bg-green-500',
    in_progress: 'bg-amber-500',
    not_started: 'bg-gray-300',
  };
  return <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colors[status]}`} />;
};

const CategoryItem: React.FC<{
  category: Category;
  sectionId: string;
  isActive: boolean;
  status: ProgressStatus;
  onNavigate: (path: string) => void;
  itemRef?: React.RefObject<HTMLButtonElement>;
}> = ({ category, sectionId, isActive, status, onNavigate, itemRef }) => {
  const path = `${sectionId}/${category.id}`;
  
  return (
    <button
      ref={itemRef}
      type="button"
      onClick={() => onNavigate(path)}
      className={`
        w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md text-left transition-all
        ${isActive 
          ? 'bg-blue-100 text-blue-700 font-medium border-l-2 border-blue-500 -ml-[2px]' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }
      `}
    >
      <StatusDot status={status} />
      <span className="truncate">{category.name}</span>
      {status === 'completed' && (
        <svg className="w-4 h-4 text-green-500 ml-auto flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
};

const SectionItem: React.FC<{
  section: Section;
  currentPath: string;
  sectionProgress: SectionProgress | undefined;
  onNavigate: (path: string) => void;
  activeItemRef: React.RefObject<HTMLButtonElement>;
}> = ({ section, currentPath, sectionProgress, onNavigate, activeItemRef }) => {
  const isCurrentSection = currentPath.startsWith(`${section.id}/`);
  const [isExpanded, setIsExpanded] = useState(isCurrentSection);
  
  // Auto-expand when this section becomes current
  useEffect(() => {
    if (isCurrentSection && !isExpanded) {
      setIsExpanded(true);
    }
  }, [isCurrentSection]);
  
  const sectionStatus = sectionProgress?.status ?? 'not_started';
  const progress = sectionProgress?.progress ?? 0;

  const getCategoryStatus = (categoryId: string): ProgressStatus => {
    return sectionProgress?.categories?.[categoryId]?.status ?? 'not_started';
  };

  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-md transition-colors
          ${isCurrentSection 
            ? 'bg-blue-50 text-blue-800' 
            : 'text-gray-700 hover:bg-gray-100'
          }
        `}
      >
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        
        <StatusDot status={sectionStatus} />
        <span className="flex-1 text-left truncate">{section.name}</span>
        
        {/* Progress badge */}
        <span className={`
          text-xs px-1.5 py-0.5 rounded-full flex-shrink-0
          ${progress === 100 
            ? 'bg-green-100 text-green-700' 
            : progress > 0 
              ? 'bg-amber-100 text-amber-700' 
              : 'bg-gray-100 text-gray-500'
          }
        `}>
          {progress}%
        </span>
      </button>

      {isExpanded && (
        <div className="ml-4 mt-1 space-y-0.5 border-l border-gray-200 pl-2">
          {section.categories.map(category => {
            const categoryPath = `${section.id}/${category.id}`;
            const isActive = currentPath === categoryPath;
            
            return (
              <CategoryItem
                key={category.id}
                category={category}
                sectionId={section.id}
                isActive={isActive}
                status={getCategoryStatus(category.id)}
                onNavigate={onNavigate}
                itemRef={isActive ? activeItemRef : undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export const Navigation: React.FC<NavigationProps> = ({
  sections,
  currentPath,
  progress,
  onNavigate,
}) => {
  const activeItemRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active item when currentPath changes
  useEffect(() => {
    if (activeItemRef.current && containerRef.current) {
      const container = containerRef.current;
      const item = activeItemRef.current;
      
      // Calculate if item is visible
      const containerRect = container.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();
      
      const isVisible = 
        itemRect.top >= containerRect.top && 
        itemRect.bottom <= containerRect.bottom;
      
      if (!isVisible) {
        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentPath]);

  return (
    <nav ref={containerRef} aria-label="导航" className="h-full">
      {/* Overall progress */}
      <div className="px-3 py-3 mb-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600 font-medium">总进度</span>
          <span className={`font-bold ${progress.overall === 100 ? 'text-green-600' : 'text-blue-600'}`}>
            {progress.overall}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              progress.overall === 100 ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progress.overall}%` }}
          />
        </div>
        {progress.overall === 100 && (
          <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            已完成所有项目！
          </p>
        )}
      </div>

      {/* Section list */}
      <div className="space-y-0.5">
        {sections.map(section => (
          <SectionItem
            key={section.id}
            section={section}
            currentPath={currentPath}
            sectionProgress={progress.sections?.[section.id]}
            onNavigate={onNavigate}
            activeItemRef={activeItemRef}
          />
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
