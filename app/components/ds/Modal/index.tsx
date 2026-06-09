'use client';

import { clsx } from 'clsx';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl'
};
export const Modal = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className
}: ModalProps) => {
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
  return createPortal(
    <AnimatePresence>
      {open &&
      <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
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
            duration: 0.25,
            ease: 'easeOut'
          }}
          onClick={onClose} />
        
          <motion.div
          role="dialog"
          aria-modal="true"
          className={clsx(
            'relative w-full bg-gm-surface rounded-gm-xl shadow-gm-soft overflow-hidden',
            sizes[size],
            className
          )}
          initial={{
            opacity: 0,
            scale: 0.96,
            y: 12
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0
          }}
          exit={{
            opacity: 0,
            scale: 0.96,
            y: 12
          }}
          transition={{
            duration: 0.3,
            ease: 'easeOut'
          }}>
          
            <div className="flex items-start justify-between gap-4 px-6 pt-6">
              <div>
                {title &&
              <h2 className="font-heading text-xl text-gm-text">{title}</h2>
              }
                {description &&
              <p className="text-sm text-gm-text-muted mt-1">
                    {description}
                  </p>
              }
              </div>
              <button
              type="button"
              onClick={onClose}
              aria-label="Zavrieť"
              className="p-1.5 -mr-1.5 rounded-gm-sm text-gm-text-muted hover:text-gm-text hover:bg-gm-bg-soft transition-colors gm-focus-ring">
              
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            {children &&
          <div className="px-6 py-5 text-gm-text-muted font-light">
                {children}
              </div>
          }
            {footer &&
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gm-bg-soft/50 border-t border-gm-border">
                {footer}
              </div>
          }
          </motion.div>
        </div>
      }
    </AnimatePresence>,
    document.body
  );
};