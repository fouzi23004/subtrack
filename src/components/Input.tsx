import React from 'react';
import { cn } from '../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className,
  ...props
}: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs text-text-muted font-mono uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full px-4 py-3 bg-background border-2 border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-[var(--accent-primary)] transition-editorial font-mono text-sm',
          error && 'border-red-500 focus:border-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500 font-mono">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-text-muted font-mono">{helperText}</p>
      )}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Textarea({
  label,
  error,
  helperText,
  className,
  ...props
}: TextareaProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs text-text-muted font-mono uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          'w-full px-4 py-3 bg-background border-2 border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-[var(--accent-primary)] transition-editorial font-mono text-sm resize-vertical',
          error && 'border-red-500 focus:border-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500 font-mono">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-text-muted font-mono">{helperText}</p>
      )}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Select({
  label,
  error,
  helperText,
  className,
  children,
  ...props
}: SelectProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs text-text-muted font-mono uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        className={cn(
          'w-full px-4 py-3 bg-background border-2 border-border rounded-lg text-text-primary focus:outline-none focus:border-[var(--accent-primary)] transition-editorial font-mono text-sm',
          error && 'border-red-500 focus:border-red-500',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-xs text-red-500 font-mono">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-text-muted font-mono">{helperText}</p>
      )}
    </div>
  );
}
