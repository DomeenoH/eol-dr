import React from 'react';

// Typography System
export const Typography = {
  h1: ({ children, className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className={`text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent ${className}`} {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className={`text-2xl font-semibold text-slate-800 dark:text-slate-100 ${className}`} {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className={`text-xl font-medium text-slate-700 dark:text-slate-200 ${className}`} {...props}>
      {children}
    </h3>
  ),
  body: ({ children, className = '', ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={`text-base text-slate-600 dark:text-slate-300 ${className}`} {...props}>
      {children}
    </p>
  ),
  small: ({ children, className = '', ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={`text-sm text-slate-500 dark:text-slate-400 ${className}`} {...props}>
      {children}
    </p>
  ),
  gradient: ({ children, className = '', ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
    <span className={`bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent ${className}`} {...props}>
      {children}
    </span>
  ),
};
