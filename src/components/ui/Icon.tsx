import React from 'react';
import { 
  Home, 
  ShoppingBag, 
  MessageCircle, 
  User, 
  Search, 
  MapPin, 
  Star, 
  Package, 
  Plus, 
  ChevronLeft,
  Bell,
  TrendingUp,
  Users,
  DollarSign,
  Truck,
  Filter,
  X,
  Check,
  AlertCircle,
  Loader2,
  Leaf,
  Sprout,
  Wheat,
  Apple
} from 'lucide-react';

interface IconProps {
  name: string;
  size?: number | string;
  className?: string;
  color?: string;
}

// Professional icon mappings replacing emojis
const iconMap: Record<string, React.ComponentType<any>> = {
  // Navigation
  '🏠': Home,
  '🛒': ShoppingBag,
  '💬': MessageCircle,
  '👤': User,
  '🔍': Search,
  '📍': MapPin,
  '⭐': Star,
  '📦': Package,
  '➕': Plus,
  '←': ChevronLeft,
  '🔔': Bell,
  
  // Business/Stats
  '📊': TrendingUp,
  '👥': Users,
  '💰': DollarSign,
  '🚚': Truck,
  '🌾': Wheat,
  '🌿': Leaf,
  '🌱': Sprout,
  
  // Categories
  '🥦': Leaf,
  '🍊': Apple,
  '🥜': Sprout,
  
  // Status
  '✅': Check,
  '❌': X,
  '⚠️': AlertCircle,
  '⏳': Loader2,
  
  };

const Icon = ({ name, size = 20, className, color }: IconProps) => {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    // Fallback for unmapped icons
    return <span className={className} style={{ fontSize: size, color }}>{name}</span>;
  }
  
  return <IconComponent size={size} className={className} color={color} />;
};

export { Icon, iconMap };
export type { IconProps };
