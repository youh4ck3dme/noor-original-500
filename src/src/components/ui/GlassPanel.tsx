import React from 'react';
import { clsx } from 'clsx';
interface GlassPanelProps {
  children: ReactNode;
  className?: string;
}
export const GlassPanel = ({ children, className }: GlassPanelProps) => {
  return <div className={clsx('gm-glass-panel', className)}>{children}</div>;
};