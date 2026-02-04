/**
 * SaveStatus Component Tests
 * 
 * Tests for the SaveStatus component that displays save status indicator with last saved time.
 * Requirements: 3.4
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SaveStatus, SaveStatusBadge, formatRelativeTime } from '../SaveStatus';

describe('SaveStatus', () => {
  // Mock the current date for consistent testing
  const mockNow = new Date('2024-01-15T12:00:00.000Z');
  
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Status Display', () => {
    it('should display "已保存" for saved status', () => {
      render(<SaveStatus status="saved" />);
      
      expect(screen.getByText('已保存')).toBeInTheDocument();
    });

    it('should display "保存中..." for saving status', () => {
      render(<SaveStatus status="saving" />);
      
      expect(screen.getByText('保存中...')).toBeInTheDocument();
    });

    it('should display "保存失败" for error status', () => {
      render(<SaveStatus status="error" />);
      
      expect(screen.getByText('保存失败')).toBeInTheDocument();
    });

    it('should have data-testid for the container', () => {
      render(<SaveStatus status="saved" />);
      
      expect(screen.getByTestId('save-status')).toBeInTheDocument();
    });

    it('should have role="status" for accessibility', () => {
      render(<SaveStatus status="saved" />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should have aria-live="polite" for screen readers', () => {
      render(<SaveStatus status="saved" />);
      
      const statusElement = screen.getByRole('status');
      expect(statusElement).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Last Saved Time Display', () => {
    it('should display relative time for saved status', () => {
      const lastSaved = new Date('2024-01-15T11:55:00.000Z'); // 5 minutes ago
      render(<SaveStatus status="saved" lastSaved={lastSaved} />);
      
      expect(screen.getByText('· 5分钟前')).toBeInTheDocument();
    });

    it('should not display time for saving status', () => {
      const lastSaved = new Date('2024-01-15T11:55:00.000Z');
      render(<SaveStatus status="saving" lastSaved={lastSaved} />);
      
      expect(screen.queryByText(/分钟前/)).not.toBeInTheDocument();
    });

    it('should not display time for error status', () => {
      const lastSaved = new Date('2024-01-15T11:55:00.000Z');
      render(<SaveStatus status="error" lastSaved={lastSaved} />);
      
      expect(screen.queryByText(/分钟前/)).not.toBeInTheDocument();
    });

    it('should handle null lastSaved', () => {
      render(<SaveStatus status="saved" lastSaved={null} />);
      
      expect(screen.getByText('已保存')).toBeInTheDocument();
      expect(screen.queryByText(/前/)).not.toBeInTheDocument();
    });

    it('should handle undefined lastSaved', () => {
      render(<SaveStatus status="saved" />);
      
      expect(screen.getByText('已保存')).toBeInTheDocument();
      expect(screen.queryByText(/前/)).not.toBeInTheDocument();
    });
  });

  describe('Error Message Display', () => {
    it('should display error message when status is error', () => {
      render(<SaveStatus status="error" errorMessage="存储空间不足" />);
      
      expect(screen.getByText('存储空间不足')).toBeInTheDocument();
    });

    it('should not display error message when status is saved', () => {
      render(<SaveStatus status="saved" errorMessage="存储空间不足" />);
      
      expect(screen.queryByText('存储空间不足')).not.toBeInTheDocument();
    });

    it('should not display error message when status is saving', () => {
      render(<SaveStatus status="saving" errorMessage="存储空间不足" />);
      
      expect(screen.queryByText('存储空间不足')).not.toBeInTheDocument();
    });

    it('should have data-testid for error message', () => {
      render(<SaveStatus status="error" errorMessage="存储空间不足" />);
      
      expect(screen.getByTestId('save-error-message')).toBeInTheDocument();
    });

    it('should handle null error message', () => {
      render(<SaveStatus status="error" errorMessage={null} />);
      
      expect(screen.getByText('保存失败')).toBeInTheDocument();
      expect(screen.queryByTestId('save-error-message')).not.toBeInTheDocument();
    });
  });

  describe('Compact Mode', () => {
    it('should render in compact mode when compact prop is true', () => {
      render(<SaveStatus status="saved" compact={true} />);
      
      expect(screen.getByText('已保存')).toBeInTheDocument();
    });

    it('should not show relative time in compact mode', () => {
      const lastSaved = new Date('2024-01-15T11:55:00.000Z');
      render(<SaveStatus status="saved" lastSaved={lastSaved} compact={true} />);
      
      // In compact mode, we don't show the relative time
      expect(screen.queryByText(/分钟前/)).not.toBeInTheDocument();
    });

    it('should not show error message in compact mode', () => {
      render(<SaveStatus status="error" errorMessage="存储空间不足" compact={true} />);
      
      // In compact mode, we don't show the error message
      expect(screen.queryByText('存储空间不足')).not.toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className to container', () => {
      render(<SaveStatus status="saved" className="custom-class" />);
      
      const container = screen.getByTestId('save-status');
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('Visual Indicators', () => {
    it('should render with green color for saved status', () => {
      render(<SaveStatus status="saved" />);
      
      const statusText = screen.getByText('已保存');
      expect(statusText).toHaveClass('text-green-600');
    });

    it('should render with blue color for saving status', () => {
      render(<SaveStatus status="saving" />);
      
      const statusText = screen.getByText('保存中...');
      expect(statusText).toHaveClass('text-blue-600');
    });

    it('should render with red color for error status', () => {
      render(<SaveStatus status="error" />);
      
      const statusText = screen.getByText('保存失败');
      expect(statusText).toHaveClass('text-red-600');
    });
  });
});

describe('SaveStatusBadge', () => {
  const mockNow = new Date('2024-01-15T12:00:00.000Z');
  
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render as a badge with rounded-full class', () => {
    render(<SaveStatusBadge status="saved" />);
    
    const badge = screen.getByTestId('save-status-badge');
    expect(badge).toHaveClass('rounded-full');
  });

  it('should display status text', () => {
    render(<SaveStatusBadge status="saved" />);
    
    expect(screen.getByText('已保存')).toBeInTheDocument();
  });

  it('should display relative time for saved status', () => {
    const lastSaved = new Date('2024-01-15T11:55:00.000Z');
    render(<SaveStatusBadge status="saved" lastSaved={lastSaved} />);
    
    expect(screen.getByText('5分钟前')).toBeInTheDocument();
  });

  it('should display error message for error status', () => {
    render(<SaveStatusBadge status="error" errorMessage="存储空间不足" />);
    
    expect(screen.getByText('存储空间不足')).toBeInTheDocument();
  });

  it('should have appropriate background color for saved status', () => {
    render(<SaveStatusBadge status="saved" />);
    
    const badge = screen.getByTestId('save-status-badge');
    expect(badge).toHaveClass('bg-green-50');
  });

  it('should have appropriate background color for saving status', () => {
    render(<SaveStatusBadge status="saving" />);
    
    const badge = screen.getByTestId('save-status-badge');
    expect(badge).toHaveClass('bg-blue-50');
  });

  it('should have appropriate background color for error status', () => {
    render(<SaveStatusBadge status="error" />);
    
    const badge = screen.getByTestId('save-status-badge');
    expect(badge).toHaveClass('bg-red-50');
  });

  it('should apply custom className', () => {
    render(<SaveStatusBadge status="saved" className="custom-badge" />);
    
    const badge = screen.getByTestId('save-status-badge');
    expect(badge).toHaveClass('custom-badge');
  });
});

describe('formatRelativeTime', () => {
  const mockNow = new Date('2024-01-15T12:00:00.000Z');
  
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return empty string for null date', () => {
    expect(formatRelativeTime(null)).toBe('');
  });

  it('should return empty string for undefined date', () => {
    expect(formatRelativeTime(undefined)).toBe('');
  });

  it('should return "刚刚" for dates less than 10 seconds ago', () => {
    const date = new Date('2024-01-15T11:59:55.000Z'); // 5 seconds ago
    expect(formatRelativeTime(date)).toBe('刚刚');
  });

  it('should return seconds format for dates 10-59 seconds ago', () => {
    const date = new Date('2024-01-15T11:59:30.000Z'); // 30 seconds ago
    expect(formatRelativeTime(date)).toBe('30秒前');
  });

  it('should return minutes format for dates 1-59 minutes ago', () => {
    const date = new Date('2024-01-15T11:45:00.000Z'); // 15 minutes ago
    expect(formatRelativeTime(date)).toBe('15分钟前');
  });

  it('should return hours format for dates 1-23 hours ago', () => {
    const date = new Date('2024-01-15T09:00:00.000Z'); // 3 hours ago
    expect(formatRelativeTime(date)).toBe('3小时前');
  });

  it('should return days format for dates 1-6 days ago', () => {
    const date = new Date('2024-01-13T12:00:00.000Z'); // 2 days ago
    expect(formatRelativeTime(date)).toBe('2天前');
  });

  it('should return date format for dates 7+ days ago in same year', () => {
    const date = new Date('2024-01-01T10:30:00.000Z'); // 14 days ago
    // Format expected time in local timezone
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    expect(formatRelativeTime(date)).toBe(`01月01日 ${hours}:${minutes}`);
  });

  it('should return full date format for dates in different year', () => {
    const date = new Date('2023-12-15T10:30:00.000Z'); // Previous year
    // Format expected time in local timezone
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    expect(formatRelativeTime(date)).toBe(`2023年12月15日 ${hours}:${minutes}`);
  });

  it('should return "刚刚" for future dates', () => {
    const date = new Date('2024-01-15T12:05:00.000Z'); // 5 minutes in future
    expect(formatRelativeTime(date)).toBe('刚刚');
  });

  it('should handle exactly 1 minute ago', () => {
    const date = new Date('2024-01-15T11:59:00.000Z'); // 1 minute ago
    expect(formatRelativeTime(date)).toBe('1分钟前');
  });

  it('should handle exactly 1 hour ago', () => {
    const date = new Date('2024-01-15T11:00:00.000Z'); // 1 hour ago
    expect(formatRelativeTime(date)).toBe('1小时前');
  });

  it('should handle exactly 1 day ago', () => {
    const date = new Date('2024-01-14T12:00:00.000Z'); // 1 day ago
    expect(formatRelativeTime(date)).toBe('1天前');
  });

  it('should handle boundary at 60 seconds', () => {
    const date = new Date('2024-01-15T11:59:00.000Z'); // exactly 60 seconds ago
    expect(formatRelativeTime(date)).toBe('1分钟前');
  });

  it('should handle boundary at 60 minutes', () => {
    const date = new Date('2024-01-15T11:00:00.000Z'); // exactly 60 minutes ago
    expect(formatRelativeTime(date)).toBe('1小时前');
  });

  it('should handle boundary at 24 hours', () => {
    const date = new Date('2024-01-14T12:00:00.000Z'); // exactly 24 hours ago
    expect(formatRelativeTime(date)).toBe('1天前');
  });

  it('should handle boundary at 7 days', () => {
    const date = new Date('2024-01-08T12:00:00.000Z'); // exactly 7 days ago
    // Format expected time in local timezone
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    expect(formatRelativeTime(date)).toBe(`01月08日 ${hours}:${minutes}`);
  });
});
