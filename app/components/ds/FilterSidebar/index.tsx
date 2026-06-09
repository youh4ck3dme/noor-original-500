'use client';

import { clsx } from 'clsx';
import React, { useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
  color?: string;
}
export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
}
export interface FilterSidebarProps {
  groups: FilterGroup[];
  selected: Record<string, string[]>;
  onChange: (groupId: string, optionId: string, checked: boolean) => void;
  onClear?: () => void;
  className?: string;
}
function CollapsibleGroup({
  group,
  selected,
  onChange




}: {group: FilterGroup;selected: string[];onChange: (optionId: string, checked: boolean) => void;}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-gm-border py-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-left gm-focus-ring rounded-gm-sm">
        
        <span className="font-medium text-gm-text">{group.label}</span>
        <ChevronDownIcon
          className={clsx(
            'w-4 h-4 text-gm-text-muted transition-transform',
            open && 'rotate-180'
          )} />
        
      </button>
      {open &&
      <ul className="mt-3 space-y-2">
          {group.options.map((opt) => {
          const checked = selected.includes(opt.id);
          return (
            <li key={opt.id}>
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => onChange(opt.id, e.target.checked)}
                  className="w-4 h-4 rounded-gm-sm border-gm-border text-gm-primary focus:ring-gm-primary" />
                
                  {opt.color &&
                <span
                  className="w-4 h-4 rounded-full ring-1 ring-gm-border"
                  style={{
                    backgroundColor: opt.color
                  }} />

                }
                  <span className="text-sm text-gm-text group-hover:text-gm-primary transition-colors">
                    {opt.label}
                  </span>
                  {typeof opt.count === 'number' &&
                <span className="ml-auto text-xs text-gm-text-muted">
                      {opt.count}
                    </span>
                }
                </label>
              </li>);

        })}
        </ul>
      }
    </div>);

}
export const FilterSidebar = ({
  groups,
  selected,
  onChange,
  onClear,
  className
}: FilterSidebarProps) => {
  const hasSelection = Object.values(selected).some((arr) => arr.length > 0);
  return (
    <aside className={clsx('w-full', className)} aria-label="Filtre">
      <div className="flex items-center justify-between pb-2">
        <h2 className="font-heading text-lg text-gm-text">Filtre</h2>
        {hasSelection && onClear &&
        <button
          type="button"
          onClick={onClear}
          className="text-sm text-gm-primary hover:text-gm-primary-hover transition-colors gm-focus-ring rounded-gm-sm">
          
            Vymazať
          </button>
        }
      </div>
      {groups.map((group) =>
      <CollapsibleGroup
        key={group.id}
        group={group}
        selected={selected[group.id] || []}
        onChange={(optionId, checked) =>
        onChange(group.id, optionId, checked)
        } />

      )}
    </aside>);

};