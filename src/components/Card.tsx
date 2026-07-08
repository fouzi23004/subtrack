import React from 'react';
import { cn } from '../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  withAccentBorder?: boolean;
  withPaperTexture?: boolean;
  onClick?: () => void;
}

export function Card({
  children,
  className,
  withAccentBorder = false,
  withPaperTexture = false,
  onClick
}: CardProps) {
  return (
    <div
      className={cn(
        'editorial-card rounded-xl p-6',
        withAccentBorder && 'accent-border',
        withPaperTexture && 'paper-texture',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('border-b border-border pb-4 mb-6', className)}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h2 className={cn('editorial-heading text-2xl text-text-primary', className)}>
      {children}
    </h2>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {children}
    </div>
  );
}
