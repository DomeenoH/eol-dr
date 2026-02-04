/**
 * SectionView Component Tests
 * 
 * Tests for the SectionView component that displays a Section with all its
 * Categories, navigation buttons for guided mode, and section completion summary.
 * 
 * Requirements: 1.4, 2.2, 2.5
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SectionView } from '../SectionView';
import type { Section } from '../../types/checklist-structure';
import type { SectionData } from '../../types/checklist-data';
import type { SectionProgress } from '../../types/progress';

describe('SectionView', () => {
  const mockOnDataChange = vi.fn();
  const mockOnNext = vi.fn();
  const mockOnSkip = vi.fn();
  const mockOnNextSection = vi.fn();

  beforeEach(() => {
    mockOnDataChange.mockClear();
    mockOnNext.mockClear();
    mockOnSkip.mockClear();
    mockOnNextSection.mockClear();
  });

  // Basic section with categories
  const basicSection: Section = {
    id: 'tech',
    name: 'Tech 技术',
    description: '技术相关的账户和服务信息。',
    categories: [
      {
        id: 'emails',
        name: 'Emails 邮箱',
        description: '主要使用的邮箱账户。',
        items: [
          {
            id: 'primary-email',
            label: '主要邮箱',
            type: 'email',
            placeholder: 'example@domain.com',
          },
        ],
      },
      {
        id: 'passwords',
        name: 'Password Managers 密码管理器',
        description: '密码管理器信息。',
        items: [
          {
            id: 'manager-name',
            label: '密码管理器名称',
            type: 'text',
            placeholder: 'KeePass, 1Password, etc.',
          },
        ],
      },
    ],
  };

  const emptyData: SectionData = {
    categories: {},
  };

  const filledData: SectionData = {
    categories: {
      emails: {
        items: {
          'primary-email': 'test@example.com',
        },
      },
      passwords: {
        items: {
          'manager-name': 'KeePass',
        },
      },
    },
  };

  const inProgressProgress: SectionProgress = {
    progress: 50,
    status: 'in_progress',
    categories: {
      emails: {
        progress: 100,
        status: 'completed',
        filledItems: 1,
        totalItems: 1,
      },
      passwords: {
        progress: 0,
        status: 'not_started',
        filledItems: 0,
        totalItems: 1,
      },
    },
  };

  const completedProgress: SectionProgress = {
    progress: 100,
    status: 'completed',
    categories: {
      emails: {
        progress: 100,
        status: 'completed',
        filledItems: 1,
        totalItems: 1,
      },
      passwords: {
        progress: 100,
        status: 'completed',
        filledItems: 1,
        totalItems: 1,
      },
    },
  };

  describe('Section Header', () => {
    it('should render section name', () => {
      render(
        <SectionView
          section={basicSection}
          data={emptyData}
          onDataChange={mockOnDataChange}
          mode="free"
        />
      );

      expect(screen.getByTestId('section-name')).toHaveTextContent('Tech 技术');
    });

    it('should render section description', () => {
      render(
        <SectionView
          section={basicSection}
          data={emptyData}
          onDataChange={mockOnDataChange}
          mode="free"
        />
      );

      expect(screen.getByTestId('section-description')).toHaveTextContent(
        '技术相关的账户和服务信息。'
      );
    });

    it('should not render description when section has no description', () => {
      const sectionWithoutDescription: Section = {
        ...basicSection,
        description: undefined,
      };

      render(
        <SectionView
          section={sectionWithoutDescription}
          data={emptyData}
          onDataChange={mockOnDataChange}
          mode="free"
        />
      );

      expect(screen.queryByTestId('section-description')).not.toBeInTheDocument();
    });

    it('should display progress bar when progress is provided', () => {
      render(
        <SectionView
          section={basicSection}
          data={emptyData}
          onDataChange={mockOnDataChange}
          mode="free"
          progress={inProgressProgress}
        />
      );

      expect(screen.getByTestId('section-progress')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });
  });

  describe('Rendering Categories', () => {
    it('should render all categories in free mode', () => {
      render(
        <SectionView
          section={basicSection}
          data={emptyData}
          onDataChange={mockOnDataChange}
          mode="free"
        />
      );

      const categoryForms = screen.getAllByTestId('category-form');
      expect(categoryForms).toHaveLength(2);
    });

    it('should render only current category in guided mode', () => {
      render(
        <SectionView
          section={basicSection}
          data={emptyData}
          onDataChange={mockOnDataChange}
          mode="guided"
          currentCategoryId="emails"
        />
      );

      const categoryForms = screen.getAllByTestId('category-form');
      expect(categoryForms).toHaveLength(1);
      expect(screen.getByTestId('category-name')).toHaveTextContent('Emails 邮箱');
    });

    it('should render all categories in guided mode when no currentCategoryId', () => {
      render(
        <SectionView
          section={basicSection}
          data={emptyData}
          onDataChange={mockOnDataChange}
          mode="guided"
        />
      );

      const categoryForms = screen.getAllByTestId('category-form');
      expect(categoryForms).toHaveLength(2);
    });

    it('should display current values for categories', () => {
      render(
        <SectionView
          section={basicSection}
          data={filledData}
          onDataChange={mockOnDataChange}
          mode="free"
        />
      );

      expect(screen.getByPlaceholderText('example@domain.com')).toHaveValue('test@example.com');
      expect(screen.getByPlaceholderText('KeePass, 1Password, etc.')).toHaveValue('KeePass');
    });

    it('should render empty state when section has no categories', () => {
      const emptySection: Section = {
        id: 'empty',
        name: 'Empty Section',
        categories: [],
      };

      render(
        <SectionView
          section={emptySection}
          data={emptyData}
          onDataChange={mockOnDataChange}
          mode="free"
        />
      );

      expect(screen.getByTestId('section-empty')).toHaveTextContent(
        '此部分暂无可填写的分类'
      );
    });
  });

  describe('Data Changes', () => {
    it('should call onDataChange when category data changes', () => {
      render(
        <SectionView
          section={basicSection}
          data={emptyData}
          onDataChange={mockOnDataChange}
          mode="free"
        />
      );

      const emailInput = screen.getByPlaceholderText('example@domain.com');
      fireEvent.change(emailInput, { target: { value: 'new@email.com' } });

      expect(mockOnDataChange).toHaveBeenCalledWith('emails', {
        items: {
          'primary-email': 'new@email.com',
        },
      });
    });

    it('should preserve existing data when updating a category', () => {
      render(
        <SectionView
          section={basicSection}
          data={filledData}
          onDataChange={mockOnDataChange}
          mode="free"
        />
      );

      const emailInput = screen.getByPlaceholderText('example@domain.com');
      fireEvent.change(emailInput, { target: { value: 'updated@email.com' } });

      expect(mockOnDataChange).toHaveBeenCalledWith('emails', {
        items: {
          'primary-email': 'updated@email.com',
        },
      });
    });
  });

  describe('Guided Mode Navigation (Requirements 1.4, 2.2)', () => {
    it('should render navigation buttons in guided mode', () => {
      render(
        <SectionView
          section={basicSection}
          data={emptyData}
          onDataChange={mockOnDataChange}
          mode="guided"
          onNext={mockOnNext}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.getByTestId('guided-mode-navigation')).toBeInTheDocument();
      expect(screen.getByTestId('next-button')).toBeInTheDocument();
      expect(screen.getByTestId('skip-button')).toBeInTheDocument();
    });

    it('should not render navigation buttons in free mode', () => {
      render(
        <SectionView
          section={basicSection}
          data={emptyData}
          onDataChange={mockOnDataChange}
          mode="free"
          onNext={mockOnNext}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.queryByTestId('guided-mode-navigation')).not.toBeInTheDocument();
    });

    it('should call onNext when Next button is clicked (Requirement 2.2)', () => {
      render(
        <SectionView
          section={basicSection}
          data={emptyData}
          onDataChange={mockOnDataChange}
          mode="guided"
          onNext={mockOnNext}
        />
      );

      fireEvent.click(screen.getByTestId('next-button'));
      expect(mockOnNext).toHaveBeenCalledTimes(1);
    });

    it('should call onSkip when Skip button is clicked (Requirement 1.4)', () => {
      render(
        <SectionView
          section={basicSection}
          data={emptyData}
          onDataChange={mockOnDataChange}
          mode="guided"
          onSkip={mockOnSkip}
        />
      );

      fireEvent.click(screen.getByTestId('skip-button'));
      expect(mockOnSkip).toHaveBeenCalledTimes(1);
    });

    it('should show "完成此部分" text on last category', () => {
      render(
        <SectionView
          section={basicSection}
          data={emptyData}
          onDataChange={mockOnDataChange}
          mode="guided"
          onNext={mockOnNext}
          currentCategoryId="passwords"
        />
      );

      expect(screen.getByTestId('next-button')).toHaveTextContent('完成此部分');
    });

    it('should show "下一步" text on non-last category', () => {
      render(
        <SectionView
          section={basicSection}
          data={emptyData}
          onDataChange={mockOnDataChange}
          mode="guided"
          onNext={mockOnNext}
          currentCategoryId="emails"
        />
      );

      expect(screen.getByTestId('next-button')).toHaveTextContent('下一步');
    });

    it('should not render Skip button when onSkip is not provided', () => {
      render(
        <SectionView
          section={basicSection}
          data={emptyData}
          onDataChange={mockOnDataChange}
          mode="guided"
          onNext={mockOnNext}
        />
      );

      expect(screen.queryByTestId('skip-button')).not.toBeInTheDocument();
    });

    it('should not render Next button when onNext is not provided', () => {
      render(
        <SectionView
          section={basicSection}
          data={emptyData}
          onDataChange={mockOnDataChange}
          mode="guided"
          onSkip={mockOnSkip}
        />
      );

      expect(screen.queryByTestId('next-button')).not.toBeInTheDocument();
    });

    it('should disable buttons when disabled prop is true', () => {
      render(
        <SectionView
          section={basicSection}
          data={emptyData}
          onDataChange={mockOnDataChange}
          mode="guided"
          onNext={mockOnNext}
          onSkip={mockOnSkip}
          disabled={true}
        />
      );

      expect(screen.getByTestId('next-button')).toBeDisabled();
      expect(screen.getByTestId('skip-button')).toBeDisabled();
    });
  });

  describe('Section Completion Summary (Requirement 2.5)', () => {
    it('should show completion summary when section is completed', () => {
      render(
        <SectionView
          section={basicSection}
          data={filledData}
          onDataChange={mockOnDataChange}
          mode="free"
          progress={completedProgress}
        />
      );

      expect(screen.getByTestId('section-completion-summary')).toBeInTheDocument();
      expect(screen.getByTestId('completion-title')).toHaveTextContent('Tech 技术 已完成！');
    });

    it('should display completion message with category count', () => {
      render(
        <SectionView
          section={basicSection}
          data={filledData}
          onDataChange={mockOnDataChange}
          mode="free"
          progress={completedProgress}
        />
      );

      expect(screen.getByTestId('completion-message')).toHaveTextContent(
        '您已完成此部分的所有 2 个分类。'
      );
    });

    it('should display all completed categories', () => {
      render(
        <SectionView
          section={basicSection}
          data={filledData}
          onDataChange={mockOnDataChange}
          mode="free"
          progress={completedProgress}
        />
      );

      const completionCategories = screen.getByTestId('completion-categories');
      expect(completionCategories).toHaveTextContent('Emails 邮箱');
      expect(completionCategories).toHaveTextContent('Password Managers 密码管理器');
    });

    it('should show "Next Section" button when onNextSection is provided', () => {
      render(
        <SectionView
          section={basicSection}
          data={filledData}
          onDataChange={mockOnDataChange}
          mode="free"
          progress={completedProgress}
          onNextSection={mockOnNextSection}
        />
      );

      expect(screen.getByTestId('next-section-button')).toBeInTheDocument();
      expect(screen.getByTestId('next-section-button')).toHaveTextContent('进入下一部分');
    });

    it('should call onNextSection when "Next Section" button is clicked', () => {
      render(
        <SectionView
          section={basicSection}
          data={filledData}
          onDataChange={mockOnDataChange}
          mode="free"
          progress={completedProgress}
          onNextSection={mockOnNextSection}
        />
      );

      fireEvent.click(screen.getByTestId('next-section-button'));
      expect(mockOnNextSection).toHaveBeenCalledTimes(1);
    });

    it('should not show "Next Section" button when onNextSection is not provided', () => {
      render(
        <SectionView
          section={basicSection}
          data={filledData}
          onDataChange={mockOnDataChange}
          mode="free"
          progress={completedProgress}
        />
      );

      expect(screen.queryByTestId('next-section-button')).not.toBeInTheDocument();
    });

    it('should not show completion summary when section is not completed', () => {
      render(
        <SectionView
          section={basicSection}
          data={emptyData}
          onDataChange={mockOnDataChange}
          mode="free"
          progress={inProgressProgress}
        />
      );

      expect(screen.queryByTestId('section-completion-summary')).not.toBeInTheDocument();
    });

    it('should not show completion summary when progress is not provided', () => {
      render(
        <SectionView
          section={basicSection}
          data={filledData}
          onDataChange={mockOnDataChange}
          mode="free"
        />
      );

      expect(screen.queryByTestId('section-completion-summary')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper role and aria-labelledby', () => {
      render(
        <SectionView
          section={basicSection}
          data={emptyData}
          onDataChange={mockOnDataChange}
          mode="free"
        />
      );

      const sectionView = screen.getByTestId('section-view');
      expect(sectionView).toHaveAttribute('role', 'region');
      expect(sectionView).toHaveAttribute('aria-labelledby');
    });

    it('should have data-section-id attribute', () => {
      render(
        <SectionView
          section={basicSection}
          data={emptyData}
          onDataChange={mockOnDataChange}
          mode="free"
        />
      );

      expect(screen.getByTestId('section-view')).toHaveAttribute('data-section-id', 'tech');
    });

    it('should have data-mode attribute', () => {
      render(
        <SectionView
          section={basicSection}
          data={emptyData}
          onDataChange={mockOnDataChange}
          mode="guided"
        />
      );

      expect(screen.getByTestId('section-view')).toHaveAttribute('data-mode', 'guided');
    });

    it('should have proper aria-label on navigation buttons', () => {
      render(
        <SectionView
          section={basicSection}
          data={emptyData}
          onDataChange={mockOnDataChange}
          mode="guided"
          onNext={mockOnNext}
          onSkip={mockOnSkip}
        />
      );

      expect(screen.getByTestId('skip-button')).toHaveAttribute('aria-label', '跳过此部分');
      expect(screen.getByTestId('next-button')).toHaveAttribute('aria-label');
    });

    it('should have proper role on navigation container', () => {
      render(
        <SectionView
          section={basicSection}
          data={emptyData}
          onDataChange={mockOnDataChange}
          mode="guided"
          onNext={mockOnNext}
        />
      );

      expect(screen.getByTestId('guided-mode-navigation')).toHaveAttribute('role', 'navigation');
    });

    it('should have proper aria-live on completion summary', () => {
      render(
        <SectionView
          section={basicSection}
          data={filledData}
          onDataChange={mockOnDataChange}
          mode="free"
          progress={completedProgress}
        />
      );

      expect(screen.getByTestId('section-completion-summary')).toHaveAttribute('aria-live', 'polite');
    });

    it('should have proper progressbar attributes', () => {
      render(
        <SectionView
          section={basicSection}
          data={emptyData}
          onDataChange={mockOnDataChange}
          mode="free"
          progress={inProgressProgress}
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });
  });

  describe('Custom Class Name', () => {
    it('should apply custom class name', () => {
      render(
        <SectionView
          section={basicSection}
          data={emptyData}
          onDataChange={mockOnDataChange}
          mode="free"
          className="custom-class"
        />
      );

      expect(screen.getByTestId('section-view')).toHaveClass('custom-class');
    });
  });

  describe('Disabled State', () => {
    it('should disable all category forms when disabled prop is true', () => {
      render(
        <SectionView
          section={basicSection}
          data={emptyData}
          onDataChange={mockOnDataChange}
          mode="free"
          disabled={true}
        />
      );

      const inputs = screen.getAllByTestId('item-input');
      inputs.forEach((input) => {
        expect(input).toBeDisabled();
      });
    });
  });
});
