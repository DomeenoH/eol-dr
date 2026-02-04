/**
 * WelcomePage Component Tests
 * 
 * Tests for the WelcomePage component that validates:
 * - Welcome message display
 * - Guided Mode and Free Mode selection
 * - Detection of saved data and "Continue from last session" option
 * 
 * @validates Requirements 1.1, 3.3
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WelcomePage } from '../WelcomePage';
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

// Import the mocked module
import { storageService } from '../../services/StorageService';

/**
 * Helper to render WelcomePage with ChecklistProvider
 */
const renderWelcomePage = (props: Partial<React.ComponentProps<typeof WelcomePage>> = {}) => {
  return render(
    <ChecklistProvider>
      <WelcomePage {...props} />
    </ChecklistProvider>
  );
};

describe('WelcomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementations
    vi.mocked(storageService.isAvailable).mockReturnValue(true);
    vi.mocked(storageService.load).mockReturnValue(null);
    vi.mocked(storageService.loadProgress).mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Welcome Message Display', () => {
    it('should display the welcome title', () => {
      renderWelcomePage();
      
      expect(screen.getByText('身后事清单')).toBeInTheDocument();
      expect(screen.getByText('End-of-life Disaster Response Checklist')).toBeInTheDocument();
    });

    it('should display the welcome description', () => {
      renderWelcomePage();
      
      expect(screen.getByText(/为您的家人准备一份完整的信息清单/)).toBeInTheDocument();
    });

    it('should display the data security notice', () => {
      renderWelcomePage();
      
      expect(screen.getByText(/您的数据仅保存在本地浏览器中/)).toBeInTheDocument();
    });

    it('should display feature items', () => {
      renderWelcomePage();
      
      expect(screen.getByText('自动保存')).toBeInTheDocument();
      expect(screen.getByText('多格式导出')).toBeInTheDocument();
      expect(screen.getByText('预览打印')).toBeInTheDocument();
      expect(screen.getByText('隐私保护')).toBeInTheDocument();
    });
  });

  describe('Mode Selection', () => {
    it('should display Guided Mode option', () => {
      renderWelcomePage();
      
      expect(screen.getByText('引导模式')).toBeInTheDocument();
      expect(screen.getByText('Guided Mode')).toBeInTheDocument();
      expect(screen.getByText(/按照预设顺序逐步引导/)).toBeInTheDocument();
    });

    it('should display Free Mode option', () => {
      renderWelcomePage();
      
      expect(screen.getByText('自由模式')).toBeInTheDocument();
      expect(screen.getByText('Free Mode')).toBeInTheDocument();
      expect(screen.getByText(/自由选择想要填写的部分/)).toBeInTheDocument();
    });

    it('should display Guided Mode features', () => {
      renderWelcomePage();
      
      expect(screen.getByText('按顺序逐步引导')).toBeInTheDocument();
      expect(screen.getByText('可随时跳过当前部分')).toBeInTheDocument();
      expect(screen.getByText('清晰的进度追踪')).toBeInTheDocument();
    });

    it('should display Free Mode features', () => {
      renderWelcomePage();
      
      expect(screen.getByText('自由选择填写顺序')).toBeInTheDocument();
      expect(screen.getByText('快速定位特定部分')).toBeInTheDocument();
      expect(screen.getByText('灵活的导航体验')).toBeInTheDocument();
    });

    it('should call onStart with "guided" when Guided Mode is selected', () => {
      const onStart = vi.fn();
      renderWelcomePage({ onStart });
      
      const guidedButton = screen.getByRole('button', { name: /选择引导模式/ });
      fireEvent.click(guidedButton);
      
      expect(onStart).toHaveBeenCalledWith('guided', false);
    });

    it('should call onStart with "free" when Free Mode is selected', () => {
      const onStart = vi.fn();
      renderWelcomePage({ onStart });
      
      const freeButton = screen.getByRole('button', { name: /选择自由模式/ });
      fireEvent.click(freeButton);
      
      expect(onStart).toHaveBeenCalledWith('free', false);
    });

    it('should show "推荐" badge on Guided Mode when no saved data', () => {
      renderWelcomePage();
      
      expect(screen.getByText('推荐')).toBeInTheDocument();
    });
  });

  describe('Saved Data Detection (Requirement 3.3)', () => {
    it('should not show continue option when no saved data exists', () => {
      vi.mocked(storageService.load).mockReturnValue(null);
      vi.mocked(storageService.loadProgress).mockReturnValue(null);
      
      renderWelcomePage();
      
      expect(screen.queryByText('继续上次填写')).not.toBeInTheDocument();
    });

    it('should show continue option when saved data exists', async () => {
      const savedData: ChecklistData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        sections: {
          'emergency-contacts': {
            categories: {
              contacts: {
                items: { name: 'Test Contact' },
              },
            },
          },
        },
      };
      
      const savedProgress: ProgressState = {
        overall: 25,
        sections: {},
        currentPosition: { sectionId: 'emergency-contacts', categoryId: 'contacts' },
        mode: 'guided',
        lastVisited: new Date().toISOString(),
      };
      
      vi.mocked(storageService.load).mockReturnValue(savedData);
      vi.mocked(storageService.loadProgress).mockReturnValue(savedProgress);
      
      renderWelcomePage();
      
      await waitFor(() => {
        expect(screen.getByText('继续上次填写')).toBeInTheDocument();
      });
    });

    it('should display progress percentage when saved data exists', async () => {
      const savedData: ChecklistData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        sections: {
          'emergency-contacts': {
            categories: {
              contacts: {
                items: { name: 'Test Contact' },
              },
            },
          },
        },
      };
      
      const savedProgress: ProgressState = {
        overall: 42,
        sections: {},
        currentPosition: { sectionId: 'emergency-contacts', categoryId: 'contacts' },
        mode: 'guided',
        lastVisited: new Date().toISOString(),
      };
      
      vi.mocked(storageService.load).mockReturnValue(savedData);
      vi.mocked(storageService.loadProgress).mockReturnValue(savedProgress);
      
      renderWelcomePage();
      
      await waitFor(() => {
        expect(screen.getByText(/已完成 42%/)).toBeInTheDocument();
      });
    });

    it('should display "今天" for last visited today', async () => {
      const savedData: ChecklistData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        sections: { test: { categories: {} } },
      };
      
      const savedProgress: ProgressState = {
        overall: 10,
        sections: {},
        currentPosition: { sectionId: 'test', categoryId: 'test' },
        mode: 'guided',
        lastVisited: new Date().toISOString(),
      };
      
      vi.mocked(storageService.load).mockReturnValue(savedData);
      vi.mocked(storageService.loadProgress).mockReturnValue(savedProgress);
      
      renderWelcomePage();
      
      await waitFor(() => {
        expect(screen.getByText(/上次访问: 今天/)).toBeInTheDocument();
      });
    });

    it('should display "昨天" for last visited yesterday', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const savedData: ChecklistData = {
        version: '1.0.0',
        lastModified: yesterday.toISOString(),
        sections: { test: { categories: {} } },
      };
      
      const savedProgress: ProgressState = {
        overall: 10,
        sections: {},
        currentPosition: { sectionId: 'test', categoryId: 'test' },
        mode: 'guided',
        lastVisited: yesterday.toISOString(),
      };
      
      vi.mocked(storageService.load).mockReturnValue(savedData);
      vi.mocked(storageService.loadProgress).mockReturnValue(savedProgress);
      
      renderWelcomePage();
      
      await waitFor(() => {
        expect(screen.getByText(/上次访问: 昨天/)).toBeInTheDocument();
      });
    });

    it('should call onStart with continueFromLast=true when continue button is clicked', async () => {
      const onStart = vi.fn();
      
      const savedData: ChecklistData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        sections: { test: { categories: {} } },
      };
      
      const savedProgress: ProgressState = {
        overall: 25,
        sections: {},
        currentPosition: { sectionId: 'test', categoryId: 'test' },
        mode: 'guided',
        lastVisited: new Date().toISOString(),
      };
      
      vi.mocked(storageService.load).mockReturnValue(savedData);
      vi.mocked(storageService.loadProgress).mockReturnValue(savedProgress);
      
      renderWelcomePage({ onStart });
      
      await waitFor(() => {
        expect(screen.getByText('继续填写')).toBeInTheDocument();
      });
      
      const continueButton = screen.getByRole('button', { name: /继续上次填写/ });
      fireEvent.click(continueButton);
      
      expect(onStart).toHaveBeenCalledWith('guided', true);
    });

    it('should show "或者重新开始" when saved data exists', async () => {
      const savedData: ChecklistData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        sections: { test: { categories: {} } },
      };
      
      const savedProgress: ProgressState = {
        overall: 25,
        sections: {},
        currentPosition: { sectionId: 'test', categoryId: 'test' },
        mode: 'guided',
        lastVisited: new Date().toISOString(),
      };
      
      vi.mocked(storageService.load).mockReturnValue(savedData);
      vi.mocked(storageService.loadProgress).mockReturnValue(savedProgress);
      
      renderWelcomePage();
      
      await waitFor(() => {
        expect(screen.getByText('或者重新开始')).toBeInTheDocument();
      });
    });

    it('should show "选择填写模式" when no saved data', () => {
      renderWelcomePage();
      
      expect(screen.getByText('选择填写模式')).toBeInTheDocument();
    });
  });

  describe('Storage Unavailable', () => {
    it('should not show continue option when storage is unavailable', () => {
      vi.mocked(storageService.isAvailable).mockReturnValue(false);
      
      renderWelcomePage();
      
      expect(screen.queryByText('继续上次填写')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for mode selection buttons', () => {
      renderWelcomePage();
      
      expect(screen.getByRole('button', { name: /选择引导模式/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /选择自由模式/ })).toBeInTheDocument();
    });

    it('should have proper heading structure', () => {
      renderWelcomePage();
      
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should have proper region labels', () => {
      renderWelcomePage();
      
      expect(screen.getByRole('article', { name: /引导模式/ })).toBeInTheDocument();
      expect(screen.getByRole('article', { name: /自由模式/ })).toBeInTheDocument();
    });

    it('should have progress bar with proper ARIA attributes when saved data exists', async () => {
      const savedData: ChecklistData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        sections: { test: { categories: {} } },
      };
      
      const savedProgress: ProgressState = {
        overall: 50,
        sections: {},
        currentPosition: { sectionId: 'test', categoryId: 'test' },
        mode: 'guided',
        lastVisited: new Date().toISOString(),
      };
      
      vi.mocked(storageService.load).mockReturnValue(savedData);
      vi.mocked(storageService.loadProgress).mockReturnValue(savedProgress);
      
      renderWelcomePage();
      
      await waitFor(() => {
        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toHaveAttribute('aria-valuenow', '50');
        expect(progressBar).toHaveAttribute('aria-valuemin', '0');
        expect(progressBar).toHaveAttribute('aria-valuemax', '100');
      });
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      const { container } = renderWelcomePage({ className: 'custom-class' });
      
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Error Handling', () => {
    it('should handle storage errors gracefully', () => {
      vi.mocked(storageService.load).mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      // Should not throw and should render without continue option
      expect(() => renderWelcomePage()).not.toThrow();
      expect(screen.queryByText('继续上次填写')).not.toBeInTheDocument();
    });

    it('should handle invalid date gracefully', async () => {
      const savedData: ChecklistData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        sections: { test: { categories: {} } },
      };
      
      const savedProgress: ProgressState = {
        overall: 25,
        sections: {},
        currentPosition: { sectionId: 'test', categoryId: 'test' },
        mode: 'guided',
        lastVisited: 'invalid-date',
      };
      
      vi.mocked(storageService.load).mockReturnValue(savedData);
      vi.mocked(storageService.loadProgress).mockReturnValue(savedProgress);
      
      // Should not throw
      expect(() => renderWelcomePage()).not.toThrow();
    });
  });
});
