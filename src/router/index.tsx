/**
 * Router Configuration
 * Configures all page routes for the EOL Checklist Webapp
 * 
 * Routes:
 * - `/` - WelcomePage (landing page)
 * - `/checklist` - ChecklistPage (main filling page)
 * - `/preview` - PreviewPage (preview content)
 * - `/complete` - CompletePage (completion page)
 * - `/settings` - SettingsPage (settings page)
 * - `*` - 404 Not Found page
 * 
 * @validates Requirements 2.4 - Navigate to any Section/Category via URL routing
 */

import React, { useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ChecklistProvider } from '../context/ChecklistContext';
import {
  WelcomePage,
  ChecklistPage,
  PreviewPage,
  CompletePage,
  SettingsPage,
} from '../pages';

/**
 * Route paths as constants for type safety and consistency
 */
export const ROUTES = {
  HOME: '/',
  CHECKLIST: '/checklist',
  PREVIEW: '/preview',
  COMPLETE: '/complete',
  SETTINGS: '/settings',
} as const;

export type RoutePath = typeof ROUTES[keyof typeof ROUTES];

/**
 * 404 Not Found Page Component
 * Displayed when user navigates to an unknown route
 */
const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = useCallback(() => {
    navigate(ROUTES.HOME);
  }, [navigate]);

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4"
      data-testid="not-found-page"
    >
      <div className="text-center max-w-md">
        {/* 404 Icon */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full">
            <NotFoundIcon className="w-12 h-12 text-gray-400" />
          </div>
        </div>
        
        {/* Error Message */}
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          页面未找到
        </h2>
        <p className="text-gray-600 mb-8">
          抱歉，您访问的页面不存在或已被移动。
        </p>
        
        {/* Action Button */}
        <button
          type="button"
          onClick={handleGoHome}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          aria-label="返回首页"
        >
          <HomeIcon className="w-5 h-5" />
          返回首页
        </button>
      </div>
    </div>
  );
};

/**
 * Connected WelcomePage with navigation
 */
const ConnectedWelcomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleStart = useCallback(() => {
    navigate(ROUTES.CHECKLIST);
  }, [navigate]);

  return <WelcomePage onStart={handleStart} />;
};

/**
 * Connected ChecklistPage with navigation
 */
const ConnectedChecklistPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    navigate(ROUTES.HOME);
  }, [navigate]);

  const handleComplete = useCallback(() => {
    navigate(ROUTES.COMPLETE);
  }, [navigate]);

  const handlePreview = useCallback(() => {
    navigate(ROUTES.PREVIEW);
  }, [navigate]);

  return (
    <ChecklistPage
      onBack={handleBack}
      onComplete={handleComplete}
      onPreview={handlePreview}
    />
  );
};

/**
 * Connected PreviewPage with navigation
 */
const ConnectedPreviewPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    navigate(ROUTES.CHECKLIST);
  }, [navigate]);

  return <PreviewPage onBack={handleBack} />;
};

/**
 * Connected CompletePage with navigation
 */
const ConnectedCompletePage: React.FC = () => {
  const navigate = useNavigate();

  const handlePreview = useCallback(() => {
    navigate(ROUTES.PREVIEW);
  }, [navigate]);

  const handleBackToEdit = useCallback(() => {
    navigate(ROUTES.CHECKLIST);
  }, [navigate]);

  return (
    <CompletePage
      onPreview={handlePreview}
      onBackToEdit={handleBackToEdit}
    />
  );
};

/**
 * Connected SettingsPage with navigation
 */
const ConnectedSettingsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    navigate(-1); // Go back to previous page
  }, [navigate]);

  return <SettingsPage onBack={handleBack} />;
};

/**
 * AppRoutes Component
 * Defines all application routes with smooth transitions
 */
export const AppRoutes: React.FC = () => {
  return (
    <div className="app-routes">
      <Routes>
        {/* Home / Welcome Page */}
        <Route path={ROUTES.HOME} element={<ConnectedWelcomePage />} />
        
        {/* Main Checklist Page */}
        <Route path={ROUTES.CHECKLIST} element={<ConnectedChecklistPage />} />
        
        {/* Preview Page */}
        <Route path={ROUTES.PREVIEW} element={<ConnectedPreviewPage />} />
        
        {/* Completion Page */}
        <Route path={ROUTES.COMPLETE} element={<ConnectedCompletePage />} />
        
        {/* Settings Page */}
        <Route path={ROUTES.SETTINGS} element={<ConnectedSettingsPage />} />
        
        {/* 404 Not Found - Catch all unknown routes */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
};

/**
 * AppRouter Component
 * Main router component that wraps routes with ChecklistProvider
 * This component should be used inside BrowserRouter
 */
export const AppRouter: React.FC = () => {
  return (
    <ChecklistProvider>
      <AppRoutes />
    </ChecklistProvider>
  );
};

// ============================================================================
// Icons
// ============================================================================

const NotFoundIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const HomeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

export default AppRouter;
