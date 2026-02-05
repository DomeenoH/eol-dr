/**
 * RepeatableItemList Component Tests
 * 
 * Tests for the RepeatableItemList component that manages
 * dynamic add/delete of repeatable items.
 * Requirements: 8.3
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  RepeatableItemList,
} from '../RepeatableItemList';
import { getDefaultValue } from '../../utils/checklist-utils';
import type { ItemDefinition } from '../../types/checklist-structure';
import type { ItemValue } from '../../types/checklist-data';

describe('getDefaultValue', () => {
  it('should return empty string for text type', () => {
    const item: ItemDefinition = { id: 'test', label: 'Test', type: 'text' };
    expect(getDefaultValue(item)).toBe('');
  });

  it('should return empty string for email type', () => {
    const item: ItemDefinition = { id: 'test', label: 'Test', type: 'email' };
    expect(getDefaultValue(item)).toBe('');
  });

  it('should return empty string for tel type', () => {
    const item: ItemDefinition = { id: 'test', label: 'Test', type: 'tel' };
    expect(getDefaultValue(item)).toBe('');
  });

  it('should return empty string for url type', () => {
    const item: ItemDefinition = { id: 'test', label: 'Test', type: 'url' };
    expect(getDefaultValue(item)).toBe('');
  });

  it('should return empty string for password type', () => {
    const item: ItemDefinition = { id: 'test', label: 'Test', type: 'password' };
    expect(getDefaultValue(item)).toBe('');
  });

  it('should return empty string for textarea type', () => {
    const item: ItemDefinition = { id: 'test', label: 'Test', type: 'textarea' };
    expect(getDefaultValue(item)).toBe('');
  });

  it('should return false for checkbox type', () => {
    const item: ItemDefinition = { id: 'test', label: 'Test', type: 'checkbox' };
    expect(getDefaultValue(item)).toBe(false);
  });

  it('should return 0 for number type', () => {
    const item: ItemDefinition = { id: 'test', label: 'Test', type: 'number' };
    expect(getDefaultValue(item)).toBe(0);
  });

  it('should return empty object for group type without fields', () => {
    const item: ItemDefinition = { id: 'test', label: 'Test', type: 'group' };
    expect(getDefaultValue(item)).toEqual({});
  });

  it('should return object with default values for group type with fields', () => {
    const item: ItemDefinition = {
      id: 'test',
      label: 'Test',
      type: 'group',
      fields: [
        { id: 'name', label: 'Name', type: 'text' },
        { id: 'active', label: 'Active', type: 'checkbox' },
        { id: 'count', label: 'Count', type: 'number' },
      ],
    };
    expect(getDefaultValue(item)).toEqual({
      name: '',
      active: false,
      count: 0,
    });
  });
});


describe('RepeatableItemList', () => {
  const mockOnChange = vi.fn();

  const defaultItem: ItemDefinition = {
    id: 'email',
    label: '邮箱',
    type: 'email',
    placeholder: '请输入邮箱地址',
    helpText: '可以添加多个邮箱地址',
    repeatable: true,
  };

  const defaultValues: ItemValue[] = [
    'test1@example.com',
    'test2@example.com',
  ];

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('List Display', () => {
    it('should render the component', () => {
      render(
        <RepeatableItemList
          item={defaultItem}
          values={defaultValues}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('repeatable-item-list')).toBeInTheDocument();
    });

    it('should render item label in header', () => {
      render(
        <RepeatableItemList
          item={defaultItem}
          values={defaultValues}
          onChange={mockOnChange}
        />
      );

      // The header h3 should contain the label
      const header = screen.getByRole('heading', { level: 3 });
      expect(header).toHaveTextContent('邮箱');
    });

    it('should render item count', () => {
      render(
        <RepeatableItemList
          item={defaultItem}
          values={defaultValues}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('repeatable-item-count')).toHaveTextContent('(2 项)');
    });

    it('should render help text when provided', () => {
      render(
        <RepeatableItemList
          item={defaultItem}
          values={defaultValues}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('repeatable-help-text')).toHaveTextContent('可以添加多个邮箱地址');
    });

    it('should not render help text when not provided', () => {
      const itemWithoutHelp: ItemDefinition = {
        id: 'test',
        label: 'Test',
        type: 'text',
      };

      render(
        <RepeatableItemList
          item={itemWithoutHelp}
          values={[]}
          onChange={mockOnChange}
        />
      );

      expect(screen.queryByTestId('repeatable-help-text')).not.toBeInTheDocument();
    });

    it('should render required indicator when item is required', () => {
      const requiredItem: ItemDefinition = {
        ...defaultItem,
        required: true,
      };

      render(
        <RepeatableItemList
          item={requiredItem}
          values={defaultValues}
          onChange={mockOnChange}
        />
      );

      // The header h3 should contain the required indicator
      const header = screen.getByRole('heading', { level: 3 });
      expect(header).toHaveTextContent('*');
    });

    it('should render all items in the list', () => {
      render(
        <RepeatableItemList
          item={defaultItem}
          values={defaultValues}
          onChange={mockOnChange}
        />
      );

      const itemWrappers = screen.getAllByTestId('repeatable-item-wrapper');
      expect(itemWrappers).toHaveLength(2);
    });

    it('should render item index badges', () => {
      render(
        <RepeatableItemList
          item={defaultItem}
          values={defaultValues}
          onChange={mockOnChange}
        />
      );

      const indexBadges = screen.getAllByTestId('repeatable-item-index');
      expect(indexBadges).toHaveLength(2);
      expect(indexBadges[0]).toHaveTextContent('1');
      expect(indexBadges[1]).toHaveTextContent('2');
    });

    it('should render add button', () => {
      render(
        <RepeatableItemList
          item={defaultItem}
          values={defaultValues}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('repeatable-add-button')).toBeInTheDocument();
    });

    it('should render custom add button label', () => {
      render(
        <RepeatableItemList
          item={defaultItem}
          values={defaultValues}
          onChange={mockOnChange}
          addButtonLabel="添加新邮箱"
        />
      );

      expect(screen.getByTestId('repeatable-add-button')).toHaveTextContent('添加新邮箱');
    });

    it('should render default add button label based on item label', () => {
      render(
        <RepeatableItemList
          item={defaultItem}
          values={defaultValues}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('repeatable-add-button')).toHaveTextContent('添加邮箱');
    });
  });


  describe('Empty State', () => {
    it('should render empty state when no values', () => {
      render(
        <RepeatableItemList
          item={defaultItem}
          values={[]}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('repeatable-empty-state')).toBeInTheDocument();
    });

    it('should render default empty message', () => {
      render(
        <RepeatableItemList
          item={defaultItem}
          values={[]}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('repeatable-empty-state')).toHaveTextContent('暂无邮箱，点击下方按钮添加');
    });

    it('should render custom empty message', () => {
      render(
        <RepeatableItemList
          item={defaultItem}
          values={[]}
          onChange={mockOnChange}
          emptyMessage="还没有添加任何邮箱"
        />
      );

      expect(screen.getByTestId('repeatable-empty-state')).toHaveTextContent('还没有添加任何邮箱');
    });

    it('should show item count as 0', () => {
      render(
        <RepeatableItemList
          item={defaultItem}
          values={[]}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('repeatable-item-count')).toHaveTextContent('(0 项)');
    });
  });


  describe('Add Item', () => {
    it('should call onChange with new item when add button is clicked', () => {
      render(
        <RepeatableItemList
          item={defaultItem}
          values={defaultValues}
          onChange={mockOnChange}
        />
      );

      fireEvent.click(screen.getByTestId('repeatable-add-button'));

      expect(mockOnChange).toHaveBeenCalledTimes(1);
      expect(mockOnChange).toHaveBeenCalledWith([
        'test1@example.com',
        'test2@example.com',
        '', // Default value for email type
      ]);
    });

    it('should add item with correct default value for text type', () => {
      const textItem: ItemDefinition = {
        id: 'name',
        label: '姓名',
        type: 'text',
      };

      render(
        <RepeatableItemList
          item={textItem}
          values={['John']}
          onChange={mockOnChange}
        />
      );

      fireEvent.click(screen.getByTestId('repeatable-add-button'));

      expect(mockOnChange).toHaveBeenCalledWith(['John', '']);
    });

    it('should add item with correct default value for checkbox type', () => {
      const checkboxItem: ItemDefinition = {
        id: 'active',
        label: '激活',
        type: 'checkbox',
      };

      render(
        <RepeatableItemList
          item={checkboxItem}
          values={[true]}
          onChange={mockOnChange}
        />
      );

      fireEvent.click(screen.getByTestId('repeatable-add-button'));

      expect(mockOnChange).toHaveBeenCalledWith([true, false]);
    });

    it('should add item with correct default value for number type', () => {
      const numberItem: ItemDefinition = {
        id: 'count',
        label: '数量',
        type: 'number',
      };

      render(
        <RepeatableItemList
          item={numberItem}
          values={[5]}
          onChange={mockOnChange}
        />
      );

      fireEvent.click(screen.getByTestId('repeatable-add-button'));

      expect(mockOnChange).toHaveBeenCalledWith([5, 0]);
    });

    it('should add first item to empty list', () => {
      render(
        <RepeatableItemList
          item={defaultItem}
          values={[]}
          onChange={mockOnChange}
        />
      );

      fireEvent.click(screen.getByTestId('repeatable-add-button'));

      expect(mockOnChange).toHaveBeenCalledWith(['']);
    });
  });


  describe('Delete Item', () => {
    it('should render delete button for each item', () => {
      render(
        <RepeatableItemList
          item={defaultItem}
          values={defaultValues}
          onChange={mockOnChange}
        />
      );

      const deleteButtons = screen.getAllByTestId('item-delete-button');
      expect(deleteButtons).toHaveLength(2);
    });

    it('should call onChange with item removed when delete is clicked', () => {
      render(
        <RepeatableItemList
          item={defaultItem}
          values={defaultValues}
          onChange={mockOnChange}
        />
      );

      const deleteButtons = screen.getAllByTestId('item-delete-button');
      fireEvent.click(deleteButtons[0]);

      expect(mockOnChange).toHaveBeenCalledTimes(1);
      expect(mockOnChange).toHaveBeenCalledWith(['test2@example.com']);
    });

    it('should remove correct item when deleting from middle', () => {
      const threeValues = ['a@test.com', 'b@test.com', 'c@test.com'];

      render(
        <RepeatableItemList
          item={defaultItem}
          values={threeValues}
          onChange={mockOnChange}
        />
      );

      const deleteButtons = screen.getAllByTestId('item-delete-button');
      fireEvent.click(deleteButtons[1]); // Delete middle item

      expect(mockOnChange).toHaveBeenCalledWith(['a@test.com', 'c@test.com']);
    });

    it('should remove last item correctly', () => {
      render(
        <RepeatableItemList
          item={defaultItem}
          values={defaultValues}
          onChange={mockOnChange}
        />
      );

      const deleteButtons = screen.getAllByTestId('item-delete-button');
      fireEvent.click(deleteButtons[1]); // Delete last item

      expect(mockOnChange).toHaveBeenCalledWith(['test1@example.com']);
    });
  });


  describe('Update Item', () => {
    it('should call onChange with updated value when item is changed', () => {
      render(
        <RepeatableItemList
          item={defaultItem}
          values={defaultValues}
          onChange={mockOnChange}
        />
      );

      const inputs = screen.getAllByTestId('item-input');
      fireEvent.change(inputs[0], { target: { value: 'updated@example.com' } });

      expect(mockOnChange).toHaveBeenCalledTimes(1);
      expect(mockOnChange).toHaveBeenCalledWith([
        'updated@example.com',
        'test2@example.com',
      ]);
    });

    it('should update correct item when changing middle item', () => {
      const threeValues = ['a@test.com', 'b@test.com', 'c@test.com'];

      render(
        <RepeatableItemList
          item={defaultItem}
          values={threeValues}
          onChange={mockOnChange}
        />
      );

      const inputs = screen.getAllByTestId('item-input');
      fireEvent.change(inputs[1], { target: { value: 'updated@test.com' } });

      expect(mockOnChange).toHaveBeenCalledWith([
        'a@test.com',
        'updated@test.com',
        'c@test.com',
      ]);
    });
  });


  describe('Min/Max Items', () => {
    it('should not show delete button when at minItems', () => {
      render(
        <RepeatableItemList
          item={defaultItem}
          values={['test@example.com']}
          onChange={mockOnChange}
          minItems={1}
        />
      );

      expect(screen.queryByTestId('item-delete-button')).not.toBeInTheDocument();
    });

    it('should show delete button when above minItems', () => {
      render(
        <RepeatableItemList
          item={defaultItem}
          values={defaultValues}
          onChange={mockOnChange}
          minItems={1}
        />
      );

      const deleteButtons = screen.getAllByTestId('item-delete-button');
      expect(deleteButtons).toHaveLength(2);
    });

    it('should disable add button when at maxItems', () => {
      render(
        <RepeatableItemList
          item={defaultItem}
          values={defaultValues}
          onChange={mockOnChange}
          maxItems={2}
        />
      );

      expect(screen.getByTestId('repeatable-add-button')).toBeDisabled();
    });

    it('should show max reached message when at maxItems', () => {
      render(
        <RepeatableItemList
          item={defaultItem}
          values={defaultValues}
          onChange={mockOnChange}
          maxItems={2}
        />
      );

      expect(screen.getByTestId('repeatable-max-reached')).toHaveTextContent('已达到最大数量限制 (2 项)');
    });

    it('should not show max reached message when below maxItems', () => {
      render(
        <RepeatableItemList
          item={defaultItem}
          values={['test@example.com']}
          onChange={mockOnChange}
          maxItems={2}
        />
      );

      expect(screen.queryByTestId('repeatable-max-reached')).not.toBeInTheDocument();
    });

    it('should enable add button when below maxItems', () => {
      render(
        <RepeatableItemList
          item={defaultItem}
          values={['test@example.com']}
          onChange={mockOnChange}
          maxItems={2}
        />
      );

      expect(screen.getByTestId('repeatable-add-button')).not.toBeDisabled();
    });

    it('should not call onChange when trying to add at maxItems', () => {
      render(
        <RepeatableItemList
          item={defaultItem}
          values={defaultValues}
          onChange={mockOnChange}
          maxItems={2}
        />
      );

      fireEvent.click(screen.getByTestId('repeatable-add-button'));

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });


  describe('Disabled State', () => {
    it('should disable add button when disabled', () => {
      render(
        <RepeatableItemList
          item={defaultItem}
          values={defaultValues}
          onChange={mockOnChange}
          disabled={true}
        />
      );

      expect(screen.getByTestId('repeatable-add-button')).toBeDisabled();
    });

    it('should disable all item inputs when disabled', () => {
      render(
        <RepeatableItemList
          item={defaultItem}
          values={defaultValues}
          onChange={mockOnChange}
          disabled={true}
        />
      );

      const inputs = screen.getAllByTestId('item-input');
      inputs.forEach((input) => {
        expect(input).toBeDisabled();
      });
    });

    it('should not show delete buttons when disabled', () => {
      render(
        <RepeatableItemList
          item={defaultItem}
          values={defaultValues}
          onChange={mockOnChange}
          disabled={true}
        />
      );

      // Delete buttons should not be rendered when disabled
      // because canDelete is false when disabled
      expect(screen.queryAllByTestId('item-delete-button')).toHaveLength(0);
    });
  });


  describe('Data Consistency', () => {
    it('should preserve other items when adding new item', () => {
      const values = ['a@test.com', 'b@test.com'];

      render(
        <RepeatableItemList
          item={defaultItem}
          values={values}
          onChange={mockOnChange}
        />
      );

      fireEvent.click(screen.getByTestId('repeatable-add-button'));

      const calledWith = mockOnChange.mock.calls[0][0];
      expect(calledWith[0]).toBe('a@test.com');
      expect(calledWith[1]).toBe('b@test.com');
      expect(calledWith).toHaveLength(3);
    });

    it('should preserve other items when deleting an item', () => {
      const values = ['a@test.com', 'b@test.com', 'c@test.com'];

      render(
        <RepeatableItemList
          item={defaultItem}
          values={values}
          onChange={mockOnChange}
        />
      );

      const deleteButtons = screen.getAllByTestId('item-delete-button');
      fireEvent.click(deleteButtons[1]); // Delete middle item

      const calledWith = mockOnChange.mock.calls[0][0];
      expect(calledWith[0]).toBe('a@test.com');
      expect(calledWith[1]).toBe('c@test.com');
      expect(calledWith).toHaveLength(2);
    });

    it('should preserve other items when updating an item', () => {
      const values = ['a@test.com', 'b@test.com', 'c@test.com'];

      render(
        <RepeatableItemList
          item={defaultItem}
          values={values}
          onChange={mockOnChange}
        />
      );

      const inputs = screen.getAllByTestId('item-input');
      fireEvent.change(inputs[1], { target: { value: 'updated@test.com' } });

      const calledWith = mockOnChange.mock.calls[0][0];
      expect(calledWith[0]).toBe('a@test.com');
      expect(calledWith[1]).toBe('updated@test.com');
      expect(calledWith[2]).toBe('c@test.com');
    });

    it('should not mutate original values array when adding', () => {
      const originalValues = ['a@test.com', 'b@test.com'];
      const values = [...originalValues];

      render(
        <RepeatableItemList
          item={defaultItem}
          values={values}
          onChange={mockOnChange}
        />
      );

      fireEvent.click(screen.getByTestId('repeatable-add-button'));

      // Original array should not be mutated
      expect(values).toEqual(originalValues);
    });

    it('should not mutate original values array when deleting', () => {
      const originalValues = ['a@test.com', 'b@test.com'];
      const values = [...originalValues];

      render(
        <RepeatableItemList
          item={defaultItem}
          values={values}
          onChange={mockOnChange}
        />
      );

      const deleteButtons = screen.getAllByTestId('item-delete-button');
      fireEvent.click(deleteButtons[0]);

      // Original array should not be mutated
      expect(values).toEqual(originalValues);
    });

    it('should not mutate original values array when updating', () => {
      const originalValues = ['a@test.com', 'b@test.com'];
      const values = [...originalValues];

      render(
        <RepeatableItemList
          item={defaultItem}
          values={values}
          onChange={mockOnChange}
        />
      );

      const inputs = screen.getAllByTestId('item-input');
      fireEvent.change(inputs[0], { target: { value: 'updated@test.com' } });

      // Original array should not be mutated
      expect(values).toEqual(originalValues);
    });
  });


  describe('Accessibility', () => {
    it('should have region role', () => {
      render(
        <RepeatableItemList
          item={defaultItem}
          values={defaultValues}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('repeatable-item-list')).toHaveAttribute('role', 'region');
    });

    it('should have aria-labelledby pointing to label', () => {
      render(
        <RepeatableItemList
          item={defaultItem}
          values={defaultValues}
          onChange={mockOnChange}
        />
      );

      const list = screen.getByTestId('repeatable-item-list');
      const labelId = list.getAttribute('aria-labelledby');
      expect(labelId).toBeTruthy();
      expect(document.getElementById(labelId!)).toHaveTextContent('邮箱');
    });

    it('should have list role on items container', () => {
      render(
        <RepeatableItemList
          item={defaultItem}
          values={defaultValues}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('repeatable-items-container')).toHaveAttribute('role', 'list');
    });

    it('should have aria-label on add button', () => {
      render(
        <RepeatableItemList
          item={defaultItem}
          values={defaultValues}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('repeatable-add-button')).toHaveAttribute('aria-label', '添加邮箱');
    });

    it('should have status role on max reached message', () => {
      render(
        <RepeatableItemList
          item={defaultItem}
          values={defaultValues}
          onChange={mockOnChange}
          maxItems={2}
        />
      );

      expect(screen.getByTestId('repeatable-max-reached')).toHaveAttribute('role', 'status');
    });

    it('should have data-item-id attribute', () => {
      render(
        <RepeatableItemList
          item={defaultItem}
          values={defaultValues}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('repeatable-item-list')).toHaveAttribute('data-item-id', 'email');
    });

    it('should have data-item-index on each item wrapper', () => {
      render(
        <RepeatableItemList
          item={defaultItem}
          values={defaultValues}
          onChange={mockOnChange}
        />
      );

      const wrappers = screen.getAllByTestId('repeatable-item-wrapper');
      expect(wrappers[0]).toHaveAttribute('data-item-index', '0');
      expect(wrappers[1]).toHaveAttribute('data-item-index', '1');
    });
  });


  describe('Custom Class Name', () => {
    it('should apply custom class name', () => {
      render(
        <RepeatableItemList
          item={defaultItem}
          values={defaultValues}
          onChange={mockOnChange}
          className="custom-class"
        />
      );

      expect(screen.getByTestId('repeatable-item-list')).toHaveClass('custom-class');
    });
  });
});
