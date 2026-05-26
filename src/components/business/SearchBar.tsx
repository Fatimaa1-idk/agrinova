import React from 'react';
import { Input, Icon } from '../ui';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchBar = ({ value, onChange, placeholder = "Chercher un produit, une région...", className }: SearchBarProps) => {
  return (
    <div className={className}>
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary/40">
          <Icon name="🔍" size={20} />
        </div>
        
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-12 pr-12 bg-surface-container border-none"
        />
        
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-primary/40 hover:text-primary transition-colors"
          >
            <Icon name="❌" size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export { SearchBar };
