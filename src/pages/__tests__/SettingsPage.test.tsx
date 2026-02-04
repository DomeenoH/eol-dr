/**
 * SettingsPage Component Tests
 * 
 * Tests for the SettingsPage component that validates:
 * - Import JSON backup functionality
 * - Clear all data with confirmation dialog
 * - Accessibility features
 * 
 * @validates Requirements 4.5, 6.4, 6.5
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SettingsPage } from '../SettingsPage';
import { ChecklistProvider } from '../../context/ChecklistContext';
import type { ChecklistData } from '../../types/checklist-data';
import type { ProgressState } from '../../types/progress';

// Mock the StorageService
vi.mock('../../services/StorageService', () => ({
  storageService: {
    isAvailable: vi.fn(() => true),
    load: vi.fn(() => null),
    loadProgress: vi.fn(() => null),
    save: vi.fn(),
    saveProgress: vi.fn(),
    clear: vi.fn(),
    getUsedSpace: vi.fn(() => 0),
  },
  StorageError: class StorageError extends Error {
    constructor(message: string, public code: string) {
      super(message);
      this.name = 'StorageError';
    }
  },
}));

// Mock the ExportService
vi.mock('../../services/ExportService', () => ({
  exportService: {
    toJSON: vi.fn(() => '{"test": "data"}'),
    fromJSON: vi.fn((json: string) => {
      const parsed = JSON.parse(json);
      if (parsed.metadata && parsed.data) {
        return parsed;
      }
      throw new Error('Invalid format');
    }),
    toMarkdown: vi.fn(() => '# Test Markdown'),
    toHTML: vi.fn(() => '<html><body>Test HTML</body></html>'),
    downloadFile: vi.fn(),
  },
  ExportService: vi.fn(),
  ExportError: class ExportError extends Error {
    constructor(message: string, public code: string) {
      super(message);
      this.name = 'ExportError';
    }
  },
}));

// Import the mocked modules
import { storageService } from '../../services/StorageService';
import { exportService } from '../../services/ExportService';

/**
 * Sample checklist data for testing
 */
const sampleChecklistData: ChecklistData = {
  version: '1.0.0',
  lastModified: new Date().toISOString(),
  sections: {
    'emergency-contacts': {
      categories: {
        contacts: {
          items: {
            contacts: [
              {
                name: 'John Doe',
                platform: 'imessage',
                contact: '+1234567890',
              },
            ],
          },
        },
      },
    },
  },
};

const sampleProgressState: ProgressState = {
  overall: 50,
  sections: {},
  currentPosition: { sectionId: 'emergency-contacts', categoryId: 'contacts' },
  mode: 'guided',
  lastVisited: new Date().toISOString(),
};

const emptyChecklistData: ChecklistData = {
  version: '1.0.0',
  lastModified: new Date().toISOString(),
  sections: {},
};

const emptyProgressState: ProgressState = {
  overall: 0,
  sections: {},
  currentPosition: { sectionId: '', categoryId: '' },
  mode: 'guided',
  lastVisited: new Date().toISOString(),
};

/**
 * Helper to render SettingsPage with ChecklistProvider
 */
const renderSettingsPage = (
  props: Partial<React.ComponentProps<typeof SettingsPage>> = {},
  initialData?: ChecklistData,
  initialProgress?: ProgressState
) => {
  return render(
    <ChecklistProvider
      initialData={initialData || sampleChecklistData}
      initialProgress={initialProgress || sampleProgressState}
    >
      <SettingsPage {...props} />
    </ChecklistProvider>
  );
};

/**
 * Helper to create a mock file
 */
const createMockFile = (content: string, name: string = 'backup.json'): File => {
  return new File([content], name, { type: 'application/json' });
};

/**
 * Valid export data for import testing
 */
const validExportData = {
  metadata: {
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
    appVersion: '1.0.0',
  },
  data: sampleChecklistData,
  progress: sampleProgressState,
};

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(storageService.isAvailable).mockReturnValue(true);
    vi.mocked(storageService.load).mockReturnValue(null);
    vi.mocked(storageService.loadProgress).mockReturnValue(null);
    vi.mocked(exportService.fromJSON).mockImplementation((json: string) => {
      const parsed = JSON.parse(json);
      if (parsed.metadata && parsed.data) {
        return parsed;
      }
      throw new Error('Invalid format');
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the settings page', () => {
      renderSettingsPage();
      
      expect(screen.getByTestId('settings-page')).toBeInTheDocument();
    });

    it('should display settings title', () => {
      renderSettingsPage();
      
      expect(screen.getByRole('heading', { name: /设置/ })).toBeInTheDocument();
    });

    it('should display subtitle', () => {
      renderSettingsPage();
      
      expect(screen.getByText(/数据管理与备份/)).toBeInTheDocument();
    });

    it('should display import section', () => {
      renderSettingsPage();
      
      expect(screen.getByText('导入数据')).toBeInTheDocument();
    });

    it('should display clear data section', () => {
      renderSettingsPage();
      
      // Use heading role to find the section title specifically
      expect(screen.getByRole('heading', { name: '清除所有数据' })).toBeInTheDocument();
    });

    it('should display privacy notice', () => {
      renderSettingsPage();
      
      expect(screen.getByText(/您的数据仅保存在本地浏览器中/)).toBeInTheDocument();
    });
  });

  describe('Requirement 4.5: Import JSON Backup', () => {
    it('should display import button', () => {
      renderSettingsPage();
      
      expect(screen.getByRole('button', { name: /选择 JSON 文件/ })).toBeInTheDocument();
    });

    it('should have hidden file input', () => {
      renderSettingsPage();
      
      const fileInput = screen.getByTestId('import-file-input');
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveClass('hidden');
    });

    it('should accept JSON files', () => {
      renderSettingsPage();
      
      const fileInput = screen.getByTestId('import-file-input');
      expect(fileInput).toHaveAttribute('accept', '.json,application/json');
    });

    it('should display import description', () => {
      renderSettingsPage();
      
      expect(screen.getByText(/从 JSON 备份文件恢复您的数据/)).toBeInTheDocument();
    });

    it('should show success message after successful import', async () => {
      renderSettingsPage();
      
      const fileInput = screen.getByTestId('import-file-input');
      const file = createMockFile(JSON.stringify(validExportData));
      
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(screen.getByText(/数据导入成功/)).toBeInTheDocument();
      });
    });

    it('should call exportService.fromJSON when importing', async () => {
      renderSettingsPage();
      
      const fileInput = screen.getByTestId('import-file-input');
      const file = createMockFile(JSON.stringify(validExportData));
      
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(exportService.fromJSON).toHaveBeenCalled();
      });
    });

    it('should show error message for invalid JSON', async () => {
      vi.mocked(exportService.fromJSON).mockImplementation(() => {
        throw new Error('Invalid JSON');
      });
      
      renderSettingsPage();
      
      const fileInput = screen.getByTestId('import-file-input');
      const file = createMockFile('invalid json content');
      
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });

    it('should display import warning about overwriting data', () => {
      renderSettingsPage();
      
      expect(screen.getByText(/导入将覆盖当前所有数据/)).toBeInTheDocument();
    });
  });

  describe('Requirement 6.4: Clear All Data', () => {
    it('should display clear data button', () => {
      renderSettingsPage();
      
      expect(screen.getByRole('button', { name: /清除所有数据/ })).toBeInTheDocument();
    });

    it('should display clear data description', () => {
      renderSettingsPage();
      
      expect(screen.getByText(/永久删除所有已填写的数据和进度/)).toBeInTheDocument();
    });

    it('should display current data status when data exists', () => {
      renderSettingsPage();
      
      expect(screen.getByText(/有已保存的数据/)).toBeInTheDocument();
    });

    it('should display progress percentage in status', () => {
      renderSettingsPage();
      
      expect(screen.getByText(/50% 完成/)).toBeInTheDocument();
    });

    it('should display empty status when no data', () => {
      renderSettingsPage({}, emptyChecklistData, emptyProgressState);
      
      expect(screen.getByText(/暂无数据/)).toBeInTheDocument();
    });

    it('should disable clear button when no data', () => {
      renderSettingsPage({}, emptyChecklistData, emptyProgressState);
      
      const clearButton = screen.getByRole('button', { name: /清除所有数据/ });
      expect(clearButton).toBeDisabled();
    });

    it('should enable clear button when data exists', () => {
      renderSettingsPage();
      
      const clearButton = screen.getByRole('button', { name: /清除所有数据/ });
      expect(clearButton).not.toBeDisabled();
    });

    it('should call storageService.clear after confirmation', async () => {
      renderSettingsPage();
      
      // Click clear button
      const clearButton = screen.getByRole('button', { name: /清除所有数据/ });
      fireEvent.click(clearButton);
      
      // Type confirmation text
      const confirmInput = screen.getByTestId('confirm-input');
      fireEvent.change(confirmInput, { target: { value: '确认删除' } });
      
      // Click confirm button
      const confirmButton = screen.getByTestId('confirm-clear-button');
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(storageService.clear).toHaveBeenCalled();
      });
    });
  });

  describe('Requirement 6.5: Confirmation Before Clearing', () => {
    it('should show confirmation dialog when clear button is clicked', () => {
      renderSettingsPage();
      
      const clearButton = screen.getByRole('button', { name: /清除所有数据/ });
      fireEvent.click(clearButton);
      
      expect(screen.getByTestId('clear-confirm-dialog')).toBeInTheDocument();
    });

    it('should display confirmation dialog title', () => {
      renderSettingsPage();
      
      const clearButton = screen.getByRole('button', { name: /清除所有数据/ });
      fireEvent.click(clearButton);
      
      expect(screen.getByText(/确认清除所有数据/)).toBeInTheDocument();
    });

    it('should display warning message in dialog', () => {
      renderSettingsPage();
      
      const clearButton = screen.getByRole('button', { name: /清除所有数据/ });
      fireEvent.click(clearButton);
      
      expect(screen.getByText(/这将永久删除以下内容/)).toBeInTheDocument();
    });

    it('should list items that will be deleted', () => {
      renderSettingsPage();
      
      const clearButton = screen.getByRole('button', { name: /清除所有数据/ });
      fireEvent.click(clearButton);
      
      expect(screen.getByText(/所有已填写的清单数据/)).toBeInTheDocument();
      expect(screen.getByText(/填写进度和状态/)).toBeInTheDocument();
      expect(screen.getByText(/所有本地保存的信息/)).toBeInTheDocument();
    });

    it('should require typing confirmation text', () => {
      renderSettingsPage();
      
      const clearButton = screen.getByRole('button', { name: /清除所有数据/ });
      fireEvent.click(clearButton);
      
      expect(screen.getByText(/请输入/)).toBeInTheDocument();
      expect(screen.getByText(/确认删除/)).toBeInTheDocument();
    });

    it('should have disabled confirm button initially', () => {
      renderSettingsPage();
      
      const clearButton = screen.getByRole('button', { name: /清除所有数据/ });
      fireEvent.click(clearButton);
      
      const confirmButton = screen.getByTestId('confirm-clear-button');
      expect(confirmButton).toBeDisabled();
    });

    it('should enable confirm button when correct text is entered', () => {
      renderSettingsPage();
      
      const clearButton = screen.getByRole('button', { name: /清除所有数据/ });
      fireEvent.click(clearButton);
      
      const confirmInput = screen.getByTestId('confirm-input');
      fireEvent.change(confirmInput, { target: { value: '确认删除' } });
      
      const confirmButton = screen.getByTestId('confirm-clear-button');
      expect(confirmButton).not.toBeDisabled();
    });

    it('should keep confirm button disabled for incorrect text', () => {
      renderSettingsPage();
      
      const clearButton = screen.getByRole('button', { name: /清除所有数据/ });
      fireEvent.click(clearButton);
      
      const confirmInput = screen.getByTestId('confirm-input');
      fireEvent.change(confirmInput, { target: { value: 'wrong text' } });
      
      const confirmButton = screen.getByTestId('confirm-clear-button');
      expect(confirmButton).toBeDisabled();
    });

    it('should close dialog when cancel is clicked', () => {
      renderSettingsPage();
      
      const clearButton = screen.getByRole('button', { name: /清除所有数据/ });
      fireEvent.click(clearButton);
      
      expect(screen.getByTestId('clear-confirm-dialog')).toBeInTheDocument();
      
      const cancelButton = screen.getByRole('button', { name: /取消/ });
      fireEvent.click(cancelButton);
      
      expect(screen.queryByTestId('clear-confirm-dialog')).not.toBeInTheDocument();
    });

    it('should close dialog after successful clear', async () => {
      renderSettingsPage();
      
      const clearButton = screen.getByRole('button', { name: /清除所有数据/ });
      fireEvent.click(clearButton);
      
      const confirmInput = screen.getByTestId('confirm-input');
      fireEvent.change(confirmInput, { target: { value: '确认删除' } });
      
      const confirmButton = screen.getByTestId('confirm-clear-button');
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(screen.queryByTestId('clear-confirm-dialog')).not.toBeInTheDocument();
      });
    });

    it('should have proper dialog accessibility attributes', () => {
      renderSettingsPage();
      
      const clearButton = screen.getByRole('button', { name: /清除所有数据/ });
      fireEvent.click(clearButton);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby');
    });
  });

  describe('Back Button', () => {
    it('should display back button when onBack is provided', () => {
      const onBack = vi.fn();
      renderSettingsPage({ onBack });
      
      expect(screen.getByRole('button', { name: /返回/ })).toBeInTheDocument();
    });

    it('should call onBack when back button is clicked', () => {
      const onBack = vi.fn();
      renderSettingsPage({ onBack });
      
      const backButton = screen.getByRole('button', { name: /返回/ });
      fireEvent.click(backButton);
      
      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('should not display back button when onBack is not provided', () => {
      renderSettingsPage();
      
      expect(screen.queryByRole('button', { name: /返回/ })).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      renderSettingsPage();
      
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(2);
    });

    it('should have proper section labels', () => {
      renderSettingsPage();
      
      const importSection = screen.getByRole('region', { name: /导入数据/ });
      expect(importSection).toBeInTheDocument();
      
      const clearSection = screen.getByRole('region', { name: /清除所有数据/ });
      expect(clearSection).toBeInTheDocument();
    });

    it('should have proper ARIA labels on buttons', () => {
      renderSettingsPage();
      
      expect(screen.getByRole('button', { name: /选择 JSON 文件/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /清除所有数据/ })).toBeInTheDocument();
    });

    it('should have proper alert role for success message', async () => {
      renderSettingsPage();
      
      const fileInput = screen.getByTestId('import-file-input');
      const file = createMockFile(JSON.stringify(validExportData));
      
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
      });
    });

    it('should have proper label for confirmation input', () => {
      renderSettingsPage();
      
      const clearButton = screen.getByRole('button', { name: /清除所有数据/ });
      fireEvent.click(clearButton);
      
      const confirmInput = screen.getByLabelText(/请输入/);
      expect(confirmInput).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      renderSettingsPage({ className: 'custom-settings-class' });
      
      expect(screen.getByTestId('settings-page')).toHaveClass('custom-settings-class');
    });
  });

  describe('Visual Design', () => {
    it('should have gradient background', () => {
      renderSettingsPage();
      
      const page = screen.getByTestId('settings-page');
      expect(page).toHaveClass('bg-gradient-to-br');
    });

    it('should have danger styling for clear section', () => {
      renderSettingsPage();
      
      const clearSection = screen.getByRole('region', { name: /清除所有数据/ });
      expect(clearSection).toHaveClass('border-red-200');
    });

    it('should have blue styling for import section', () => {
      renderSettingsPage();
      
      const importButton = screen.getByRole('button', { name: /选择 JSON 文件/ });
      expect(importButton).toHaveClass('bg-blue-600');
    });
  });
});
