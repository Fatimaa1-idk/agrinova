import React from 'react';
import { cn } from '../../lib/utils';
import { Icon } from './Icon';
import type { RoutePath } from '../../router/RouterContext';

export interface NavigationProps {
  active: string;
  onNavigate: (page: RoutePath) => void;
  cartItemCount?: number;
  userRole?: 'producteur' | 'acheteur';
}

const Navigation = ({ active, onNavigate, cartItemCount = 0, userRole }: NavigationProps) => {
  const navItems: { icon: string; label: string; page: RoutePath }[] = [
    { icon: '🏠', label: 'Accueil', page: 'onboarding' },
    { icon: '🛒', label: 'Marché', page: 'marketplace' },
    { icon: '🤖', label: 'Assistant', page: 'bot' },
    { icon: '💬', label: 'Chat', page: 'chat' },
    { icon: '👤', label: 'Profil', page: userRole === 'producteur' ? 'producteur' : 'profil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-surface-container rounded-t-3xl shadow-lg">
      <div className="flex justify-around items-center py-3 px-4 pb-6">
        {navItems.map((item) => (
          <button
            key={item.page}
            onClick={() => onNavigate(item.page)}
            className={cn(
              'flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-200 relative',
              active === item.page 
                ? 'bg-primary text-white' 
                : 'text-primary/60 hover:text-primary hover:bg-surface-container'
            )}
          >
            <Icon name={item.icon} size={22} />
            <span className="text-xs font-bold uppercase tracking-wide">
              {item.label}
            </span>
            {item.page === 'marketplace' && cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {cartItemCount}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

export { Navigation };
