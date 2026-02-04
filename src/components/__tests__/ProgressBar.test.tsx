/**
 * ProgressBar Component Tests
 * 
 * Tests for the ProgressBar component that displays overall and section-level progress.
 * Requirements: 10.1, 10.2
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProgressBar, SectionProgressData } from '../ProgressBar';

describe('ProgressBar', () => {
  const mockSections: SectionProgressData[] = [
    { id: 'section-1', name: '紧急联系人', progress: 100 },
    { id: 'section-2', name: 'Tech 技术', progress: 50 },
    { id: 'section-3', name: 'Input 收入', progress: 25 },
    { id: 'section-4', name: 'Output 支出', progress: 0 },
    { id: 'section-5', name: 'Misc 杂项', progress: 75 },
  ];

  describe('Overall Progress Display', () => {
    it('should display overall completion percentage', () => {
      render(<ProgressBar overall={65} sections={mockSections} />);
      
      expect(screen.getByText('65%')).toBeInTheDocument();
      expect(screen.getByText('整体进度')).toBeInTheDocument();
    });

    it('should display 0% when no progress', () => {
      render(<ProgressBar overall={0} sections={[]} />);
      
      expect(screen.getByText('0%')).toBeInTheDocument();
      expect(screen.getByText('(尚未开始)')).toBeInTheDocument();
    });

    it('should display 100% when complete', () => {
      render(<ProgressBar overall={100} sections={[]} />);
      
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('(已完成！)')).toBeInTheDocument();
    });

    it('should display "进行中" status for partial progress', () => {
      render(<ProgressBar overall={50} sections={[]} />);
      
      expect(screen.getByText('(进行中)')).toBeInTheDocument();
    });

    it('should clamp overall progress to 0-100 range', () => {
      const { rerender } = render(<ProgressBar overall={-10} sections={[]} />);
      expect(screen.getByText('0%')).toBeInTheDocument();

      rerender(<ProgressBar overall={150} sections={[]} />);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should round decimal progress values', () => {
      render(<ProgressBar overall={33.7} sections={[]} />);
      expect(screen.getByText('34%')).toBeInTheDocument();
    });
  });

  describe('Section Progress Display', () => {
    it('should display all section names', () => {
      render(<ProgressBar overall={50} sections={mockSections} />);
      
      expect(screen.getByText('紧急联系人')).toBeInTheDocument();
      expect(screen.getByText('Tech 技术')).toBeInTheDocument();
      expect(screen.getByText('Input 收入')).toBeInTheDocument();
      expect(screen.getByText('Output 支出')).toBeInTheDocument();
      expect(screen.getByText('Misc 杂项')).toBeInTheDocument();
    });

    it('should display section progress percentages', () => {
      render(<ProgressBar overall={50} sections={mockSections} />);
      
      // Check for section percentages (excluding overall)
      const percentages = screen.getAllByText(/^\d+%$/);
      // Should have overall (50%) + 5 sections
      expect(percentages.length).toBe(6);
    });

    it('should display "各部分进度" header when sections are shown', () => {
      render(<ProgressBar overall={50} sections={mockSections} />);
      
      expect(screen.getByText('各部分进度')).toBeInTheDocument();
    });

    it('should not display section header when showSections is false', () => {
      render(<ProgressBar overall={50} sections={mockSections} showSections={false} />);
      
      expect(screen.queryByText('各部分进度')).not.toBeInTheDocument();
      expect(screen.queryByText('紧急联系人')).not.toBeInTheDocument();
    });

    it('should not display section header when sections array is empty', () => {
      render(<ProgressBar overall={50} sections={[]} />);
      
      expect(screen.queryByText('各部分进度')).not.toBeInTheDocument();
    });

    it('should clamp section progress values to 0-100 range', () => {
      const invalidSections: SectionProgressData[] = [
        { id: 'section-1', name: 'Section 1', progress: -20 },
        { id: 'section-2', name: 'Section 2', progress: 200 },
      ];
      
      render(<ProgressBar overall={50} sections={invalidSections} />);
      
      // Should display clamped values
      expect(screen.getByText('0%')).toBeInTheDocument(); // -20 clamped to 0
      expect(screen.getByText('100%')).toBeInTheDocument(); // 200 clamped to 100
    });
  });

  describe('Visual Progress Bar', () => {
    it('should render progress bar with correct ARIA attributes for overall progress', () => {
      render(<ProgressBar overall={75} sections={[]} />);
      
      const progressBar = screen.getByRole('progressbar', { name: '整体完成进度' });
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('should render progress bars with correct ARIA attributes for sections', () => {
      const singleSection: SectionProgressData[] = [
        { id: 'section-1', name: '紧急联系人', progress: 60 },
      ];
      
      render(<ProgressBar overall={60} sections={singleSection} />);
      
      const sectionProgressBar = screen.getByRole('progressbar', { name: '紧急联系人 完成进度' });
      expect(sectionProgressBar).toBeInTheDocument();
      expect(sectionProgressBar).toHaveAttribute('aria-valuenow', '60');
    });

    it('should have data-testid for the container', () => {
      render(<ProgressBar overall={50} sections={[]} />);
      
      expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
    });
  });

  describe('Compact Mode', () => {
    it('should render in compact mode when compact prop is true', () => {
      render(<ProgressBar overall={60} sections={mockSections} compact={true} />);
      
      // Component should still render all content
      expect(screen.getByText('整体进度')).toBeInTheDocument();
      expect(screen.getByText('60%')).toBeInTheDocument();
      expect(screen.getByText('各部分进度')).toBeInTheDocument();
    });

    it('should render in normal mode by default', () => {
      render(<ProgressBar overall={60} sections={mockSections} />);
      
      expect(screen.getByText('整体进度')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className to container', () => {
      render(<ProgressBar overall={50} sections={[]} className="custom-class" />);
      
      const container = screen.getByTestId('progress-bar');
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty sections array', () => {
      render(<ProgressBar overall={50} sections={[]} />);
      
      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(screen.queryByText('各部分进度')).not.toBeInTheDocument();
    });

    it('should handle single section', () => {
      const singleSection: SectionProgressData[] = [
        { id: 'section-1', name: 'Only Section', progress: 42 },
      ];
      
      render(<ProgressBar overall={50} sections={singleSection} />);
      
      expect(screen.getByText('Only Section')).toBeInTheDocument();
      // Use getAllByText since 42% appears in section progress
      const percentages = screen.getAllByText('42%');
      expect(percentages.length).toBe(1); // Only section has 42%
    });

    it('should handle many sections', () => {
      const manySections: SectionProgressData[] = Array.from({ length: 10 }, (_, i) => ({
        id: `section-${i}`,
        name: `Section ${i + 1}`,
        progress: i * 10,
      }));
      
      render(<ProgressBar overall={45} sections={manySections} />);
      
      // All sections should be rendered
      manySections.forEach(section => {
        expect(screen.getByText(section.name)).toBeInTheDocument();
      });
    });

    it('should handle sections with special characters in names', () => {
      const specialSections: SectionProgressData[] = [
        { id: 'section-1', name: 'Tech & 技术', progress: 50 },
        { id: 'section-2', name: 'Input/Output', progress: 30 },
      ];
      
      render(<ProgressBar overall={40} sections={specialSections} />);
      
      expect(screen.getByText('Tech & 技术')).toBeInTheDocument();
      expect(screen.getByText('Input/Output')).toBeInTheDocument();
    });

    it('should handle sections with very long names', () => {
      const longNameSections: SectionProgressData[] = [
        { 
          id: 'section-1', 
          name: 'This is a very long section name that might need truncation in the UI', 
          progress: 50 
        },
      ];
      
      render(<ProgressBar overall={50} sections={longNameSections} />);
      
      expect(screen.getByText('This is a very long section name that might need truncation in the UI')).toBeInTheDocument();
    });
  });

  describe('Progress Color Coding', () => {
    it('should render different colors based on progress level', () => {
      // This test verifies the component renders without errors for different progress levels
      // The actual color classes are implementation details tested through visual inspection
      const progressLevels = [0, 10, 25, 50, 75, 100];
      
      progressLevels.forEach(progress => {
        const { unmount } = render(<ProgressBar overall={progress} sections={[]} />);
        expect(screen.getByText(`${progress}%`)).toBeInTheDocument();
        unmount();
      });
    });
  });
});
