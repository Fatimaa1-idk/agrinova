import React from 'react';
import { cn } from '../../lib/utils';
import { Home, ShoppingBag, MessageSquare, User } from 'lucide-react';
import type { RoutePath } from '../../router/RouterContext';

export interface NavigationProps {
  active: string;
  onNavigate: (page: RoutePath) => void;
  cartItemCount?: number;
  userRole?: 'producteur' | 'acheteur';
}

const Navigation = ({ active, onNavigate, cartItemCount = 0, userRole }: NavigationProps) => {
  const navItems = [
    { icon: Home, label: 'Accueil', page: 'accueil' as RoutePath },
    { icon: ShoppingBag, label: 'Marché', page: 'marketplace' as RoutePath },
    { icon: MessageSquare, label: 'Chat', page: 'chat' as RoutePath },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-black/5 rounded-t-3xl shadow-[0_-4px_30px_-5px_rgba(0,0,0,0.05)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex justify-around items-center h-16 px-2 lg:max-w-lg lg:mx-auto gap-2">
        {navItems.map((item) => {
          const isActive = active === item.page;
          const Icon = item.icon;

          return (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className="relative flex flex-col items-center justify-center w-[20%] h-full group"
            >
              {/* Animated Background Pill */}
              <div 
                className={cn(
                  "absolute inset-0 top-3 bottom-3 rounded-md transition-all duration-300 z-0",
                  isActive ? "bg-primary/10 scale-100" : "bg-transparent scale-50 opacity-0 group-hover:bg-primary/5 group-hover:scale-100 group-hover:opacity-100"
                )}
              />
              
              <div className="relative z-10 flex flex-col items-center justify-center gap-1 mt-1">
                <div className="relative">
                  <Icon 
                    size={18} 
                    strokeWidth={isActive ? 2.5 : 2}
                    className={cn(
                      "transition-colors duration-300",
                      isActive ? "text-primary" : "text-slate-400 group-hover:text-primary/70"
                    )} 
                  />
                  {/* Cart Notification Badge */}
                  {item.page === 'marketplace' && cartItemCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-red-500 text-white rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold ring-2 ring-white shadow-sm border border-red-600">
                      {cartItemCount > 9 ? '9+' : cartItemCount}
                    </span>
                  )}
                </div>

                <span 
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider transition-colors duration-300",
                    isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-500"
                  )}
                >
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export { Navigation };
