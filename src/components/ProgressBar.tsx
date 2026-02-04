/**
 * ProgressBar Component
 * Simple progress display
 * 
 * Requirements: 10.1, 10.2
 */

import React from 'react';

export interface SectionProgressData {
  id: string;
  name: string;
  progress: number;
}

export interface ProgressBarProps {
  overall: number;
  sections: SectionProgressData[];
  showSections?: boolean;
  compact?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  overall,
  sections,
  showSections = true,
  compact = false,
  className = '',
}) => {
  const normalizedOverall = Math.max(0, Math.min(100, Math.round(overall)));

  return (
    <div className={className} data-testid="progress-bar">
      {/* Overall Progress */}
      <div className={compact ? 'mb-2' : 'mb-4'}>
        <div className="flex items-center justify-between mb-1">
          <span className={`${compact ? 'text-sm' : 'text-base'} font-medium text-gray-700`}>
            总进度
          </span>
          <span className={`${compact ? 'text-sm' : 'text-lg'} font-bold text-blue-600`}>
            {normalizedOverall}%
          </span>
        </div>
        <div className={`w-full bg-gray-200 rounded-full ${compact ? 'h-2' : 'h-3'}`}>
          <div
            className={`bg-blue-500 ${compact ? 'h-2' : 'h-3'} rounded-full transition-all duration-300`}
            style={{ width: `${normalizedOverall}%` }}
            role="progressbar"
            aria-valuenow={normalizedOverall}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Section Progress */}
      {showSections && sections.length > 0 && (
        <div className="space-y-2">
          {sections.map(section => (
            <div key={section.id} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-20 truncate">{section.name}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-blue-400 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.round(section.progress)}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 w-8 text-right">{Math.round(section.progress)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
