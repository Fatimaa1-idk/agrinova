import React from 'react';
import { cn } from '../../lib/utils';
import { Icon } from './Icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: string;
  state?: 'default' | 'hover' | 'active' | 'disabled' | 'loading' | 'error';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    icon, 
    state = 'default',
    disabled,
    children, 
    ...props 
  }, ref) => {
    
    const baseStyles = 'inline-flex items-center justify-center font-bold transition-natural focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed relative overflow-hidden';
    
    const variants = {
      primary: {
        default: 'bg-green-700 text-white shadow-md',
        hover: 'bg-green-800 text-white shadow-lg -translate-y-px',
        active: 'bg-green-750 text-white shadow-md translate-y-0',
        disabled: 'bg-green-300 text-white/50 cursor-not-allowed',
        loading: 'bg-green-700 text-white cursor-wait',
        error: 'bg-red-500 text-white',
      },
      secondary: {
        default: 'bg-yellow-500 text-green-800 shadow-md',
        hover: 'bg-yellow-600 text-green-800 shadow-lg -translate-y-px',
        active: 'bg-yellow-550 text-green-800 shadow-md translate-y-0',
        disabled: 'bg-yellow-200 text-green-400/50 cursor-not-allowed',
        loading: 'bg-yellow-500 text-green-800 cursor-wait',
        error: 'bg-red-500 text-white',
      },
      outline: {
        default: 'border-2 border-green-700 text-green-700 bg-transparent',
        hover: 'bg-green-700 text-white border-green-700 -translate-y-px',
        active: 'bg-green-800 text-white border-green-700 translate-y-0',
        disabled: 'border-green-300 text-green-300 cursor-not-allowed',
        loading: 'border-green-700 text-green-700 cursor-wait',
        error: 'border-red-500 text-red-500',
      },
      ghost: {
        default: 'text-green-700 bg-transparent',
        hover: 'bg-green-50 text-green-800 -translate-y-px',
        active: 'bg-green-100 text-green-800 translate-y-0',
        disabled: 'text-green-300 cursor-not-allowed',
        loading: 'text-green-500 cursor-wait',
        error: 'text-red-500',
      },
      destructive: {
        default: 'bg-red-500 text-white shadow-md',
        hover: 'bg-red-600 text-white shadow-lg -translate-y-px',
        active: 'bg-red-550 text-white shadow-md translate-y-0',
        disabled: 'bg-red-200 text-white/50 cursor-not-allowed',
        loading: 'bg-red-500 text-white cursor-wait',
        error: 'bg-red-600 text-white',
      },
    };

    const sizes = {
      sm: 'px-3 py-2 text-xs rounded-lg gap-2',
      md: 'px-4 py-3 text-sm rounded-xl gap-2',
      lg: 'px-6 py-4 text-base rounded-xl gap-3',
      xl: 'px-8 py-5 text-lg rounded-2xl gap-3',
    };

    const finalState = disabled ? 'disabled' : loading ? 'loading' : state;
    const variantStyles = variants[variant][finalState];

    return (
      <button
        className={cn(
          baseStyles,
          variantStyles,
          sizes[size],
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-inherit">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        )}
        
        <div className={cn('flex items-center', loading && 'opacity-0')}>
          {icon && !loading && (
            <Icon name={icon} size={size === 'sm' ? 14 : size === 'md' ? 16 : 20} />
          )}
          {children && <span>{children}</span>}
        </div>
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
