import React from 'react';
import { cn } from '../../lib/utils';
import { Home, ShoppingBag, MessageSquare, Plus, Package } from 'lucide-react';
import type { RoutePath, RouteState } from '../../router/RouterContext';

export interface NavigationProps {
  active: string;
  onNavigate: (page: RoutePath, state?: RouteState) => void;
  cartItemCount?: number;
  userRole?: 'producteur' | 'acheteur';
}

interface NavItem {
  icon: React.FC<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  page: RoutePath;
  state?: RouteState;
  activeOn?: RoutePath[];
}

const Navigation = ({ active, onNavigate, cartItemCount = 0, userRole }: NavigationProps) => {
  const baseItems: NavItem[] = [
    { icon: Home,         label: 'Accueil', page: 'accueil'    },
    { icon: ShoppingBag,  label: 'Marché',  page: 'marketplace' },
    { icon: MessageSquare,label: 'Chat',    page: 'chat'        },
  ];

  const roleItem: NavItem | null = userRole === 'producteur'
    ? { icon: Plus,    label: 'Publier',   page: 'ajouter'  }
    : userRole === 'acheteur'
    ? { icon: Package, label: 'Commandes', page: 'accueil', state: { tab: 'commandes' }, activeOn: [] }
    : null;

  const navItems = roleItem ? [...baseItems, roleItem] : baseItems;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-black/5 rounded-t-3xl shadow-[0_-4px_30px_-5px_rgba(0,0,0,0.05)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Role badge strip */}
      {userRole && (
        <div className="flex justify-center pt-1.5">
          <span className={cn(
            'text-[9px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full border',
            userRole === 'producteur'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
              : 'bg-blue-50 text-blue-700 border-blue-100'
          )}>
            {userRole === 'producteur' ? '🌾 Producteur' : '🛒 Acheteur'}
          </span>
        </div>
      )}

      <div className="flex justify-around items-center h-16 px-2 lg:max-w-lg lg:mx-auto gap-1">
        {navItems.map((item) => {
          const isActive = item.activeOn !== undefined
            ? false
            : active === item.page;
          const Icon = item.icon;

          return (
            <button
              key={`${item.page}-${item.label}`}
              onClick={() => onNavigate(item.page, item.state)}
              className="relative flex flex-col items-center justify-center flex-1 h-full group"
            >
              <div
                className={cn(
                  'absolute inset-0 top-3 bottom-3 rounded-md transition-all duration-300 z-0',
                  isActive
                    ? 'bg-primary/10 scale-100'
                    : 'bg-transparent scale-50 opacity-0 group-hover:bg-primary/5 group-hover:scale-100 group-hover:opacity-100'
                )}
              />

              <div className="relative z-10 flex flex-col items-center justify-center gap-0.5 mt-1">
                <div className="relative">
                  <Icon
                    size={item.label === 'Publier' ? 20 : 18}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={cn(
                      'transition-colors duration-300',
                      item.label === 'Publier' && !isActive
                        ? 'text-primary/70'
                        : isActive
                        ? 'text-primary'
                        : 'text-slate-400 group-hover:text-primary/70'
                    )}
                  />
                  {item.page === 'marketplace' && cartItemCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-red-500 text-white rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold ring-2 ring-white shadow-sm border border-red-600">
                      {cartItemCount > 9 ? '9+' : cartItemCount}
                    </span>
                  )}
                  {item.label === 'Publier' && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary border-2 border-white" />
                  )}
                </div>

                <span
                  className={cn(
                    'text-[9px] font-bold uppercase tracking-wider transition-colors duration-300',
                    isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-500'
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
