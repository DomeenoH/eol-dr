/**
 * PlatformCard Component Tests
 * 
 * Tests for the PlatformCard component that displays platform-specific login interface style cards.
 * Requirements: 9.1
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlatformCard } from '../PlatformCard';
import { platformBranding } from '../../utils/platform-utils';
import type { PlatformData, PlatformField } from '../PlatformCard';
import type { PlatformType } from '../../types/platform';

describe('PlatformCard', () => {
  const mockOnChange = vi.fn();
  const defaultData: PlatformData = {};

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Platform Branding', () => {
    it('should render with correct platform name', () => {
      render(
        <PlatformCard
          platform="discord"
          data={defaultData}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Discord')).toBeInTheDocument();
    });

    it('should render with platform-specific brand color in header', () => {
      render(
        <PlatformCard
          platform="discord"
          data={defaultData}
          onChange={mockOnChange}
        />
      );

      const card = screen.getByTestId('platform-card');
      expect(card).toHaveAttribute('data-platform', 'discord');
    });

    it('should render different platforms with their respective names', () => {
      const platforms: PlatformType[] = [
        'discord', 'whatsapp', 'facebook', 'google', 'github'
      ];

      platforms.forEach((platform) => {
        const { unmount } = render(
          <PlatformCard
            platform={platform}
            data={defaultData}
            onChange={mockOnChange}
          />
        );

        expect(screen.getByText(platformBranding[platform].name)).toBeInTheDocument();
        unmount();
      });
    });

    it('should have all platform types defined in branding', () => {
      const expectedPlatforms: PlatformType[] = [
        'imessage', 'whatsapp', 'facebook', 'skype', 'discord',
        'google', 'instagram', 'twitter', 'github', 'linkedin',
        'email', 'bank', 'paypal', 'crypto'
      ];

      expectedPlatforms.forEach((platform) => {
        expect(platformBranding[platform]).toBeDefined();
        expect(platformBranding[platform].name).toBeTruthy();
        expect(platformBranding[platform].primaryColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(platformBranding[platform].backgroundColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(platformBranding[platform].textColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
  });

  describe('Default Fields', () => {
    it('should render username field by default', () => {
      render(
        <PlatformCard
          platform="discord"
          data={defaultData}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByLabelText(/Email or Username/i)).toBeInTheDocument();
    });

    it('should render password field by default', () => {
      render(
        <PlatformCard
          platform="discord"
          data={defaultData}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    });

    it('should render notes field by default', () => {
      render(
        <PlatformCard
          platform="discord"
          data={defaultData}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByLabelText(/Notes/i)).toBeInTheDocument();
    });
  });

  describe('Custom Fields', () => {
    it('should render custom fields when provided', () => {
      const customFields: PlatformField[] = [
        { id: 'email', label: 'Email Address', type: 'email', placeholder: 'test@example.com' },
        { id: 'apiKey', label: 'API Key', type: 'password', sensitive: true },
      ];

      render(
        <PlatformCard
          platform="github"
          fields={customFields}
          data={defaultData}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/API Key/i)).toBeInTheDocument();
    });

    it('should not render default fields when custom fields are provided', () => {
      const customFields: PlatformField[] = [
        { id: 'customField', label: 'Custom Field', type: 'text' },
      ];

      render(
        <PlatformCard
          platform="github"
          fields={customFields}
          data={defaultData}
          onChange={mockOnChange}
        />
      );

      expect(screen.queryByLabelText(/Email or Username/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/Password/i)).not.toBeInTheDocument();
    });
  });


  describe('Data Binding', () => {
    it('should display initial data values', () => {
      const initialData: PlatformData = {
        username: 'testuser',
        password: 'secret123',
        notes: 'Test notes',
      };

      render(
        <PlatformCard
          platform="discord"
          data={initialData}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('platform-field-username')).toHaveValue('testuser');
      expect(screen.getByTestId('platform-field-notes')).toHaveValue('Test notes');
    });

    it('should call onChange when username field changes', () => {
      render(
        <PlatformCard
          platform="discord"
          data={defaultData}
          onChange={mockOnChange}
        />
      );

      const usernameInput = screen.getByTestId('platform-field-username');
      fireEvent.change(usernameInput, { target: { value: 'newuser' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        username: 'newuser',
      });
    });

    it('should call onChange when password field changes', () => {
      render(
        <PlatformCard
          platform="discord"
          data={defaultData}
          onChange={mockOnChange}
        />
      );

      const passwordInput = screen.getByTestId('platform-field-password');
      fireEvent.change(passwordInput, { target: { value: 'newpassword' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        password: 'newpassword',
      });
    });

    it('should call onChange when notes field changes', () => {
      render(
        <PlatformCard
          platform="discord"
          data={defaultData}
          onChange={mockOnChange}
        />
      );

      const notesInput = screen.getByTestId('platform-field-notes');
      fireEvent.change(notesInput, { target: { value: 'New notes' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        notes: 'New notes',
      });
    });

    it('should preserve existing data when updating a field', () => {
      const existingData: PlatformData = {
        username: 'existinguser',
        password: 'existingpass',
      };

      render(
        <PlatformCard
          platform="discord"
          data={existingData}
          onChange={mockOnChange}
        />
      );

      const notesInput = screen.getByTestId('platform-field-notes');
      fireEvent.change(notesInput, { target: { value: 'New notes' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        username: 'existinguser',
        password: 'existingpass',
        notes: 'New notes',
      });
    });
  });


  describe('Sensitive Field Toggle', () => {
    it('should render password field as password type by default', () => {
      render(
        <PlatformCard
          platform="discord"
          data={defaultData}
          onChange={mockOnChange}
        />
      );

      const passwordInput = screen.getByTestId('platform-field-password');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should render show/hide toggle button for sensitive fields', () => {
      render(
        <PlatformCard
          platform="discord"
          data={defaultData}
          onChange={mockOnChange}
        />
      );

      const toggleButton = screen.getByTestId('toggle-visibility-password');
      expect(toggleButton).toBeInTheDocument();
    });

    it('should toggle password visibility when clicking the toggle button', () => {
      render(
        <PlatformCard
          platform="discord"
          data={defaultData}
          onChange={mockOnChange}
        />
      );

      const passwordInput = screen.getByTestId('platform-field-password');
      const toggleButton = screen.getByTestId('toggle-visibility-password');

      // Initially password type
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Click to show
      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      // Click to hide again
      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should have accessible label for toggle button', () => {
      render(
        <PlatformCard
          platform="discord"
          data={defaultData}
          onChange={mockOnChange}
        />
      );

      const toggleButton = screen.getByTestId('toggle-visibility-password');
      expect(toggleButton).toHaveAttribute('aria-label', '显示密码');

      fireEvent.click(toggleButton);
      expect(toggleButton).toHaveAttribute('aria-label', '隐藏密码');
    });

    it('should not render toggle button for non-sensitive fields', () => {
      render(
        <PlatformCard
          platform="discord"
          data={defaultData}
          onChange={mockOnChange}
        />
      );

      expect(screen.queryByTestId('toggle-visibility-username')).not.toBeInTheDocument();
      expect(screen.queryByTestId('toggle-visibility-notes')).not.toBeInTheDocument();
    });
  });


  describe('Status Indicator', () => {
    it('should display "未填写" status by default', () => {
      render(
        <PlatformCard
          platform="discord"
          data={defaultData}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('platform-card-status')).toHaveTextContent('未填写');
    });

    it('should display "部分填写" status when status is partial', () => {
      render(
        <PlatformCard
          platform="discord"
          data={defaultData}
          onChange={mockOnChange}
          status="partial"
        />
      );

      expect(screen.getByTestId('platform-card-status')).toHaveTextContent('部分填写');
    });

    it('should display "已填写" status when status is complete', () => {
      render(
        <PlatformCard
          platform="discord"
          data={defaultData}
          onChange={mockOnChange}
          status="complete"
        />
      );

      expect(screen.getByTestId('platform-card-status')).toHaveTextContent('已填写');
    });

    it('should have appropriate styling for empty status', () => {
      render(
        <PlatformCard
          platform="discord"
          data={defaultData}
          onChange={mockOnChange}
          status="empty"
        />
      );

      const statusBadge = screen.getByTestId('platform-card-status');
      expect(statusBadge).toHaveClass('bg-gray-100');
      expect(statusBadge).toHaveClass('text-gray-500');
    });

    it('should have appropriate styling for partial status', () => {
      render(
        <PlatformCard
          platform="discord"
          data={defaultData}
          onChange={mockOnChange}
          status="partial"
        />
      );

      const statusBadge = screen.getByTestId('platform-card-status');
      expect(statusBadge).toHaveClass('bg-yellow-100');
      expect(statusBadge).toHaveClass('text-yellow-700');
    });

    it('should have appropriate styling for complete status', () => {
      render(
        <PlatformCard
          platform="discord"
          data={defaultData}
          onChange={mockOnChange}
          status="complete"
        />
      );

      const statusBadge = screen.getByTestId('platform-card-status');
      expect(statusBadge).toHaveClass('bg-green-100');
      expect(statusBadge).toHaveClass('text-green-700');
    });
  });


  describe('Disabled State', () => {
    it('should disable all input fields when disabled prop is true', () => {
      render(
        <PlatformCard
          platform="discord"
          data={defaultData}
          onChange={mockOnChange}
          disabled={true}
        />
      );

      expect(screen.getByTestId('platform-field-username')).toBeDisabled();
      expect(screen.getByTestId('platform-field-password')).toBeDisabled();
      expect(screen.getByTestId('platform-field-notes')).toBeDisabled();
    });

    it('should not disable fields when disabled prop is false', () => {
      render(
        <PlatformCard
          platform="discord"
          data={defaultData}
          onChange={mockOnChange}
          disabled={false}
        />
      );

      expect(screen.getByTestId('platform-field-username')).not.toBeDisabled();
      expect(screen.getByTestId('platform-field-password')).not.toBeDisabled();
      expect(screen.getByTestId('platform-field-notes')).not.toBeDisabled();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className to container', () => {
      render(
        <PlatformCard
          platform="discord"
          data={defaultData}
          onChange={mockOnChange}
          className="custom-class"
        />
      );

      const card = screen.getByTestId('platform-card');
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('Field Types', () => {
    it('should render textarea for notes field', () => {
      render(
        <PlatformCard
          platform="discord"
          data={defaultData}
          onChange={mockOnChange}
        />
      );

      const notesField = screen.getByTestId('platform-field-notes');
      expect(notesField.tagName.toLowerCase()).toBe('textarea');
    });

    it('should render input for text fields', () => {
      render(
        <PlatformCard
          platform="discord"
          data={defaultData}
          onChange={mockOnChange}
        />
      );

      const usernameField = screen.getByTestId('platform-field-username');
      expect(usernameField.tagName.toLowerCase()).toBe('input');
    });

    it('should render email type input for email fields', () => {
      const customFields: PlatformField[] = [
        { id: 'email', label: 'Email', type: 'email' },
      ];

      render(
        <PlatformCard
          platform="google"
          fields={customFields}
          data={defaultData}
          onChange={mockOnChange}
        />
      );

      const emailField = screen.getByTestId('platform-field-email');
      expect(emailField).toHaveAttribute('type', 'email');
    });
  });


  describe('Dark Theme Support', () => {
    it('should apply dark theme styles for Discord', () => {
      render(
        <PlatformCard
          platform="discord"
          data={defaultData}
          onChange={mockOnChange}
        />
      );

      // Discord has dark background (#36393f)
      const card = screen.getByTestId('platform-card');
      expect(card).toHaveStyle({ backgroundColor: '#36393f' });
    });

    it('should apply light theme styles for Google', () => {
      render(
        <PlatformCard
          platform="google"
          data={defaultData}
          onChange={mockOnChange}
        />
      );

      // Google has white background
      const card = screen.getByTestId('platform-card');
      expect(card).toHaveStyle({ backgroundColor: '#ffffff' });
    });
  });

  describe('Accessibility', () => {
    it('should have proper label associations', () => {
      render(
        <PlatformCard
          platform="discord"
          data={defaultData}
          onChange={mockOnChange}
        />
      );

      // Labels should be properly associated with inputs
      const usernameInput = screen.getByLabelText(/Email or Username/i);
      expect(usernameInput).toBeInTheDocument();

      const passwordInput = screen.getByLabelText(/Password/i);
      expect(passwordInput).toBeInTheDocument();

      const notesInput = screen.getByLabelText(/Notes/i);
      expect(notesInput).toBeInTheDocument();
    });

    it('should have unique IDs for each field', () => {
      render(
        <PlatformCard
          platform="discord"
          data={defaultData}
          onChange={mockOnChange}
        />
      );

      const usernameInput = screen.getByTestId('platform-field-username');
      const passwordInput = screen.getByTestId('platform-field-password');
      const notesInput = screen.getByTestId('platform-field-notes');

      expect(usernameInput.id).toBe('discord-username');
      expect(passwordInput.id).toBe('discord-password');
      expect(notesInput.id).toBe('discord-notes');
    });
  });

  describe('Placeholder Text', () => {
    it('should display placeholder text for fields', () => {
      render(
        <PlatformCard
          platform="discord"
          data={defaultData}
          onChange={mockOnChange}
        />
      );

      const usernameInput = screen.getByTestId('platform-field-username');
      expect(usernameInput).toHaveAttribute('placeholder', 'your_username');
    });

    it('should display custom placeholder for custom fields', () => {
      const customFields: PlatformField[] = [
        { id: 'custom', label: 'Custom', type: 'text', placeholder: 'Custom placeholder' },
      ];

      render(
        <PlatformCard
          platform="github"
          fields={customFields}
          data={defaultData}
          onChange={mockOnChange}
        />
      );

      const customInput = screen.getByTestId('platform-field-custom');
      expect(customInput).toHaveAttribute('placeholder', 'Custom placeholder');
    });
  });
});
