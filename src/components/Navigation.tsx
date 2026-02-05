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
    completed: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]',
    in_progress: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]',
    not_started: 'bg-[var(--text-muted)]',
  };
  return <span className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-300 ${colors[status]}`} />;
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
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onNavigate(path);
    }
  };
  
  return (
    <button
      ref={itemRef}
      type="button"
      onClick={() => onNavigate(path)}
      onKeyDown={handleKeyDown}
      data-active={isActive}
      className={`
        w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-left transition-all duration-200
        ${isActive 
          ? 'bg-blue-500/20 text-[var(--text-primary)] font-medium border-l-2 border-blue-500' 
          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] hover:pl-4 border-l-2 border-transparent'
        }
      `}
    >
      <StatusDot status={status} />
      <span className="truncate">{category.name}</span>
      {status === 'completed' && (
        <svg className="w-4 h-4 text-emerald-500 ml-auto flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
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
    if (isCurrentSection) {
      setIsExpanded(true);
    }
  }, [isCurrentSection]);
  
  const sectionStatus = sectionProgress?.status ?? 'not_started';
  const progress = sectionProgress?.progress ?? 0;

  const getCategoryStatus = (categoryId: string): ProgressStatus => {
    return sectionProgress?.categories?.[categoryId]?.status ?? 'not_started';
  };

  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        data-active={isCurrentSection}
        className={`
          w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
          ${isCurrentSection 
            ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm ring-1 ring-[var(--border-subtle)]' 
            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'
          }
        `}
      >
        <svg
          className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
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
          text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 font-medium
          ${progress === 100 
            ? 'bg-emerald-500/20 text-emerald-500' 
            : progress > 0 
              ? 'bg-amber-500/20 text-amber-500' 
              : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'
          }
        `}>
          {progress}%
        </span>
      </button>

      {isExpanded && (
        <div className="ml-3 mt-1 space-y-0.5 border-l border-[var(--border-subtle)] pl-2">
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
    <nav ref={containerRef} aria-label="Checklist 导航" className="h-full">
      {/* Overall progress */}
      <div className="px-4 py-4 mb-4 mx-2 mt-2 bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] shadow-lg" data-testid="progress-bar">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-[var(--text-muted)] font-medium">总进度</span>
          <span className={`font-bold ${progress.overall === 100 ? 'text-emerald-500' : 'text-blue-500'}`}>
            {progress.overall}%
          </span>
        </div>
        <div className="w-full bg-[var(--bg-surface)] rounded-full h-1.5 overflow-hidden border border-[var(--border-subtle)]">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              progress.overall === 100 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
            }`}
            style={{ width: `${progress.overall}%` }}
          />
        </div>
        {progress.overall === 100 && (
          <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-medium animate-pulse">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            已完成所有项目！
          </p>
        )}
      </div>

      {/* Section list */}
      <div className="space-y-1 px-2">
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
