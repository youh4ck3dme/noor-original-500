'use client';

import { clsx } from 'clsx';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  side?: 'right' | 'left';
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}
export const Drawer = ({
  open,
  onClose,
  side = 'right',
  title,
  children,
  footer,
  className
}: DrawerProps) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);
  if (typeof document === 'undefined') return null;
  const offscreen = side === 'right' ? '100%' : '-100%';
  return createPortal(
    <AnimatePresence>
      {open &&
      <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <motion.div
          className="absolute inset-0 bg-gm-text/30 backdrop-blur-sm"
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          exit={{
            opacity: 0
          }}
          transition={{
            duration: 0.3,
            ease: 'easeOut'
          }}
          onClick={onClose} />
        
          <motion.aside
          className={clsx(
            'absolute top-0 bottom-0 w-full max-w-md flex flex-col bg-gm-surface shadow-gm-soft',
            side === 'right' ? 'right-0' : 'left-0',
            className
          )}
          initial={{
            x: offscreen
          }}
          animate={{
            x: 0
          }}
          exit={{
            x: offscreen
          }}
          transition={{
            type: 'tween',
            duration: 0.35,
            ease: 'easeOut'
          }}>
          
            <div className="flex items-center justify-between px-6 py-5 border-b border-gm-border">
              <h2 className="font-heading text-xl text-gm-text">{title}</h2>
              <button
              type="button"
              onClick={onClose}
              aria-label="Zavrieť"
              className="p-1.5 rounded-gm-sm text-gm-text-muted hover:text-gm-text hover:bg-gm-bg-soft transition-colors gm-focus-ring">
              
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer &&
          <div className="border-t border-gm-border px-6 py-5">
                {footer}
              </div>
          }
          </motion.aside>
        </div>
      }
    </AnimatePresence>,
    document.body
  );
};