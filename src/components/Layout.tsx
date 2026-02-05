import React, { useState, useCallback, useEffect } from 'react';
import { LanguageSwitcher } from './LanguageSwitcher';

export interface LayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  showSidebar?: boolean;
  className?: string;
}

const TOUCH_TARGET_SIZE = 'min-h-[44px] min-w-[44px]';

export const Layout: React.FC<LayoutProps> = ({
  children,
  sidebar,
  header,
  footer,
  showSidebar = true,
  className = '',
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const toggleSidebarCollapse = useCallback(() => {
    setIsSidebarCollapsed((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const hasSidebar = showSidebar && sidebar;
  const sidebarWidth = isSidebarCollapsed ? 0 : 280; // 280px = w-70

  return (
    <div className={`min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] ${className}`}>
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-[var(--bg-secondary)]/80 backdrop-blur-md border-b border-[var(--border-subtle)] z-30 h-14 shadow-sm">
        <div className="flex items-center justify-between px-4 h-full">
          {hasSidebar && (
            <button
              type="button"
              onClick={toggleMobileMenu}
              className={`md:hidden flex items-center justify-center ${TOUCH_TARGET_SIZE} -ml-2 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors`}
              aria-label={isMobileMenuOpen ? '关闭菜单' : '打开菜单'}
            >
              {isMobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <HamburgerIcon className="w-6 h-6" />}
            </button>
          )}



          <div className="flex-1 flex items-center justify-between">
            {header || <h1 className="text-lg font-semibold text-[var(--text-primary)] tracking-wide">EOL Checklist</h1>}
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      {hasSidebar && (
        <div
          className={`
            fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300
            ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
          `}
          onClick={closeMobileMenu}
        />
      )}

      {/* Fixed Sidebar - Desktop */}
      {hasSidebar && !isSidebarCollapsed && (
        <aside
          className="hidden md:flex fixed left-0 top-14 bottom-0 w-[280px] bg-[var(--bg-secondary)]/50 backdrop-blur-md border-r border-[var(--border-subtle)] flex-col z-20 group"
          style={{ height: 'calc(100vh - 56px)' }}
        >
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {sidebar}
          </div>
          {/* Collapse button on right edge */}
          <button
            type="button"
            onClick={toggleSidebarCollapse}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-r-lg shadow-lg hover:bg-[var(--bg-surface)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-30 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            aria-label="收起侧边栏"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
        </aside>
      )}

      {/* Collapsed Sidebar Expand Button - Desktop */}
      {hasSidebar && isSidebarCollapsed && (
        <button
          type="button"
          onClick={toggleSidebarCollapse}
          className="hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 w-6 h-12 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-r-lg shadow-lg hover:bg-[var(--bg-surface)] items-center justify-center z-20 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          aria-label="展开侧边栏"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      )}

      {/* Mobile Sidebar */}
      {hasSidebar && (
        <aside
          className={`
            md:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw]
            bg-[var(--bg-secondary)] border-r border-[var(--border-subtle)] flex flex-col shadow-2xl
            transform transition-transform duration-300
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/50 backdrop-blur-md">
            <span className="font-medium text-[var(--text-primary)]">导航菜单</span>
            <button
              type="button"
              onClick={closeMobileMenu}
              className={`flex items-center justify-center ${TOUCH_TARGET_SIZE} -mr-2 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors`}
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {sidebar}
          </div>
        </aside>
      )}

      {/* Main content area */}
      <main
        className="pt-14 min-h-screen transition-all duration-300"
        style={{ marginLeft: hasSidebar && !isSidebarCollapsed ? `${sidebarWidth}px` : 0 }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          {children}
        </div>
      </main>

      {/* Footer */}
      {footer && (
        <footer
          className="bg-[var(--bg-secondary)]/80 backdrop-blur-md border-t border-[var(--border-subtle)] px-4 py-3 transition-all duration-300"
          style={{ marginLeft: hasSidebar && !isSidebarCollapsed ? `${sidebarWidth}px` : 0 }}
        >
          {footer}
        </footer>
      )}
    </div>
  );
};

const HamburgerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export default Layout;
