/**
 * ZenModeView Component Tests
 * 
 * Tests for the focused, distraction-free guided mode experience.
 * 
 * @validates Requirements 1.2-1.4, 2.2
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ZenModeView } from '../ZenModeView';
import type { Section, Category } from '../../types/checklist-structure';
import type { CategoryData } from '../../types/checklist-data';

// Mock sections for testing
const mockSections: Section[] = [
  {
    id: 'section-1',
    name: 'Section One',
    description: 'First section',
    categories: [
      {
        id: 'cat-1',
        name: 'Category One',
        description: 'First category',
        items: [
          { id: 'item-1', label: 'Item 1', type: 'text' },
          { id: 'item-2', label: 'Item 2', type: 'text' },
        ],
      },
      {
        id: 'cat-2',
        name: 'Category Two',
        description: 'Second category',
        items: [
          { id: 'item-3', label: 'Item 3', type: 'text' },
        ],
      },
    ],
  },
  {
    id: 'section-2',
    name: 'Section Two',
    description: 'Second section',
    categories: [
      {
        id: 'cat-3',
        name: 'Category Three',
        description: 'Third category',
        items: [
          { id: 'item-4', label: 'Item 4', type: 'text' },
        ],
      },
    ],
  },
];

const defaultProps = {
  sections: mockSections,
  currentSection: mockSections[0],
  currentCategory: mockSections[0].categories[0],
  categoryData: { items: {} } as CategoryData,
  onDataChange: vi.fn(),
  onNext: vi.fn(),
  onExitZenMode: vi.fn(),
};

describe('ZenModeView', () => {
  describe('Basic Rendering', () => {
    it('should render zen mode view', () => {
      render(<ZenModeView {...defaultProps} />);
      
      expect(screen.getByTestId('zen-mode-view')).toBeInTheDocument();
    });

    it('should display current category name', () => {
      render(<ZenModeView {...defaultProps} />);
      
      expect(screen.getByText('Category One')).toBeInTheDocument();
    });

    it('should display current section badge', () => {
      render(<ZenModeView {...defaultProps} />);
      
      expect(screen.getByText('Section One')).toBeInTheDocument();
    });

    it('should display category description', () => {
      render(<ZenModeView {...defaultProps} />);
      
      expect(screen.getByText('First category')).toBeInTheDocument();
    });

    it('should display category items', () => {
      render(<ZenModeView {...defaultProps} />);
      
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });
  });

  describe('Progress Indicator', () => {
    it('should display progress as "X / Y" format', () => {
      render(<ZenModeView {...defaultProps} />);
      
      // First category of 3 total
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });

    it('should update progress when on different category', () => {
      render(
        <ZenModeView
          {...defaultProps}
          currentCategory={mockSections[0].categories[1]}
        />
      );
      
      // Second category of 3 total
      expect(screen.getByText('2 / 3')).toBeInTheDocument();
    });

    it('should show correct progress for last category', () => {
      render(
        <ZenModeView
          {...defaultProps}
          currentSection={mockSections[1]}
          currentCategory={mockSections[1].categories[0]}
        />
      );
      
      // Third category of 3 total
      expect(screen.getByText('3 / 3')).toBeInTheDocument();
    });
  });

  describe('Navigation Buttons', () => {
    it('should render Next button', () => {
      render(<ZenModeView {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /下一步/ })).toBeInTheDocument();
    });

    it('should show "完成" instead of "下一步" on last category', () => {
      render(
        <ZenModeView
          {...defaultProps}
          currentSection={mockSections[1]}
          currentCategory={mockSections[1].categories[0]}
        />
      );
      
      expect(screen.getByRole('button', { name: /完成/ })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /下一步/ })).not.toBeInTheDocument();
    });
  });

  describe('Exit Zen Mode', () => {
    it('should render exit button', () => {
      render(<ZenModeView {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /退出专注模式/ })).toBeInTheDocument();
    });

    it('should call onExitZenMode when exit button is clicked', () => {
      const onExitZenMode = vi.fn();
      render(<ZenModeView {...defaultProps} onExitZenMode={onExitZenMode} />);
      
      fireEvent.click(screen.getByRole('button', { name: /退出专注模式/ }));
      
      expect(onExitZenMode).toHaveBeenCalled();
    });
  });

  describe('Navigation Callbacks', () => {
    it('should call onNext when Next button is clicked', () => {
      const onNext = vi.fn();
      render(<ZenModeView {...defaultProps} onNext={onNext} />);
      
      fireEvent.click(screen.getByRole('button', { name: /下一步/ }));
      
      expect(onNext).toHaveBeenCalled();
    });

    it('should call onComplete when Complete button is clicked on last category', () => {
      const onComplete = vi.fn();
      render(
        <ZenModeView
          {...defaultProps}
          currentSection={mockSections[1]}
          currentCategory={mockSections[1].categories[0]}
          onComplete={onComplete}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /完成/ }));
      
      expect(onComplete).toHaveBeenCalled();
    });
  });

  describe('Data Change', () => {
    it('should call onDataChange when item value changes', () => {
      const onDataChange = vi.fn();
      render(<ZenModeView {...defaultProps} onDataChange={onDataChange} />);
      
      // Get input by test id since label contains emoji
      const inputs = screen.getAllByTestId('item-input');
      fireEvent.change(inputs[0], { target: { value: 'test value' } });
      
      expect(onDataChange).toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('should disable navigation buttons when disabled', () => {
      render(<ZenModeView {...defaultProps} disabled />);
      
      expect(screen.getByRole('button', { name: /下一步/ })).toBeDisabled();
    });
  });

  describe('Empty Category', () => {
    it('should show empty message when category has no items', () => {
      const emptyCategory: Category = {
        id: 'empty-cat',
        name: 'Empty Category',
        items: [],
      };
      
      render(
        <ZenModeView
          {...defaultProps}
          currentCategory={emptyCategory}
        />
      );
      
      expect(screen.getByText('此分类暂无可填写的项目')).toBeInTheDocument();
    });
  });

  describe('Help Text', () => {
    it('should display help text when provided', () => {
      const categoryWithHelp: Category = {
        id: 'help-cat',
        name: 'Category with Help',
        helpText: 'This is helpful information',
        items: [{ id: 'item', label: 'Item', type: 'text' }],
      };
      
      render(
        <ZenModeView
          {...defaultProps}
          currentCategory={categoryWithHelp}
        />
      );
      
      expect(screen.getByText(/This is helpful information/)).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <ZenModeView {...defaultProps} className="custom-zen-class" />
      );
      
      expect(container.querySelector('.custom-zen-class')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for navigation buttons', () => {
      render(<ZenModeView {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /下一步/ })).toHaveAttribute('aria-label');
    });

    it('should have proper ARIA label for exit button', () => {
      render(<ZenModeView {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /退出专注模式/ })).toHaveAttribute('aria-label');
    });
  });
});
