'use client';

import { clsx } from 'clsx';
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDownIcon } from 'lucide-react';
export interface AccordionItemData {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
}
export interface AccordionProps {
  items: AccordionItemData[];
  /** Allow multiple panels open at once. */
  multiple?: boolean;
  /** Ids open by default. */
  defaultOpen?: string[];
  className?: string;
}
export const Accordion = ({
  items,
  multiple = false,
  defaultOpen = [],
  className
}: AccordionProps) => {
  const [open, setOpen] = useState<string[]>(defaultOpen);
  const toggle = (id: string) => {
    setOpen((prev) => {
      const isOpen = prev.includes(id);
      if (multiple) {
        return isOpen ? prev.filter((x) => x !== id) : [...prev, id];
      }
      return isOpen ? [] : [id];
    });
  };
  return (
    <div
      className={clsx(
        'divide-y divide-gm-border border-y border-gm-border',
        className
      )}>
      
      {items.map((item) => {
        const isOpen = open.includes(item.id);
        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                onClick={() => toggle(item.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 py-4 text-left gm-focus-ring rounded-gm-sm">
                
                <span className="font-medium text-gm-text">{item.title}</span>
                <ChevronDownIcon
                  className={clsx(
                    'w-4 h-4 text-gm-text-muted flex-shrink-0 transition-transform duration-300',
                    isOpen && 'rotate-180'
                  )} />
                
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen &&
              <motion.div
                initial={{
                  height: 0,
                  opacity: 0
                }}
                animate={{
                  height: 'auto',
                  opacity: 1
                }}
                exit={{
                  height: 0,
                  opacity: 0
                }}
                transition={{
                  duration: 0.3,
                  ease: 'easeOut'
                }}
                className="overflow-hidden">
                
                  <div className="pb-4 text-gm-text-muted font-light leading-relaxed">
                    {item.content}
                  </div>
                </motion.div>
              }
            </AnimatePresence>
          </div>);

      })}
    </div>);

};