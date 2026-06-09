import { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

interface LiquidButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
  className?: string; // Explicitly add className to solve the type error
}

export const LiquidButton = ({
  children,
  variant = 'primary',
  fullWidth,
  className,
  ...props
}: LiquidButtonProps) => {
  const baseStyles =
  'inline-flex items-center justify-center px-8 py-3.5 rounded-gm-md font-medium transition-all duration-300 ease-out';

  const variants = {
    primary:
    'bg-gm-primary text-white hover:bg-gm-primary-hover hover:shadow-gm-soft hover:-translate-y-0.5',
    secondary: 'bg-gm-surface text-gm-text hover:bg-gm-bg-soft',
    outline:
    'border border-gm-border text-gm-text hover:border-gm-primary hover:text-gm-primary',
    ghost: 'text-gm-text hover:text-gm-primary hover:bg-gm-bg-soft/50'
  };

  return (
    <button
      className={clsx(
        baseStyles,
        variants[variant],
        fullWidth && 'w-full',
        className
      )}
      {...props}>
      {children}
    </button>
  );
};