import React from 'react';
import { Button, Icon } from '../ui';
import { cn } from '../../lib/utils';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  user?: any;
  cartItemCount?: number;
  onNavigate?: (page: string) => void;
  onBack?: () => void;
  showBack?: boolean;
  actions?: React.ReactNode;
  className?: string;
}

const Header = ({ 
  title, 
  subtitle, 
  user, 
  cartItemCount = 0, 
  onNavigate, 
  onBack,
  showBack = false,
  actions,
  className 
}: HeaderProps) => {
  return (
    <header className={cn(
      'bg-white sticky top-0 z-40 shadow-sm border-b border-surface-container',
      className
    )}>
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          {showBack && (
            <button 
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-surface-container transition-colors"
            >
              <Icon name="←" size={24} />
            </button>
          )}
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container flex items-center justify-center">
              {user ? (
                <div className="w-full h-full bg-primary flex items-center justify-center text-white font-bold">
                  {user.nom?.[0]?.toUpperCase()}
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <Icon name="🌾" size={20} className="text-white" />
                </div>
              )}
            </div>
            
            <div>
              <h1 className="font-black text-primary text-xl tracking-tight uppercase">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-primary/60 font-medium">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {actions || (
            <>
              {cartItemCount > 0 && onNavigate && (
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => onNavigate('panier')}
                >
                  <Icon name="🛒" size={14} />
                  {cartItemCount}
                </Button>
              )}
              
              {!user && onNavigate && (
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => onNavigate('connexion')}
                >
                  Se connecter
                </Button>
              )}
              
              {user && onNavigate && (
                <button 
                  onClick={() => onNavigate('mes-commandes')}
                  className="p-2 rounded-lg hover:bg-surface-container transition-colors"
                  title="Mes commandes"
                >
                  <Icon name="📦" size={22} />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export { Header };
