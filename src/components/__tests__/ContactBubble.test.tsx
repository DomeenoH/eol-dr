/**
 * ContactBubble Component Tests
 * 
 * Tests for the ContactBubble component that displays contacts in chat bubble style.
 * Requirements: 9.2
 */

import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ContactBubble,
  ContactBubbleForm,
  ContactBubbleList,
} from '../ContactBubble';
import {
  contactPlatforms,
  getInitials,
} from '../../utils/contact-utils';
import type { ContactData } from '../../types/platform';
import { platformBranding } from '../../utils/platform-utils';

describe('getInitials', () => {
  it('should return single initial for single word name', () => {
    expect(getInitials('Blake')).toBe('B');
  });

  it('should return two initials for two word name', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('should return first and last initials for multi-word name', () => {
    expect(getInitials('John Michael Doe')).toBe('JD');
  });

  it('should handle empty string', () => {
    expect(getInitials('')).toBe('?');
  });

  it('should handle whitespace only', () => {
    expect(getInitials('   ')).toBe('?');
  });

  it('should handle names with extra whitespace', () => {
    expect(getInitials('  John   Doe  ')).toBe('JD');
  });

  it('should return uppercase initials', () => {
    expect(getInitials('john doe')).toBe('JD');
  });
});

describe('ContactBubble', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnToggleEdit = vi.fn();

  const defaultContact: ContactData = {
    platform: 'imessage',
    name: 'Blake',
    contactInfo: '+1234567890',
    notes: 'Brother',
    order: 1,
  };

  beforeEach(() => {
    mockOnEdit.mockClear();
    mockOnDelete.mockClear();
    mockOnToggleEdit.mockClear();
  });

  describe('Display Mode', () => {
    it('should render contact name', () => {
      render(
        <ContactBubble
          contact={defaultContact}
          order={1}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('contact-name')).toHaveTextContent('Blake');
    });

    it('should render contact info', () => {
      render(
        <ContactBubble
          contact={defaultContact}
          order={1}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('contact-info')).toHaveTextContent('+1234567890');
    });

    it('should render contact notes', () => {
      render(
        <ContactBubble
          contact={defaultContact}
          order={1}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('contact-notes')).toHaveTextContent('Brother');
    });

    it('should render order badge', () => {
      render(
        <ContactBubble
          contact={defaultContact}
          order={3}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('contact-order-badge')).toHaveTextContent('3');
    });

    it('should render avatar with initials', () => {
      render(
        <ContactBubble
          contact={defaultContact}
          order={1}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('contact-avatar')).toHaveTextContent('B');
    });

    it('should render platform badge', () => {
      render(
        <ContactBubble
          contact={defaultContact}
          order={1}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('contact-platform-badge')).toHaveTextContent('iMessage');
    });

    it('should not render contact info if not provided', () => {
      const contactWithoutInfo: ContactData = {
        ...defaultContact,
        contactInfo: undefined,
      };

      render(
        <ContactBubble
          contact={contactWithoutInfo}
          order={1}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByTestId('contact-info')).not.toBeInTheDocument();
    });

    it('should not render notes if not provided', () => {
      const contactWithoutNotes: ContactData = {
        ...defaultContact,
        notes: undefined,
      };

      render(
        <ContactBubble
          contact={contactWithoutNotes}
          order={1}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByTestId('contact-notes')).not.toBeInTheDocument();
    });
  });

  describe('Platform Styling', () => {
    it('should apply platform color to avatar', () => {
      render(
        <ContactBubble
          contact={defaultContact}
          order={1}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const avatar = screen.getByTestId('contact-avatar');
      expect(avatar).toHaveStyle({
        backgroundColor: platformBranding.imessage.primaryColor,
      });
    });

    it('should apply platform color to badge', () => {
      render(
        <ContactBubble
          contact={defaultContact}
          order={1}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const badge = screen.getByTestId('contact-platform-badge');
      expect(badge).toHaveStyle({
        backgroundColor: platformBranding.imessage.primaryColor,
      });
    });

    it('should render different platforms correctly', () => {
      const platforms = ['whatsapp', 'facebook', 'discord'] as const;

      platforms.forEach((platform) => {
        const contact: ContactData = {
          ...defaultContact,
          platform,
        };

        const { unmount } = render(
          <ContactBubble
            contact={contact}
            order={1}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        );

        expect(screen.getByTestId('contact-platform-badge')).toHaveTextContent(
          platformBranding[platform].name
        );
        unmount();
      });
    });
  });

  describe('Action Buttons', () => {
    it('should render edit button', () => {
      render(
        <ContactBubble
          contact={defaultContact}
          order={1}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleEdit={mockOnToggleEdit}
        />
      );

      expect(screen.getByTestId('contact-edit-button')).toBeInTheDocument();
    });

    it('should render delete button', () => {
      render(
        <ContactBubble
          contact={defaultContact}
          order={1}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('contact-delete-button')).toBeInTheDocument();
    });

    it('should call onToggleEdit when edit button is clicked', () => {
      render(
        <ContactBubble
          contact={defaultContact}
          order={1}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleEdit={mockOnToggleEdit}
        />
      );

      fireEvent.click(screen.getByTestId('contact-edit-button'));
      expect(mockOnToggleEdit).toHaveBeenCalledTimes(1);
    });

    it('should call onDelete when delete button is clicked', () => {
      render(
        <ContactBubble
          contact={defaultContact}
          order={1}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      fireEvent.click(screen.getByTestId('contact-delete-button'));
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it('should disable buttons when disabled prop is true', () => {
      render(
        <ContactBubble
          contact={defaultContact}
          order={1}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          disabled={true}
        />
      );

      expect(screen.getByTestId('contact-edit-button')).toBeDisabled();
      expect(screen.getByTestId('contact-delete-button')).toBeDisabled();
    });
  });

  describe('Edit Mode', () => {
    it('should render form when isEditing is true', () => {
      render(
        <ContactBubble
          contact={defaultContact}
          order={1}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          isEditing={true}
          onToggleEdit={mockOnToggleEdit}
        />
      );

      expect(screen.getByTestId('contact-bubble-form')).toBeInTheDocument();
    });

    it('should not render bubble when isEditing is true', () => {
      render(
        <ContactBubble
          contact={defaultContact}
          order={1}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          isEditing={true}
          onToggleEdit={mockOnToggleEdit}
        />
      );

      expect(screen.queryByTestId('contact-bubble')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels for action buttons', () => {
      render(
        <ContactBubble
          contact={defaultContact}
          order={1}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByLabelText('编辑联系人')).toBeInTheDocument();
      expect(screen.getByLabelText('删除联系人')).toBeInTheDocument();
    });

    it('should have accessible label for avatar', () => {
      render(
        <ContactBubble
          contact={defaultContact}
          order={1}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByLabelText('Blake avatar')).toBeInTheDocument();
    });
  });
});

describe('ContactBubbleForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  describe('Form Fields', () => {
    it('should render platform select', () => {
      render(
        <ContactBubbleForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(screen.getByTestId('contact-platform-select')).toBeInTheDocument();
    });

    it('should render name input', () => {
      render(
        <ContactBubbleForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(screen.getByTestId('contact-name-input')).toBeInTheDocument();
    });

    it('should render contact info input', () => {
      render(
        <ContactBubbleForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(screen.getByTestId('contact-info-input')).toBeInTheDocument();
    });

    it('should render notes textarea', () => {
      render(
        <ContactBubbleForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(screen.getByTestId('contact-notes-input')).toBeInTheDocument();
    });

    it('should render all available platforms in select', () => {
      render(
        <ContactBubbleForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const select = screen.getByTestId('contact-platform-select');
      contactPlatforms.forEach((platform) => {
        expect(within(select).getByText(platformBranding[platform].name)).toBeInTheDocument();
      });
    });
  });

  describe('Initial Data', () => {
    it('should populate form with initial data', () => {
      const initialData: Partial<ContactData> = {
        platform: 'whatsapp',
        name: 'John Doe',
        contactInfo: '+1234567890',
        notes: 'Test notes',
      };

      render(
        <ContactBubbleForm
          initialData={initialData}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByTestId('contact-platform-select')).toHaveValue('whatsapp');
      expect(screen.getByTestId('contact-name-input')).toHaveValue('John Doe');
      expect(screen.getByTestId('contact-info-input')).toHaveValue('+1234567890');
      expect(screen.getByTestId('contact-notes-input')).toHaveValue('Test notes');
    });

    it('should default to imessage platform', () => {
      render(
        <ContactBubbleForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(screen.getByTestId('contact-platform-select')).toHaveValue('imessage');
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with form data when submitted', () => {
      render(
        <ContactBubbleForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      fireEvent.change(screen.getByTestId('contact-name-input'), {
        target: { value: 'Test Name' },
      });
      fireEvent.change(screen.getByTestId('contact-info-input'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByTestId('contact-notes-input'), {
        target: { value: 'Test notes' },
      });

      fireEvent.click(screen.getByTestId('contact-submit-button'));

      expect(mockOnSubmit).toHaveBeenCalledWith({
        platform: 'imessage',
        name: 'Test Name',
        contactInfo: 'test@example.com',
        notes: 'Test notes',
        order: undefined,
      });
    });

    it('should trim whitespace from values', () => {
      render(
        <ContactBubbleForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      fireEvent.change(screen.getByTestId('contact-name-input'), {
        target: { value: '  Test Name  ' },
      });

      fireEvent.click(screen.getByTestId('contact-submit-button'));

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Name',
        })
      );
    });

    it('should not submit if name is empty', () => {
      render(
        <ContactBubbleForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      fireEvent.click(screen.getByTestId('contact-submit-button'));

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should not submit if name is only whitespace', () => {
      render(
        <ContactBubbleForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      fireEvent.change(screen.getByTestId('contact-name-input'), {
        target: { value: '   ' },
      });
      fireEvent.click(screen.getByTestId('contact-submit-button'));

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should disable submit button when name is empty', () => {
      render(
        <ContactBubbleForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(screen.getByTestId('contact-submit-button')).toBeDisabled();
    });

    it('should enable submit button when name is provided', () => {
      render(
        <ContactBubbleForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      fireEvent.change(screen.getByTestId('contact-name-input'), {
        target: { value: 'Test' },
      });

      expect(screen.getByTestId('contact-submit-button')).not.toBeDisabled();
    });
  });

  describe('Form Cancellation', () => {
    it('should call onCancel when cancel button is clicked', () => {
      render(
        <ContactBubbleForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      fireEvent.click(screen.getByTestId('contact-cancel-button'));

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Button Labels', () => {
    it('should show "添加" for new contact', () => {
      render(
        <ContactBubbleForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(screen.getByTestId('contact-submit-button')).toHaveTextContent('添加');
    });

    it('should show "保存" for existing contact', () => {
      render(
        <ContactBubbleForm
          initialData={{ name: 'Existing' }}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByTestId('contact-submit-button')).toHaveTextContent('保存');
    });
  });

  describe('Disabled State', () => {
    it('should disable all inputs when disabled prop is true', () => {
      render(
        <ContactBubbleForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          disabled={true}
        />
      );

      expect(screen.getByTestId('contact-platform-select')).toBeDisabled();
      expect(screen.getByTestId('contact-name-input')).toBeDisabled();
      expect(screen.getByTestId('contact-info-input')).toBeDisabled();
      expect(screen.getByTestId('contact-notes-input')).toBeDisabled();
      expect(screen.getByTestId('contact-cancel-button')).toBeDisabled();
      expect(screen.getByTestId('contact-submit-button')).toBeDisabled();
    });
  });
});

describe('ContactBubbleList', () => {
  const mockOnChange = vi.fn();

  const defaultContacts: ContactData[] = [
    {
      platform: 'imessage',
      name: 'Blake',
      contactInfo: '+1234567890',
      notes: 'Brother',
      order: 1,
    },
    {
      platform: 'whatsapp',
      name: 'Aaron',
      order: 2,
    },
    {
      platform: 'facebook',
      name: 'Dad',
      notes: '电话号码在我手机里',
      order: 3,
    },
  ];

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('List Display', () => {
    it('should render all contacts', () => {
      render(
        <ContactBubbleList contacts={defaultContacts} onChange={mockOnChange} />
      );

      expect(screen.getAllByTestId('contact-bubble')).toHaveLength(3);
    });

    it('should render contacts in order', () => {
      render(
        <ContactBubbleList contacts={defaultContacts} onChange={mockOnChange} />
      );

      const bubbles = screen.getAllByTestId('contact-bubble');
      expect(bubbles[0]).toHaveAttribute('data-contact-name', 'Blake');
      expect(bubbles[1]).toHaveAttribute('data-contact-name', 'Aaron');
      expect(bubbles[2]).toHaveAttribute('data-contact-name', 'Dad');
    });

    it('should render header text', () => {
      render(
        <ContactBubbleList contacts={defaultContacts} onChange={mockOnChange} />
      );

      expect(screen.getByText('📱 紧急联系人通知列表')).toBeInTheDocument();
      expect(screen.getByText('当我离开后，请按以下顺序通知这些人：')).toBeInTheDocument();
    });

    it('should render add contact button', () => {
      render(
        <ContactBubbleList contacts={defaultContacts} onChange={mockOnChange} />
      );

      expect(screen.getByTestId('add-contact-button')).toBeInTheDocument();
    });

    it('should render empty list', () => {
      render(<ContactBubbleList contacts={[]} onChange={mockOnChange} />);

      expect(screen.queryAllByTestId('contact-bubble')).toHaveLength(0);
      expect(screen.getByTestId('add-contact-button')).toBeInTheDocument();
    });
  });

  describe('Add Contact', () => {
    it('should show form when add button is clicked', () => {
      render(
        <ContactBubbleList contacts={defaultContacts} onChange={mockOnChange} />
      );

      fireEvent.click(screen.getByTestId('add-contact-button'));

      expect(screen.getByTestId('contact-bubble-form')).toBeInTheDocument();
    });

    it('should hide add button when form is shown', () => {
      render(
        <ContactBubbleList contacts={defaultContacts} onChange={mockOnChange} />
      );

      fireEvent.click(screen.getByTestId('add-contact-button'));

      expect(screen.queryByTestId('add-contact-button')).not.toBeInTheDocument();
    });

    it('should add new contact when form is submitted', () => {
      render(<ContactBubbleList contacts={[]} onChange={mockOnChange} />);

      fireEvent.click(screen.getByTestId('add-contact-button'));

      fireEvent.change(screen.getByTestId('contact-name-input'), {
        target: { value: 'New Contact' },
      });
      fireEvent.click(screen.getByTestId('contact-submit-button'));

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          name: 'New Contact',
          order: 1,
        }),
      ]);
    });

    it('should assign correct order to new contact', () => {
      render(
        <ContactBubbleList contacts={defaultContacts} onChange={mockOnChange} />
      );

      fireEvent.click(screen.getByTestId('add-contact-button'));

      fireEvent.change(screen.getByTestId('contact-name-input'), {
        target: { value: 'New Contact' },
      });
      fireEvent.click(screen.getByTestId('contact-submit-button'));

      expect(mockOnChange).toHaveBeenCalledWith([
        ...defaultContacts,
        expect.objectContaining({
          name: 'New Contact',
          order: 4,
        }),
      ]);
    });

    it('should hide form when cancelled', () => {
      render(
        <ContactBubbleList contacts={defaultContacts} onChange={mockOnChange} />
      );

      fireEvent.click(screen.getByTestId('add-contact-button'));
      fireEvent.click(screen.getByTestId('contact-cancel-button'));

      expect(screen.queryByTestId('contact-bubble-form')).not.toBeInTheDocument();
      expect(screen.getByTestId('add-contact-button')).toBeInTheDocument();
    });
  });

  describe('Edit Contact', () => {
    it('should show form when edit button is clicked', () => {
      render(
        <ContactBubbleList contacts={defaultContacts} onChange={mockOnChange} />
      );

      const editButtons = screen.getAllByTestId('contact-edit-button');
      fireEvent.click(editButtons[0]);

      expect(screen.getByTestId('contact-bubble-form')).toBeInTheDocument();
    });

    it('should update contact when form is submitted', () => {
      render(
        <ContactBubbleList contacts={defaultContacts} onChange={mockOnChange} />
      );

      const editButtons = screen.getAllByTestId('contact-edit-button');
      fireEvent.click(editButtons[0]);

      fireEvent.change(screen.getByTestId('contact-name-input'), {
        target: { value: 'Updated Name' },
      });
      fireEvent.click(screen.getByTestId('contact-submit-button'));

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          name: 'Updated Name',
          order: 1,
        }),
        defaultContacts[1],
        defaultContacts[2],
      ]);
    });

    it('should close form when cancelled', () => {
      render(
        <ContactBubbleList contacts={defaultContacts} onChange={mockOnChange} />
      );

      const editButtons = screen.getAllByTestId('contact-edit-button');
      fireEvent.click(editButtons[0]);
      fireEvent.click(screen.getByTestId('contact-cancel-button'));

      expect(screen.queryByTestId('contact-bubble-form')).not.toBeInTheDocument();
      expect(screen.getAllByTestId('contact-bubble')).toHaveLength(3);
    });
  });

  describe('Delete Contact', () => {
    it('should remove contact when delete button is clicked', () => {
      render(
        <ContactBubbleList contacts={defaultContacts} onChange={mockOnChange} />
      );

      const deleteButtons = screen.getAllByTestId('contact-delete-button');
      fireEvent.click(deleteButtons[1]); // Delete Aaron

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({ name: 'Blake', order: 1 }),
        expect.objectContaining({ name: 'Dad', order: 2 }),
      ]);
    });

    it('should reorder remaining contacts after deletion', () => {
      render(
        <ContactBubbleList contacts={defaultContacts} onChange={mockOnChange} />
      );

      const deleteButtons = screen.getAllByTestId('contact-delete-button');
      fireEvent.click(deleteButtons[0]); // Delete Blake

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({ name: 'Aaron', order: 1 }),
        expect.objectContaining({ name: 'Dad', order: 2 }),
      ]);
    });
  });

  describe('Disabled State', () => {
    it('should disable add button when disabled', () => {
      render(
        <ContactBubbleList
          contacts={defaultContacts}
          onChange={mockOnChange}
          disabled={true}
        />
      );

      expect(screen.getByTestId('add-contact-button')).toBeDisabled();
    });

    it('should disable all edit and delete buttons when disabled', () => {
      render(
        <ContactBubbleList
          contacts={defaultContacts}
          onChange={mockOnChange}
          disabled={true}
        />
      );

      screen.getAllByTestId('contact-edit-button').forEach((button) => {
        expect(button).toBeDisabled();
      });
      screen.getAllByTestId('contact-delete-button').forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });
});

describe('contactPlatforms', () => {
  it('should include common messaging platforms', () => {
    expect(contactPlatforms).toContain('imessage');
    expect(contactPlatforms).toContain('whatsapp');
    expect(contactPlatforms).toContain('facebook');
    expect(contactPlatforms).toContain('discord');
    expect(contactPlatforms).toContain('email');
  });

  it('should have all platforms defined in platformBranding', () => {
    contactPlatforms.forEach((platform) => {
      expect(platformBranding[platform]).toBeDefined();
    });
  });
});
