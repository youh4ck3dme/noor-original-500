import React, { ReactNode } from 'react';
import { clsx } from 'clsx';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  intensity?: 'light' | 'medium' | 'heavy';
}

export const GlassPanel = ({ children, className, intensity = 'medium' }: GlassPanelProps) => {
  const intensities = {
    light: 'bg-white/60 backdrop-blur-sm',
    medium: 'bg-white/80 backdrop-blur-md',
    heavy: 'bg-white/95 backdrop-blur-lg',
  };

  return (
    <div className={clsx('border border-white/20 shadow-sm', intensities[intensity], className)}>
      {children}
    </div>
  );
};
