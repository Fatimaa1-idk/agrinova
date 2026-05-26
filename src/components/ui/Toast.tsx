import React from 'react';
import { cn } from '../../lib/utils';
import { Icon } from './Icon';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose?: () => void;
}

const Toast = ({ message, type = 'info', onClose }: ToastProps) => {
  const typeStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-primary text-white',
  };

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  return (
    <div className={cn(
      'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-full font-bold shadow-lg transition-all duration-300 max-w-[90vw] text-center',
      typeStyles[type]
    )}>
      <div className="flex items-center gap-2">
        <Icon name={icons[type]} size={16} />
        <span>{message}</span>
      </div>
    </div>
  );
};

export { Toast };
