import React from 'react';
import { 
  Home, 
  Store, 
  Map, 
  Tag, 
  Grid, 
  Video, 
  Car, 
  Users, 
  ChevronRight,
  ShieldAlert,
  Sparkles,
  ShoppingBag,
  History
} from 'lucide-react';

interface SidebarProps {
  isAdmin: boolean;
  activeSection: string;
  setActiveSection: (sec: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isAdmin,
  activeSection,
  setActiveSection,
}) => {
  // Navigation Menu Definitions
  const visitorMenu = [
    { id: 'home', label: 'Homepage', icon: Home },
    { id: 'directory', label: 'Store Directory', icon: Store },
    { id: 'map', label: 'Floor Map', icon: Map },
    { id: 'offers', label: 'Offers & Events', icon: Tag },
    { id: 'concierge', label: 'VIP Concierge', icon: Sparkles },
    { id: 'mallatoms', label: 'Online Booking', icon: ShoppingBag },
  ];

  const adminMenu = [
    { id: 'tenants', label: 'Tenant Ledger', icon: Grid },
    { id: 'cctv', label: 'CCTV Security', icon: Video },
    { id: 'parking', label: 'Smart Parking', icon: Car },
    { id: 'attendance', label: 'Staff Hub', icon: Users },
    { id: 'heatmap', label: '3D Floor Traffic', icon: Map },
    { id: 'history', label: 'System History', icon: History },
  ];

  const currentMenu = isAdmin ? adminMenu : visitorMenu;

  return (
    <aside className="hidden lg:flex flex-col w-64 h-[calc(100vh-65px)] bg-luxury-darkCard border-r border-luxury-darkBorder py-6 px-4 shrink-0 justify-between">
      <div className="space-y-6">
        {/* Navigation Section Title */}
        <div className="px-3">
          <p className="text-[10px] font-bold tracking-widest text-luxury-gold uppercase">
            {isAdmin ? 'System Panel' : 'Visitor Guide'}
          </p>
        </div>

        {/* Menu Items */}
        <nav className="space-y-1">
          {currentMenu.map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-all duration-300 group ${
                  isActive
                    ? 'bg-gradient-to-r from-luxury-gold/15 to-luxury-gold/5 border-l-2 border-luxury-gold text-luxury-gold shadow-gold-glow'
                    : 'text-slate-400 hover:bg-luxury-darkCardLighter hover:text-slate-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${
                    isActive ? 'text-luxury-gold' : 'text-slate-400'
                  }`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-luxury-gold animate-pulse" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Admin Safety/Compliance Footer */}
      {isAdmin && (
        <div className="bg-luxury-darkCardLighter/60 p-3 rounded-lg border border-luxury-darkBorder text-[11px] text-slate-400 space-y-1.5 animate-fade-in">
          <div className="flex items-center space-x-1.5 text-luxury-gold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="font-semibold uppercase tracking-wider">Secure Access</span>
          </div>
          <p className="leading-relaxed">
            All configuration updates will automatically sync locally. Activity logs are simulated.
          </p>
        </div>
      )}
    </aside>
  );
};
