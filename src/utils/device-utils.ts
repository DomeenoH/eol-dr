import type { DeviceType } from '../types/platform';

/**
 * Device type configuration for styling and display
 */
export const deviceTypeConfig: Record<DeviceType, {
  label: string;
  icon: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}> = {
  server: {
    label: '服务器',
    icon: '🖥️',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    textColor: 'text-purple-700',
  },
  computer: {
    label: '电脑',
    icon: '💻',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    textColor: 'text-blue-700',
  },
  phone: {
    label: '手机/平板',
    icon: '📱',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    textColor: 'text-green-700',
  },
  network: {
    label: '网络设备',
    icon: '🌐',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    textColor: 'text-orange-700',
  },
  iot: {
    label: 'IoT 设备',
    icon: '🏠',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-300',
    textColor: 'text-teal-700',
  },
};

/**
 * Get icon for a device type
 */
export const getDeviceIcon = (type: DeviceType): string => {
  return deviceTypeConfig[type]?.icon || '📦';
};

/**
 * Get label for a device type
 */
export const getDeviceTypeLabel = (type: DeviceType): string => {
  return deviceTypeConfig[type]?.label || '未知设备';
};

/**
 * Available device types for selection
 */
export const deviceTypes: DeviceType[] = ['server', 'computer', 'phone', 'network', 'iot'];
