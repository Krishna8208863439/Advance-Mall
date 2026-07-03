import React from 'react';
import { useMall } from '../../context/MallContext';
import { 
  Home, 
  Store, 
  Map, 
  Tag, 
  Grid, 
  Video, 
  Car, 
  Users,
  Sparkles,
  ShoppingBag,
  History
} from 'lucide-react';

interface BottomNavProps {
  isAdmin: boolean;
  activeSection: string;
  setActiveSection: (sec: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  isAdmin,
  activeSection,
  setActiveSection,
}) => {
  const { t } = useMall();

  const visitorMenu = [
    { id: 'home', label: t('nav.home'), icon: Home },
    { id: 'directory', label: t('nav.directory'), icon: Store },
    { id: 'map', label: t('nav.map'), icon: Map },
    { id: 'offers', label: t('nav.offers'), icon: Tag },
    { id: 'concierge', label: t('nav.concierge'), icon: Sparkles },
    { id: 'mallatoms', label: t('nav.mallatoms'), icon: ShoppingBag },
  ];

  const adminMenu = [
    { id: 'tenants', label: t('nav.tenants'), icon: Grid },
    { id: 'cctv', label: t('nav.cctv'), icon: Video },
    { id: 'parking', label: t('nav.parking'), icon: Car },
    { id: 'attendance', label: t('nav.attendance'), icon: Users },
    { id: 'heatmap', label: t('nav.heatmap'), icon: Map },
    { id: 'history', label: t('nav.history'), icon: History },
  ];

  const currentMenu = isAdmin ? adminMenu : visitorMenu;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-luxury-darkCard/90 backdrop-blur-md border-t border-luxury-darkBorder py-1.5 flex items-center justify-around px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] shadow-lg">
      {currentMenu.map(item => {
        const Icon = item.icon;
        const isActive = activeSection === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-300 relative ${
              isActive ? 'text-luxury-gold' : 'text-slate-400'
            }`}
          >
            {/* Visual Indicator Bubble */}
            {isActive && (
              <span className="absolute -top-1 w-5 h-1 bg-luxury-gold rounded-full animate-pulse" />
            )}
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[9px] font-semibold tracking-wider text-center truncate w-full">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
