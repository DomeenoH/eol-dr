/**
 * ThemeSwitcher - 主题切换按钮
 * 
 * 功能：
 * - 太阳/月亮图标切换
 * - 平滑动画过渡
 * - 显示当前主题状态
 */

import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface ThemeSwitcherProps {
  /** 自定义类名 */
  className?: string;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ className = '' }) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`
        relative inline-flex items-center justify-center 
        w-9 h-9 rounded-lg
        transition-all duration-300 ease-in-out
        ${isDark 
          ? 'bg-slate-700 hover:bg-slate-600 text-yellow-400' 
          : 'bg-gray-100 hover:bg-gray-200 text-amber-500'
        }
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${isDark ? 'focus:ring-offset-slate-800' : 'focus:ring-offset-white'}
        ${className}
      `}
      aria-label={isDark ? '切换到浅色模式' : '切换到深色模式'}
      title={isDark ? '切换到浅色模式' : '切换到深色模式'}
    >
      {/* 太阳图标 - 浅色模式显示 */}
      <SunIcon 
        className={`
          absolute w-5 h-5 transition-all duration-300
          ${isDark 
            ? 'opacity-0 rotate-90 scale-0' 
            : 'opacity-100 rotate-0 scale-100'
          }
        `}
      />
      
      {/* 月亮图标 - 深色模式显示 */}
      <MoonIcon 
        className={`
          absolute w-5 h-5 transition-all duration-300
          ${isDark 
            ? 'opacity-100 rotate-0 scale-100' 
            : 'opacity-0 -rotate-90 scale-0'
          }
        `}
      />
    </button>
  );
};

// 太阳图标
const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    className={className} 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor" 
    strokeWidth={2}
    aria-hidden="true"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
    />
  </svg>
);

// 月亮图标
const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    className={className} 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor" 
    strokeWidth={2}
    aria-hidden="true"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
    />
  </svg>
);

export default ThemeSwitcher;
