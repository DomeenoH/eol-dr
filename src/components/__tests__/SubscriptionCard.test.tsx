/**
 * SubscriptionCard Component Tests
 * 
 * Tests for the SubscriptionCard component that displays subscription services
 * with Logo grid layout and keep/cancel/transfer status selection.
 * Requirements: 9.3
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  SubscriptionCard,
  SubscriptionCardForm,
  SubscriptionCardList,
  actionConfig,
  commonServices,
  getServiceIcon,
} from '../SubscriptionCard';
import type { SubscriptionData } from '../../types/platform';

describe('getServiceIcon', () => {
  it('should return custom icon when provided', () => {
    expect(getServiceIcon('Netflix', '🎥')).toBe('🎥');
  });

  it('should return icon from common services when service name matches', () => {
    expect(getServiceIcon('Netflix')).toBe('🎬');
    expect(getServiceIcon('Spotify')).toBe('🎵');
  });

  it('should be case insensitive for service name matching', () => {
    expect(getServiceIcon('netflix')).toBe('🎬');
    expect(getServiceIcon('SPOTIFY')).toBe('🎵');
  });

  it('should return default icon for unknown services', () => {
    expect(getServiceIcon('Unknown Service')).toBe('📱');
  });
});


describe('actionConfig', () => {
  it('should have configuration for keep action', () => {
    expect(actionConfig.keep).toBeDefined();
    expect(actionConfig.keep.label).toBe('保留');
  });

  it('should have configuration for cancel action', () => {
    expect(actionConfig.cancel).toBeDefined();
    expect(actionConfig.cancel.label).toBe('取消');
  });

  it('should have configuration for transfer action', () => {
    expect(actionConfig.transfer).toBeDefined();
    expect(actionConfig.transfer.label).toBe('转让');
  });

  it('should have all required styling properties', () => {
    const actions = ['keep', 'cancel', 'transfer'] as const;
    actions.forEach((action) => {
      expect(actionConfig[action].bgColor).toBeTruthy();
      expect(actionConfig[action].textColor).toBeTruthy();
      expect(actionConfig[action].borderColor).toBeTruthy();
    });
  });
});

describe('commonServices', () => {
  it('should include popular streaming services', () => {
    const serviceNames = commonServices.map((s) => s.name);
    expect(serviceNames).toContain('Netflix');
    expect(serviceNames).toContain('Spotify');
    expect(serviceNames).toContain('YouTube Premium');
  });

  it('should have icons for all services', () => {
    commonServices.forEach((service) => {
      expect(service.icon).toBeTruthy();
    });
  });
});


describe('SubscriptionCard', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnToggleEdit = vi.fn();

  const defaultSubscription: SubscriptionData = {
    service: 'Netflix',
    action: 'keep',
    notes: 'Family plan',
  };

  beforeEach(() => {
    mockOnEdit.mockClear();
    mockOnDelete.mockClear();
    mockOnToggleEdit.mockClear();
  });

  describe('Display Mode', () => {
    it('should render service name', () => {
      render(
        <SubscriptionCard
          subscription={defaultSubscription}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('subscription-service-name')).toHaveTextContent('Netflix');
    });

    it('should render service icon', () => {
      render(
        <SubscriptionCard
          subscription={defaultSubscription}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('subscription-icon')).toBeInTheDocument();
    });

    it('should render action badge', () => {
      render(
        <SubscriptionCard
          subscription={defaultSubscription}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('subscription-action-badge')).toHaveTextContent('保留');
    });

    it('should render notes when provided', () => {
      render(
        <SubscriptionCard
          subscription={defaultSubscription}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('subscription-notes')).toHaveTextContent('Family plan');
    });

    it('should not render notes when not provided', () => {
      const subscriptionWithoutNotes: SubscriptionData = {
        service: 'Netflix',
        action: 'keep',
      };

      render(
        <SubscriptionCard
          subscription={subscriptionWithoutNotes}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByTestId('subscription-notes')).not.toBeInTheDocument();
    });
  });


  describe('Action Types', () => {
    it('should display keep action correctly', () => {
      const subscription: SubscriptionData = {
        service: 'Netflix',
        action: 'keep',
      };

      render(
        <SubscriptionCard
          subscription={subscription}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('subscription-action-badge')).toHaveTextContent('保留');
    });

    it('should display cancel action correctly', () => {
      const subscription: SubscriptionData = {
        service: 'Netflix',
        action: 'cancel',
      };

      render(
        <SubscriptionCard
          subscription={subscription}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('subscription-action-badge')).toHaveTextContent('取消');
    });

    it('should display transfer action correctly', () => {
      const subscription: SubscriptionData = {
        service: 'Netflix',
        action: 'transfer',
        transferTo: 'John',
      };

      render(
        <SubscriptionCard
          subscription={subscription}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('subscription-action-badge')).toHaveTextContent('转让');
    });

    it('should display transfer recipient when action is transfer', () => {
      const subscription: SubscriptionData = {
        service: 'Netflix',
        action: 'transfer',
        transferTo: 'John',
      };

      render(
        <SubscriptionCard
          subscription={subscription}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('subscription-transfer-to')).toHaveTextContent('→ John');
    });

    it('should not display transfer recipient when action is not transfer', () => {
      render(
        <SubscriptionCard
          subscription={defaultSubscription}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByTestId('subscription-transfer-to')).not.toBeInTheDocument();
    });
  });


  describe('Custom Icon', () => {
    it('should use custom icon when provided', () => {
      const subscription: SubscriptionData = {
        service: 'Custom Service',
        icon: '🎯',
        action: 'keep',
      };

      render(
        <SubscriptionCard
          subscription={subscription}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('subscription-icon')).toHaveTextContent('🎯');
    });

    it('should use default icon from common services', () => {
      render(
        <SubscriptionCard
          subscription={defaultSubscription}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('subscription-icon')).toHaveTextContent('🎬');
    });
  });

  describe('Action Buttons', () => {
    it('should render edit button', () => {
      render(
        <SubscriptionCard
          subscription={defaultSubscription}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleEdit={mockOnToggleEdit}
        />
      );

      expect(screen.getByTestId('subscription-edit-button')).toBeInTheDocument();
    });

    it('should render delete button', () => {
      render(
        <SubscriptionCard
          subscription={defaultSubscription}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('subscription-delete-button')).toBeInTheDocument();
    });

    it('should call onToggleEdit when edit button is clicked', () => {
      render(
        <SubscriptionCard
          subscription={defaultSubscription}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleEdit={mockOnToggleEdit}
        />
      );

      fireEvent.click(screen.getByTestId('subscription-edit-button'));
      expect(mockOnToggleEdit).toHaveBeenCalledTimes(1);
    });

    it('should call onDelete when delete button is clicked', () => {
      render(
        <SubscriptionCard
          subscription={defaultSubscription}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      fireEvent.click(screen.getByTestId('subscription-delete-button'));
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it('should disable buttons when disabled prop is true', () => {
      render(
        <SubscriptionCard
          subscription={defaultSubscription}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          disabled={true}
        />
      );

      expect(screen.getByTestId('subscription-edit-button')).toBeDisabled();
      expect(screen.getByTestId('subscription-delete-button')).toBeDisabled();
    });
  });


  describe('Edit Mode', () => {
    it('should render form when isEditing is true', () => {
      render(
        <SubscriptionCard
          subscription={defaultSubscription}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          isEditing={true}
          onToggleEdit={mockOnToggleEdit}
        />
      );

      expect(screen.getByTestId('subscription-card-form')).toBeInTheDocument();
    });

    it('should not render card when isEditing is true', () => {
      render(
        <SubscriptionCard
          subscription={defaultSubscription}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          isEditing={true}
          onToggleEdit={mockOnToggleEdit}
        />
      );

      expect(screen.queryByTestId('subscription-card')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels for action buttons', () => {
      render(
        <SubscriptionCard
          subscription={defaultSubscription}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByLabelText('编辑订阅')).toBeInTheDocument();
      expect(screen.getByLabelText('删除订阅')).toBeInTheDocument();
    });

    it('should have data-service attribute for identification', () => {
      render(
        <SubscriptionCard
          subscription={defaultSubscription}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('subscription-card')).toHaveAttribute('data-service', 'Netflix');
    });
  });
});


describe('SubscriptionCardForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  describe('Form Fields', () => {
    it('should render service name input', () => {
      render(
        <SubscriptionCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(screen.getByTestId('subscription-service-input')).toBeInTheDocument();
    });

    it('should render icon input', () => {
      render(
        <SubscriptionCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(screen.getByTestId('subscription-icon-input')).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(
        <SubscriptionCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(screen.getByTestId('action-button-keep')).toBeInTheDocument();
      expect(screen.getByTestId('action-button-cancel')).toBeInTheDocument();
      expect(screen.getByTestId('action-button-transfer')).toBeInTheDocument();
    });

    it('should render notes textarea', () => {
      render(
        <SubscriptionCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(screen.getByTestId('subscription-notes-input')).toBeInTheDocument();
    });

    it('should show transfer-to input when transfer action is selected', () => {
      render(
        <SubscriptionCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      fireEvent.click(screen.getByTestId('action-button-transfer'));

      expect(screen.getByTestId('subscription-transfer-to-input')).toBeInTheDocument();
    });

    it('should hide transfer-to input when action is not transfer', () => {
      render(
        <SubscriptionCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(screen.queryByTestId('subscription-transfer-to-input')).not.toBeInTheDocument();
    });
  });


  describe('Initial Data', () => {
    it('should populate form with initial data', () => {
      const initialData: Partial<SubscriptionData> = {
        service: 'Netflix',
        icon: '🎬',
        action: 'cancel',
        notes: 'Test notes',
      };

      render(
        <SubscriptionCardForm
          initialData={initialData}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByTestId('subscription-service-input')).toHaveValue('Netflix');
      expect(screen.getByTestId('subscription-icon-input')).toHaveValue('🎬');
      expect(screen.getByTestId('subscription-notes-input')).toHaveValue('Test notes');
    });

    it('should default to keep action', () => {
      render(
        <SubscriptionCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const keepButton = screen.getByTestId('action-button-keep');
      expect(keepButton).toHaveAttribute('aria-checked', 'true');
    });

    it('should show transfer-to input with initial data when action is transfer', () => {
      const initialData: Partial<SubscriptionData> = {
        service: 'Netflix',
        action: 'transfer',
        transferTo: 'John',
      };

      render(
        <SubscriptionCardForm
          initialData={initialData}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByTestId('subscription-transfer-to-input')).toHaveValue('John');
    });
  });


  describe('Form Submission', () => {
    it('should call onSubmit with form data when submitted', () => {
      render(
        <SubscriptionCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      fireEvent.change(screen.getByTestId('subscription-service-input'), {
        target: { value: 'Netflix' },
      });
      fireEvent.change(screen.getByTestId('subscription-notes-input'), {
        target: { value: 'Test notes' },
      });

      fireEvent.click(screen.getByTestId('subscription-submit-button'));

      expect(mockOnSubmit).toHaveBeenCalledWith({
        service: 'Netflix',
        icon: undefined,
        action: 'keep',
        transferTo: undefined,
        notes: 'Test notes',
      });
    });

    it('should trim whitespace from values', () => {
      render(
        <SubscriptionCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      fireEvent.change(screen.getByTestId('subscription-service-input'), {
        target: { value: '  Netflix  ' },
      });

      fireEvent.click(screen.getByTestId('subscription-submit-button'));

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'Netflix',
        })
      );
    });

    it('should not submit if service name is empty', () => {
      render(
        <SubscriptionCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      fireEvent.click(screen.getByTestId('subscription-submit-button'));

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should not submit if service name is only whitespace', () => {
      render(
        <SubscriptionCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      fireEvent.change(screen.getByTestId('subscription-service-input'), {
        target: { value: '   ' },
      });
      fireEvent.click(screen.getByTestId('subscription-submit-button'));

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should disable submit button when service name is empty', () => {
      render(
        <SubscriptionCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(screen.getByTestId('subscription-submit-button')).toBeDisabled();
    });

    it('should enable submit button when service name is provided', () => {
      render(
        <SubscriptionCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      fireEvent.change(screen.getByTestId('subscription-service-input'), {
        target: { value: 'Netflix' },
      });

      expect(screen.getByTestId('subscription-submit-button')).not.toBeDisabled();
    });

    it('should include transferTo only when action is transfer', () => {
      render(
        <SubscriptionCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      fireEvent.change(screen.getByTestId('subscription-service-input'), {
        target: { value: 'Netflix' },
      });
      fireEvent.click(screen.getByTestId('action-button-transfer'));
      fireEvent.change(screen.getByTestId('subscription-transfer-to-input'), {
        target: { value: 'John' },
      });

      fireEvent.click(screen.getByTestId('subscription-submit-button'));

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'transfer',
          transferTo: 'John',
        })
      );
    });
  });


  describe('Form Cancellation', () => {
    it('should call onCancel when cancel button is clicked', () => {
      render(
        <SubscriptionCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      fireEvent.click(screen.getByTestId('subscription-cancel-button'));

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Button Labels', () => {
    it('should show "添加" for new subscription', () => {
      render(
        <SubscriptionCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(screen.getByTestId('subscription-submit-button')).toHaveTextContent('添加');
    });

    it('should show "保存" for existing subscription', () => {
      render(
        <SubscriptionCardForm
          initialData={{ service: 'Netflix' }}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByTestId('subscription-submit-button')).toHaveTextContent('保存');
    });
  });

  describe('Disabled State', () => {
    it('should disable all inputs when disabled prop is true', () => {
      render(
        <SubscriptionCardForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          disabled={true}
        />
      );

      expect(screen.getByTestId('subscription-service-input')).toBeDisabled();
      expect(screen.getByTestId('subscription-icon-input')).toBeDisabled();
      expect(screen.getByTestId('subscription-notes-input')).toBeDisabled();
      expect(screen.getByTestId('subscription-cancel-button')).toBeDisabled();
      expect(screen.getByTestId('subscription-submit-button')).toBeDisabled();
    });

    it('should disable action buttons when disabled', () => {
      render(
        <SubscriptionCardForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          disabled={true}
        />
      );

      expect(screen.getByTestId('action-button-keep')).toBeDisabled();
      expect(screen.getByTestId('action-button-cancel')).toBeDisabled();
      expect(screen.getByTestId('action-button-transfer')).toBeDisabled();
    });
  });
});


describe('SubscriptionCardList', () => {
  const mockOnChange = vi.fn();

  const defaultSubscriptions: SubscriptionData[] = [
    {
      service: 'YouTube Premium',
      action: 'keep',
    },
    {
      service: 'Netflix',
      action: 'cancel',
    },
    {
      service: 'Spotify',
      action: 'transfer',
      transferTo: 'John',
    },
  ];

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('List Display', () => {
    it('should render all subscriptions', () => {
      render(
        <SubscriptionCardList subscriptions={defaultSubscriptions} onChange={mockOnChange} />
      );

      expect(screen.getAllByTestId('subscription-card')).toHaveLength(3);
    });

    it('should render subscriptions in grid layout', () => {
      render(
        <SubscriptionCardList subscriptions={defaultSubscriptions} onChange={mockOnChange} />
      );

      expect(screen.getByTestId('subscription-grid')).toBeInTheDocument();
    });

    it('should render header text', () => {
      render(
        <SubscriptionCardList subscriptions={defaultSubscriptions} onChange={mockOnChange} />
      );

      expect(screen.getByText('📺 订阅服务管理')).toBeInTheDocument();
      expect(screen.getByText('管理您的订阅服务，选择保留、取消或转让')).toBeInTheDocument();
    });

    it('should render add subscription button', () => {
      render(
        <SubscriptionCardList subscriptions={defaultSubscriptions} onChange={mockOnChange} />
      );

      expect(screen.getByTestId('add-subscription-button')).toBeInTheDocument();
    });

    it('should render empty list', () => {
      render(<SubscriptionCardList subscriptions={[]} onChange={mockOnChange} />);

      expect(screen.queryAllByTestId('subscription-card')).toHaveLength(0);
      expect(screen.getByTestId('add-subscription-button')).toBeInTheDocument();
    });
  });


  describe('Add Subscription', () => {
    it('should show form when add button is clicked', () => {
      render(
        <SubscriptionCardList subscriptions={defaultSubscriptions} onChange={mockOnChange} />
      );

      fireEvent.click(screen.getByTestId('add-subscription-button'));

      expect(screen.getByTestId('subscription-card-form')).toBeInTheDocument();
    });

    it('should hide add button when form is shown', () => {
      render(
        <SubscriptionCardList subscriptions={defaultSubscriptions} onChange={mockOnChange} />
      );

      fireEvent.click(screen.getByTestId('add-subscription-button'));

      expect(screen.queryByTestId('add-subscription-button')).not.toBeInTheDocument();
    });

    it('should add new subscription when form is submitted', () => {
      render(<SubscriptionCardList subscriptions={[]} onChange={mockOnChange} />);

      fireEvent.click(screen.getByTestId('add-subscription-button'));

      fireEvent.change(screen.getByTestId('subscription-service-input'), {
        target: { value: 'New Service' },
      });
      fireEvent.click(screen.getByTestId('subscription-submit-button'));

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          service: 'New Service',
        }),
      ]);
    });

    it('should hide form when cancelled', () => {
      render(
        <SubscriptionCardList subscriptions={defaultSubscriptions} onChange={mockOnChange} />
      );

      fireEvent.click(screen.getByTestId('add-subscription-button'));
      fireEvent.click(screen.getByTestId('subscription-cancel-button'));

      expect(screen.queryByTestId('subscription-card-form')).not.toBeInTheDocument();
      expect(screen.getByTestId('add-subscription-button')).toBeInTheDocument();
    });
  });


  describe('Edit Subscription', () => {
    it('should show form when edit button is clicked', () => {
      render(
        <SubscriptionCardList subscriptions={defaultSubscriptions} onChange={mockOnChange} />
      );

      const editButtons = screen.getAllByTestId('subscription-edit-button');
      fireEvent.click(editButtons[0]);

      expect(screen.getByTestId('subscription-card-form')).toBeInTheDocument();
    });

    it('should update subscription when form is submitted', () => {
      render(
        <SubscriptionCardList subscriptions={defaultSubscriptions} onChange={mockOnChange} />
      );

      const editButtons = screen.getAllByTestId('subscription-edit-button');
      fireEvent.click(editButtons[0]);

      fireEvent.change(screen.getByTestId('subscription-service-input'), {
        target: { value: 'Updated Service' },
      });
      fireEvent.click(screen.getByTestId('subscription-submit-button'));

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          service: 'Updated Service',
        }),
        defaultSubscriptions[1],
        defaultSubscriptions[2],
      ]);
    });

    it('should close form when cancelled', () => {
      render(
        <SubscriptionCardList subscriptions={defaultSubscriptions} onChange={mockOnChange} />
      );

      const editButtons = screen.getAllByTestId('subscription-edit-button');
      fireEvent.click(editButtons[0]);
      fireEvent.click(screen.getByTestId('subscription-cancel-button'));

      expect(screen.queryByTestId('subscription-card-form')).not.toBeInTheDocument();
      expect(screen.getAllByTestId('subscription-card')).toHaveLength(3);
    });
  });


  describe('Delete Subscription', () => {
    it('should remove subscription when delete button is clicked', () => {
      render(
        <SubscriptionCardList subscriptions={defaultSubscriptions} onChange={mockOnChange} />
      );

      const deleteButtons = screen.getAllByTestId('subscription-delete-button');
      fireEvent.click(deleteButtons[1]); // Delete Netflix

      expect(mockOnChange).toHaveBeenCalledWith([
        defaultSubscriptions[0],
        defaultSubscriptions[2],
      ]);
    });
  });

  describe('Disabled State', () => {
    it('should disable add button when disabled', () => {
      render(
        <SubscriptionCardList
          subscriptions={defaultSubscriptions}
          onChange={mockOnChange}
          disabled={true}
        />
      );

      expect(screen.getByTestId('add-subscription-button')).toBeDisabled();
    });

    it('should disable all edit and delete buttons when disabled', () => {
      render(
        <SubscriptionCardList
          subscriptions={defaultSubscriptions}
          onChange={mockOnChange}
          disabled={true}
        />
      );

      screen.getAllByTestId('subscription-edit-button').forEach((button) => {
        expect(button).toBeDisabled();
      });
      screen.getAllByTestId('subscription-delete-button').forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('Grid Layout', () => {
    it('should have responsive grid classes', () => {
      render(
        <SubscriptionCardList subscriptions={defaultSubscriptions} onChange={mockOnChange} />
      );

      const grid = screen.getByTestId('subscription-grid');
      expect(grid).toHaveClass('grid');
      expect(grid).toHaveClass('grid-cols-2');
      expect(grid).toHaveClass('sm:grid-cols-3');
      expect(grid).toHaveClass('md:grid-cols-4');
      expect(grid).toHaveClass('lg:grid-cols-5');
    });
  });
});
