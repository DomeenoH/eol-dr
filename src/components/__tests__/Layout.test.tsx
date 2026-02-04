import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Layout } from '../Layout';

describe('Layout', () => {
  describe('Basic Rendering', () => {
    it('renders children content', () => {
      render(
        <Layout>
          <div data-testid="main-content">Main Content</div>
        </Layout>
      );

      expect(screen.getByTestId('main-content')).toBeInTheDocument();
      expect(screen.getByText('Main Content')).toBeInTheDocument();
    });

    it('renders default header when no header prop provided', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      expect(screen.getByText('EOL Checklist')).toBeInTheDocument();
    });

    it('renders custom header when provided', () => {
      render(
        <Layout header={<div data-testid="custom-header">Custom Header</div>}>
          <div>Content</div>
        </Layout>
      );

      expect(screen.getByTestId('custom-header')).toBeInTheDocument();
      expect(screen.getByText('Custom Header')).toBeInTheDocument();
    });

    it('renders footer when provided', () => {
      render(
        <Layout footer={<div data-testid="footer">Footer Content</div>}>
          <div>Content</div>
        </Layout>
      );

      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByText('Footer Content')).toBeInTheDocument();
    });

    it('does not render footer when not provided', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
    });

    it('applies custom className to container', () => {
      const { container } = render(
        <Layout className="custom-class">
          <div>Content</div>
        </Layout>
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Sidebar', () => {
    it('renders sidebar when provided', () => {
      render(
        <Layout sidebar={<nav data-testid="sidebar-nav">Navigation</nav>}>
          <div>Content</div>
        </Layout>
      );

      expect(screen.getByTestId('sidebar-nav')).toBeInTheDocument();
      expect(screen.getByText('Navigation')).toBeInTheDocument();
    });

    it('does not render sidebar when showSidebar is false', () => {
      render(
        <Layout sidebar={<nav data-testid="sidebar-nav">Navigation</nav>} showSidebar={false}>
          <div>Content</div>
        </Layout>
      );

      expect(screen.queryByTestId('sidebar-nav')).not.toBeInTheDocument();
    });

    it('does not render sidebar when no sidebar content provided', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      expect(screen.queryByLabelText('侧边导航')).not.toBeInTheDocument();
    });

    it('sidebar has proper aria-label for accessibility', () => {
      render(
        <Layout sidebar={<nav>Navigation</nav>}>
          <div>Content</div>
        </Layout>
      );

      expect(screen.getByLabelText('侧边导航')).toBeInTheDocument();
    });
  });

  describe('Mobile Hamburger Menu', () => {
    it('renders hamburger menu button when sidebar is provided', () => {
      render(
        <Layout sidebar={<nav>Navigation</nav>}>
          <div>Content</div>
        </Layout>
      );

      const hamburgerButton = screen.getByLabelText('打开菜单');
      expect(hamburgerButton).toBeInTheDocument();
    });

    it('does not render hamburger menu button when no sidebar', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      expect(screen.queryByLabelText('打开菜单')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('关闭菜单')).not.toBeInTheDocument();
    });

    it('toggles mobile menu visibility when hamburger button clicked', () => {
      render(
        <Layout sidebar={<nav data-testid="sidebar">Navigation</nav>}>
          <div>Content</div>
        </Layout>
      );

      const hamburgerButton = screen.getByLabelText('打开菜单');
      
      // Initially sidebar should be hidden on mobile (translated off-screen)
      const sidebar = screen.getByLabelText('侧边导航');
      expect(sidebar).toHaveClass('-translate-x-full');

      // Click to open
      fireEvent.click(hamburgerButton);
      
      // After click, sidebar should be visible (translated to 0)
      expect(sidebar).toHaveClass('translate-x-0');
      
      // Button labels should change - there are two close buttons (header and sidebar)
      const closeButtons = screen.getAllByLabelText('关闭菜单');
      expect(closeButtons.length).toBeGreaterThanOrEqual(1);
    });

    it('closes mobile menu when clicking overlay', () => {
      render(
        <Layout sidebar={<nav>Navigation</nav>}>
          <div>Content</div>
        </Layout>
      );

      // Open the menu first
      fireEvent.click(screen.getByLabelText('打开菜单'));
      
      const sidebar = screen.getByLabelText('侧边导航');
      expect(sidebar).toHaveClass('translate-x-0');

      // Click the overlay (the dark background) - now uses opacity classes instead of bg-opacity
      const overlay = document.querySelector('.fixed.inset-0.bg-black.z-40');
      expect(overlay).toBeInTheDocument();
      fireEvent.click(overlay!);

      // Menu should be closed
      expect(sidebar).toHaveClass('-translate-x-full');
    });

    it('closes mobile menu when clicking close button inside sidebar', () => {
      render(
        <Layout sidebar={<nav>Navigation</nav>}>
          <div>Content</div>
        </Layout>
      );

      // Open the menu first
      fireEvent.click(screen.getByLabelText('打开菜单'));
      
      const sidebar = screen.getByLabelText('侧边导航');
      expect(sidebar).toHaveClass('translate-x-0');

      // Find and click the close button inside the sidebar (there are multiple close buttons)
      const closeButtons = screen.getAllByLabelText('关闭菜单');
      // The second one is inside the sidebar
      const sidebarCloseButton = closeButtons.find(btn => 
        btn.closest('[id="mobile-sidebar"]')
      );
      
      if (sidebarCloseButton) {
        fireEvent.click(sidebarCloseButton);
        expect(sidebar).toHaveClass('-translate-x-full');
      }
    });

    it('hamburger button has correct aria-expanded attribute', () => {
      render(
        <Layout sidebar={<nav>Navigation</nav>}>
          <div>Content</div>
        </Layout>
      );

      const hamburgerButton = screen.getByLabelText('打开菜单');
      expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(hamburgerButton);
      
      // After opening, the header button changes to close button with aria-expanded true
      // Get the header close button (the one with aria-controls)
      const headerCloseButton = screen.getByRole('button', { 
        name: '关闭菜单',
        expanded: true 
      });
      expect(headerCloseButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('hamburger button has aria-controls pointing to sidebar', () => {
      render(
        <Layout sidebar={<nav>Navigation</nav>}>
          <div>Content</div>
        </Layout>
      );

      const hamburgerButton = screen.getByLabelText('打开菜单');
      expect(hamburgerButton).toHaveAttribute('aria-controls', 'mobile-sidebar');
    });
  });

  describe('Desktop Sidebar Toggle', () => {
    it('renders desktop sidebar toggle button when sidebar is provided', () => {
      render(
        <Layout sidebar={<nav>Navigation</nav>}>
          <div>Content</div>
        </Layout>
      );

      const toggleButton = screen.getByLabelText('收起侧边栏');
      expect(toggleButton).toBeInTheDocument();
    });

    it('toggles sidebar collapsed state when desktop toggle clicked', () => {
      render(
        <Layout sidebar={<nav>Navigation</nav>}>
          <div>Content</div>
        </Layout>
      );

      const sidebar = screen.getByLabelText('侧边导航');
      
      // Initially expanded
      expect(sidebar).toHaveClass('md:w-64');
      
      const toggleButton = screen.getByLabelText('收起侧边栏');
      fireEvent.click(toggleButton);
      
      // After click, should be collapsed
      expect(sidebar).toHaveClass('md:w-16');
      
      // Button label should change
      expect(screen.getByLabelText('展开侧边栏')).toBeInTheDocument();
    });

    it('desktop toggle button has correct aria-expanded attribute', () => {
      render(
        <Layout sidebar={<nav>Navigation</nav>}>
          <div>Content</div>
        </Layout>
      );

      const toggleButton = screen.getByLabelText('收起侧边栏');
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

      fireEvent.click(toggleButton);
      
      const expandButton = screen.getByLabelText('展开侧边栏');
      expect(expandButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Responsive Design', () => {
    it('sidebar has responsive width classes', () => {
      render(
        <Layout sidebar={<nav>Navigation</nav>}>
          <div>Content</div>
        </Layout>
      );

      const sidebar = screen.getByLabelText('侧边导航');
      
      // Should have mobile width
      expect(sidebar).toHaveClass('w-72');
      // Should have max-width for mobile
      expect(sidebar).toHaveClass('max-w-[85vw]');
      // Should have desktop width
      expect(sidebar).toHaveClass('md:w-64');
      expect(sidebar).toHaveClass('lg:w-72');
    });

    it('header has responsive height', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      const header = document.querySelector('header > div');
      expect(header).toHaveClass('h-14');
      expect(header).toHaveClass('md:h-16');
    });

    it('main content has responsive padding', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      const contentWrapper = document.querySelector('main > div');
      expect(contentWrapper).toHaveClass('px-4');
      expect(contentWrapper).toHaveClass('sm:px-6');
      expect(contentWrapper).toHaveClass('lg:px-8');
    });

    it('hamburger button is hidden on desktop (md breakpoint)', () => {
      render(
        <Layout sidebar={<nav>Navigation</nav>}>
          <div>Content</div>
        </Layout>
      );

      const hamburgerButton = screen.getByLabelText('打开菜单');
      expect(hamburgerButton).toHaveClass('md:hidden');
    });

    it('desktop toggle button is hidden on mobile', () => {
      render(
        <Layout sidebar={<nav>Navigation</nav>}>
          <div>Content</div>
        </Layout>
      );

      const toggleButton = screen.getByLabelText('收起侧边栏');
      expect(toggleButton).toHaveClass('hidden');
      expect(toggleButton).toHaveClass('md:flex');
    });
  });

  describe('Accessibility', () => {
    it('header is a semantic header element', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      expect(document.querySelector('header')).toBeInTheDocument();
    });

    it('main content is a semantic main element', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      expect(document.querySelector('main')).toBeInTheDocument();
    });

    it('sidebar is a semantic aside element', () => {
      render(
        <Layout sidebar={<nav>Navigation</nav>}>
          <div>Content</div>
        </Layout>
      );

      expect(document.querySelector('aside')).toBeInTheDocument();
    });

    it('footer is a semantic footer element when provided', () => {
      render(
        <Layout footer={<div>Footer</div>}>
          <div>Content</div>
        </Layout>
      );

      expect(document.querySelector('footer')).toBeInTheDocument();
    });

    it('buttons have proper focus styles', () => {
      render(
        <Layout sidebar={<nav>Navigation</nav>}>
          <div>Content</div>
        </Layout>
      );

      const hamburgerButton = screen.getByLabelText('打开菜单');
      expect(hamburgerButton).toHaveClass('focus:outline-none');
      expect(hamburgerButton).toHaveClass('focus:ring-2');
      expect(hamburgerButton).toHaveClass('focus:ring-primary-500');
    });

    it('overlay has aria-hidden attribute', () => {
      render(
        <Layout sidebar={<nav>Navigation</nav>}>
          <div>Content</div>
        </Layout>
      );

      // Open the menu to show overlay
      fireEvent.click(screen.getByLabelText('打开菜单'));

      // Overlay now uses opacity classes instead of bg-opacity
      const overlay = document.querySelector('.fixed.inset-0.bg-black.z-40');
      expect(overlay).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Touch-Friendly UI', () => {
    it('buttons have adequate touch target size (min 44x44px)', () => {
      render(
        <Layout sidebar={<nav>Navigation</nav>}>
          <div>Content</div>
        </Layout>
      );

      const hamburgerButton = screen.getByLabelText('打开菜单');
      // Should have min-h-[44px] and min-w-[44px] classes for touch targets
      expect(hamburgerButton).toHaveClass('min-h-[44px]');
      expect(hamburgerButton).toHaveClass('min-w-[44px]');
    });

    it('sidebar close button has adequate touch target', () => {
      render(
        <Layout sidebar={<nav>Navigation</nav>}>
          <div>Content</div>
        </Layout>
      );

      // Open menu to access close button
      fireEvent.click(screen.getByLabelText('打开菜单'));

      const closeButtons = screen.getAllByLabelText('关闭菜单');
      closeButtons.forEach(button => {
        expect(button).toHaveClass('min-h-[44px]');
        expect(button).toHaveClass('min-w-[44px]');
      });
    });

    it('hamburger button has touch-manipulation class for better mobile response', () => {
      render(
        <Layout sidebar={<nav>Navigation</nav>}>
          <div>Content</div>
        </Layout>
      );

      const hamburgerButton = screen.getByLabelText('打开菜单');
      expect(hamburgerButton).toHaveClass('touch-manipulation');
    });

    it('desktop sidebar toggle has adequate touch target', () => {
      render(
        <Layout sidebar={<nav>Navigation</nav>}>
          <div>Content</div>
        </Layout>
      );

      const toggleButton = screen.getByLabelText('收起侧边栏');
      expect(toggleButton).toHaveClass('min-h-[44px]');
      expect(toggleButton).toHaveClass('min-w-[44px]');
    });
  });

  describe('Responsive Breakpoints', () => {
    it('sidebar has xl breakpoint width class', () => {
      render(
        <Layout sidebar={<nav>Navigation</nav>}>
          <div>Content</div>
        </Layout>
      );

      const sidebar = screen.getByLabelText('侧边导航');
      expect(sidebar).toHaveClass('xl:w-80');
    });

    it('main content has xl breakpoint padding', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      const contentWrapper = document.querySelector('main > div');
      expect(contentWrapper).toHaveClass('xl:px-10');
    });

    it('footer has responsive padding', () => {
      render(
        <Layout footer={<div>Footer</div>}>
          <div>Content</div>
        </Layout>
      );

      const footer = document.querySelector('footer');
      expect(footer).toHaveClass('sm:px-6');
      expect(footer).toHaveClass('lg:px-8');
    });
  });

  describe('Mobile Menu Behavior', () => {
    it('sidebar has shadow on mobile for visual separation', () => {
      render(
        <Layout sidebar={<nav>Navigation</nav>}>
          <div>Content</div>
        </Layout>
      );

      const sidebar = screen.getByLabelText('侧边导航');
      expect(sidebar).toHaveClass('shadow-lg');
      expect(sidebar).toHaveClass('md:shadow-none');
    });

    it('sidebar content has overscroll-contain for better mobile scrolling', () => {
      render(
        <Layout sidebar={<nav>Navigation</nav>}>
          <div>Content</div>
        </Layout>
      );

      // Open menu to see sidebar content
      fireEvent.click(screen.getByLabelText('打开菜单'));

      const sidebarContent = document.querySelector('#mobile-sidebar > div:last-child');
      expect(sidebarContent).toHaveClass('overscroll-contain');
    });

    it('mobile menu header has background color for visual distinction', () => {
      render(
        <Layout sidebar={<nav>Navigation</nav>}>
          <div>Content</div>
        </Layout>
      );

      // Open menu
      fireEvent.click(screen.getByLabelText('打开菜单'));

      const menuHeader = document.querySelector('#mobile-sidebar > div:first-child');
      expect(menuHeader).toHaveClass('bg-gray-50');
    });

    it('overlay has transition classes for smooth animation', () => {
      render(
        <Layout sidebar={<nav>Navigation</nav>}>
          <div>Content</div>
        </Layout>
      );

      // The overlay should exist but be invisible initially
      const overlay = document.querySelector('.fixed.inset-0.bg-black.z-40');
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveClass('transition-opacity');
      expect(overlay).toHaveClass('duration-300');
    });

    it('overlay becomes visible when menu is opened', () => {
      render(
        <Layout sidebar={<nav>Navigation</nav>}>
          <div>Content</div>
        </Layout>
      );

      const overlay = document.querySelector('.fixed.inset-0.bg-black.z-40');
      
      // Initially invisible
      expect(overlay).toHaveClass('opacity-0');
      expect(overlay).toHaveClass('pointer-events-none');

      // Open menu
      fireEvent.click(screen.getByLabelText('打开菜单'));

      // Should be visible
      expect(overlay).toHaveClass('opacity-50');
      expect(overlay).toHaveClass('pointer-events-auto');
    });
  });
});
