/**
 * CompletePage Component Tests
 * 
 * Tests for the CompletePage component that validates:
 * - Display completion congratulations message
 * - Provide export options (JSON, Markdown, HTML)
 * - Provide preview entry
 * - Accessibility features
 * 
 * @validates Requirements 10.5
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CompletePage } from '../CompletePage';
import { ChecklistProvider, ThemeProvider } from '../../context';
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
  overall: 100,
  sections: {},
  currentPosition: { sectionId: 'emergency-contacts', categoryId: 'contacts' },
  mode: 'guided',
  lastVisited: new Date().toISOString(),
};

/**
 * Helper to render CompletePage with ChecklistProvider
 */
const renderCompletePage = (
  props: Partial<React.ComponentProps<typeof CompletePage>> = {},
  initialData?: ChecklistData,
  initialProgress?: ProgressState
) => {
  return render(
    <ThemeProvider>
      <ChecklistProvider
        initialData={initialData || sampleChecklistData}
        initialProgress={initialProgress || sampleProgressState}
      >
        <CompletePage {...props} />
      </ChecklistProvider>
    </ThemeProvider>
  );
};

describe('CompletePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(storageService.isAvailable).mockReturnValue(true);
    vi.mocked(storageService.load).mockReturnValue(null);
    vi.mocked(storageService.loadProgress).mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the complete page', () => {
      renderCompletePage();
      
      expect(screen.getByTestId('complete-page')).toBeInTheDocument();
    });

    it('should display congratulations message', () => {
      renderCompletePage();
      
      expect(screen.getByText(/恭喜您完成了清单/)).toBeInTheDocument();
    });

    it('should display completion description', () => {
      renderCompletePage();
      
      expect(screen.getByText(/您已经成功完成了身后事清单的填写/)).toBeInTheDocument();
    });

    it('should display trophy icon', () => {
      renderCompletePage();
      
      // The trophy icon container should be present
      const trophyContainer = screen.getByTestId('complete-page').querySelector('.animate-bounce');
      expect(trophyContainer).toBeInTheDocument();
    });
  });

  describe('Requirement 10.5: Display Completion Congratulations', () => {
    it('should display celebratory emojis', () => {
      renderCompletePage();
      
      // Check for celebration emojis in the page
      const pageContent = screen.getByTestId('complete-page').textContent;
      expect(pageContent).toContain('🎉');
    });

    it('should display progress summary', () => {
      renderCompletePage();
      
      expect(screen.getByText('完成摘要')).toBeInTheDocument();
    });

    it('should display overall progress percentage', () => {
      renderCompletePage();
      
      expect(screen.getByText('整体进度')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should display progress bar with correct value', () => {
      renderCompletePage();
      
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('should display important reminder section', () => {
      renderCompletePage();
      
      expect(screen.getByText('重要提醒')).toBeInTheDocument();
    });

    it('should display reminder about exporting data', () => {
      renderCompletePage();
      
      expect(screen.getByText(/请导出并妥善保存您的数据/)).toBeInTheDocument();
    });

    it('should display reminder about telling family', () => {
      renderCompletePage();
      
      expect(screen.getByText(/告知您信任的家人或朋友/)).toBeInTheDocument();
    });

    it('should display footer message', () => {
      renderCompletePage();
      
      expect(screen.getByText(/感谢您使用身后事清单应用/)).toBeInTheDocument();
    });
  });

  describe('Preview Entry', () => {
    it('should display preview button', () => {
      renderCompletePage();
      
      expect(screen.getByRole('button', { name: /预览清单/ })).toBeInTheDocument();
    });

    it('should call onPreview when preview button is clicked', () => {
      const onPreview = vi.fn();
      renderCompletePage({ onPreview });
      
      const previewButton = screen.getByRole('button', { name: /预览清单/ });
      fireEvent.click(previewButton);
      
      expect(onPreview).toHaveBeenCalledTimes(1);
    });
  });

  describe('Export Options', () => {
    it('should display export button', () => {
      renderCompletePage();
      
      expect(screen.getByRole('button', { name: /导出数据/ })).toBeInTheDocument();
    });

    it('should show export menu when export button is clicked', () => {
      renderCompletePage();
      
      const exportButton = screen.getByRole('button', { name: /导出数据/ });
      fireEvent.click(exportButton);
      
      expect(screen.getByRole('menu', { name: /导出选项/ })).toBeInTheDocument();
    });

    it('should have JSON export option', () => {
      renderCompletePage();
      
      const exportButton = screen.getByRole('button', { name: /导出数据/ });
      fireEvent.click(exportButton);
      
      expect(screen.getByRole('menuitem', { name: /导出为 JSON/ })).toBeInTheDocument();
    });

    it('should have Markdown export option', () => {
      renderCompletePage();
      
      const exportButton = screen.getByRole('button', { name: /导出数据/ });
      fireEvent.click(exportButton);
      
      expect(screen.getByRole('menuitem', { name: /导出为 Markdown/ })).toBeInTheDocument();
    });

    it('should have HTML export option', () => {
      renderCompletePage();
      
      const exportButton = screen.getByRole('button', { name: /导出数据/ });
      fireEvent.click(exportButton);
      
      expect(screen.getByRole('menuitem', { name: /导出为 HTML/ })).toBeInTheDocument();
    });

    it('should call exportService.toJSON when JSON export is clicked', () => {
      renderCompletePage();
      
      const exportButton = screen.getByRole('button', { name: /导出数据/ });
      fireEvent.click(exportButton);
      
      const jsonOption = screen.getByRole('menuitem', { name: /导出为 JSON/ });
      fireEvent.click(jsonOption);
      
      expect(exportService.toJSON).toHaveBeenCalled();
      expect(exportService.downloadFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringMatching(/eol-checklist-.*\.json/),
        'application/json'
      );
    });

    it('should call exportService.toMarkdown when Markdown export is clicked', () => {
      renderCompletePage();
      
      const exportButton = screen.getByRole('button', { name: /导出数据/ });
      fireEvent.click(exportButton);
      
      const mdOption = screen.getByRole('menuitem', { name: /导出为 Markdown/ });
      fireEvent.click(mdOption);
      
      expect(exportService.toMarkdown).toHaveBeenCalled();
      expect(exportService.downloadFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringMatching(/eol-checklist-.*\.md/),
        'text/markdown'
      );
    });

    it('should call exportService.toHTML when HTML export is clicked', () => {
      renderCompletePage();
      
      const exportButton = screen.getByRole('button', { name: /导出数据/ });
      fireEvent.click(exportButton);
      
      const htmlOption = screen.getByRole('menuitem', { name: /导出为 HTML/ });
      fireEvent.click(htmlOption);
      
      expect(exportService.toHTML).toHaveBeenCalled();
      expect(exportService.downloadFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringMatching(/eol-checklist-.*\.html/),
        'text/html'
      );
    });

    it('should show export success message after export', async () => {
      renderCompletePage();
      
      const exportButton = screen.getByRole('button', { name: /导出数据/ });
      fireEvent.click(exportButton);
      
      const jsonOption = screen.getByRole('menuitem', { name: /导出为 JSON/ });
      fireEvent.click(jsonOption);
      
      // Success message should appear immediately
      expect(screen.getByText(/JSON 文件已成功导出/)).toBeInTheDocument();
    });

    it('should close export menu after selecting an option', () => {
      renderCompletePage();
      
      const exportButton = screen.getByRole('button', { name: /导出数据/ });
      fireEvent.click(exportButton);
      
      expect(screen.getByRole('menu')).toBeInTheDocument();
      
      const jsonOption = screen.getByRole('menuitem', { name: /导出为 JSON/ });
      fireEvent.click(jsonOption);
      
      // Menu should close immediately after selection
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('should display export option descriptions', () => {
      renderCompletePage();
      
      const exportButton = screen.getByRole('button', { name: /导出数据/ });
      fireEvent.click(exportButton);
      
      expect(screen.getByText(/用于数据备份和迁移/)).toBeInTheDocument();
      expect(screen.getByText(/可读的文档格式/)).toBeInTheDocument();
      expect(screen.getByText(/适合打印的网页格式/)).toBeInTheDocument();
    });
  });

  describe('Back to Edit Button', () => {
    it('should display back to edit button when onBackToEdit is provided', () => {
      const onBackToEdit = vi.fn();
      renderCompletePage({ onBackToEdit });
      
      // The button has aria-label="返回编辑" but visible text "返回继续编辑"
      expect(screen.getByRole('button', { name: /返回编辑/ })).toBeInTheDocument();
      expect(screen.getByText(/返回继续编辑/)).toBeInTheDocument();
    });

    it('should call onBackToEdit when back button is clicked', () => {
      const onBackToEdit = vi.fn();
      renderCompletePage({ onBackToEdit });
      
      const backButton = screen.getByRole('button', { name: /返回编辑/ });
      fireEvent.click(backButton);
      
      expect(onBackToEdit).toHaveBeenCalledTimes(1);
    });

    it('should not display back button when onBackToEdit is not provided', () => {
      renderCompletePage();
      
      expect(screen.queryByRole('button', { name: /返回编辑/ })).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      renderCompletePage();
      
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
      
      // Main title should be h1
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('should have proper ARIA labels on buttons', () => {
      renderCompletePage();
      
      expect(screen.getByRole('button', { name: /预览清单/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /导出数据/ })).toBeInTheDocument();
    });

    it('should have aria-expanded on export dropdown', () => {
      renderCompletePage();
      
      const exportButton = screen.getByRole('button', { name: /导出数据/ });
      expect(exportButton).toHaveAttribute('aria-expanded', 'false');
      
      fireEvent.click(exportButton);
      expect(exportButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have aria-haspopup on export dropdown', () => {
      renderCompletePage();
      
      const exportButton = screen.getByRole('button', { name: /导出数据/ });
      expect(exportButton).toHaveAttribute('aria-haspopup', 'menu');
    });

    it('should have proper region labels', () => {
      renderCompletePage();
      
      expect(screen.getByRole('region', { name: /完成摘要/ })).toBeInTheDocument();
    });

    it('should have proper alert role for reminder section', () => {
      renderCompletePage();
      
      const alerts = screen.getAllByRole('alert');
      expect(alerts.length).toBeGreaterThan(0);
    });

    it('should have proper group role for action buttons', () => {
      renderCompletePage();
      
      expect(screen.getByRole('group', { name: /操作按钮/ })).toBeInTheDocument();
    });

    it('should have proper progressbar accessibility attributes', () => {
      renderCompletePage();
      
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label');
      expect(progressBar).toHaveAttribute('aria-valuenow');
      expect(progressBar).toHaveAttribute('aria-valuemin');
      expect(progressBar).toHaveAttribute('aria-valuemax');
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      renderCompletePage({ className: 'custom-complete-class' });
      
      expect(screen.getByTestId('complete-page')).toHaveClass('custom-complete-class');
    });
  });

  describe('Export Menu Behavior', () => {
    it('should toggle export menu visibility', () => {
      renderCompletePage();
      
      const exportButton = screen.getByRole('button', { name: /导出数据/ });
      
      // Open menu
      fireEvent.click(exportButton);
      expect(screen.getByRole('menu')).toBeInTheDocument();
      
      // Close menu by clicking again
      fireEvent.click(exportButton);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('should rotate chevron icon when menu is open', () => {
      renderCompletePage();
      
      const exportButton = screen.getByRole('button', { name: /导出数据/ });
      const chevron = exportButton.querySelector('svg:last-child');
      
      // Initially not rotated
      expect(chevron).not.toHaveClass('rotate-180');
      
      // After click, should be rotated
      fireEvent.click(exportButton);
      expect(chevron).toHaveClass('rotate-180');
    });
  });

  describe('Progress Display', () => {
    it('should display correct progress for partial completion', () => {
      const partialProgress: ProgressState = {
        ...sampleProgressState,
        overall: 75,
      };
      
      renderCompletePage({}, sampleChecklistData, partialProgress);
      
      expect(screen.getByText('75%')).toBeInTheDocument();
      
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
    });

    it('should display correct progress for zero completion', () => {
      const zeroProgress: ProgressState = {
        ...sampleProgressState,
        overall: 0,
      };
      
      renderCompletePage({}, sampleChecklistData, zeroProgress);
      
      expect(screen.getByText('0%')).toBeInTheDocument();
      
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    });
  });

  describe('Visual Design', () => {
    it('should have gradient background', () => {
      renderCompletePage();
      
      const page = screen.getByTestId('complete-page');
      expect(page).toHaveClass('bg-gradient-to-br');
    });

    it('should have celebratory animation on trophy', () => {
      renderCompletePage();
      
      const trophyContainer = screen.getByTestId('complete-page').querySelector('.animate-bounce');
      expect(trophyContainer).toBeInTheDocument();
    });
  });
});
