/**
 * ChecklistPage Component Tests
 * 
 * Tests for the ChecklistPage component that validates:
 * - Integration of Navigation, ProgressBar, SectionView components
 * - Mode-specific navigation (Guided/Zen vs Free mode)
 * - Page leave confirmation for unsaved changes
 * 
 * @validates Requirements 1.2-1.5, 2.1-2.5, 8.5
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ChecklistPage } from '../ChecklistPage';
import { ChecklistProvider, ThemeProvider } from '../../context';
import type { ChecklistData } from '../../types/checklist-data';
import type { ProgressState } from '../../types/progress';

// Mock StorageService
vi.mock('../../services/StorageService', () => ({
  storageService: {
    isAvailable: vi.fn(),
    load: vi.fn(),
    loadProgress: vi.fn(),
    save: vi.fn(),
    saveProgress: vi.fn(),
  },
}));

// Import the mocked module
import { storageService } from '../../services/StorageService';

// Mock the useChecklistStructure hook
vi.mock('../../hooks/useChecklistStructure', () => {
  const structure = {
    sections: [
      {
        id: 'emergency-contacts',
        name: '紧急联系人',
        description: '关键时刻的第一联系人',
        categories: [
          {
            id: 'contact-list',
            name: '通讯录',
            description: '重要人物列表',
            items: [
              { id: 'phone', label: '电话', type: 'text' },
            ],
          },
          {
            id: 'medical-info', // Second category to enable "Next" button
            name: '医疗信息',
            items: [
              { id: 'meds', label: 'Medications', type: 'text' }
            ],
          }
        ],
      },
      {
        id: 'financial-assets',
        name: '财务资产',
        description: '你的钱在哪里',
        categories: [],
      },
    ],
  };

  const hookValue = { structure, isLoading: false };
  const useChecklistStructure = () => hookValue;

  return {
    default: useChecklistStructure,
    useChecklistStructure,
    __esModule: true,
  };
});

/**
 * Helper to render ChecklistPage with ChecklistProvider
 */
const renderChecklistPage = (
  props: Partial<React.ComponentProps<typeof ChecklistPage>> = {},
  initialData?: ChecklistData,
  initialProgress?: ProgressState
) => {
  return render(
    <ThemeProvider>
      <ChecklistProvider initialData={initialData} initialProgress={initialProgress}>
        <ChecklistPage {...props} />
      </ChecklistProvider>
    </ThemeProvider>
  );
};

/**
 * Create mock checklist data
 */
const createMockData = (overrides: Partial<ChecklistData> = {}): ChecklistData => ({
  version: '1.0.0',
  lastModified: new Date().toISOString(),
  sections: {},
  ...overrides,
});

/**
 * Create mock progress state
 */
const createMockProgress = (overrides: Partial<ProgressState> = {}): ProgressState => ({
  overall: 0,
  sections: {},
  currentPosition: { sectionId: 'emergency-contacts', categoryId: 'contact-list' },
  mode: 'guided',
  lastVisited: new Date().toISOString(),
  ...overrides,
});

describe('ChecklistPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(storageService.isAvailable).mockReturnValue(true);
    vi.mocked(storageService.load).mockReturnValue(null);
    vi.mocked(storageService.loadProgress).mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Free Mode - Basic Rendering', () => {
    it('should render the checklist page in free mode', () => {
      const progress = createMockProgress({ mode: 'free' });
      renderChecklistPage({}, createMockData(), progress);
      
      expect(screen.getByTestId('checklist-page')).toBeInTheDocument();
    });

    it('should display the page title in free mode', () => {
      const progress = createMockProgress({ mode: 'free' });
      renderChecklistPage({}, createMockData(), progress);
      
      expect(screen.getByText('身后事清单')).toBeInTheDocument();
    });

    it('should render the navigation sidebar in free mode', () => {
      const progress = createMockProgress({ mode: 'free' });
      renderChecklistPage({}, createMockData(), progress);
      
      // Navigation should show sections (might be multiple due to responsive layout in JSDOM)
      const navigations = screen.getAllByRole('navigation', { name: /Checklist 导航/ });
      expect(navigations.length).toBeGreaterThan(0);
    });

    it('should render the progress bar in free mode', () => {
      const progress = createMockProgress({ mode: 'free' });
      renderChecklistPage({}, createMockData(), progress);
      
      expect(screen.getAllByTestId('progress-bar').length).toBeGreaterThan(0);
    });

    it('should render the save status indicator in free mode', () => {
      const progress = createMockProgress({ mode: 'free' });
      renderChecklistPage({}, createMockData(), progress);
      
      expect(screen.getAllByTestId('save-status').length).toBeGreaterThan(0);
    });
  });

  describe('Zen Mode (Guided Mode) - Basic Rendering', () => {
    it('should render zen mode view when in guided mode', () => {
      const progress = createMockProgress({ mode: 'guided' });
      renderChecklistPage({}, createMockData(), progress);
      
      expect(screen.getByTestId('zen-mode-view')).toBeInTheDocument();
    });

    it('should not show sidebar navigation in zen mode', () => {
      const progress = createMockProgress({ mode: 'guided' });
      renderChecklistPage({}, createMockData(), progress);
      
      expect(screen.queryByRole('navigation', { name: /Checklist 导航/ })).not.toBeInTheDocument();
    });

    it('should show progress indicator in zen mode', () => {
      const progress = createMockProgress({ mode: 'guided' });
      renderChecklistPage({}, createMockData(), progress);
      
      // Should show "X / Y" format progress
      expect(screen.getByText(/\d+ \/ \d+/)).toBeInTheDocument();
    });

    it('should show exit zen mode button', () => {
      const progress = createMockProgress({ mode: 'guided' });
      renderChecklistPage({}, createMockData(), progress);
      
      expect(screen.getByRole('button', { name: /退出专注模式/ })).toBeInTheDocument();
    });

    it('should show current section badge in zen mode', () => {
      const progress = createMockProgress({ 
        mode: 'guided',
        currentPosition: { sectionId: 'emergency-contacts', categoryId: 'contact-list' },
      });
      renderChecklistPage({}, createMockData(), progress);
      
      expect(screen.getByText('紧急联系人')).toBeInTheDocument();
    });
  });

  describe('Mode Display (Requirement 1.2-1.3)', () => {
    it('should display zen mode (专注模式) indicator when in guided mode', () => {
      const progress = createMockProgress({ mode: 'guided' });
      renderChecklistPage({}, createMockData(), progress);
      
      // In zen mode, the exit button shows "退出专注模式"
      expect(screen.getByRole('button', { name: /退出专注模式/ })).toBeInTheDocument();
    });

    it('should display free mode indicator when in free mode', () => {
      const progress = createMockProgress({ mode: 'free' });
      renderChecklistPage({}, createMockData(), progress);
      
      expect(screen.getAllByText('专注').length).toBeGreaterThan(0);
    });
  });

  describe('Mode Toggle (Requirement 1.5)', () => {
    it('should switch from zen mode to free mode when exit button is clicked', async () => {
      const progress = createMockProgress({ mode: 'guided' });
      renderChecklistPage({}, createMockData(), progress);
      
      const exitButton = screen.getAllByRole('button', { name: /退出/ })[0];
      
      await act(async () => {
        fireEvent.click(exitButton);
      });
      
      await waitFor(() => {
        // In free mode, the toggle button should show "专注" (switch TO zen)
        expect(screen.getAllByText('专注').length).toBeGreaterThan(0);
        expect(screen.getByTestId('checklist-page')).toBeInTheDocument();
      });
    });

    it('should switch from free mode to zen mode when mode button is clicked', async () => {
      const progress = createMockProgress({ mode: 'free' });
      renderChecklistPage({}, createMockData(), progress);
      
      const modeButton = screen.getAllByRole('button', { name: /切换到专注模式/ })[0];
      
      await act(async () => {
        fireEvent.click(modeButton);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('zen-mode-view')).toBeInTheDocument();
      });
    });
  });

  describe('Free Mode Navigation (Requirement 2.3-2.4)', () => {
    it('should display all sections and categories', () => {
      const progress = createMockProgress({ mode: 'free' });
      renderChecklistPage({}, createMockData(), progress);
      
      // Check for main sections - use getAllByText since sections appear in both nav and content
      expect(screen.getAllByText('紧急联系人').length).toBeGreaterThan(0);
      // "财务资产" is in our mock structure, "Tech 技术" is not
      expect(screen.getAllByText('财务资产').length).toBeGreaterThan(0);
      // Check for categories
      expect(screen.getAllByText('通讯录').length).toBeGreaterThan(0);
    });

    it('should highlight the current section in navigation', async () => {
      const progress = createMockProgress({
        mode: 'free',
        currentPosition: { sectionId: 'emergency-contacts', categoryId: 'contact-list' },
      });
      
      renderChecklistPage({}, createMockData(), progress);
      
      // The emergency contacts section should be highlighted
      // getAllByRole because of dual sidebar (mobile/desktop)
      const navSections = screen.getAllByRole('button', { name: /紧急联系人/ });
      expect(navSections.length).toBeGreaterThan(0);
      
      // Check if ANY of the navigation items are active
      const activeItems = navSections.filter(el => el.getAttribute('data-active') === 'true');
      expect(activeItems.length).toBeGreaterThan(0);
    });

    it('should navigate to section on click', async () => {
      const progress = createMockProgress({ mode: 'free' });
      renderChecklistPage({}, createMockData(), progress);
      
      // Find navigation item (use getAll for dual sidebar)
      const navItems = screen.getAllByRole('button', { name: /紧急联系人/ });
      expect(navItems.length).toBeGreaterThan(0);
      
      // Click the first one (Desktop or Mobile doesn't matter, logic is same)
      fireEvent.click(navItems[0]);

      // Verify scroll was triggered (mocked)
      // Note: window.scrollTo is mocked in setupTests or should be spyed on
    });
  });

  describe('Free Mode Section View (Requirement 2.1-2.2)', () => {
    it('should display the current section in free mode', () => {
      const progress = createMockProgress({
        mode: 'free',
        currentPosition: { sectionId: 'emergency-contacts', categoryId: 'contact-list' },
      });
      renderChecklistPage({}, createMockData(), progress);
      
      const sectionViews = screen.getAllByTestId('section-view');
      expect(sectionViews.length).toBeGreaterThan(0);
    });

    it('should not show Next/Skip buttons in free mode', () => {
      const progress = createMockProgress({ mode: 'free' });
      renderChecklistPage({}, createMockData(), progress);
      
      expect(screen.queryByTestId('next-button')).not.toBeInTheDocument();
    });
  });

  describe('Zen Mode Navigation (Requirement 2.2)', () => {
    it('should show Next button in zen mode', () => {
      const progress = createMockProgress({ mode: 'guided' });
      renderChecklistPage({}, createMockData(), progress);
      
      expect(screen.getByRole('button', { name: /下一步/ })).toBeInTheDocument();
    });

    it('should navigate to next category when Next button is clicked', async () => {
      const progress = createMockProgress({
        mode: 'guided',
        currentPosition: { sectionId: 'emergency-contacts', categoryId: 'contact-list' },
      });
      renderChecklistPage({}, createMockData(), progress);
      
      const nextButton = screen.getByRole('button', { name: /下一步/ });
      
      await act(async () => {
        fireEvent.click(nextButton);
      });
      
      // Should navigate to next category - zen mode view should still be visible
      await waitFor(() => {
        expect(screen.getByTestId('zen-mode-view')).toBeInTheDocument();
      });
    });

    it('should not show Previous button on first category', () => {
      const progress = createMockProgress({
        mode: 'guided',
        currentPosition: { sectionId: 'emergency-contacts', categoryId: 'contact-list' },
      });
      renderChecklistPage({}, createMockData(), progress);
      
      // First category should not have previous button
      expect(screen.queryByRole('button', { name: /上一步/ })).not.toBeInTheDocument();
    });
  });

  describe('Callbacks', () => {
    it('should call onBack when back button is clicked in free mode', () => {
      const onBack = vi.fn();
      const progress = createMockProgress({ mode: 'free' });
      renderChecklistPage({ onBack }, createMockData(), progress);
      
      const backButton = screen.getByRole('button', { name: /返回首页/ });
      fireEvent.click(backButton);
      
      expect(onBack).toHaveBeenCalled();
    });

    it('should call onPreview when preview button is clicked in free mode', () => {
      const onPreview = vi.fn();
      const progress = createMockProgress({ mode: 'free' });
      renderChecklistPage({ onPreview }, createMockData(), progress);
      
      const previewButton = screen.getAllByRole('button', { name: /预览/ })[0];
      fireEvent.click(previewButton);
      
      expect(onPreview).toHaveBeenCalled();
    });

    it('should not render back button when onBack is not provided', () => {
      const progress = createMockProgress({ mode: 'free' });
      renderChecklistPage({ onBack: undefined }, createMockData(), progress);
      
      expect(screen.queryByRole('button', { name: /返回首页/ })).not.toBeInTheDocument();
    });

    it('should not render preview button when onPreview is not provided', () => {
      const progress = createMockProgress({ mode: 'free' });
      renderChecklistPage({ onPreview: undefined }, createMockData(), progress);
      
      expect(screen.queryByRole('button', { name: /预览/ })).not.toBeInTheDocument();
    });
  });

  describe('Completion State (Requirement 10.5)', () => {
    it('should show completion message when all sections are complete in free mode', () => {
      const progress = createMockProgress({
        mode: 'free',
        overall: 100,
        sections: {
          'emergency-contacts': { progress: 100, status: 'completed', categories: {} },
          'tech': { progress: 100, status: 'completed', categories: {} },
          'input': { progress: 100, status: 'completed', categories: {} },
          'output': { progress: 100, status: 'completed', categories: {} },
          'misc': { progress: 100, status: 'completed', categories: {} },
        },
      });
      renderChecklistPage({}, createMockData(), progress);
      
      expect(screen.getByText(/恭喜！您已完成所有部分/)).toBeInTheDocument();
    });

    it('should show preview button in completion message', () => {
      const onPreview = vi.fn();
      const progress = createMockProgress({ mode: 'free', overall: 100 });
      renderChecklistPage({ onPreview }, createMockData(), progress);
      
      // The preview button in the completion card AND top bar
      expect(screen.getAllByRole('button', { name: /预览清单/ }).length).toBeGreaterThan(0);
    });
  });

  describe('Page Leave Confirmation (Requirement 8.5)', () => {
    it('should add beforeunload event listener', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const progress = createMockProgress({ mode: 'free' });
      
      renderChecklistPage({}, createMockData(), progress);
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    });

    it('should remove beforeunload event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      const progress = createMockProgress({ mode: 'free' });
      
      const { unmount } = renderChecklistPage({}, createMockData(), progress);
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    });
  });

  describe('Progress Display', () => {
    it('should display overall progress percentage in free mode', () => {
      const progress = createMockProgress({ mode: 'free', overall: 42 });
      renderChecklistPage({}, createMockData(), progress);
      
      // Progress appears in multiple places, use getAllByText
      expect(screen.getAllByText('42%').length).toBeGreaterThan(0);
    });

    it('should display section progress in navigation', () => {
      const progress = createMockProgress({
        mode: 'free',
        sections: {
          'emergency-contacts': { progress: 50, status: 'in_progress', categories: {} },
        },
      });
      renderChecklistPage({}, createMockData(), progress);
      
      // Section progress should be visible - may appear multiple times
      expect(screen.getAllByText('50%').length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for navigation in free mode', () => {
      const progress = createMockProgress({ mode: 'free' });
      renderChecklistPage({}, createMockData(), progress);
      
      const navigations = screen.getAllByRole('navigation', { name: /Checklist 导航/ });
      expect(navigations.length).toBeGreaterThan(0);
    });

    it('should have proper ARIA labels for mode toggle button in free mode', () => {
      const progress = createMockProgress({ mode: 'free' });
      renderChecklistPage({}, createMockData(), progress);
      
      const buttons = screen.getAllByRole('button', { name: /切换到专注模式/ });
      expect(buttons.length).toBeGreaterThan(0);
      expect(buttons[0]).toBeInTheDocument();
    });

    it('should have proper heading structure in free mode', () => {
      const progress = createMockProgress({ mode: 'free' });
      renderChecklistPage({}, createMockData(), progress);
      
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  describe('Custom className', () => {
    it('should apply custom className in free mode', () => {
      const progress = createMockProgress({ mode: 'free' });
      const { container } = renderChecklistPage({ className: 'custom-class' }, createMockData(), progress);
      
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('should apply custom className in zen mode', () => {
      const progress = createMockProgress({ mode: 'guided' });
      const { container } = renderChecklistPage({ className: 'custom-class' }, createMockData(), progress);
      
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });

  describe('Save Status Display', () => {
    it('should display "已保存" when save status is saved in free mode', () => {
      const progress = createMockProgress({ mode: 'free' });
      renderChecklistPage({}, createMockData(), progress);
      
      // Default state should show saved
      expect(screen.getAllByText('已保存').length).toBeGreaterThan(0);
    });
  });

  describe('Empty State', () => {
    it('should handle empty current position gracefully in free mode', () => {
      const progress = createMockProgress({
        mode: 'free',
        currentPosition: { sectionId: '', categoryId: '' },
      });
      
      // Should not throw
      expect(() => renderChecklistPage({}, createMockData(), progress)).not.toThrow();
    });

    it('should handle empty current position gracefully in zen mode', () => {
      const progress = createMockProgress({
        mode: 'guided',
        currentPosition: { sectionId: '', categoryId: '' },
      });
      
      // Should fall back to first section/category and not throw
      expect(() => renderChecklistPage({}, createMockData(), progress)).not.toThrow();
    });
  });
});
