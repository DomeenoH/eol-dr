/**
 * BankAccountCard Component Tests
 * 
 * Tests for the BankAccountCard component that displays bank account cards
 * with account type selection and PIN code hidden display.
 * Requirements: 9.5
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  BankAccountCard,
  BankAccountCardForm,
  BankAccountCardList,
} from '../BankAccountCard';
import {
  accountTypeConfig,
  accountTypes,
  getAccountTypeLabel,
  getAccountTypeLabelEn,
} from '../../utils/bank-account-utils';
import type { BankAccountData } from '../../types/platform';

describe('getAccountTypeLabel', () => {
  it('should return correct label for checking type', () => {
    expect(getAccountTypeLabel('checking')).toBe('支票账户');
  });

  it('should return correct label for savings type', () => {
    expect(getAccountTypeLabel('savings')).toBe('储蓄账户');
  });

  it('should return correct label for both type', () => {
    expect(getAccountTypeLabel('both')).toBe('两者都有');
  });
});

describe('getAccountTypeLabelEn', () => {
  it('should return correct English label for checking type', () => {
    expect(getAccountTypeLabelEn('checking')).toBe('Checking');
  });

  it('should return correct English label for savings type', () => {
    expect(getAccountTypeLabelEn('savings')).toBe('Savings');
  });

  it('should return correct English label for both type', () => {
    expect(getAccountTypeLabelEn('both')).toBe('Both');
  });
});


describe('accountTypeConfig', () => {
  it('should have configuration for all account types', () => {
    accountTypes.forEach((type) => {
      expect(accountTypeConfig[type]).toBeDefined();
      expect(accountTypeConfig[type].label).toBeTruthy();
      expect(accountTypeConfig[type].labelEn).toBeTruthy();
    });
  });
});

describe('accountTypes', () => {
  it('should include all expected account types', () => {
    expect(accountTypes).toContain('checking');
    expect(accountTypes).toContain('savings');
    expect(accountTypes).toContain('both');
  });

  it('should have exactly 3 account types', () => {
    expect(accountTypes).toHaveLength(3);
  });
});

describe('BankAccountCard', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnToggleEdit = vi.fn();

  const defaultAccount: BankAccountData = {
    bankName: 'Fak Bank',
    accountType: 'checking',
    pin: '1234',
    purpose: '主要账户，可支付国际账单',
  };

  beforeEach(() => {
    mockOnEdit.mockClear();
    mockOnDelete.mockClear();
    mockOnToggleEdit.mockClear();
  });

  describe('Display Mode', () => {
    it('should render bank name', () => {
      render(
        <BankAccountCard
          account={defaultAccount}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('bank-name')).toHaveTextContent('Fak Bank');
    });

    it('should render account type badge', () => {
      render(
        <BankAccountCard
          account={defaultAccount}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('account-type-badge')).toHaveTextContent('Checking');
    });

    it('should render account type display', () => {
      render(
        <BankAccountCard
          account={defaultAccount}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('account-type-display')).toHaveTextContent('支票账户');
    });

    it('should render purpose when provided', () => {
      render(
        <BankAccountCard
          account={defaultAccount}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('account-purpose')).toHaveTextContent('主要账户，可支付国际账单');
    });

    it('should not render purpose when not provided', () => {
      const accountWithoutPurpose: BankAccountData = {
        bankName: 'Test Bank',
        accountType: 'savings',
      };

      render(
        <BankAccountCard
          account={accountWithoutPurpose}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByTestId('account-purpose')).not.toBeInTheDocument();
    });
  });


  describe('PIN Code Display', () => {
    it('should hide PIN by default', () => {
      render(
        <BankAccountCard
          account={defaultAccount}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('pin-display')).toHaveTextContent('••••');
    });

    it('should show PIN when toggle is clicked', () => {
      render(
        <BankAccountCard
          account={defaultAccount}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      fireEvent.click(screen.getByTestId('pin-toggle-button'));

      expect(screen.getByTestId('pin-display')).toHaveTextContent('1234');
    });

    it('should hide PIN again when toggle is clicked twice', () => {
      render(
        <BankAccountCard
          account={defaultAccount}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      fireEvent.click(screen.getByTestId('pin-toggle-button'));
      fireEvent.click(screen.getByTestId('pin-toggle-button'));

      expect(screen.getByTestId('pin-display')).toHaveTextContent('••••');
    });

    it('should show "未设置" when PIN is not provided', () => {
      const accountWithoutPin: BankAccountData = {
        bankName: 'Test Bank',
        accountType: 'checking',
      };

      render(
        <BankAccountCard
          account={accountWithoutPin}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('pin-display')).toHaveTextContent('未设置');
    });

    it('should not show toggle button when PIN is not provided', () => {
      const accountWithoutPin: BankAccountData = {
        bankName: 'Test Bank',
        accountType: 'checking',
      };

      render(
        <BankAccountCard
          account={accountWithoutPin}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByTestId('pin-toggle-button')).not.toBeInTheDocument();
    });

    it('should have accessible label for toggle button', () => {
      render(
        <BankAccountCard
          account={defaultAccount}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByLabelText('显示 PIN 码')).toBeInTheDocument();
    });

    it('should update accessible label when PIN is visible', () => {
      render(
        <BankAccountCard
          account={defaultAccount}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      fireEvent.click(screen.getByTestId('pin-toggle-button'));

      expect(screen.getByLabelText('隐藏 PIN 码')).toBeInTheDocument();
    });
  });


  describe('Account Types', () => {
    it('should display checking type correctly', () => {
      render(
        <BankAccountCard
          account={defaultAccount}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('account-type-badge')).toHaveTextContent('Checking');
      expect(screen.getByTestId('account-type-display')).toHaveTextContent('支票账户');
    });

    it('should display savings type correctly', () => {
      const savingsAccount: BankAccountData = {
        bankName: 'Test Bank',
        accountType: 'savings',
      };

      render(
        <BankAccountCard
          account={savingsAccount}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('account-type-badge')).toHaveTextContent('Savings');
      expect(screen.getByTestId('account-type-display')).toHaveTextContent('储蓄账户');
    });

    it('should display both type correctly', () => {
      const bothAccount: BankAccountData = {
        bankName: 'Test Bank',
        accountType: 'both',
      };

      render(
        <BankAccountCard
          account={bothAccount}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('account-type-badge')).toHaveTextContent('Both');
      expect(screen.getByTestId('account-type-display')).toHaveTextContent('两者都有');
    });
  });

  describe('Action Buttons', () => {
    it('should render edit button', () => {
      render(
        <BankAccountCard
          account={defaultAccount}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleEdit={mockOnToggleEdit}
        />
      );

      expect(screen.getByTestId('account-edit-button')).toBeInTheDocument();
    });

    it('should render delete button', () => {
      render(
        <BankAccountCard
          account={defaultAccount}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('account-delete-button')).toBeInTheDocument();
    });

    it('should call onToggleEdit when edit button is clicked', () => {
      render(
        <BankAccountCard
          account={defaultAccount}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleEdit={mockOnToggleEdit}
        />
      );

      fireEvent.click(screen.getByTestId('account-edit-button'));
      expect(mockOnToggleEdit).toHaveBeenCalledTimes(1);
    });

    it('should call onDelete when delete button is clicked', () => {
      render(
        <BankAccountCard
          account={defaultAccount}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      fireEvent.click(screen.getByTestId('account-delete-button'));
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it('should disable buttons when disabled prop is true', () => {
      render(
        <BankAccountCard
          account={defaultAccount}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          disabled={true}
        />
      );

      expect(screen.getByTestId('account-edit-button')).toBeDisabled();
      expect(screen.getByTestId('account-delete-button')).toBeDisabled();
    });
  });


  describe('Edit Mode', () => {
    it('should render form when isEditing is true', () => {
      render(
        <BankAccountCard
          account={defaultAccount}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          isEditing={true}
          onToggleEdit={mockOnToggleEdit}
        />
      );

      expect(screen.getByTestId('bank-account-card-form')).toBeInTheDocument();
    });

    it('should not render card when isEditing is true', () => {
      render(
        <BankAccountCard
          account={defaultAccount}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          isEditing={true}
          onToggleEdit={mockOnToggleEdit}
        />
      );

      expect(screen.queryByTestId('bank-account-card')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels for action buttons', () => {
      render(
        <BankAccountCard
          account={defaultAccount}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByLabelText('编辑银行账户')).toBeInTheDocument();
      expect(screen.getByLabelText('删除银行账户')).toBeInTheDocument();
    });

    it('should have data-bank-name attribute for identification', () => {
      render(
        <BankAccountCard
          account={defaultAccount}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('bank-account-card')).toHaveAttribute('data-bank-name', 'Fak Bank');
    });
  });
});


describe('BankAccountCardForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  describe('Form Fields', () => {
    it('should render bank name input', () => {
      render(
        <BankAccountCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(screen.getByTestId('bank-name-input')).toBeInTheDocument();
    });

    it('should render account type radio buttons', () => {
      render(
        <BankAccountCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(screen.getByTestId('account-type-radio-checking')).toBeInTheDocument();
      expect(screen.getByTestId('account-type-radio-savings')).toBeInTheDocument();
      expect(screen.getByTestId('account-type-radio-both')).toBeInTheDocument();
    });

    it('should render PIN input', () => {
      render(
        <BankAccountCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(screen.getByTestId('bank-pin-input')).toBeInTheDocument();
    });

    it('should render purpose textarea', () => {
      render(
        <BankAccountCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(screen.getByTestId('bank-purpose-input')).toBeInTheDocument();
    });
  });

  describe('PIN Input Type', () => {
    it('should have password type by default', () => {
      render(
        <BankAccountCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(screen.getByTestId('bank-pin-input')).toHaveAttribute('type', 'password');
    });

    it('should toggle to text type when show button is clicked', () => {
      render(
        <BankAccountCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      fireEvent.click(screen.getByTestId('bank-pin-toggle'));

      expect(screen.getByTestId('bank-pin-input')).toHaveAttribute('type', 'text');
    });

    it('should toggle back to password type when clicked again', () => {
      render(
        <BankAccountCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      fireEvent.click(screen.getByTestId('bank-pin-toggle'));
      fireEvent.click(screen.getByTestId('bank-pin-toggle'));

      expect(screen.getByTestId('bank-pin-input')).toHaveAttribute('type', 'password');
    });
  });


  describe('Initial Data', () => {
    it('should populate form with initial data', () => {
      const initialData: Partial<BankAccountData> = {
        bankName: 'Fak Bank',
        accountType: 'savings',
        pin: '1234',
        purpose: '主要账户',
      };

      render(
        <BankAccountCardForm
          initialData={initialData}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByTestId('bank-name-input')).toHaveValue('Fak Bank');
      expect(screen.getByTestId('account-type-radio-savings')).toBeChecked();
      expect(screen.getByTestId('bank-pin-input')).toHaveValue('1234');
      expect(screen.getByTestId('bank-purpose-input')).toHaveValue('主要账户');
    });

    it('should default to checking account type', () => {
      render(
        <BankAccountCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(screen.getByTestId('account-type-radio-checking')).toBeChecked();
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with form data when submitted', () => {
      render(
        <BankAccountCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      fireEvent.change(screen.getByTestId('bank-name-input'), {
        target: { value: 'Test Bank' },
      });
      fireEvent.click(screen.getByTestId('account-type-radio-savings'));
      fireEvent.change(screen.getByTestId('bank-pin-input'), {
        target: { value: '5678' },
      });
      fireEvent.change(screen.getByTestId('bank-purpose-input'), {
        target: { value: 'Test purpose' },
      });

      fireEvent.click(screen.getByTestId('bank-submit-button'));

      expect(mockOnSubmit).toHaveBeenCalledWith({
        bankName: 'Test Bank',
        accountType: 'savings',
        pin: '5678',
        purpose: 'Test purpose',
      });
    });

    it('should trim whitespace from values', () => {
      render(
        <BankAccountCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      fireEvent.change(screen.getByTestId('bank-name-input'), {
        target: { value: '  Test Bank  ' },
      });
      fireEvent.change(screen.getByTestId('bank-pin-input'), {
        target: { value: '  1234  ' },
      });

      fireEvent.click(screen.getByTestId('bank-submit-button'));

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          bankName: 'Test Bank',
          pin: '1234',
        })
      );
    });

    it('should not submit if bank name is empty', () => {
      render(
        <BankAccountCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      fireEvent.click(screen.getByTestId('bank-submit-button'));

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should not submit if bank name is only whitespace', () => {
      render(
        <BankAccountCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      fireEvent.change(screen.getByTestId('bank-name-input'), {
        target: { value: '   ' },
      });
      fireEvent.click(screen.getByTestId('bank-submit-button'));

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should disable submit button when bank name is empty', () => {
      render(
        <BankAccountCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(screen.getByTestId('bank-submit-button')).toBeDisabled();
    });

    it('should enable submit button when bank name is provided', () => {
      render(
        <BankAccountCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      fireEvent.change(screen.getByTestId('bank-name-input'), {
        target: { value: 'Test Bank' },
      });

      expect(screen.getByTestId('bank-submit-button')).not.toBeDisabled();
    });

    it('should set pin to undefined when empty', () => {
      render(
        <BankAccountCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      fireEvent.change(screen.getByTestId('bank-name-input'), {
        target: { value: 'Test Bank' },
      });

      fireEvent.click(screen.getByTestId('bank-submit-button'));

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          pin: undefined,
        })
      );
    });

    it('should set purpose to undefined when empty', () => {
      render(
        <BankAccountCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      fireEvent.change(screen.getByTestId('bank-name-input'), {
        target: { value: 'Test Bank' },
      });

      fireEvent.click(screen.getByTestId('bank-submit-button'));

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          purpose: undefined,
        })
      );
    });
  });


  describe('Form Cancellation', () => {
    it('should call onCancel when cancel button is clicked', () => {
      render(
        <BankAccountCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      fireEvent.click(screen.getByTestId('bank-cancel-button'));

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Button Labels', () => {
    it('should show "添加" for new account', () => {
      render(
        <BankAccountCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(screen.getByTestId('bank-submit-button')).toHaveTextContent('添加');
    });

    it('should show "保存" for existing account', () => {
      render(
        <BankAccountCardForm
          initialData={{ bankName: 'Test Bank' }}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByTestId('bank-submit-button')).toHaveTextContent('保存');
    });
  });

  describe('Disabled State', () => {
    it('should disable all inputs when disabled prop is true', () => {
      render(
        <BankAccountCardForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          disabled={true}
        />
      );

      expect(screen.getByTestId('bank-name-input')).toBeDisabled();
      expect(screen.getByTestId('account-type-radio-checking')).toBeDisabled();
      expect(screen.getByTestId('account-type-radio-savings')).toBeDisabled();
      expect(screen.getByTestId('account-type-radio-both')).toBeDisabled();
      expect(screen.getByTestId('bank-pin-input')).toBeDisabled();
      expect(screen.getByTestId('bank-purpose-input')).toBeDisabled();
      expect(screen.getByTestId('bank-cancel-button')).toBeDisabled();
      expect(screen.getByTestId('bank-submit-button')).toBeDisabled();
    });
  });

  describe('Account Type Selection', () => {
    it('should allow changing account type', () => {
      render(
        <BankAccountCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      fireEvent.click(screen.getByTestId('account-type-radio-savings'));

      expect(screen.getByTestId('account-type-radio-savings')).toBeChecked();
      expect(screen.getByTestId('account-type-radio-checking')).not.toBeChecked();
    });

    it('should include account type in submission', () => {
      render(
        <BankAccountCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      fireEvent.change(screen.getByTestId('bank-name-input'), {
        target: { value: 'Test Bank' },
      });
      fireEvent.click(screen.getByTestId('account-type-radio-both'));

      fireEvent.click(screen.getByTestId('bank-submit-button'));

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          accountType: 'both',
        })
      );
    });
  });
});


describe('BankAccountCardList', () => {
  const mockOnChange = vi.fn();

  const defaultAccounts: BankAccountData[] = [
    {
      bankName: 'Fak Bank',
      accountType: 'checking',
      pin: '1234',
      purpose: '主要账户',
    },
    {
      bankName: 'Test Bank',
      accountType: 'savings',
      pin: '5678',
    },
    {
      bankName: 'Another Bank',
      accountType: 'both',
      purpose: '备用账户',
    },
  ];

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('List Display', () => {
    it('should render all accounts', () => {
      render(
        <BankAccountCardList accounts={defaultAccounts} onChange={mockOnChange} />
      );

      expect(screen.getAllByTestId('bank-account-card')).toHaveLength(3);
    });

    it('should render accounts in list layout', () => {
      render(
        <BankAccountCardList accounts={defaultAccounts} onChange={mockOnChange} />
      );

      expect(screen.getByTestId('bank-account-list')).toBeInTheDocument();
    });

    it('should render header text', () => {
      render(
        <BankAccountCardList accounts={defaultAccounts} onChange={mockOnChange} />
      );

      expect(screen.getByText('🏦 银行账户')).toBeInTheDocument();
      expect(screen.getByText('管理您的银行账户信息，包括账户类型和 PIN 码')).toBeInTheDocument();
    });

    it('should render add account button', () => {
      render(
        <BankAccountCardList accounts={defaultAccounts} onChange={mockOnChange} />
      );

      expect(screen.getByTestId('add-bank-account-button')).toBeInTheDocument();
    });

    it('should render empty list', () => {
      render(<BankAccountCardList accounts={[]} onChange={mockOnChange} />);

      expect(screen.queryAllByTestId('bank-account-card')).toHaveLength(0);
      expect(screen.getByTestId('add-bank-account-button')).toBeInTheDocument();
    });
  });

  describe('Add Account', () => {
    it('should show form when add button is clicked', () => {
      render(
        <BankAccountCardList accounts={defaultAccounts} onChange={mockOnChange} />
      );

      fireEvent.click(screen.getByTestId('add-bank-account-button'));

      expect(screen.getByTestId('bank-account-card-form')).toBeInTheDocument();
    });

    it('should hide add button when form is shown', () => {
      render(
        <BankAccountCardList accounts={defaultAccounts} onChange={mockOnChange} />
      );

      fireEvent.click(screen.getByTestId('add-bank-account-button'));

      expect(screen.queryByTestId('add-bank-account-button')).not.toBeInTheDocument();
    });

    it('should add new account when form is submitted', () => {
      render(<BankAccountCardList accounts={[]} onChange={mockOnChange} />);

      fireEvent.click(screen.getByTestId('add-bank-account-button'));

      fireEvent.change(screen.getByTestId('bank-name-input'), {
        target: { value: 'New Bank' },
      });
      fireEvent.click(screen.getByTestId('bank-submit-button'));

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          bankName: 'New Bank',
        }),
      ]);
    });

    it('should hide form when cancelled', () => {
      render(
        <BankAccountCardList accounts={defaultAccounts} onChange={mockOnChange} />
      );

      fireEvent.click(screen.getByTestId('add-bank-account-button'));
      fireEvent.click(screen.getByTestId('bank-cancel-button'));

      expect(screen.queryByTestId('bank-account-card-form')).not.toBeInTheDocument();
      expect(screen.getByTestId('add-bank-account-button')).toBeInTheDocument();
    });
  });


  describe('Edit Account', () => {
    it('should show form when edit button is clicked', () => {
      render(
        <BankAccountCardList accounts={defaultAccounts} onChange={mockOnChange} />
      );

      const editButtons = screen.getAllByTestId('account-edit-button');
      fireEvent.click(editButtons[0]);

      expect(screen.getByTestId('bank-account-card-form')).toBeInTheDocument();
    });

    it('should update account when form is submitted', () => {
      render(
        <BankAccountCardList accounts={defaultAccounts} onChange={mockOnChange} />
      );

      const editButtons = screen.getAllByTestId('account-edit-button');
      fireEvent.click(editButtons[0]);

      fireEvent.change(screen.getByTestId('bank-name-input'), {
        target: { value: 'Updated Bank' },
      });
      fireEvent.click(screen.getByTestId('bank-submit-button'));

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          bankName: 'Updated Bank',
        }),
        defaultAccounts[1],
        defaultAccounts[2],
      ]);
    });

    it('should close form when cancelled', () => {
      render(
        <BankAccountCardList accounts={defaultAccounts} onChange={mockOnChange} />
      );

      const editButtons = screen.getAllByTestId('account-edit-button');
      fireEvent.click(editButtons[0]);
      fireEvent.click(screen.getByTestId('bank-cancel-button'));

      expect(screen.queryByTestId('bank-account-card-form')).not.toBeInTheDocument();
      expect(screen.getAllByTestId('bank-account-card')).toHaveLength(3);
    });
  });

  describe('Delete Account', () => {
    it('should remove account when delete button is clicked', () => {
      render(
        <BankAccountCardList accounts={defaultAccounts} onChange={mockOnChange} />
      );

      const deleteButtons = screen.getAllByTestId('account-delete-button');
      fireEvent.click(deleteButtons[1]); // Delete Test Bank

      expect(mockOnChange).toHaveBeenCalledWith([
        defaultAccounts[0],
        defaultAccounts[2],
      ]);
    });
  });

  describe('Disabled State', () => {
    it('should disable add button when disabled', () => {
      render(
        <BankAccountCardList
          accounts={defaultAccounts}
          onChange={mockOnChange}
          disabled={true}
        />
      );

      expect(screen.getByTestId('add-bank-account-button')).toBeDisabled();
    });

    it('should disable all edit and delete buttons when disabled', () => {
      render(
        <BankAccountCardList
          accounts={defaultAccounts}
          onChange={mockOnChange}
          disabled={true}
        />
      );

      screen.getAllByTestId('account-edit-button').forEach((button) => {
        expect(button).toBeDisabled();
      });
      screen.getAllByTestId('account-delete-button').forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });
});
