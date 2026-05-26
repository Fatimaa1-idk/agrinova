import React from 'react';
import { Icon } from '../ui';
import { cn } from '../../lib/utils';

export interface CategoryFilterProps {
  categories: Array<{ label: string; value: string; icon: string }>;
  active: string;
  onChange: (category: string) => void;
  className?: string;
}

const CategoryFilter = ({ categories, active, onChange, className }: CategoryFilterProps) => {
  return (
    <div className={cn('flex gap-3 overflow-x-auto pb-2', className)}>
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => onChange(category.value)}
          className={cn(
            'flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-200 border-2',
            active === category.value
              ? 'bg-primary text-white border-primary shadow-lg'
              : 'bg-surface-container text-primary border-surface-container hover:bg-surface-container-high'
          )}
        >
          <Icon name={category.icon} size={16} />
          {category.label}
        </button>
      ))}
    </div>
  );
};

export { CategoryFilter };
