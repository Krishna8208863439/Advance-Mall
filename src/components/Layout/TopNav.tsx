import React, { useEffect, useState } from 'react';
import { useMall } from '../../context/MallContext';
import { Megaphone, ShieldCheck, User, Sparkles, BookOpen, Globe } from 'lucide-react';

interface TopNavProps {
  isAdmin: boolean;
  setIsAdmin: (admin: boolean) => void;
  setActiveSection: (sec: string) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  isAdmin,
  setIsAdmin,
  setActiveSection,
}) => {
  const { announcements, savedCoupons, language, setLanguage, t } = useMall();
  const [tickerIndex, setTickerIndex] = useState(0);

  // Auto rotate announcements in the header ticker
  useEffect(() => {
    if (announcements.length === 0) return;
    const interval = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [announcements]);

  const activeAnnouncement = announcements[tickerIndex];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-luxury-darkBorder px-4 lg:px-8 py-3 flex items-center justify-between">
      {/* Brand Logo */}
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => { setIsAdmin(false); setActiveSection('home'); }}>
        <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-luxury-gold to-luxury-gold-dark text-black shadow-gold-glow animate-pulse-gold">
          <Sparkles className="w-5 h-5 text-black" />
        </div>
        <div>
          <h1 className="text-lg lg:text-xl font-extrabold tracking-wider bg-gradient-to-r from-luxury-gold-light via-luxury-gold to-luxury-gold-dark bg-clip-text text-transparent uppercase">
            Amanora Plaza
          </h1>
          <p className="text-[10px] tracking-widest uppercase text-luxury-textMuted">
            Luxury Destination
          </p>
        </div>
      </div>

      {/* Announcement Marquee Ticker (Desktop/Tablet) */}
      {activeAnnouncement && (
        <div className="hidden md:flex items-center space-x-3 max-w-lg bg-luxury-darkBg/60 px-4 py-1.5 rounded-full border border-luxury-darkBorder text-xs transition-all duration-500">
          <span className="flex items-center space-x-1 text-luxury-gold font-bold uppercase tracking-wider">
            <Megaphone className="w-3.5 h-3.5 mr-1" />
            {activeAnnouncement.tag}:
          </span>
          <span className="text-slate-300 truncate max-w-md">
            {activeAnnouncement.content}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center space-x-3">
        {/* Saved Coupons Count */}
        {savedCoupons.length > 0 && (
          <button 
            onClick={() => { setIsAdmin(false); setActiveSection('offers'); }}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-luxury-gold/10 border border-luxury-gold/30 text-luxury-gold text-xs font-semibold animate-pulse hover:bg-luxury-gold/20 transition-all"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('nav.savedOffers')}:</span>
            <span className="bg-luxury-gold text-black rounded-full px-1.5 py-0.2 text-[10px] font-bold">
              {savedCoupons.length}
            </span>
          </button>
        )}

        {/* Language Switcher Button */}
        <button
          onClick={() => {
            const nextLang = language === 'en' ? 'hi' : 'en';
            setLanguage(nextLang);
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-luxury-darkBg/60 border border-luxury-darkBorder text-slate-300 hover:text-white hover:border-luxury-gold/50 text-xs font-bold transition-all duration-300"
        >
          <Globe className="w-4 h-4 text-luxury-gold" />
          <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
        </button>

        {/* Admin Switcher */}
        <button
          onClick={() => {
            const nextAdminState = !isAdmin;
            setIsAdmin(nextAdminState);
            // Switch default section based on mode
            if (nextAdminState) {
              setActiveSection('tenants');
            } else {
              setActiveSection('home');
            }
          }}
          className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
            isAdmin
              ? 'bg-luxury-rose/10 border border-luxury-rose/30 text-luxury-rose hover:bg-luxury-rose/25'
              : 'bg-luxury-gold/10 border border-luxury-gold/30 text-luxury-gold hover:bg-luxury-gold/25'
          }`}
        >
          {isAdmin ? (
            <>
              <User className="w-4 h-4" />
              <span>{t('nav.exitAdmin')}</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>{t('nav.adminControl')}</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
