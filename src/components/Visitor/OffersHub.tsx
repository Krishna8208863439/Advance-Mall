import React, { useState, useEffect } from 'react';
import { useMall, type Store, type Offer } from '../../context/MallContext';
import { Tag, Bookmark, BookmarkCheck, Calendar, Sparkles, Clock, Share2 } from 'lucide-react';

interface FestivalCountdown {
  name: string;
  targetDate: string;
  description: string;
  tag: string;
}

export const OffersHub: React.FC = () => {
  const { stores, savedCoupons, toggleSaveCoupon } = useMall();
  const [filterSavedOnly, setFilterSavedOnly] = useState(false);

  // Seed festivals with target countdown dates
  const [festivals] = useState<FestivalCountdown[]>(() => [
    {
      name: 'Amanora Luxury Runway',
      targetDate: new Date(Date.now() + 3600000 * 24 * 3.5).toISOString(), // 3.5 days from now
      description: 'Elite designer fashion show featuring international collections.',
      tag: 'Fashion'
    },
    {
      name: 'The Elite Gold Souk Festival',
      targetDate: new Date(Date.now() + 3600000 * 24 * 15.2).toISOString(), // 15.2 days from now
      description: 'Grand jewelry exposition showcasing bridal ranges and certified diamonds.',
      tag: 'Jewellery'
    },
    {
      name: 'Mercedes-Benz EQ Experience',
      targetDate: new Date(Date.now() + 3600000 * 24 * 76.8).toISOString(), // 76.8 days from now
      description: 'Book test drives, experience electric AMG speeds, and get custom brand items.',
      tag: 'Automobile'
    }
  ]);

  // Fetch all offers from stores
  const allOffers = React.useMemo(() => {
    const list: { store: Store; offer: Offer }[] = [];
    stores.forEach(store => {
      if (store.offers && store.offers.length > 0) {
        store.offers.forEach(offer => {
          list.push({ store, offer });
        });
      }
    });
    return list;
  }, [stores]);

  const displayedOffers = React.useMemo(() => {
    if (filterSavedOnly) {
      return allOffers.filter(item => savedCoupons.includes(item.offer.id));
    }
    return allOffers;
  }, [allOffers, filterSavedOnly, savedCoupons]);

  // Live countdown component inside the file
  const CountdownWidget: React.FC<{ festival: FestivalCountdown }> = ({ festival }) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
      const calculateTimeLeft = () => {
        const difference = +new Date(festival.targetDate) - +new Date();
        let left = { days: 0, hours: 0, minutes: 0, seconds: 0 };

        if (difference > 0) {
          left = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60)
          };
        }
        return left;
      };

      setTimeLeft(calculateTimeLeft());

      const interval = setInterval(() => {
        setTimeLeft(calculateTimeLeft());
      }, 1000);

      return () => clearInterval(interval);
    }, [festival.targetDate]);

    return (
      <div className="bg-luxury-darkCard/80 border border-luxury-darkBorder rounded-xl p-4 flex flex-col justify-between h-[150px] relative overflow-hidden">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-extrabold uppercase bg-luxury-gold/15 text-luxury-gold px-2 py-0.5 rounded border border-luxury-gold/20">
              {festival.tag}
            </span>
            <span className="flex items-center text-[10px] text-slate-400">
              <Calendar className="w-3 h-3 mr-1 text-luxury-gold" />
              Live Fest
            </span>
          </div>
          <h4 className="font-extrabold text-sm text-white mt-2 leading-tight">
            {festival.name}
          </h4>
          <p className="text-[11px] text-slate-400 mt-1 font-light leading-relaxed truncate">
            {festival.description}
          </p>
        </div>

        {/* Live Ticker display */}
        <div className="grid grid-cols-4 gap-2 text-center pt-2 border-t border-luxury-darkBorder/40">
          <div>
            <span className="block text-xs font-bold text-white tracking-tight">{timeLeft.days}</span>
            <span className="text-[8px] uppercase font-bold text-slate-500">Days</span>
          </div>
          <div>
            <span className="block text-xs font-bold text-white tracking-tight">{timeLeft.hours}</span>
            <span className="text-[8px] uppercase font-bold text-slate-500">Hrs</span>
          </div>
          <div>
            <span className="block text-xs font-bold text-white tracking-tight">{timeLeft.minutes}</span>
            <span className="text-[8px] uppercase font-bold text-slate-500">Mins</span>
          </div>
          <div>
            <span className="block text-xs font-bold text-luxury-gold tracking-tight animate-pulse">{timeLeft.seconds}</span>
            <span className="text-[8px] uppercase font-bold text-slate-500">Secs</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-white flex items-center">
          <Sparkles className="w-5 h-5 text-luxury-gold mr-2" />
          Offers & Events Hub
        </h2>
        <p className="text-xs text-luxury-textMuted mt-1">
          Save discount codes directly to your device and track upcoming flagship festivals.
        </p>
      </div>

      {/* Festival Countdown Timelines Section */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase font-extrabold tracking-widest text-slate-400 flex items-center">
          <Clock className="w-4 h-4 mr-1.5 text-luxury-gold" />
          Festival countdown timelines
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {festivals.map(fest => (
            <CountdownWidget key={fest.name} festival={fest} />
          ))}
        </div>
      </div>

      {/* Filter and Coupon Code Grid */}
      <div className="space-y-4">
        {/* Toggle Filters */}
        <div className="flex items-center justify-between border-b border-luxury-darkBorder pb-2">
          <h3 className="text-xs uppercase font-extrabold tracking-widest text-slate-400 flex items-center">
            <Tag className="w-4 h-4 mr-1.5 text-luxury-gold" />
            Active coupon booklets
          </h3>

          <div className="flex space-x-2">
            <button
              onClick={() => setFilterSavedOnly(false)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 ${
                !filterSavedOnly
                  ? 'bg-luxury-darkBorder text-white border border-luxury-darkBorder'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Booklets ({allOffers.length})
            </button>
            <button
              onClick={() => setFilterSavedOnly(true)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 ${
                filterSavedOnly
                  ? 'bg-luxury-gold text-black shadow-gold-glow border border-luxury-gold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Saved to Phone ({savedCoupons.length})
            </button>
          </div>
        </div>

        {/* Coupons Grid */}
        {displayedOffers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayedOffers.map(({ store, offer }) => {
              const isSaved = savedCoupons.includes(offer.id);
              return (
                <div
                  key={offer.id}
                  className="glass-panel rounded-xl overflow-hidden flex flex-col justify-between h-[180px] border border-luxury-darkBorder relative"
                >
                  {/* Coupon cut line detailing visual */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-luxury-darkBg rounded-r-full border-r border-y border-luxury-darkBorder" />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-luxury-darkBg rounded-l-full border-l border-y border-luxury-darkBorder" />
                  
                  {/* Coupon Details */}
                  <div className="p-5 flex justify-between items-start">
                    <div className="space-y-2 max-w-[70%]">
                      <span className="text-[9px] uppercase font-bold text-luxury-gold tracking-widest block">
                        {store.name}
                      </span>
                      <h4 className="text-base font-extrabold text-white leading-tight">
                        {offer.title}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Expires: <span className="font-semibold text-slate-300">{offer.expires}</span>
                      </p>
                    </div>

                    {/* Value Badge */}
                    <div className="bg-gradient-to-br from-luxury-gold/20 to-luxury-gold/5 border border-luxury-gold/30 rounded-xl px-4 py-2 text-center shadow-gold-glow shrink-0">
                      <span className="block text-xs font-extrabold uppercase text-luxury-gold">Value</span>
                      <span className="block text-lg font-black text-white">{offer.discount}</span>
                    </div>
                  </div>

                  {/* Coupon Actions footer */}
                  <div className="bg-luxury-darkCardLighter/60 px-5 py-3 border-t border-dashed border-luxury-darkBorder flex items-center justify-between">
                    {/* Coupon Promo code display */}
                    <div className="flex items-center space-x-2">
                      <span className="text-[9px] text-slate-500 uppercase font-bold">Code:</span>
                      <code className="bg-luxury-darkBg text-luxury-gold font-mono font-bold text-xs px-2.5 py-0.8 rounded border border-luxury-darkBorder shadow-inner tracking-wider">
                        {offer.code}
                      </code>
                    </div>

                    {/* Bookmark Toggle Action */}
                    <div className="flex items-center space-x-2.5">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(offer.code);
                          alert(`Promo Code "${offer.code}" copied to clipboard!`);
                        }}
                        className="text-slate-400 hover:text-slate-200 transition-colors"
                        title="Copy Code"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => toggleSaveCoupon(offer.id)}
                        className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 ${
                          isSaved
                            ? 'bg-luxury-gold text-black shadow-gold-glow'
                            : 'bg-luxury-darkBg border border-luxury-darkBorder text-slate-300 hover:border-luxury-gold/40 hover:text-white'
                        }`}
                      >
                        {isSaved ? (
                          <>
                            <BookmarkCheck className="w-3.5 h-3.5" />
                            <span>Saved to Phone</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-3.5 h-3.5" />
                            <span>Save to Phone</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 border border-dashed border-luxury-darkBorder rounded-2xl glass-panel text-center">
            <span className="text-3xl mb-2">🎟️</span>
            <h3 className="font-extrabold text-slate-200">No saved coupons</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              {filterSavedOnly 
                ? "You haven't saved any coupons to your phone yet. Browse booklets and tap 'Save to Phone'." 
                : "No active coupons available at this time."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
