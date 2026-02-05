/**
 * DeviceCard Component Tests
 * 
 * Tests for the DeviceCard component that displays device cards
 * with inheritor and formatting requirements fields.
 * Requirements: 9.4
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  DeviceCard,
  DeviceCardForm,
  DeviceCardList,
} from '../DeviceCard';
import {
  deviceTypeConfig,
  deviceTypes,
  getDeviceIcon,
  getDeviceTypeLabel,
} from '../../utils/device-utils';
import type { DeviceData } from '../../types/platform';

describe('getDeviceIcon', () => {
  it('should return correct icon for server type', () => {
    expect(getDeviceIcon('server')).toBe('🖥️');
  });

  it('should return correct icon for computer type', () => {
    expect(getDeviceIcon('computer')).toBe('💻');
  });

  it('should return correct icon for phone type', () => {
    expect(getDeviceIcon('phone')).toBe('📱');
  });

  it('should return correct icon for network type', () => {
    expect(getDeviceIcon('network')).toBe('🌐');
  });

  it('should return correct icon for iot type', () => {
    expect(getDeviceIcon('iot')).toBe('🏠');
  });
});


describe('getDeviceTypeLabel', () => {
  it('should return correct label for server type', () => {
    expect(getDeviceTypeLabel('server')).toBe('服务器');
  });

  it('should return correct label for computer type', () => {
    expect(getDeviceTypeLabel('computer')).toBe('电脑');
  });

  it('should return correct label for phone type', () => {
    expect(getDeviceTypeLabel('phone')).toBe('手机/平板');
  });

  it('should return correct label for network type', () => {
    expect(getDeviceTypeLabel('network')).toBe('网络设备');
  });

  it('should return correct label for iot type', () => {
    expect(getDeviceTypeLabel('iot')).toBe('IoT 设备');
  });
});

describe('deviceTypeConfig', () => {
  it('should have configuration for all device types', () => {
    deviceTypes.forEach((type) => {
      const typeKey = type as keyof typeof deviceTypeConfig;
      expect(deviceTypeConfig[typeKey]).toBeDefined();
      expect(deviceTypeConfig[typeKey].label).toBeTruthy();
      expect(deviceTypeConfig[type].icon).toBeTruthy();
      expect(deviceTypeConfig[type].bgColor).toBeTruthy();
      expect(deviceTypeConfig[type].borderColor).toBeTruthy();
      expect(deviceTypeConfig[type].textColor).toBeTruthy();
    });
  });
});

describe('deviceTypes', () => {
  it('should include all expected device types', () => {
    expect(deviceTypes).toContain('server');
    expect(deviceTypes).toContain('computer');
    expect(deviceTypes).toContain('phone');
    expect(deviceTypes).toContain('network');
    expect(deviceTypes).toContain('iot');
  });

  it('should have exactly 5 device types', () => {
    expect(deviceTypes).toHaveLength(5);
  });
});


describe('DeviceCard', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnToggleEdit = vi.fn();

  const defaultDevice: DeviceData = {
    type: 'server',
    name: '大黑盒子',
    inheritor: 'Janet',
    needsFormatting: false,
  };

  beforeEach(() => {
    mockOnEdit.mockClear();
    mockOnDelete.mockClear();
    mockOnToggleEdit.mockClear();
  });

  describe('Display Mode', () => {
    it('should render device name', () => {
      render(
        <DeviceCard
          device={defaultDevice}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('device-name')).toHaveTextContent('大黑盒子');
    });

    it('should render device icon', () => {
      render(
        <DeviceCard
          device={defaultDevice}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('device-icon')).toHaveTextContent('🖥️');
    });

    it('should render device type badge', () => {
      render(
        <DeviceCard
          device={defaultDevice}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('device-type-badge')).toHaveTextContent('服务器');
    });

    it('should render inheritor when provided', () => {
      render(
        <DeviceCard
          device={defaultDevice}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('device-inheritor')).toHaveTextContent('Janet');
    });

    it('should render "未指定" when inheritor is not provided', () => {
      const deviceWithoutInheritor: DeviceData = {
        type: 'computer',
        name: 'Test Device',
      };

      render(
        <DeviceCard
          device={deviceWithoutInheritor}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('device-inheritor')).toHaveTextContent('未指定');
    });
  });


  describe('Formatting Indicator', () => {
    it('should show "❌ 否" when needsFormatting is false', () => {
      render(
        <DeviceCard
          device={defaultDevice}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('device-formatting-indicator')).toHaveTextContent('❌ 否');
    });

    it('should show "✅ 是" when needsFormatting is true', () => {
      const deviceNeedsFormatting: DeviceData = {
        ...defaultDevice,
        needsFormatting: true,
      };

      render(
        <DeviceCard
          device={deviceNeedsFormatting}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('device-formatting-indicator')).toHaveTextContent('✅ 是');
    });

    it('should show "❌ 否" when needsFormatting is undefined', () => {
      const deviceUndefinedFormatting: DeviceData = {
        type: 'computer',
        name: 'Test Device',
      };

      render(
        <DeviceCard
          device={deviceUndefinedFormatting}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('device-formatting-indicator')).toHaveTextContent('❌ 否');
    });
  });

  describe('Special Instructions Warning', () => {
    it('should render warning message when specialInstructions is provided', () => {
      const deviceWithInstructions: DeviceData = {
        ...defaultDevice,
        specialInstructions: '需要从 Find My 注销',
      };

      render(
        <DeviceCard
          device={deviceWithInstructions}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('device-warning-message')).toHaveTextContent('需要从 Find My 注销');
    });

    it('should not render warning message when specialInstructions is not provided', () => {
      render(
        <DeviceCard
          device={defaultDevice}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByTestId('device-warning-message')).not.toBeInTheDocument();
    });

    it('should have alert role for accessibility', () => {
      const deviceWithInstructions: DeviceData = {
        ...defaultDevice,
        specialInstructions: '需要从 Find My 注销',
      };

      render(
        <DeviceCard
          device={deviceWithInstructions}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('device-warning-message')).toHaveAttribute('role', 'alert');
    });
  });


  describe('Device Types', () => {
    it('should display server type correctly', () => {
      render(
        <DeviceCard
          device={defaultDevice}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('device-icon')).toHaveTextContent('🖥️');
      expect(screen.getByTestId('device-type-badge')).toHaveTextContent('服务器');
    });

    it('should display computer type correctly', () => {
      const computerDevice: DeviceData = {
        type: 'computer',
        name: 'Mac 电脑',
      };

      render(
        <DeviceCard
          device={computerDevice}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('device-icon')).toHaveTextContent('💻');
      expect(screen.getByTestId('device-type-badge')).toHaveTextContent('电脑');
    });

    it('should display phone type correctly', () => {
      const phoneDevice: DeviceData = {
        type: 'phone',
        name: 'iPhone',
      };

      render(
        <DeviceCard
          device={phoneDevice}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('device-icon')).toHaveTextContent('📱');
      expect(screen.getByTestId('device-type-badge')).toHaveTextContent('手机/平板');
    });

    it('should display network type correctly', () => {
      const networkDevice: DeviceData = {
        type: 'network',
        name: 'Router',
      };

      render(
        <DeviceCard
          device={networkDevice}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('device-icon')).toHaveTextContent('🌐');
      expect(screen.getByTestId('device-type-badge')).toHaveTextContent('网络设备');
    });

    it('should display iot type correctly', () => {
      const iotDevice: DeviceData = {
        type: 'iot',
        name: 'Smart Hub',
      };

      render(
        <DeviceCard
          device={iotDevice}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('device-icon')).toHaveTextContent('🏠');
      expect(screen.getByTestId('device-type-badge')).toHaveTextContent('IoT 设备');
    });
  });


  describe('Action Buttons', () => {
    it('should render edit button', () => {
      render(
        <DeviceCard
          device={defaultDevice}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleEdit={mockOnToggleEdit}
        />
      );

      expect(screen.getByTestId('device-edit-button')).toBeInTheDocument();
    });

    it('should render delete button', () => {
      render(
        <DeviceCard
          device={defaultDevice}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('device-delete-button')).toBeInTheDocument();
    });

    it('should call onToggleEdit when edit button is clicked', () => {
      render(
        <DeviceCard
          device={defaultDevice}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleEdit={mockOnToggleEdit}
        />
      );

      fireEvent.click(screen.getByTestId('device-edit-button'));
      expect(mockOnToggleEdit).toHaveBeenCalledTimes(1);
    });

    it('should call onDelete when delete button is clicked', () => {
      render(
        <DeviceCard
          device={defaultDevice}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      fireEvent.click(screen.getByTestId('device-delete-button'));
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it('should disable buttons when disabled prop is true', () => {
      render(
        <DeviceCard
          device={defaultDevice}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          disabled={true}
        />
      );

      expect(screen.getByTestId('device-edit-button')).toBeDisabled();
      expect(screen.getByTestId('device-delete-button')).toBeDisabled();
    });
  });

  describe('Edit Mode', () => {
    it('should render form when isEditing is true', () => {
      render(
        <DeviceCard
          device={defaultDevice}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          isEditing={true}
          onToggleEdit={mockOnToggleEdit}
        />
      );

      expect(screen.getByTestId('device-card-form')).toBeInTheDocument();
    });

    it('should not render card when isEditing is true', () => {
      render(
        <DeviceCard
          device={defaultDevice}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          isEditing={true}
          onToggleEdit={mockOnToggleEdit}
        />
      );

      expect(screen.queryByTestId('device-card')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels for action buttons', () => {
      render(
        <DeviceCard
          device={defaultDevice}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByLabelText('编辑设备')).toBeInTheDocument();
      expect(screen.getByLabelText('删除设备')).toBeInTheDocument();
    });

    it('should have data-device-name attribute for identification', () => {
      render(
        <DeviceCard
          device={defaultDevice}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('device-card')).toHaveAttribute('data-device-name', '大黑盒子');
    });
  });
});


describe('DeviceCardForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  describe('Form Fields', () => {
    it('should render device type select', () => {
      render(
        <DeviceCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(screen.getByTestId('device-type-select')).toBeInTheDocument();
    });

    it('should render device name input', () => {
      render(
        <DeviceCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(screen.getByTestId('device-name-input')).toBeInTheDocument();
    });

    it('should render inheritor input', () => {
      render(
        <DeviceCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(screen.getByTestId('device-inheritor-input')).toBeInTheDocument();
    });

    it('should render needs formatting checkbox', () => {
      render(
        <DeviceCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(screen.getByTestId('device-needs-formatting-checkbox')).toBeInTheDocument();
    });

    it('should render special instructions textarea', () => {
      render(
        <DeviceCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(screen.getByTestId('device-special-instructions-input')).toBeInTheDocument();
    });
  });

  describe('Initial Data', () => {
    it('should populate form with initial data', () => {
      const initialData: Partial<DeviceData> = {
        type: 'server',
        name: '大黑盒子',
        inheritor: 'Janet',
        needsFormatting: true,
        specialInstructions: '需要从 Find My 注销',
      };

      render(
        <DeviceCardForm
          initialData={initialData}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByTestId('device-type-select')).toHaveValue('server');
      expect(screen.getByTestId('device-name-input')).toHaveValue('大黑盒子');
      expect(screen.getByTestId('device-inheritor-input')).toHaveValue('Janet');
      expect(screen.getByTestId('device-needs-formatting-checkbox')).toBeChecked();
      expect(screen.getByTestId('device-special-instructions-input')).toHaveValue('需要从 Find My 注销');
    });

    it('should default to computer type', () => {
      render(
        <DeviceCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(screen.getByTestId('device-type-select')).toHaveValue('computer');
    });

    it('should default needsFormatting to unchecked', () => {
      render(
        <DeviceCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(screen.getByTestId('device-needs-formatting-checkbox')).not.toBeChecked();
    });
  });


  describe('Form Submission', () => {
    it('should call onSubmit with form data when submitted', () => {
      render(
        <DeviceCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      fireEvent.change(screen.getByTestId('device-name-input'), {
        target: { value: 'Test Device' },
      });
      fireEvent.change(screen.getByTestId('device-inheritor-input'), {
        target: { value: 'John' },
      });
      fireEvent.click(screen.getByTestId('device-needs-formatting-checkbox'));
      fireEvent.change(screen.getByTestId('device-special-instructions-input'), {
        target: { value: 'Test instructions' },
      });

      fireEvent.click(screen.getByTestId('device-submit-button'));

      expect(mockOnSubmit).toHaveBeenCalledWith({
        type: 'computer',
        name: 'Test Device',
        inheritor: 'John',
        needsFormatting: true,
        specialInstructions: 'Test instructions',
      });
    });

    it('should trim whitespace from values', () => {
      render(
        <DeviceCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      fireEvent.change(screen.getByTestId('device-name-input'), {
        target: { value: '  Test Device  ' },
      });
      fireEvent.change(screen.getByTestId('device-inheritor-input'), {
        target: { value: '  John  ' },
      });

      fireEvent.click(screen.getByTestId('device-submit-button'));

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Device',
          inheritor: 'John',
        })
      );
    });

    it('should not submit if device name is empty', () => {
      render(
        <DeviceCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      fireEvent.click(screen.getByTestId('device-submit-button'));

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should not submit if device name is only whitespace', () => {
      render(
        <DeviceCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      fireEvent.change(screen.getByTestId('device-name-input'), {
        target: { value: '   ' },
      });
      fireEvent.click(screen.getByTestId('device-submit-button'));

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should disable submit button when device name is empty', () => {
      render(
        <DeviceCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(screen.getByTestId('device-submit-button')).toBeDisabled();
    });

    it('should enable submit button when device name is provided', () => {
      render(
        <DeviceCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      fireEvent.change(screen.getByTestId('device-name-input'), {
        target: { value: 'Test Device' },
      });

      expect(screen.getByTestId('device-submit-button')).not.toBeDisabled();
    });

    it('should set inheritor to undefined when empty', () => {
      render(
        <DeviceCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      fireEvent.change(screen.getByTestId('device-name-input'), {
        target: { value: 'Test Device' },
      });

      fireEvent.click(screen.getByTestId('device-submit-button'));

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          inheritor: undefined,
        })
      );
    });

    it('should set specialInstructions to undefined when empty', () => {
      render(
        <DeviceCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      fireEvent.change(screen.getByTestId('device-name-input'), {
        target: { value: 'Test Device' },
      });

      fireEvent.click(screen.getByTestId('device-submit-button'));

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          specialInstructions: undefined,
        })
      );
    });
  });


  describe('Form Cancellation', () => {
    it('should call onCancel when cancel button is clicked', () => {
      render(
        <DeviceCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      fireEvent.click(screen.getByTestId('device-cancel-button'));

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Button Labels', () => {
    it('should show "添加" for new device', () => {
      render(
        <DeviceCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(screen.getByTestId('device-submit-button')).toHaveTextContent('添加');
    });

    it('should show "保存" for existing device', () => {
      render(
        <DeviceCardForm
          initialData={{ name: 'Test Device' }}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByTestId('device-submit-button')).toHaveTextContent('保存');
    });
  });

  describe('Disabled State', () => {
    it('should disable all inputs when disabled prop is true', () => {
      render(
        <DeviceCardForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          disabled={true}
        />
      );

      expect(screen.getByTestId('device-type-select')).toBeDisabled();
      expect(screen.getByTestId('device-name-input')).toBeDisabled();
      expect(screen.getByTestId('device-inheritor-input')).toBeDisabled();
      expect(screen.getByTestId('device-needs-formatting-checkbox')).toBeDisabled();
      expect(screen.getByTestId('device-special-instructions-input')).toBeDisabled();
      expect(screen.getByTestId('device-cancel-button')).toBeDisabled();
      expect(screen.getByTestId('device-submit-button')).toBeDisabled();
    });
  });

  describe('Device Type Selection', () => {
    it('should allow changing device type', () => {
      render(
        <DeviceCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      fireEvent.change(screen.getByTestId('device-type-select'), {
        target: { value: 'server' },
      });

      expect(screen.getByTestId('device-type-select')).toHaveValue('server');
    });

    it('should include device type in submission', () => {
      render(
        <DeviceCardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      fireEvent.change(screen.getByTestId('device-type-select'), {
        target: { value: 'server' },
      });
      fireEvent.change(screen.getByTestId('device-name-input'), {
        target: { value: 'Test Server' },
      });

      fireEvent.click(screen.getByTestId('device-submit-button'));

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'server',
        })
      );
    });
  });
});


describe('DeviceCardList', () => {
  const mockOnChange = vi.fn();

  const defaultDevices: DeviceData[] = [
    {
      type: 'server',
      name: '大黑盒子',
      inheritor: 'Janet',
      needsFormatting: false,
    },
    {
      type: 'computer',
      name: 'NUC 小黑盒',
      inheritor: 'Janet',
      needsFormatting: true,
    },
    {
      type: 'computer',
      name: 'Mac 电脑',
      inheritor: 'Peter',
      needsFormatting: true,
      specialInstructions: '需要从 Find My 注销',
    },
  ];

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('List Display', () => {
    it('should render all devices', () => {
      render(
        <DeviceCardList devices={defaultDevices} onChange={mockOnChange} />
      );

      expect(screen.getAllByTestId('device-card')).toHaveLength(3);
    });

    it('should render devices in list layout', () => {
      render(
        <DeviceCardList devices={defaultDevices} onChange={mockOnChange} />
      );

      expect(screen.getByTestId('device-list')).toBeInTheDocument();
    });

    it('should render header text', () => {
      render(
        <DeviceCardList devices={defaultDevices} onChange={mockOnChange} />
      );

      expect(screen.getByText('🖥️ 家庭实验室设备')).toBeInTheDocument();
      expect(screen.getByText('管理您的设备，指定继承人和格式化要求')).toBeInTheDocument();
    });

    it('should render add device button', () => {
      render(
        <DeviceCardList devices={defaultDevices} onChange={mockOnChange} />
      );

      expect(screen.getByTestId('add-device-button')).toBeInTheDocument();
    });

    it('should render empty list', () => {
      render(<DeviceCardList devices={[]} onChange={mockOnChange} />);

      expect(screen.queryAllByTestId('device-card')).toHaveLength(0);
      expect(screen.getByTestId('add-device-button')).toBeInTheDocument();
    });
  });

  describe('Warning Message', () => {
    it('should render warning message when provided', () => {
      render(
        <DeviceCardList
          devices={defaultDevices}
          onChange={mockOnChange}
          warningMessage="重要：出售前必须格式化硬盘！"
        />
      );

      expect(screen.getByTestId('device-list-warning')).toHaveTextContent('重要：出售前必须格式化硬盘！');
    });

    it('should not render warning message when not provided', () => {
      render(
        <DeviceCardList devices={defaultDevices} onChange={mockOnChange} />
      );

      expect(screen.queryByTestId('device-list-warning')).not.toBeInTheDocument();
    });

    it('should have alert role for accessibility', () => {
      render(
        <DeviceCardList
          devices={defaultDevices}
          onChange={mockOnChange}
          warningMessage="重要：出售前必须格式化硬盘！"
        />
      );

      expect(screen.getByTestId('device-list-warning')).toHaveAttribute('role', 'alert');
    });
  });


  describe('Add Device', () => {
    it('should show form when add button is clicked', () => {
      render(
        <DeviceCardList devices={defaultDevices} onChange={mockOnChange} />
      );

      fireEvent.click(screen.getByTestId('add-device-button'));

      expect(screen.getByTestId('device-card-form')).toBeInTheDocument();
    });

    it('should hide add button when form is shown', () => {
      render(
        <DeviceCardList devices={defaultDevices} onChange={mockOnChange} />
      );

      fireEvent.click(screen.getByTestId('add-device-button'));

      expect(screen.queryByTestId('add-device-button')).not.toBeInTheDocument();
    });

    it('should add new device when form is submitted', () => {
      render(<DeviceCardList devices={[]} onChange={mockOnChange} />);

      fireEvent.click(screen.getByTestId('add-device-button'));

      fireEvent.change(screen.getByTestId('device-name-input'), {
        target: { value: 'New Device' },
      });
      fireEvent.click(screen.getByTestId('device-submit-button'));

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          name: 'New Device',
        }),
      ]);
    });

    it('should hide form when cancelled', () => {
      render(
        <DeviceCardList devices={defaultDevices} onChange={mockOnChange} />
      );

      fireEvent.click(screen.getByTestId('add-device-button'));
      fireEvent.click(screen.getByTestId('device-cancel-button'));

      expect(screen.queryByTestId('device-card-form')).not.toBeInTheDocument();
      expect(screen.getByTestId('add-device-button')).toBeInTheDocument();
    });
  });

  describe('Edit Device', () => {
    it('should show form when edit button is clicked', () => {
      render(
        <DeviceCardList devices={defaultDevices} onChange={mockOnChange} />
      );

      const editButtons = screen.getAllByTestId('device-edit-button');
      fireEvent.click(editButtons[0]);

      expect(screen.getByTestId('device-card-form')).toBeInTheDocument();
    });

    it('should update device when form is submitted', () => {
      render(
        <DeviceCardList devices={defaultDevices} onChange={mockOnChange} />
      );

      const editButtons = screen.getAllByTestId('device-edit-button');
      fireEvent.click(editButtons[0]);

      fireEvent.change(screen.getByTestId('device-name-input'), {
        target: { value: 'Updated Device' },
      });
      fireEvent.click(screen.getByTestId('device-submit-button'));

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          name: 'Updated Device',
        }),
        defaultDevices[1],
        defaultDevices[2],
      ]);
    });

    it('should close form when cancelled', () => {
      render(
        <DeviceCardList devices={defaultDevices} onChange={mockOnChange} />
      );

      const editButtons = screen.getAllByTestId('device-edit-button');
      fireEvent.click(editButtons[0]);
      fireEvent.click(screen.getByTestId('device-cancel-button'));

      expect(screen.queryByTestId('device-card-form')).not.toBeInTheDocument();
      expect(screen.getAllByTestId('device-card')).toHaveLength(3);
    });
  });


  describe('Delete Device', () => {
    it('should remove device when delete button is clicked', () => {
      render(
        <DeviceCardList devices={defaultDevices} onChange={mockOnChange} />
      );

      const deleteButtons = screen.getAllByTestId('device-delete-button');
      fireEvent.click(deleteButtons[1]); // Delete NUC 小黑盒

      expect(mockOnChange).toHaveBeenCalledWith([
        defaultDevices[0],
        defaultDevices[2],
      ]);
    });
  });

  describe('Disabled State', () => {
    it('should disable add button when disabled', () => {
      render(
        <DeviceCardList
          devices={defaultDevices}
          onChange={mockOnChange}
          disabled={true}
        />
      );

      expect(screen.getByTestId('add-device-button')).toBeDisabled();
    });

    it('should disable all edit and delete buttons when disabled', () => {
      render(
        <DeviceCardList
          devices={defaultDevices}
          onChange={mockOnChange}
          disabled={true}
        />
      );

      screen.getAllByTestId('device-edit-button').forEach((button) => {
        expect(button).toBeDisabled();
      });
      screen.getAllByTestId('device-delete-button').forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });
});
