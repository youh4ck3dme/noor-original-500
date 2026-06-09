'use client';

import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useState, useId } from 'react';
export interface TabItem {
  id: string;
  label: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}
export interface TabsProps {
  items: TabItem[];
  /** Controlled active tab id. */
  value?: string;
  /** Uncontrolled initial tab id. */
  defaultValue?: string;
  onChange?: (id: string) => void;
  className?: string;
}
export const Tabs = ({
  items,
  value,
  defaultValue,
  onChange,
  className
}: TabsProps) => {
  const baseId = useId();
  const [internal, setInternal] = useState(defaultValue || items[0]?.id);
  const active = value ?? internal;
  const select = (id: string) => {
    if (value === undefined) setInternal(id);
    onChange?.(id);
  };
  const activeItem = items.find((i) => i.id === active);
  return (
    <div className={className}>
      <div
        role="tablist"
        className="flex items-center gap-1 border-b border-gm-border">
        
        {items.map((item) => {
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.id}`}
              aria-selected={isActive}
              aria-controls={`${baseId}-panel-${item.id}`}
              disabled={item.disabled}
              onClick={() => select(item.id)}
              className={clsx(
                'relative px-4 py-3 text-sm font-medium transition-colors gm-focus-ring rounded-t-gm-sm -mb-px',
                isActive ?
                'text-gm-primary' :
                'text-gm-text-muted hover:text-gm-text',
                item.disabled && 'opacity-40 cursor-not-allowed'
              )}>
              
              {item.label}
              {isActive &&
              <span className="absolute left-3 right-3 -bottom-px h-0.5 bg-gm-primary rounded-full" />
              }
            </button>);

        })}
      </div>
      <AnimatePresence mode="wait">
        {activeItem && (
          <motion.div
            key={activeItem.id}
            role="tabpanel"
            id={`${baseId}-panel-${activeItem.id}`}
            aria-labelledby={`${baseId}-tab-${activeItem.id}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="pt-5 text-gm-text-muted font-light leading-relaxed"
          >
            {activeItem.content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>);

};