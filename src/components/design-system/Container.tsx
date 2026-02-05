import React from 'react';

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
