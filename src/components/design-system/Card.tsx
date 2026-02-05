import React from 'react';

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
    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    <div className="relative z-10">
      {children}
    </div>
  </div>
);
