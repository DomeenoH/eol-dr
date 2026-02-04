/**
 * Property-Based Tests for Responsive Layout
 * 
 * **Validates: Requirements 7.1**
 * 
 * Property 8: Responsive Layout
 * - For any viewport width between 320px and 2560px, the application should:
 *   - Render without errors
 *   - Have appropriate responsive classes applied
 *   - Touch targets should be at least 44x44px
 *   - Mobile menu should be available on small screens (< 768px)
 *   - Desktop sidebar should be available on large screens (>= 768px)
 * 
 * Requirements:
 * - 7.1: THE Checklist_App SHALL 在 320px 至 2560px 宽度范围内正常显示和使用
 * - 7.2: WHEN 在移动设备上访问 THEN THE Checklist_App SHALL 使用适合触摸操作的 UI 元素
 * - 7.3: WHEN 屏幕宽度小于 768px THEN THE Checklist_App SHALL 将侧边导航转换为可折叠的汉堡菜单
 * - 7.4: THE Checklist_App SHALL 在不同屏幕尺寸下保持一致的功能可用性
 */

import { describe, it, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import { Layout } from '../Layout';

// ============================================================================
// Constants
// ============================================================================

/**
 * Viewport width boundaries as defined in Requirements 7.1
 */
const MIN_VIEWPORT_WIDTH = 320;
const MAX_VIEWPORT_WIDTH = 2560;

/**
 * Mobile breakpoint (md in Tailwind) as defined in Requirements 7.3
 */
const MOBILE_BREAKPOINT = 768;

/**
 * Minimum touch target size in pixels (WCAG guidelines)
 * @validates Requirements 7.2
 */
const MIN_TOUCH_TARGET_SIZE = 44;


// ============================================================================
// Test Utilities
// ============================================================================

/**
 * Simulates setting the viewport width for testing responsive behavior.
 * Note: In JSDOM, we can't actually change the viewport, but we can test
 * that the correct CSS classes are applied for responsive behavior.
 */
function getResponsiveClassesForWidth(width: number): {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  expectedSidebarBehavior: 'hamburger' | 'visible';
} {
  const isMobile = width < MOBILE_BREAKPOINT;
  const isTablet = width >= MOBILE_BREAKPOINT && width < 1024;
  const isDesktop = width >= 1024;
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    expectedSidebarBehavior: isMobile ? 'hamburger' : 'visible',
  };
}

/**
 * Checks if an element has the minimum touch target size classes
 */
function hasTouchTargetClasses(element: HTMLElement): boolean {
  const classList = element.className;
  return classList.includes('min-h-[44px]') && classList.includes('min-w-[44px]');
}

/**
 * Extracts numeric value from a Tailwind class like 'min-h-[44px]'
 */
function extractPixelValue(className: string, pattern: RegExp): number | null {
  const match = className.match(pattern);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return null;
}

// ============================================================================
// Arbitraries (Generators)
// ============================================================================

/**
 * Generate a valid viewport width between 320px and 2560px
 * @validates Requirements 7.1
 */
const viewportWidthArbitrary = fc.integer({
  min: MIN_VIEWPORT_WIDTH,
  max: MAX_VIEWPORT_WIDTH,
});

/**
 * Generate a mobile viewport width (< 768px)
 * @validates Requirements 7.3
 */
const mobileViewportWidthArbitrary = fc.integer({
  min: MIN_VIEWPORT_WIDTH,
  max: MOBILE_BREAKPOINT - 1,
});

/**
 * Generate a desktop viewport width (>= 768px)
 * @validates Requirements 7.3
 */
const desktopViewportWidthArbitrary = fc.integer({
  min: MOBILE_BREAKPOINT,
  max: MAX_VIEWPORT_WIDTH,
});

/**
 * Generate sidebar content for testing
 */
const sidebarContentArbitrary = fc.constantFrom(
  <nav data-testid="test-sidebar">Navigation Content</nav>,
  <div data-testid="test-sidebar">Sidebar Content</div>,
  <aside data-testid="test-sidebar">Aside Content</aside>,
);

/**
 * Generate main content for testing
 */
const mainContentArbitrary = fc.constantFrom(
  <div data-testid="test-main">Main Content</div>,
  <article data-testid="test-main">Article Content</article>,
  <section data-testid="test-main">Section Content</section>,
);


// ============================================================================
// Property Tests
// ============================================================================

describe('Property 8: Responsive Layout', () => {
  /**
   * **Validates: Requirements 7.1**
   */

  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Layout Renders Without Errors', () => {
    it('renders without errors for any viewport width between 320px and 2560px', () => {
      /**
       * **Validates: Requirements 7.1**
       * 
       * Property: For any viewport width in the supported range, the Layout
       * component should render without throwing errors.
       */
      fc.assert(
        fc.property(
          viewportWidthArbitrary,
          mainContentArbitrary,
          sidebarContentArbitrary,
          (viewportWidth, mainContent, sidebarContent) => {
            cleanup();
            
            // The viewport width is used to determine expected behavior
            const responsiveInfo = getResponsiveClassesForWidth(viewportWidth);
            
            // Render should not throw
            let renderError: Error | null = null;
            try {
              render(
                <Layout sidebar={sidebarContent}>
                  {mainContent}
                </Layout>
              );
            } catch (error) {
              renderError = error as Error;
            }
            
            if (renderError) {
              throw new Error(
                `Layout failed to render at viewport width ${viewportWidth}px.\n` +
                `Error: ${renderError.message}\n` +
                `Responsive info: ${JSON.stringify(responsiveInfo)}`
              );
            }
            
            // Verify main content is rendered
            const mainElement = screen.queryByTestId('test-main');
            if (!mainElement) {
              throw new Error(
                `Main content not found at viewport width ${viewportWidth}px`
              );
            }
            
            // Verify sidebar content is rendered (may be hidden on mobile)
            const sidebarElement = screen.queryByTestId('test-sidebar');
            if (!sidebarElement) {
              throw new Error(
                `Sidebar content not found at viewport width ${viewportWidth}px`
              );
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  describe('Responsive Classes Applied', () => {
    it('has appropriate responsive width classes on sidebar for any viewport', () => {
      /**
       * **Validates: Requirements 7.1**
       * 
       * Property: The sidebar should have responsive width classes that adapt
       * to different viewport sizes.
       */
      fc.assert(
        fc.property(
          viewportWidthArbitrary,
          sidebarContentArbitrary,
          (viewportWidth, sidebarContent) => {
            cleanup();
            
            render(
              <Layout sidebar={sidebarContent}>
                <div>Content</div>
              </Layout>
            );
            
            const sidebar = screen.getByLabelText('侧边导航');
            const classList = sidebar.className;
            
            // Sidebar should have mobile width class
            if (!classList.includes('w-72')) {
              throw new Error(
                `Sidebar missing mobile width class 'w-72' at viewport ${viewportWidth}px.\n` +
                `Classes: ${classList}`
              );
            }
            
            // Sidebar should have max-width for mobile
            if (!classList.includes('max-w-[85vw]')) {
              throw new Error(
                `Sidebar missing max-width class 'max-w-[85vw]' at viewport ${viewportWidth}px.\n` +
                `Classes: ${classList}`
              );
            }
            
            // Sidebar should have desktop width classes
            if (!classList.includes('md:w-64')) {
              throw new Error(
                `Sidebar missing desktop width class 'md:w-64' at viewport ${viewportWidth}px.\n` +
                `Classes: ${classList}`
              );
            }
            
            // Sidebar should have larger desktop width classes
            if (!classList.includes('lg:w-72')) {
              throw new Error(
                `Sidebar missing large desktop width class 'lg:w-72' at viewport ${viewportWidth}px.\n` +
                `Classes: ${classList}`
              );
            }
            
            if (!classList.includes('xl:w-80')) {
              throw new Error(
                `Sidebar missing XL desktop width class 'xl:w-80' at viewport ${viewportWidth}px.\n` +
                `Classes: ${classList}`
              );
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('main content has responsive padding classes for any viewport', () => {
      /**
       * **Validates: Requirements 7.1**
       * 
       * Property: The main content area should have responsive padding classes
       * that adapt to different viewport sizes.
       */
      fc.assert(
        fc.property(viewportWidthArbitrary, (viewportWidth) => {
          cleanup();
          
          render(
            <Layout>
              <div data-testid="content">Content</div>
            </Layout>
          );
          
          const contentWrapper = document.querySelector('main > div');
          if (!contentWrapper) {
            throw new Error(
              `Main content wrapper not found at viewport ${viewportWidth}px`
            );
          }
          
          const classList = contentWrapper.className;
          
          // Should have base padding
          if (!classList.includes('px-4')) {
            throw new Error(
              `Content missing base padding 'px-4' at viewport ${viewportWidth}px.\n` +
              `Classes: ${classList}`
            );
          }
          
          // Should have responsive padding
          if (!classList.includes('sm:px-6')) {
            throw new Error(
              `Content missing sm padding 'sm:px-6' at viewport ${viewportWidth}px.\n` +
              `Classes: ${classList}`
            );
          }
          
          if (!classList.includes('lg:px-8')) {
            throw new Error(
              `Content missing lg padding 'lg:px-8' at viewport ${viewportWidth}px.\n` +
              `Classes: ${classList}`
            );
          }
          
          if (!classList.includes('xl:px-10')) {
            throw new Error(
              `Content missing xl padding 'xl:px-10' at viewport ${viewportWidth}px.\n` +
              `Classes: ${classList}`
            );
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });


  describe('Touch Target Size', () => {
    it('hamburger menu button has minimum 44x44px touch target for any viewport', () => {
      /**
       * **Validates: Requirements 7.1, 7.2**
       * 
       * Property: The hamburger menu button should have at least 44x44px
       * touch target size for accessibility on touch devices.
       */
      fc.assert(
        fc.property(
          viewportWidthArbitrary,
          sidebarContentArbitrary,
          (viewportWidth, sidebarContent) => {
            cleanup();
            
            render(
              <Layout sidebar={sidebarContent}>
                <div>Content</div>
              </Layout>
            );
            
            const hamburgerButton = screen.getByLabelText('打开菜单');
            
            if (!hasTouchTargetClasses(hamburgerButton)) {
              throw new Error(
                `Hamburger button missing touch target classes at viewport ${viewportWidth}px.\n` +
                `Expected: min-h-[44px] min-w-[44px]\n` +
                `Classes: ${hamburgerButton.className}`
              );
            }
            
            // Verify the actual pixel values
            const minHeight = extractPixelValue(hamburgerButton.className, /min-h-\[(\d+)px\]/);
            const minWidth = extractPixelValue(hamburgerButton.className, /min-w-\[(\d+)px\]/);
            
            if (minHeight === null || minHeight < MIN_TOUCH_TARGET_SIZE) {
              throw new Error(
                `Hamburger button min-height (${minHeight}px) is less than required ${MIN_TOUCH_TARGET_SIZE}px ` +
                `at viewport ${viewportWidth}px`
              );
            }
            
            if (minWidth === null || minWidth < MIN_TOUCH_TARGET_SIZE) {
              throw new Error(
                `Hamburger button min-width (${minWidth}px) is less than required ${MIN_TOUCH_TARGET_SIZE}px ` +
                `at viewport ${viewportWidth}px`
              );
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('desktop sidebar toggle has minimum 44x44px touch target for any viewport', () => {
      /**
       * **Validates: Requirements 7.1, 7.2**
       * 
       * Property: The desktop sidebar toggle button should have at least 44x44px
       * touch target size for accessibility.
       */
      fc.assert(
        fc.property(
          viewportWidthArbitrary,
          sidebarContentArbitrary,
          (viewportWidth, sidebarContent) => {
            cleanup();
            
            render(
              <Layout sidebar={sidebarContent}>
                <div>Content</div>
              </Layout>
            );
            
            const toggleButton = screen.getByLabelText('收起侧边栏');
            
            if (!hasTouchTargetClasses(toggleButton)) {
              throw new Error(
                `Desktop toggle button missing touch target classes at viewport ${viewportWidth}px.\n` +
                `Expected: min-h-[44px] min-w-[44px]\n` +
                `Classes: ${toggleButton.className}`
              );
            }
            
            // Verify the actual pixel values
            const minHeight = extractPixelValue(toggleButton.className, /min-h-\[(\d+)px\]/);
            const minWidth = extractPixelValue(toggleButton.className, /min-w-\[(\d+)px\]/);
            
            if (minHeight === null || minHeight < MIN_TOUCH_TARGET_SIZE) {
              throw new Error(
                `Desktop toggle min-height (${minHeight}px) is less than required ${MIN_TOUCH_TARGET_SIZE}px ` +
                `at viewport ${viewportWidth}px`
              );
            }
            
            if (minWidth === null || minWidth < MIN_TOUCH_TARGET_SIZE) {
              throw new Error(
                `Desktop toggle min-width (${minWidth}px) is less than required ${MIN_TOUCH_TARGET_SIZE}px ` +
                `at viewport ${viewportWidth}px`
              );
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  describe('Mobile Menu Availability', () => {
    it('hamburger menu is available on mobile viewports (< 768px)', () => {
      /**
       * **Validates: Requirements 7.1, 7.3**
       * 
       * Property: For any viewport width less than 768px, the hamburger menu
       * button should be visible (not hidden by CSS classes).
       */
      fc.assert(
        fc.property(
          mobileViewportWidthArbitrary,
          sidebarContentArbitrary,
          (viewportWidth, sidebarContent) => {
            cleanup();
            
            render(
              <Layout sidebar={sidebarContent}>
                <div>Content</div>
              </Layout>
            );
            
            const hamburgerButton = screen.getByLabelText('打开菜单');
            const classList = hamburgerButton.className;
            
            // The hamburger button should have md:hidden class (hidden on desktop)
            // which means it's visible on mobile
            if (!classList.includes('md:hidden')) {
              throw new Error(
                `Hamburger button should have 'md:hidden' class to be visible on mobile ` +
                `at viewport ${viewportWidth}px.\n` +
                `Classes: ${classList}`
              );
            }
            
            // Verify the button is in the DOM and accessible
            if (!hamburgerButton.getAttribute('aria-label')) {
              throw new Error(
                `Hamburger button missing aria-label at viewport ${viewportWidth}px`
              );
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('sidebar is initially hidden on mobile viewports', () => {
      /**
       * **Validates: Requirements 7.3**
       * 
       * Property: For any mobile viewport width, the sidebar should be
       * initially hidden (translated off-screen).
       */
      fc.assert(
        fc.property(
          mobileViewportWidthArbitrary,
          sidebarContentArbitrary,
          (viewportWidth, sidebarContent) => {
            cleanup();
            
            render(
              <Layout sidebar={sidebarContent}>
                <div>Content</div>
              </Layout>
            );
            
            const sidebar = screen.getByLabelText('侧边导航');
            const classList = sidebar.className;
            
            // Sidebar should be translated off-screen initially on mobile
            if (!classList.includes('-translate-x-full')) {
              throw new Error(
                `Sidebar should be hidden (translated off-screen) initially on mobile ` +
                `at viewport ${viewportWidth}px.\n` +
                `Classes: ${classList}`
              );
            }
            
            // Sidebar should have transform transition for smooth animation
            if (!classList.includes('transform')) {
              throw new Error(
                `Sidebar should have 'transform' class for animation ` +
                `at viewport ${viewportWidth}px.\n` +
                `Classes: ${classList}`
              );
            }
            
            if (!classList.includes('transition-transform')) {
              throw new Error(
                `Sidebar should have 'transition-transform' class for smooth animation ` +
                `at viewport ${viewportWidth}px.\n` +
                `Classes: ${classList}`
              );
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  describe('Desktop Sidebar Availability', () => {
    it('sidebar is visible on desktop viewports (>= 768px)', () => {
      /**
       * **Validates: Requirements 7.1, 7.3**
       * 
       * Property: For any viewport width >= 768px, the sidebar should be
       * visible (translated to 0 position).
       */
      fc.assert(
        fc.property(
          desktopViewportWidthArbitrary,
          sidebarContentArbitrary,
          (viewportWidth, sidebarContent) => {
            cleanup();
            
            render(
              <Layout sidebar={sidebarContent}>
                <div>Content</div>
              </Layout>
            );
            
            const sidebar = screen.getByLabelText('侧边导航');
            const classList = sidebar.className;
            
            // Sidebar should have md:translate-x-0 to be visible on desktop
            if (!classList.includes('md:translate-x-0')) {
              throw new Error(
                `Sidebar should have 'md:translate-x-0' class to be visible on desktop ` +
                `at viewport ${viewportWidth}px.\n` +
                `Classes: ${classList}`
              );
            }
            
            // Sidebar should have md:relative positioning on desktop
            if (!classList.includes('md:relative')) {
              throw new Error(
                `Sidebar should have 'md:relative' class for desktop layout ` +
                `at viewport ${viewportWidth}px.\n` +
                `Classes: ${classList}`
              );
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('desktop sidebar toggle is available on desktop viewports', () => {
      /**
       * **Validates: Requirements 7.1, 7.4**
       * 
       * Property: For any desktop viewport width, the sidebar toggle button
       * should be available (visible on md and above).
       */
      fc.assert(
        fc.property(
          desktopViewportWidthArbitrary,
          sidebarContentArbitrary,
          (viewportWidth, sidebarContent) => {
            cleanup();
            
            render(
              <Layout sidebar={sidebarContent}>
                <div>Content</div>
              </Layout>
            );
            
            const toggleButton = screen.getByLabelText('收起侧边栏');
            const classList = toggleButton.className;
            
            // Toggle button should be hidden on mobile but visible on desktop
            if (!classList.includes('hidden')) {
              throw new Error(
                `Desktop toggle should have 'hidden' class (hidden on mobile) ` +
                `at viewport ${viewportWidth}px.\n` +
                `Classes: ${classList}`
              );
            }
            
            if (!classList.includes('md:flex')) {
              throw new Error(
                `Desktop toggle should have 'md:flex' class to be visible on desktop ` +
                `at viewport ${viewportWidth}px.\n` +
                `Classes: ${classList}`
              );
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  describe('Consistent Functionality Across Viewports', () => {
    it('header is always present for any viewport width', () => {
      /**
       * **Validates: Requirements 7.1, 7.4**
       * 
       * Property: For any viewport width, the header should always be present
       * and accessible.
       */
      fc.assert(
        fc.property(viewportWidthArbitrary, (viewportWidth) => {
          cleanup();
          
          render(
            <Layout>
              <div>Content</div>
            </Layout>
          );
          
          const header = document.querySelector('header');
          if (!header) {
            throw new Error(
              `Header element not found at viewport ${viewportWidth}px`
            );
          }
          
          // Header should be sticky
          if (!header.className.includes('sticky')) {
            throw new Error(
              `Header should be sticky at viewport ${viewportWidth}px.\n` +
              `Classes: ${header.className}`
            );
          }
          
          // Header should have responsive height
          const headerInner = header.querySelector('div');
          if (!headerInner) {
            throw new Error(
              `Header inner div not found at viewport ${viewportWidth}px`
            );
          }
          
          if (!headerInner.className.includes('h-14')) {
            throw new Error(
              `Header should have mobile height 'h-14' at viewport ${viewportWidth}px.\n` +
              `Classes: ${headerInner.className}`
            );
          }
          
          if (!headerInner.className.includes('md:h-16')) {
            throw new Error(
              `Header should have desktop height 'md:h-16' at viewport ${viewportWidth}px.\n` +
              `Classes: ${headerInner.className}`
            );
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('main content area is always present for any viewport width', () => {
      /**
       * **Validates: Requirements 7.1, 7.4**
       * 
       * Property: For any viewport width, the main content area should always
       * be present and accessible.
       */
      fc.assert(
        fc.property(viewportWidthArbitrary, (viewportWidth) => {
          cleanup();
          
          render(
            <Layout>
              <div data-testid="test-content">Test Content</div>
            </Layout>
          );
          
          const main = document.querySelector('main');
          if (!main) {
            throw new Error(
              `Main element not found at viewport ${viewportWidth}px`
            );
          }
          
          // Main should be scrollable
          if (!main.className.includes('overflow-y-auto')) {
            throw new Error(
              `Main should be scrollable at viewport ${viewportWidth}px.\n` +
              `Classes: ${main.className}`
            );
          }
          
          // Content should be rendered inside main
          const content = screen.getByTestId('test-content');
          if (!main.contains(content)) {
            throw new Error(
              `Content should be inside main element at viewport ${viewportWidth}px`
            );
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('layout has minimum height of screen for any viewport', () => {
      /**
       * **Validates: Requirements 7.1**
       * 
       * Property: For any viewport width, the layout should have minimum
       * height of the screen to prevent content from being cut off.
       */
      fc.assert(
        fc.property(viewportWidthArbitrary, (viewportWidth) => {
          cleanup();
          
          const { container } = render(
            <Layout>
              <div>Content</div>
            </Layout>
          );
          
          const layoutContainer = container.firstChild as HTMLElement;
          if (!layoutContainer) {
            throw new Error(
              `Layout container not found at viewport ${viewportWidth}px`
            );
          }
          
          if (!layoutContainer.className.includes('min-h-screen')) {
            throw new Error(
              `Layout should have 'min-h-screen' class at viewport ${viewportWidth}px.\n` +
              `Classes: ${layoutContainer.className}`
            );
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });


  describe('Accessibility Across Viewports', () => {
    it('interactive elements have proper ARIA attributes for any viewport', () => {
      /**
       * **Validates: Requirements 7.1, 7.4**
       * 
       * Property: For any viewport width, interactive elements should have
       * proper ARIA attributes for accessibility.
       */
      fc.assert(
        fc.property(
          viewportWidthArbitrary,
          sidebarContentArbitrary,
          (viewportWidth, sidebarContent) => {
            cleanup();
            
            render(
              <Layout sidebar={sidebarContent}>
                <div>Content</div>
              </Layout>
            );
            
            // Check hamburger button accessibility
            const hamburgerButton = screen.getByLabelText('打开菜单');
            
            if (!hamburgerButton.getAttribute('aria-expanded')) {
              throw new Error(
                `Hamburger button missing aria-expanded at viewport ${viewportWidth}px`
              );
            }
            
            if (!hamburgerButton.getAttribute('aria-controls')) {
              throw new Error(
                `Hamburger button missing aria-controls at viewport ${viewportWidth}px`
              );
            }
            
            // Check desktop toggle accessibility
            const toggleButton = screen.getByLabelText('收起侧边栏');
            
            if (!toggleButton.getAttribute('aria-expanded')) {
              throw new Error(
                `Desktop toggle missing aria-expanded at viewport ${viewportWidth}px`
              );
            }
            
            // Check sidebar accessibility
            const sidebar = screen.getByLabelText('侧边导航');
            if (!sidebar) {
              throw new Error(
                `Sidebar missing aria-label at viewport ${viewportWidth}px`
              );
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('buttons have focus styles for any viewport', () => {
      /**
       * **Validates: Requirements 7.1, 7.4**
       * 
       * Property: For any viewport width, buttons should have visible focus
       * styles for keyboard navigation.
       */
      fc.assert(
        fc.property(
          viewportWidthArbitrary,
          sidebarContentArbitrary,
          (viewportWidth, sidebarContent) => {
            cleanup();
            
            render(
              <Layout sidebar={sidebarContent}>
                <div>Content</div>
              </Layout>
            );
            
            const hamburgerButton = screen.getByLabelText('打开菜单');
            const classList = hamburgerButton.className;
            
            // Should have focus outline removal (custom focus styles)
            if (!classList.includes('focus:outline-none')) {
              throw new Error(
                `Hamburger button missing 'focus:outline-none' at viewport ${viewportWidth}px.\n` +
                `Classes: ${classList}`
              );
            }
            
            // Should have focus ring
            if (!classList.includes('focus:ring-2')) {
              throw new Error(
                `Hamburger button missing 'focus:ring-2' at viewport ${viewportWidth}px.\n` +
                `Classes: ${classList}`
              );
            }
            
            // Should have focus ring color
            if (!classList.includes('focus:ring-primary-500')) {
              throw new Error(
                `Hamburger button missing 'focus:ring-primary-500' at viewport ${viewportWidth}px.\n` +
                `Classes: ${classList}`
              );
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  describe('Edge Cases', () => {
    it('layout works at minimum supported viewport (320px)', () => {
      /**
       * **Validates: Requirements 7.1**
       * 
       * Property: The layout should work correctly at the minimum supported
       * viewport width of 320px.
       */
      fc.assert(
        fc.property(
          fc.constant(MIN_VIEWPORT_WIDTH),
          sidebarContentArbitrary,
          (viewportWidth, sidebarContent) => {
            cleanup();
            
            render(
              <Layout sidebar={sidebarContent}>
                <div data-testid="content">Content</div>
              </Layout>
            );
            
            // All essential elements should be present
            const content = screen.getByTestId('content');
            const sidebar = screen.getByLabelText('侧边导航');
            const hamburgerButton = screen.getByLabelText('打开菜单');
            
            if (!content || !sidebar || !hamburgerButton) {
              throw new Error(
                `Essential elements missing at minimum viewport ${viewportWidth}px`
              );
            }
            
            // Sidebar should have max-width constraint for small screens
            if (!sidebar.className.includes('max-w-[85vw]')) {
              throw new Error(
                `Sidebar should have max-width constraint at ${viewportWidth}px.\n` +
                `Classes: ${sidebar.className}`
              );
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('layout works at maximum supported viewport (2560px)', () => {
      /**
       * **Validates: Requirements 7.1**
       * 
       * Property: The layout should work correctly at the maximum supported
       * viewport width of 2560px.
       */
      fc.assert(
        fc.property(
          fc.constant(MAX_VIEWPORT_WIDTH),
          sidebarContentArbitrary,
          (viewportWidth, sidebarContent) => {
            cleanup();
            
            render(
              <Layout sidebar={sidebarContent}>
                <div data-testid="content">Content</div>
              </Layout>
            );
            
            // All essential elements should be present
            const content = screen.getByTestId('content');
            const sidebar = screen.getByLabelText('侧边导航');
            const toggleButton = screen.getByLabelText('收起侧边栏');
            
            if (!content || !sidebar || !toggleButton) {
              throw new Error(
                `Essential elements missing at maximum viewport ${viewportWidth}px`
              );
            }
            
            // Content should have max-width constraint for readability
            const contentWrapper = document.querySelector('main > div');
            if (!contentWrapper?.className.includes('max-w-7xl')) {
              throw new Error(
                `Content should have max-width constraint at ${viewportWidth}px.\n` +
                `Classes: ${contentWrapper?.className}`
              );
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('layout works at mobile breakpoint boundary (767px and 768px)', () => {
      /**
       * **Validates: Requirements 7.1, 7.3**
       * 
       * Property: The layout should work correctly at the mobile breakpoint
       * boundary (767px mobile, 768px desktop).
       */
      fc.assert(
        fc.property(
          fc.constantFrom(MOBILE_BREAKPOINT - 1, MOBILE_BREAKPOINT),
          sidebarContentArbitrary,
          (viewportWidth, sidebarContent) => {
            cleanup();
            
            render(
              <Layout sidebar={sidebarContent}>
                <div data-testid="content">Content</div>
              </Layout>
            );
            
            const responsiveInfo = getResponsiveClassesForWidth(viewportWidth);
            
            // All essential elements should be present
            const content = screen.getByTestId('content');
            const sidebar = screen.getByLabelText('侧边导航');
            
            if (!content || !sidebar) {
              throw new Error(
                `Essential elements missing at breakpoint ${viewportWidth}px`
              );
            }
            
            // Verify correct behavior based on viewport
            if (responsiveInfo.isMobile) {
              // Mobile: hamburger should be available
              const hamburgerButton = screen.getByLabelText('打开菜单');
              if (!hamburgerButton) {
                throw new Error(
                  `Hamburger button should be available at mobile viewport ${viewportWidth}px`
                );
              }
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
