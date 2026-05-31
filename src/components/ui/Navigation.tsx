import React from 'react';
import { cn } from '../../lib/utils';
import { Home, ShoppingBag, MessageSquare, Newspaper, User, LogOut } from 'lucide-react';
import type { RoutePath, RouteState } from '../../router/RouterContext';

export interface NavigationProps {
  active: string;
  onNavigate: (page: RoutePath, state?: RouteState) => void;
  onLogout?: () => void;
  userRole?: 'producteur' | 'acheteur';
}

interface NavItem {
  icon: React.FC<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  page: RoutePath;
  state?: RouteState;
}

const Navigation = ({ active, onNavigate, onLogout, userRole }: NavigationProps) => {
  const navItems: NavItem[] = [
    { icon: Home,          label: 'Accueil',    page: 'accueil'     },
    { icon: ShoppingBag,   label: 'Marché',     page: 'marketplace' },
    { icon: Newspaper,     label: 'Actus',      page: 'feed'        },
    { icon: MessageSquare, label: 'Chat',       page: 'chat'        },
    { icon: User,          label: 'Profil',     page: 'profil'      },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-black/5 rounded-t-3xl shadow-[0_-4px_30px_-5px_rgba(0,0,0,0.05)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Role badge + logout strip */}
      {userRole && (
        <div className="flex items-center justify-between px-4 pt-1.5">
          <span className={cn(
            'text-[9px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full border',
            userRole === 'producteur'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
              : 'bg-blue-50 text-blue-700 border-blue-100'
          )}>
            {userRole === 'producteur' ? '🌾 Producteur' : '🛒 Acheteur'}
          </span>

          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-wider hover:bg-red-100 transition-colors active:scale-95"
            >
              <LogOut size={11} strokeWidth={2.5} />
              Déconnexion
            </button>
          )}
        </div>
      )}

      <div className="flex justify-around items-center h-16 px-1 lg:max-w-lg lg:mx-auto gap-0.5">
        {navItems.map((item) => {
          const isActive = active === item.page;
          const Icon = item.icon;

          return (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page, item.state)}
              className="relative flex flex-col items-center justify-center flex-1 h-full group"
            >
              <div className={cn(
                'absolute inset-0 top-3 bottom-3 rounded-md transition-all duration-300 z-0',
                isActive
                  ? 'bg-primary/10 scale-100'
                  : 'bg-transparent scale-50 opacity-0 group-hover:bg-primary/5 group-hover:scale-100 group-hover:opacity-100'
              )} />

              <div className="relative z-10 flex flex-col items-center justify-center gap-0.5 mt-1">
                <Icon
                  size={17}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={cn(
                    'transition-colors duration-300',
                    isActive ? 'text-primary' : 'text-slate-400 group-hover:text-primary/70'
                  )}
                />
                <span className={cn(
                  'text-[8px] font-bold uppercase tracking-wider transition-colors duration-300',
                  isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-500'
                )}>
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
