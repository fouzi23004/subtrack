import React from 'react';
import { cn } from '../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Badge({
  children,
  variant = 'primary',
  size = 'md',
  className
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center justify-center font-mono font-bold uppercase tracking-widest rounded-md transition-editorial';

  const variantStyles = {
    primary: 'bg-[var(--accent-primary)] bg-opacity-10 text-[var(--accent-primary)] border border-[var(--accent-primary)] border-opacity-20',
    secondary: 'bg-[var(--accent-secondary)] bg-opacity-10 text-[var(--accent-secondary)] border border-[var(--accent-secondary)] border-opacity-20',
    success: 'bg-green-500 bg-opacity-10 text-green-600 border border-green-500 border-opacity-20',
    warning: 'bg-yellow-500 bg-opacity-10 text-yellow-600 border border-yellow-500 border-opacity-20',
    danger: 'bg-red-500 bg-opacity-10 text-red-600 border border-red-500 border-opacity-20',
    neutral: 'bg-text-muted bg-opacity-10 text-text-muted border border-text-muted border-opacity-20',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[9px]',
    md: 'px-3 py-1 text-[10px]',
    lg: 'px-4 py-1.5 text-xs',
  };

  return (
    <span className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}>
      {children}
    </span>
  );
}
