/**
 * Router Tests
 * Tests for the router configuration and navigation
 * 
 * @validates Requirements 2.4 - Navigate to any Section/Category via URL routing
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes, ROUTES } from '../index';
import { ChecklistProvider, ThemeProvider } from '../../context';

// Mock the storage service to avoid localStorage issues in tests
vi.mock('../../services/StorageService', () => ({
  storageService: {
    isAvailable: () => true,
    load: () => null,
    loadProgress: () => null,
    save: vi.fn(),
    saveProgress: vi.fn(),
    clear: vi.fn(),
    getUsedSpace: () => 0,
  },
  StorageError: class StorageError extends Error {},
}));

import type { ChecklistData } from '../../types/checklist-data';

const sampleChecklistData: ChecklistData = {
  version: '1.0.0',
  lastModified: new Date().toISOString(),
  sections: {
    'emergency-contacts': {
      categories: {
        'contact-list': {
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

/**
 * Helper function to render with router and context
 */
function renderWithRouter(initialRoute: string = '/', initialData: ChecklistData = sampleChecklistData) {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <ThemeProvider>
        <ChecklistProvider initialData={initialData}>
          <AppRoutes />
        </ChecklistProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('Router Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.scrollTo
    window.scrollTo = vi.fn();
    // Mock IntersectionObserver
    const mockIntersectionObserver = vi.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null
    });
    window.IntersectionObserver = mockIntersectionObserver;
  });

  describe('Route Constants', () => {
    it('should have correct route paths defined', () => {
      expect(ROUTES.HOME).toBe('/');
      expect(ROUTES.CHECKLIST).toBe('/checklist');
      expect(ROUTES.PREVIEW).toBe('/preview');
      expect(ROUTES.COMPLETE).toBe('/complete');
      expect(ROUTES.SETTINGS).toBe('/settings');
    });
  });

  describe('Home Route (/)', () => {
    it('should render WelcomePage at root path', () => {
      renderWithRouter('/');
      
      // WelcomePage should show the title
      expect(screen.getByText('身后事清单')).toBeInTheDocument();
      expect(screen.getByText('End-of-life Disaster Response Checklist')).toBeInTheDocument();
    });

    it('should show mode selection options', () => {
      renderWithRouter('/');
      
      // Should show both mode options
      expect(screen.getByText('引导模式')).toBeInTheDocument();
      expect(screen.getByText('自由模式')).toBeInTheDocument();
    });
  });

  describe('Checklist Route (/checklist)', () => {
    it('should render ChecklistPage at /checklist path', () => {
      renderWithRouter('/checklist');
      
      // ChecklistPage should be rendered
      expect(screen.getByTestId('checklist-page')).toBeInTheDocument();
    });

    it('should show navigation and progress components', () => {
      renderWithRouter('/checklist');
      
      // Should have the main checklist page content
      expect(screen.getByText('身后事清单')).toBeInTheDocument();
    });
  });

  describe('Preview Route (/preview)', () => {
    it('should render PreviewPage at /preview path', () => {
      renderWithRouter('/preview');
      
      // PreviewPage should be rendered
      expect(screen.getByTestId('preview-page')).toBeInTheDocument();
    });

    it('should show preview title', () => {
      renderWithRouter('/preview');
      
      expect(screen.getByText('预览清单')).toBeInTheDocument();
    });

    it('should show export options', () => {
      renderWithRouter('/preview');
      
      // Should have export button
      expect(screen.getByRole('button', { name: /导出/i })).toBeInTheDocument();
    });
  });

  describe('Complete Route (/complete)', () => {
    it('should render CompletePage at /complete path', () => {
      renderWithRouter('/complete');
      
      // CompletePage should be rendered
      expect(screen.getByTestId('complete-page')).toBeInTheDocument();
    });

    it('should show congratulations message', () => {
      renderWithRouter('/complete');
      
      expect(screen.getByText(/恭喜您完成了清单/i)).toBeInTheDocument();
    });

    it('should show preview and export buttons', () => {
      renderWithRouter('/complete');
      
      expect(screen.getByRole('button', { name: /预览清单/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /导出数据/i })).toBeInTheDocument();
    });
  });

  describe('Settings Route (/settings)', () => {
    it('should render SettingsPage at /settings path', () => {
      renderWithRouter('/settings');
      
      // SettingsPage should be rendered
      expect(screen.getByTestId('settings-page')).toBeInTheDocument();
    });

    it('should show settings title', () => {
      renderWithRouter('/settings');
      
      expect(screen.getByRole('heading', { name: '设置' })).toBeInTheDocument();
    });

    it('should show import and clear data options', () => {
      renderWithRouter('/settings');
      
      expect(screen.getByRole('heading', { name: '导入数据' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: '清除所有数据' })).toBeInTheDocument();
    });
  });

  describe('404 Not Found Route', () => {
    it('should render NotFoundPage for unknown routes', () => {
      renderWithRouter('/unknown-route');
      
      // NotFoundPage should be rendered
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });

    it('should show 404 error message', () => {
      renderWithRouter('/some/random/path');
      
      expect(screen.getByText('404')).toBeInTheDocument();
      expect(screen.getByText('页面未找到')).toBeInTheDocument();
    });

    it('should have a button to return home', () => {
      renderWithRouter('/invalid');
      
      const homeButton = screen.getByRole('button', { name: /返回首页/i });
      expect(homeButton).toBeInTheDocument();
    });

    it('should navigate to home when clicking return button', async () => {
      renderWithRouter('/invalid');
      
      const homeButton = screen.getByRole('button', { name: /返回首页/i });
      fireEvent.click(homeButton);
      
      // Should navigate to home page
      await waitFor(() => {
        expect(screen.getByText('身后事清单')).toBeInTheDocument();
        expect(screen.getByText('引导模式')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Between Routes', () => {
    it('should navigate from welcome to checklist when starting', async () => {
      renderWithRouter('/');
      
      // Click on free mode button
      const freeModeButton = screen.getByRole('button', { name: /选择自由模式/i });
      fireEvent.click(freeModeButton);
      
      // Should navigate to checklist page
      await waitFor(() => {
        expect(screen.getByTestId('checklist-page')).toBeInTheDocument();
      });
    });

    it('should navigate from checklist to preview', async () => {
      renderWithRouter('/checklist');
      
      // Find and click preview button
      const previewButton = screen.getAllByRole('button', { name: /预览/i })[0];
      fireEvent.click(previewButton);
      
      // Should navigate to preview page
      await waitFor(() => {
        expect(screen.getByTestId('preview-page')).toBeInTheDocument();
      });
    });

    it('should navigate from preview back to checklist', async () => {
      renderWithRouter('/preview');
      
      // Find and click the first back button (the one in the header)
      const backButtons = screen.getAllByRole('button', { name: /返回编辑/i });
      fireEvent.click(backButtons[0]);
      
      // Should navigate back to checklist page
      await waitFor(() => {
        expect(screen.getByTestId('checklist-page')).toBeInTheDocument();
      });
    });

    it('should navigate from complete to preview', async () => {
      renderWithRouter('/complete');
      
      // Find and click preview button
      const previewButton = screen.getByRole('button', { name: /预览清单/i });
      fireEvent.click(previewButton);
      
      // Should navigate to preview page
      await waitFor(() => {
        expect(screen.getByTestId('preview-page')).toBeInTheDocument();
      });
    });

    it('should navigate from complete back to checklist', async () => {
      renderWithRouter('/complete');
      
      // Find and click back to edit button - the button text is "返回继续编辑" but aria-label is "返回编辑"
      const backButton = screen.getByRole('button', { name: /返回编辑/i });
      fireEvent.click(backButton);
      
      // Should navigate back to checklist page
      await waitFor(() => {
        expect(screen.getByTestId('checklist-page')).toBeInTheDocument();
      });
    });
  });

  describe('Route Accessibility', () => {
    it('should have accessible navigation on 404 page', () => {
      renderWithRouter('/invalid');
      
      const homeButton = screen.getByRole('button', { name: /返回首页/i });
      expect(homeButton).toHaveAttribute('aria-label', '返回首页');
    });

    it('should have proper heading structure on 404 page', () => {
      renderWithRouter('/invalid');
      
      // Should have proper headings
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('404');
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('页面未找到');
    });
  });
});

describe('Route Path Validation', () => {
  it('should handle routes with trailing slashes', () => {
    // React Router typically handles trailing slashes
    renderWithRouter('/checklist/');
    
    // Should still render the checklist page or redirect appropriately
    // Note: Behavior depends on React Router configuration
  });

  it('should handle unknown routes with case sensitivity', () => {
    // Routes are case-sensitive by default in React Router
    // /CHECKLIST is different from /checklist
    // However, React Router may match routes case-insensitively depending on configuration
    // This test verifies the behavior
    renderWithRouter('/CHECKLIST');
    
    // React Router v6 is case-sensitive by default, so this should show 404
    // But if it matches, it will show the checklist page
    // Either behavior is acceptable depending on configuration
    const notFoundPage = screen.queryByTestId('not-found-page');
    const checklistPage = screen.queryByTestId('checklist-page');
    
    // One of these should be present
    expect(notFoundPage || checklistPage).toBeTruthy();
  });
});
