'use client';

import { clsx } from 'clsx';
import React, { useCallback, useState, createContext, useContext, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2Icon,
  AlertCircleIcon,
  InfoIcon,
  XIcon } from
'lucide-react';
export type ToastVariant = 'success' | 'error' | 'info';
export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}
interface ToastItem extends ToastOptions {
  id: number;
}
interface ToastContextValue {
  toast: (options: ToastOptions) => void;
}
const ToastContext = createContext<ToastContextValue | null>(null);
const icons = {
  success: CheckCircle2Icon,
  error: AlertCircleIcon,
  info: InfoIcon
};
const accent = {
  success: 'text-gm-primary',
  error: 'text-gm-primary',
  info: 'text-gm-text-muted'
};
function subscribeToMounted() {
  return () => {};
}

function getMountedSnapshot() {
  return true;
}

function getMountedServerSnapshot() {
  return false;
}

export const ToastProvider = ({ children }: {children: React.ReactNode;}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const mounted = useSyncExternalStore(
    subscribeToMounted,
    getMountedSnapshot,
    getMountedServerSnapshot,
  );
  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  const toast = useCallback(
    (options: ToastOptions) => {
      const id = Date.now() + Math.random();
      const item: ToastItem = {
        id,
        variant: 'success',
        duration: 4000,
        ...options
      };
      setToasts((prev) => [...prev, item]);
      if (item.duration && item.duration > 0) {
        setTimeout(() => remove(id), item.duration);
      }
    },
    [remove]
  );
  return (
    <ToastContext.Provider
      value={{
        toast
      }}>
      
      {children}
      {mounted && typeof document !== 'undefined' &&
      createPortal(
        <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
            <AnimatePresence>
              {toasts.map((t) => {
              const Icon = icons[t.variant || 'success'];
              return (
                <motion.div
                  key={t.id}
                  layout
                  initial={{
                    opacity: 0,
                    y: 12,
                    scale: 0.97
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1
                  }}
                  exit={{
                    opacity: 0,
                    x: 24
                  }}
                  transition={{
                    duration: 0.3,
                    ease: 'easeOut'
                  }}
                  className="pointer-events-auto gm-glass-panel rounded-gm-lg p-4 flex items-start gap-3"
                  role="status">
                  
                    <Icon
                    className={clsx(
                      'w-5 h-5 flex-shrink-0 mt-0.5',
                      accent[t.variant || 'success']
                    )} />
                  
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gm-text">
                        {t.title}
                      </p>
                      {t.description &&
                    <p className="text-xs text-gm-text-muted mt-0.5">
                          {t.description}
                        </p>
                    }
                    </div>
                    <button
                    type="button"
                    onClick={() => remove(t.id)}
                    aria-label="Zavrieť"
                    className="text-gm-text-muted hover:text-gm-text transition-colors gm-focus-ring rounded-gm-sm">
                    
                      <XIcon className="w-4 h-4" />
                    </button>
                  </motion.div>);

            })}
            </AnimatePresence>
          </div>,
        document.body
      )}
    </ToastContext.Provider>);

};
export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a <ToastProvider>');
  return ctx;
};