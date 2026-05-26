import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { Icon } from './Icon';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: string;
  helper?: string;
  state?: 'default' | 'focus' | 'error' | 'disabled';
  showPasswordToggle?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    label, 
    error, 
    icon, 
    helper,
    state = 'default',
    showPasswordToggle = false,
    id,
    type = 'text',
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    const finalState = error ? 'error' : isFocused ? 'focus' : props.disabled ? 'disabled' : state;
    const actualType = showPasswordToggle && type === 'password' ? (showPassword ? 'text' : 'password') : type;
    
    const stateStyles = {
      default: 'bg-surface border-surface-container-high text-primary placeholder:text-primary/40',
      focus: 'bg-surface border-primary ring-2 ring-primary/20 text-primary placeholder:text-primary/30',
      error: 'bg-error/5 border-error text-error placeholder:text-error/40 ring-2 ring-error/20',
      disabled: 'bg-surface-container/50 border-surface-container text-primary/50 cursor-not-allowed placeholder:text-primary/20',
    };

    return (
      <div className="space-y-3">
        {label && (
          <label 
            htmlFor={inputId}
            className={cn(
              'block text-sm font-bold transition-natural',
              finalState === 'error' ? 'text-error' : finalState === 'disabled' ? 'text-primary/40' : 'text-primary/80'
            )}
          >
            {label}
          </label>
        )}
        
        <div className="relative group">
          {icon && (
            <div className={cn(
              'absolute left-4 top-1/2 transform -translate-y-1/2 transition-natural',
              finalState === 'error' ? 'text-error' : finalState === 'focus' ? 'text-primary' : 'text-primary/40'
            )}>
              <Icon name={icon} size={16} />
            </div>
          )}
          
          <input
            id={inputId}
            type={actualType}
            className={cn(
              'w-full px-4 py-3 rounded-xl border-2 transition-natural outline-none',
              stateStyles[finalState],
              icon && 'pl-12',
              (showPasswordToggle || type === 'search') && 'pr-12',
              'group-hover:shadow-agricultural',
              className
            )}
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          
          {(showPasswordToggle || type === 'search') && (
            <button
              type="button"
              onClick={showPasswordToggle ? () => setShowPassword(!showPassword) : undefined}
              className={cn(
                'absolute right-4 top-1/2 transform -translate-y-1/2 transition-natural',
                finalState === 'error' ? 'text-error' : finalState === 'focus' ? 'text-primary' : 'text-primary/40',
                'hover:text-primary cursor-pointer'
              )}
            >
              <Icon 
                name={showPasswordToggle ? (showPassword ? '👁️' : '👁️‍🗨️') : '🔍'} 
                size={16} 
              />
            </button>
          )}
        </div>
        
        {(error || helper) && (
          <div className="flex items-start gap-2">
            {error && <Icon name="❌" size={14} className="text-error mt-0.5" />}
            <p className={cn(
              'text-sm transition-natural',
              finalState === 'error' ? 'text-error font-medium' : 'text-primary/60'
            )}>
              {error || helper}
            </p>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
