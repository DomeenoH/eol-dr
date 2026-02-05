import React from 'react';

// Typography System
export const Typography = {
  h1: ({ children, className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className={`text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent ${className}`} {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className={`text-2xl font-semibold text-slate-100 ${className}`} {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className={`text-xl font-medium text-slate-200 ${className}`} {...props}>
      {children}
    </h3>
  ),
  body: ({ children, className = '', ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={`text-base text-slate-300 ${className}`} {...props}>
      {children}
    </p>
  ),
  small: ({ children, className = '', ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={`text-sm text-slate-400 ${className}`} {...props}>
      {children}
    </p>
  ),
  gradient: ({ children, className = '', ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
    <span className={`bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent ${className}`} {...props}>
      {children}
    </span>
  ),
};

// Container Components
export const PageContainer = ({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`space-y-8 animate-fade-in ${className}`} {...props}>
    {children}
  </div>
);

export const Section = ({ children, className = '', ...props }: React.HTMLAttributes<HTMLElement>) => (
  <section className={`space-y-4 ${className}`} {...props}>
    {children}
  </section>
);

// Card Components
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const GlassCard = ({ children, className = '', onClick, hoverEffect = true, ...props }: CardProps) => (
  <div 
    onClick={onClick}
    className={`
      glass-card p-6 relative overflow-hidden group
      ${hoverEffect ? 'hover:shadow-glass-hover hover:scale-[1.01] cursor-pointer' : ''}
      ${className}
    `}
    {...props}
  >
    {/* Optional internal gloss effect */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    <div className="relative z-10">
      {children}
    </div>
  </div>
);

// Form Element Styles
export const FormStyles = {
  label: "block text-sm font-medium text-slate-300 mb-1.5",
  input: "w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue/50 placeholder-slate-500 transition-all duration-200",
  select: "w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue/50 transition-all duration-200",
  checkbox: "rounded bg-slate-900/50 border-white/10 text-accent-blue focus:ring-accent-blue/50",
  button: {
    primary: "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium py-2.5 px-6 rounded-lg shadow-lg shadow-blue-900/20 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed",
    secondary: "bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-medium py-2.5 px-6 rounded-lg transition-all duration-200 disabled:opacity-50",
    danger: "bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-medium py-2.5 px-6 rounded-lg transition-all duration-200"
  }
};
