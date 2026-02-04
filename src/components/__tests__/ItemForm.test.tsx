/**
 * ItemForm Component Tests
 * 
 * Tests for the ItemForm component that renders various input types
 * with sensitive field toggle and help text support.
 * 
 * Requirements: 6.2, 6.3, 8.2, 8.4
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ItemForm } from '../ItemForm';
import { getInputType } from '../formUtils';
import type { ItemDefinition } from '../../types/checklist-structure';

describe('getInputType', () => {
  describe('Sensitive fields (Requirement 6.2)', () => {
    it('should return password type for sensitive field when not visible', () => {
      expect(getInputType('text', true, false)).toBe('password');
    });

    it('should return text type for sensitive text field when visible', () => {
      expect(getInputType('text', true, true)).toBe('text');
    });

    it('should return email type for sensitive email field when visible', () => {
      expect(getInputType('email', true, true)).toBe('email');
    });
  });

  describe('HTML5 input types (Requirement 8.4)', () => {
    it('should return email type for email field', () => {
      expect(getInputType('email', false, false)).toBe('email');
    });

    it('should return tel type for tel field', () => {
      expect(getInputType('tel', false, false)).toBe('tel');
    });

    it('should return url type for url field', () => {
      expect(getInputType('url', false, false)).toBe('url');
    });

    it('should return number type for number field', () => {
      expect(getInputType('number', false, false)).toBe('number');
    });

    it('should return text type for text field', () => {
      expect(getInputType('text', false, false)).toBe('text');
    });

    it('should return password type for password field when not visible', () => {
      expect(getInputType('password', false, false)).toBe('password');
    });

    it('should return text type for password field when visible', () => {
      expect(getInputType('password', false, true)).toBe('text');
    });
  });
});

describe('ItemForm', () => {
  const mockOnChange = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
    mockOnDelete.mockClear();
  });

  describe('Text Input', () => {
    const textItem: ItemDefinition = {
      id: 'username',
      label: 'Username',
      type: 'text',
      placeholder: 'Enter your username',
    };

    it('should render text input with label', () => {
      render(
        <ItemForm item={textItem} value="" onChange={mockOnChange} />
      );

      expect(screen.getByLabelText(/Username/)).toBeInTheDocument();
      expect(screen.getByTestId('item-input')).toHaveAttribute('type', 'text');
    });

    it('should render placeholder text', () => {
      render(
        <ItemForm item={textItem} value="" onChange={mockOnChange} />
      );

      expect(screen.getByPlaceholderText('Enter your username')).toBeInTheDocument();
    });

    it('should display current value', () => {
      render(
        <ItemForm item={textItem} value="testuser" onChange={mockOnChange} />
      );

      expect(screen.getByTestId('item-input')).toHaveValue('testuser');
    });

    it('should call onChange when value changes', () => {
      render(
        <ItemForm item={textItem} value="" onChange={mockOnChange} />
      );

      fireEvent.change(screen.getByTestId('item-input'), {
        target: { value: 'newvalue' },
      });

      expect(mockOnChange).toHaveBeenCalledWith('newvalue');
    });
  });

  describe('Email Input (Requirement 8.4)', () => {
    const emailItem: ItemDefinition = {
      id: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'you@example.com',
    };

    it('should render email input type', () => {
      render(
        <ItemForm item={emailItem} value="" onChange={mockOnChange} />
      );

      expect(screen.getByTestId('item-input')).toHaveAttribute('type', 'email');
    });

    it('should display email icon', () => {
      render(
        <ItemForm item={emailItem} value="" onChange={mockOnChange} />
      );

      expect(screen.getByText('📧')).toBeInTheDocument();
    });
  });

  describe('Tel Input (Requirement 8.4)', () => {
    const telItem: ItemDefinition = {
      id: 'phone',
      label: 'Phone Number',
      type: 'tel',
      placeholder: '+1 (555) 123-4567',
    };

    it('should render tel input type', () => {
      render(
        <ItemForm item={telItem} value="" onChange={mockOnChange} />
      );

      expect(screen.getByTestId('item-input')).toHaveAttribute('type', 'tel');
    });

    it('should display phone icon', () => {
      render(
        <ItemForm item={telItem} value="" onChange={mockOnChange} />
      );

      expect(screen.getByText('📞')).toBeInTheDocument();
    });
  });

  describe('URL Input (Requirement 8.4)', () => {
    const urlItem: ItemDefinition = {
      id: 'website',
      label: 'Website URL',
      type: 'url',
      placeholder: 'https://example.com',
    };

    it('should render url input type', () => {
      render(
        <ItemForm item={urlItem} value="" onChange={mockOnChange} />
      );

      expect(screen.getByTestId('item-input')).toHaveAttribute('type', 'url');
    });

    it('should display link icon', () => {
      render(
        <ItemForm item={urlItem} value="" onChange={mockOnChange} />
      );

      expect(screen.getByText('🔗')).toBeInTheDocument();
    });
  });

  describe('Password Input (Requirement 6.2)', () => {
    const passwordItem: ItemDefinition = {
      id: 'password',
      label: 'Password',
      type: 'password',
      placeholder: '••••••••',
    };

    it('should render password input type by default', () => {
      render(
        <ItemForm item={passwordItem} value="" onChange={mockOnChange} />
      );

      expect(screen.getByTestId('item-input')).toHaveAttribute('type', 'password');
    });

    it('should display lock icon', () => {
      render(
        <ItemForm item={passwordItem} value="" onChange={mockOnChange} />
      );

      expect(screen.getByText('🔒')).toBeInTheDocument();
    });
  });

  describe('Textarea Input', () => {
    const textareaItem: ItemDefinition = {
      id: 'notes',
      label: 'Notes',
      type: 'textarea',
      placeholder: 'Enter additional notes...',
    };

    it('should render textarea element', () => {
      render(
        <ItemForm item={textareaItem} value="" onChange={mockOnChange} />
      );

      const textarea = screen.getByTestId('item-input');
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('should display notes icon', () => {
      render(
        <ItemForm item={textareaItem} value="" onChange={mockOnChange} />
      );

      expect(screen.getByText('📝')).toBeInTheDocument();
    });

    it('should display current value', () => {
      render(
        <ItemForm item={textareaItem} value="Some notes here" onChange={mockOnChange} />
      );

      expect(screen.getByTestId('item-input')).toHaveValue('Some notes here');
    });
  });

  describe('Sensitive Field Toggle (Requirements 6.2, 6.3)', () => {
    const sensitiveItem: ItemDefinition = {
      id: 'pin',
      label: 'PIN Code',
      type: 'text',
      sensitive: true,
      placeholder: '••••',
    };

    it('should render password type for sensitive field by default', () => {
      render(
        <ItemForm item={sensitiveItem} value="" onChange={mockOnChange} />
      );

      expect(screen.getByTestId('item-input')).toHaveAttribute('type', 'password');
    });

    it('should render visibility toggle button for sensitive field', () => {
      render(
        <ItemForm item={sensitiveItem} value="" onChange={mockOnChange} />
      );

      expect(screen.getByTestId('item-visibility-toggle')).toBeInTheDocument();
    });

    it('should toggle to text type when visibility button is clicked', () => {
      render(
        <ItemForm item={sensitiveItem} value="" onChange={mockOnChange} />
      );

      fireEvent.click(screen.getByTestId('item-visibility-toggle'));

      expect(screen.getByTestId('item-input')).toHaveAttribute('type', 'text');
    });

    it('should toggle back to password type when clicked again', () => {
      render(
        <ItemForm item={sensitiveItem} value="" onChange={mockOnChange} />
      );

      fireEvent.click(screen.getByTestId('item-visibility-toggle'));
      fireEvent.click(screen.getByTestId('item-visibility-toggle'));

      expect(screen.getByTestId('item-input')).toHaveAttribute('type', 'password');
    });

    it('should have accessible label for toggle button', () => {
      render(
        <ItemForm item={sensitiveItem} value="" onChange={mockOnChange} />
      );

      expect(screen.getByLabelText('显示内容')).toBeInTheDocument();
    });

    it('should update accessible label when visible', () => {
      render(
        <ItemForm item={sensitiveItem} value="" onChange={mockOnChange} />
      );

      fireEvent.click(screen.getByTestId('item-visibility-toggle'));

      expect(screen.getByLabelText('隐藏内容')).toBeInTheDocument();
    });

    it('should not render toggle for non-sensitive fields', () => {
      const nonSensitiveItem: ItemDefinition = {
        id: 'name',
        label: 'Name',
        type: 'text',
      };

      render(
        <ItemForm item={nonSensitiveItem} value="" onChange={mockOnChange} />
      );

      expect(screen.queryByTestId('item-visibility-toggle')).not.toBeInTheDocument();
    });

    it('should respect sensitive prop override', () => {
      const nonSensitiveItem: ItemDefinition = {
        id: 'name',
        label: 'Name',
        type: 'text',
        sensitive: false,
      };

      render(
        <ItemForm item={nonSensitiveItem} value="" onChange={mockOnChange} sensitive={true} />
      );

      expect(screen.getByTestId('item-visibility-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('item-input')).toHaveAttribute('type', 'password');
    });
  });

  describe('Help Text (Requirement 8.2)', () => {
    const itemWithHelp: ItemDefinition = {
      id: 'complex-field',
      label: 'Complex Field',
      type: 'text',
      helpText: 'This is a helpful hint for filling out this field',
    };

    it('should render help text when provided', () => {
      render(
        <ItemForm item={itemWithHelp} value="" onChange={mockOnChange} />
      );

      expect(screen.getByTestId('item-help-text')).toBeInTheDocument();
      expect(screen.getByText('This is a helpful hint for filling out this field')).toBeInTheDocument();
    });

    it('should not render help text when not provided', () => {
      const itemWithoutHelp: ItemDefinition = {
        id: 'simple-field',
        label: 'Simple Field',
        type: 'text',
      };

      render(
        <ItemForm item={itemWithoutHelp} value="" onChange={mockOnChange} />
      );

      expect(screen.queryByTestId('item-help-text')).not.toBeInTheDocument();
    });

    it('should associate help text with input via aria-describedby', () => {
      render(
        <ItemForm item={itemWithHelp} value="" onChange={mockOnChange} />
      );

      const input = screen.getByTestId('item-input');
      const helpText = screen.getByTestId('item-help-text');
      
      expect(input).toHaveAttribute('aria-describedby', helpText.id);
    });
  });

  describe('Required Field', () => {
    const requiredItem: ItemDefinition = {
      id: 'required-field',
      label: 'Required Field',
      type: 'text',
      required: true,
    };

    it('should display required indicator', () => {
      render(
        <ItemForm item={requiredItem} value="" onChange={mockOnChange} />
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should set required attribute on input', () => {
      render(
        <ItemForm item={requiredItem} value="" onChange={mockOnChange} />
      );

      expect(screen.getByTestId('item-input')).toHaveAttribute('required');
    });
  });

  describe('Delete Button', () => {
    const item: ItemDefinition = {
      id: 'deletable',
      label: 'Deletable Item',
      type: 'text',
    };

    it('should render delete button when onDelete is provided', () => {
      render(
        <ItemForm item={item} value="" onChange={mockOnChange} onDelete={mockOnDelete} />
      );

      expect(screen.getByTestId('item-delete-button')).toBeInTheDocument();
    });

    it('should not render delete button when onDelete is not provided', () => {
      render(
        <ItemForm item={item} value="" onChange={mockOnChange} />
      );

      expect(screen.queryByTestId('item-delete-button')).not.toBeInTheDocument();
    });

    it('should call onDelete when delete button is clicked', () => {
      render(
        <ItemForm item={item} value="" onChange={mockOnChange} onDelete={mockOnDelete} />
      );

      fireEvent.click(screen.getByTestId('item-delete-button'));

      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it('should have accessible label for delete button', () => {
      render(
        <ItemForm item={item} value="" onChange={mockOnChange} onDelete={mockOnDelete} />
      );

      expect(screen.getByLabelText('删除 Deletable Item')).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    const item: ItemDefinition = {
      id: 'disabled-field',
      label: 'Disabled Field',
      type: 'text',
      sensitive: true,
    };

    it('should disable input when disabled prop is true', () => {
      render(
        <ItemForm item={item} value="" onChange={mockOnChange} disabled={true} />
      );

      expect(screen.getByTestId('item-input')).toBeDisabled();
    });

    it('should disable visibility toggle when disabled', () => {
      render(
        <ItemForm item={item} value="" onChange={mockOnChange} disabled={true} />
      );

      expect(screen.getByTestId('item-visibility-toggle')).toBeDisabled();
    });

    it('should disable delete button when disabled', () => {
      render(
        <ItemForm item={item} value="" onChange={mockOnChange} onDelete={mockOnDelete} disabled={true} />
      );

      expect(screen.getByTestId('item-delete-button')).toBeDisabled();
    });
  });

  describe('Select Input', () => {
    const selectItem: ItemDefinition = {
      id: 'account-type',
      label: 'Account Type',
      type: 'select',
      options: [
        { value: 'checking', label: 'Checking' },
        { value: 'savings', label: 'Savings' },
        { value: 'both', label: 'Both' },
      ],
    };

    it('should render select element', () => {
      render(
        <ItemForm item={selectItem} value="" onChange={mockOnChange} />
      );

      const select = screen.getByTestId('item-input');
      expect(select.tagName).toBe('SELECT');
    });

    it('should render all options', () => {
      render(
        <ItemForm item={selectItem} value="" onChange={mockOnChange} />
      );

      expect(screen.getByText('Checking')).toBeInTheDocument();
      expect(screen.getByText('Savings')).toBeInTheDocument();
      expect(screen.getByText('Both')).toBeInTheDocument();
    });

    it('should render default placeholder option', () => {
      render(
        <ItemForm item={selectItem} value="" onChange={mockOnChange} />
      );

      expect(screen.getByText('请选择...')).toBeInTheDocument();
    });

    it('should display selected value', () => {
      render(
        <ItemForm item={selectItem} value="savings" onChange={mockOnChange} />
      );

      expect(screen.getByTestId('item-input')).toHaveValue('savings');
    });

    it('should call onChange when selection changes', () => {
      render(
        <ItemForm item={selectItem} value="" onChange={mockOnChange} />
      );

      fireEvent.change(screen.getByTestId('item-input'), {
        target: { value: 'checking' },
      });

      expect(mockOnChange).toHaveBeenCalledWith('checking');
    });
  });

  describe('Checkbox Input', () => {
    const checkboxItem: ItemDefinition = {
      id: 'agree',
      label: 'I agree to the terms',
      type: 'checkbox',
      helpText: 'Please read the terms before agreeing',
    };

    it('should render checkbox input', () => {
      render(
        <ItemForm item={checkboxItem} value={false} onChange={mockOnChange} />
      );

      expect(screen.getByTestId('item-input')).toHaveAttribute('type', 'checkbox');
    });

    it('should display unchecked state', () => {
      render(
        <ItemForm item={checkboxItem} value={false} onChange={mockOnChange} />
      );

      expect(screen.getByTestId('item-input')).not.toBeChecked();
    });

    it('should display checked state', () => {
      render(
        <ItemForm item={checkboxItem} value={true} onChange={mockOnChange} />
      );

      expect(screen.getByTestId('item-input')).toBeChecked();
    });

    it('should call onChange with boolean value', () => {
      render(
        <ItemForm item={checkboxItem} value={false} onChange={mockOnChange} />
      );

      fireEvent.click(screen.getByTestId('item-input'));

      expect(mockOnChange).toHaveBeenCalledWith(true);
    });

    it('should render help text for checkbox', () => {
      render(
        <ItemForm item={checkboxItem} value={false} onChange={mockOnChange} />
      );

      expect(screen.getByTestId('item-help-text')).toBeInTheDocument();
    });
  });

  describe('Number Input', () => {
    const numberItem: ItemDefinition = {
      id: 'age',
      label: 'Age',
      type: 'number',
      placeholder: '25',
    };

    it('should render number input type', () => {
      render(
        <ItemForm item={numberItem} value="" onChange={mockOnChange} />
      );

      expect(screen.getByTestId('item-input')).toHaveAttribute('type', 'number');
    });

    it('should display number icon', () => {
      render(
        <ItemForm item={numberItem} value="" onChange={mockOnChange} />
      );

      expect(screen.getByText('🔢')).toBeInTheDocument();
    });

    it('should handle numeric value', () => {
      render(
        <ItemForm item={numberItem} value={25} onChange={mockOnChange} />
      );

      expect(screen.getByTestId('item-input')).toHaveValue(25);
    });
  });

  describe('Custom Class Name', () => {
    const item: ItemDefinition = {
      id: 'custom',
      label: 'Custom',
      type: 'text',
    };

    it('should apply custom class name', () => {
      render(
        <ItemForm item={item} value="" onChange={mockOnChange} className="custom-class" />
      );

      expect(screen.getByTestId('item-form')).toHaveClass('custom-class');
    });
  });
});
