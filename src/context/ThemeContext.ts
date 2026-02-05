/**
 * Theme Context Definition
 * Contains types, context creation, and hooks.
 * Provider is in ThemeProvider.tsx to support Fast Refresh.
 */

import { createContext, useContext } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeContextValue {
  /** 用户选择的主题 */
  theme: Theme;
  /** 实际应用的主题 */
  resolvedTheme: ResolvedTheme;
  /** 设置主题 */
  setTheme: (theme: Theme) => void;
  /** 切换主题 (light <-> dark) */
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Hook: 使用主题
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;
