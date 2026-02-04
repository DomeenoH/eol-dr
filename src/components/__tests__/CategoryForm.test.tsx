/**
 * CategoryForm Component Tests
 * 
 * Tests for the CategoryForm component that renders a category
 * with all its fields, description, and help text.
 * 
 * Requirements: 8.1
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CategoryForm } from '../CategoryForm';
import type { Category } from '../../types/checklist-structure';
import type { CategoryData } from '../../types/checklist-data';

describe('CategoryForm', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  // Basic category with simple items
  const basicCategory: Category = {
    id: 'emails',
    name: 'Emails 邮箱',
    description: '主要使用的邮箱账户。可以通过手机或笔记本电脑登录。',
    helpText: '添加所有重要的邮箱账户信息。',
    items: [
      {
        id: 'primary-email',
        label: '主要邮箱',
        type: 'email',
        placeholder: 'example@domain.com',
        required: true,
      },
      {
        id: 'notes',
        label: '备注',
        type: 'textarea',
        placeholder: '任何额外说明',
      },
    ],
  };

  const emptyData: CategoryData = {
    items: {},
  };

  const filledData: CategoryData = {
    items: {
      'primary-email': 'test@example.com',
      'notes': 'This is a test note',
    },
  };

  describe('Category Header (Requirement 8.1)', () => {
    it('should render category name', () => {
      render(
        <CategoryForm
          category={basicCategory}
          data={emptyData}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('category-name')).toHaveTextContent('Emails 邮箱');
    });

    it('should render category description', () => {
      render(
        <CategoryForm
          category={basicCategory}
          data={emptyData}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('category-description')).toHaveTextContent(
        '主要使用的邮箱账户。可以通过手机或笔记本电脑登录。'
      );
    });

    it('should render category help text', () => {
      render(
        <CategoryForm
          category={basicCategory}
          data={emptyData}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('category-help-text')).toHaveTextContent(
        '添加所有重要的邮箱账户信息。'
      );
    });

    it('should use description override when provided', () => {
      const overrideDescription = 'This is an override description';
      
      render(
        <CategoryForm
          category={basicCategory}
          data={emptyData}
          onChange={mockOnChange}
          description={overrideDescription}
        />
      );

      expect(screen.getByTestId('category-description')).toHaveTextContent(
        overrideDescription
      );
    });

    it('should not render description when category has no description', () => {
      const categoryWithoutDescription: Category = {
        ...basicCategory,
        description: undefined,
      };

      render(
        <CategoryForm
          category={categoryWithoutDescription}
          data={emptyData}
          onChange={mockOnChange}
        />
      );

      expect(screen.queryByTestId('category-description')).not.toBeInTheDocument();
    });

    it('should not render help text when category has no help text', () => {
      const categoryWithoutHelpText: Category = {
        ...basicCategory,
        helpText: undefined,
      };

      render(
        <CategoryForm
          category={categoryWithoutHelpText}
          data={emptyData}
          onChange={mockOnChange}
        />
      );

      expect(screen.queryByTestId('category-help-text')).not.toBeInTheDocument();
    });
  });

  describe('Rendering Items', () => {
    it('should render all items in the category', () => {
      render(
        <CategoryForm
          category={basicCategory}
          data={emptyData}
          onChange={mockOnChange}
        />
      );

      // Should render both items
      const itemForms = screen.getAllByTestId('item-form');
      expect(itemForms).toHaveLength(2);
    });

    it('should display current values for items', () => {
      render(
        <CategoryForm
          category={basicCategory}
          data={filledData}
          onChange={mockOnChange}
        />
      );

      // Check email input has correct value
      const emailInput = screen.getByPlaceholderText('example@domain.com');
      expect(emailInput).toHaveValue('test@example.com');

      // Check textarea has correct value
      const notesInput = screen.getByPlaceholderText('任何额外说明');
      expect(notesInput).toHaveValue('This is a test note');
    });

    it('should render empty state when category has no items', () => {
      const emptyCategory: Category = {
        id: 'empty',
        name: 'Empty Category',
        items: [],
      };

      render(
        <CategoryForm
          category={emptyCategory}
          data={emptyData}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('category-empty')).toHaveTextContent(
        '此分类暂无可填写的项目'
      );
    });
  });

  describe('Data Changes', () => {
    it('should call onChange when item value changes', () => {
      render(
        <CategoryForm
          category={basicCategory}
          data={emptyData}
          onChange={mockOnChange}
        />
      );

      const emailInput = screen.getByPlaceholderText('example@domain.com');
      fireEvent.change(emailInput, { target: { value: 'new@email.com' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        items: {
          'primary-email': 'new@email.com',
        },
      });
    });

    it('should preserve existing data when updating a single item', () => {
      render(
        <CategoryForm
          category={basicCategory}
          data={filledData}
          onChange={mockOnChange}
        />
      );

      const emailInput = screen.getByPlaceholderText('example@domain.com');
      fireEvent.change(emailInput, { target: { value: 'updated@email.com' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        items: {
          'primary-email': 'updated@email.com',
          'notes': 'This is a test note',
        },
      });
    });
  });

  describe('Repeatable Items', () => {
    const categoryWithRepeatable: Category = {
      id: 'contacts',
      name: 'Contacts',
      description: 'Contact list',
      items: [
        {
          id: 'contact',
          label: '联系人',
          type: 'text',
          repeatable: true,
          placeholder: 'Enter contact name',
        },
      ],
    };

    it('should render RepeatableItemList for repeatable items', () => {
      render(
        <CategoryForm
          category={categoryWithRepeatable}
          data={emptyData}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('repeatable-item-list')).toBeInTheDocument();
    });

    it('should display existing repeatable values', () => {
      const dataWithRepeatable: CategoryData = {
        items: {
          contact: ['Alice', 'Bob', 'Charlie'],
        },
      };

      render(
        <CategoryForm
          category={categoryWithRepeatable}
          data={dataWithRepeatable}
          onChange={mockOnChange}
        />
      );

      // Should show count of items
      expect(screen.getByTestId('repeatable-item-count')).toHaveTextContent('(3 项)');
    });

    it('should call onChange when adding a repeatable item', () => {
      render(
        <CategoryForm
          category={categoryWithRepeatable}
          data={emptyData}
          onChange={mockOnChange}
        />
      );

      const addButton = screen.getByTestId('repeatable-add-button');
      fireEvent.click(addButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        items: {
          contact: [''],
        },
      });
    });

    it('should handle empty array for repeatable items with no data', () => {
      render(
        <CategoryForm
          category={categoryWithRepeatable}
          data={emptyData}
          onChange={mockOnChange}
        />
      );

      // Should show empty state
      expect(screen.getByTestId('repeatable-empty-state')).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should disable all items when disabled prop is true', () => {
      render(
        <CategoryForm
          category={basicCategory}
          data={emptyData}
          onChange={mockOnChange}
          disabled={true}
        />
      );

      const inputs = screen.getAllByTestId('item-input');
      inputs.forEach((input) => {
        expect(input).toBeDisabled();
      });
    });

    it('should disable add button for repeatable items when disabled', () => {
      const categoryWithRepeatable: Category = {
        id: 'contacts',
        name: 'Contacts',
        items: [
          {
            id: 'contact',
            label: '联系人',
            type: 'text',
            repeatable: true,
          },
        ],
      };

      render(
        <CategoryForm
          category={categoryWithRepeatable}
          data={emptyData}
          onChange={mockOnChange}
          disabled={true}
        />
      );

      expect(screen.getByTestId('repeatable-add-button')).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper role and aria-labelledby', () => {
      render(
        <CategoryForm
          category={basicCategory}
          data={emptyData}
          onChange={mockOnChange}
        />
      );

      const form = screen.getByTestId('category-form');
      expect(form).toHaveAttribute('role', 'region');
      expect(form).toHaveAttribute('aria-labelledby');
    });

    it('should associate items container with description', () => {
      render(
        <CategoryForm
          category={basicCategory}
          data={emptyData}
          onChange={mockOnChange}
        />
      );

      const itemsContainer = screen.getByTestId('category-items');
      expect(itemsContainer).toHaveAttribute('aria-describedby');
    });

    it('should have data-category-id attribute', () => {
      render(
        <CategoryForm
          category={basicCategory}
          data={emptyData}
          onChange={mockOnChange}
        />
      );

      const form = screen.getByTestId('category-form');
      expect(form).toHaveAttribute('data-category-id', 'emails');
    });
  });

  describe('Custom Class Name', () => {
    it('should apply custom class name', () => {
      render(
        <CategoryForm
          category={basicCategory}
          data={emptyData}
          onChange={mockOnChange}
          className="custom-class"
        />
      );

      expect(screen.getByTestId('category-form')).toHaveClass('custom-class');
    });
  });

  describe('Mixed Item Types', () => {
    const mixedCategory: Category = {
      id: 'mixed',
      name: 'Mixed Items',
      description: 'Category with mixed item types',
      items: [
        {
          id: 'single-text',
          label: 'Single Text',
          type: 'text',
          placeholder: 'Single item',
        },
        {
          id: 'repeatable-text',
          label: 'Repeatable Text',
          type: 'text',
          repeatable: true,
          placeholder: 'Repeatable item',
        },
        {
          id: 'single-email',
          label: 'Single Email',
          type: 'email',
          placeholder: 'email@example.com',
        },
      ],
    };

    it('should render both single and repeatable items correctly', () => {
      render(
        <CategoryForm
          category={mixedCategory}
          data={emptyData}
          onChange={mockOnChange}
        />
      );

      // Should have 2 ItemForm components (single items)
      const itemForms = screen.getAllByTestId('item-form');
      expect(itemForms).toHaveLength(2);

      // Should have 1 RepeatableItemList
      expect(screen.getByTestId('repeatable-item-list')).toBeInTheDocument();
    });

    it('should handle data for mixed item types', () => {
      const mixedData: CategoryData = {
        items: {
          'single-text': 'Single value',
          'repeatable-text': ['Value 1', 'Value 2'],
          'single-email': 'test@example.com',
        },
      };

      render(
        <CategoryForm
          category={mixedCategory}
          data={mixedData}
          onChange={mockOnChange}
        />
      );

      // Check single text value
      expect(screen.getByPlaceholderText('Single item')).toHaveValue('Single value');
      
      // Check email value
      expect(screen.getByPlaceholderText('email@example.com')).toHaveValue('test@example.com');
      
      // Check repeatable count
      expect(screen.getByTestId('repeatable-item-count')).toHaveTextContent('(2 项)');
    });
  });

  describe('Sensitive Items', () => {
    const categoryWithSensitive: Category = {
      id: 'passwords',
      name: 'Passwords',
      description: 'Password storage',
      items: [
        {
          id: 'master-password',
          label: 'Master Password',
          type: 'password',
          sensitive: true,
          placeholder: '••••••••',
        },
      ],
    };

    it('should render sensitive items with password type', () => {
      render(
        <CategoryForm
          category={categoryWithSensitive}
          data={emptyData}
          onChange={mockOnChange}
        />
      );

      const passwordInput = screen.getByPlaceholderText('••••••••');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should render visibility toggle for sensitive items', () => {
      render(
        <CategoryForm
          category={categoryWithSensitive}
          data={emptyData}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('item-visibility-toggle')).toBeInTheDocument();
    });
  });
});
