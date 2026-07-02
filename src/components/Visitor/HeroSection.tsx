import React, { useState, useEffect } from 'react';
import { useMall } from '../../context/MallContext';
import { Calendar, Clock, MapPin, Sparkles, ChevronLeft, ChevronRight, Car, Store, Tag } from 'lucide-react';

const SlideCountdown: React.FC<{ targetDate: string }> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = +new Date(targetDate) - +new Date();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      };
    };

    setTimeLeft(calc());
    const interval = setInterval(() => {
      setTimeLeft(calc());
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex space-x-1.5 text-[9px] sm:text-[10px] uppercase font-mono font-bold text-luxury-gold bg-black/40 border border-luxury-gold/25 px-2 py-0.5 rounded backdrop-blur-sm shadow-inner shrink-0 select-none">
      <span>{timeLeft.days}D</span>
      <span>:</span>
      <span>{timeLeft.hours.toString().padStart(2, '0')}H</span>
      <span>:</span>
      <span>{timeLeft.minutes.toString().padStart(2, '0')}M</span>
      <span>:</span>
      <span className="text-white animate-pulse">{timeLeft.seconds.toString().padStart(2, '0')}S</span>
      <span className="text-slate-400 font-sans tracking-wide ml-1 font-normal lowercase">left</span>
    </div>
  );
};

export const HeroSection: React.FC = () => {
  const { parkingLogs, stores, savedCoupons } = useMall();
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: 'Amanora Summer Runway',
      subtitle: 'Haute Couture Exhibition',
      description: 'Experience fashion like never before. Top global designers unveil their summer collections live at the Central Plaza.',
      date: 'June 18 - June 20, 2026',
      time: '05:00 PM onwards',
      location: 'Central Plaza, Ground Floor',
      bgGradient: 'from-slate-950 via-slate-900 to-amber-950/60',
      badge: 'FASHION SHOW',
      accentColor: 'text-luxury-gold',
      targetDate: new Date(Date.now() + 3600000 * 24 * 3.5).toISOString()
    },
    {
      id: 2,
      title: 'The Elite Gold Souk Festival',
      subtitle: 'Exquisite Heirloom Bridal Showcases',
      description: 'Explore breathtaking collections in 22k pure gold and diamonds with zero making charges and complimentary certified valuations.',
      date: 'June 10 - June 30, 2026',
      time: '10:30 AM - 09:30 PM',
      location: 'Grand Atrium, Ground Floor',
      bgGradient: 'from-slate-950 via-slate-900 to-yellow-950/50',
      badge: 'EXCLUSIVES',
      accentColor: 'text-amber-400',
      targetDate: new Date(Date.now() + 3600000 * 24 * 15.2).toISOString()
    },
    {
      id: 3,
      title: 'Mercedes-Benz EQ Launch',
      subtitle: 'Future of Sustainable Driving',
      description: 'Get behind the wheel of Mercedes-Benz EQ electric luxury sedans. Book direct VIP test drives and receive elite lifestyle merchandise.',
      date: 'Ongoing until Aug 31, 2026',
      time: '10:00 AM - 09:00 PM',
      location: 'Mercedes Pavilion, Room 35',
      bgGradient: 'from-slate-950 via-slate-900 to-slate-800/60',
      badge: 'AUTOMOBILE EV',
      accentColor: 'text-sky-400',
      targetDate: new Date(Date.now() + 3600000 * 24 * 76.8).toISOString()
    }
  ];

  // Auto scroll slides
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrev = () => {
    setActiveSlide(prev => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setActiveSlide(prev => (prev + 1) % slides.length);
  };

  // Stats calculation
  const totalOccupiedParking = parkingLogs.length;
  const totalParkingSlots = 100; // 50 for 2W, 50 for 4W
  const freeParkingSlots = totalParkingSlots - totalOccupiedParking;
  const totalStores = stores.length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Premium Hero Carousel */}
      <div className="relative rounded-2xl overflow-hidden border border-luxury-darkBorder glass-panel h-[360px] md:h-[400px]">
        {/* Carousel Background Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

        {slides.map((slide, idx) => {
          const isSelected = activeSlide === idx;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 bg-gradient-to-br ${slide.bgGradient} p-6 md:p-12 flex flex-col justify-between transition-all duration-1000 ${
                isSelected ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-95'
              }`}
            >
              {/* Top Banner Tag */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-luxury-gold" />
                  <span className="text-[10px] tracking-widest font-extrabold uppercase bg-luxury-gold/15 border border-luxury-gold/30 px-2.5 py-0.8 rounded text-luxury-gold">
                    {slide.badge}
                  </span>
                </div>
                <SlideCountdown targetDate={slide.targetDate} />
              </div>

              {/* Main Contents */}
              <div className="max-w-xl space-y-3">
                <h3 className="text-xs uppercase font-extrabold tracking-widest text-slate-400">
                  {slide.subtitle}
                </h3>
                <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  {slide.title}
                </h2>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-light">
                  {slide.description}
                </p>
              </div>

              {/* Info Bar / Footer of slide */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-luxury-darkBorder/40 text-[11px] text-slate-400 font-medium">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-3.5 h-3.5 text-luxury-gold" />
                  <span>{slide.date}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-3.5 h-3.5 text-luxury-gold" />
                  <span>{slide.time}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-luxury-gold" />
                  <span>{slide.location}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Carousel Control Buttons */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-luxury-darkBorder glass-panel flex items-center justify-center text-slate-400 hover:text-luxury-gold hover:border-luxury-gold/50 transition-all active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-luxury-darkBorder glass-panel flex items-center justify-center text-slate-400 hover:text-luxury-gold hover:border-luxury-gold/50 transition-all active:scale-95"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Indicators dot bar */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-1.5 z-10">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`w-5 h-1 rounded-full transition-all duration-300 ${
                activeSlide === idx ? 'bg-luxury-gold w-8' : 'bg-luxury-darkBorder'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Luxury Stats Banner Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status widget */}
        <div className="p-4 rounded-xl border border-luxury-darkBorder bg-luxury-darkCard/40 flex items-start space-x-3.5">
          <div className="p-2 h-10 w-10 flex items-center justify-center rounded-lg bg-luxury-emerald/10 border border-luxury-emerald/20 text-luxury-emerald">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-0.5">MALL HOURS</span>
            <p className="text-sm font-extrabold text-white">09:00 AM - 11:30 PM</p>
            <span className="inline-block mt-1 px-1.5 py-0.2 text-[9px] font-extrabold bg-luxury-emerald/15 text-luxury-emerald uppercase rounded tracking-wider">Open Now</span>
          </div>
        </div>

        {/* Directory Counter widget */}
        <div className="p-4 rounded-xl border border-luxury-darkBorder bg-luxury-darkCard/40 flex items-start space-x-3.5">
          <div className="p-2 h-10 w-10 flex items-center justify-center rounded-lg bg-luxury-gold/10 border border-luxury-gold/20 text-luxury-gold">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-0.5">ACTIVE STORES</span>
            <p className="text-sm font-extrabold text-white">{totalStores} Brands</p>
            <p className="text-[10px] text-slate-400 mt-1">Across 4 luxury floors</p>
          </div>
        </div>

        {/* Dynamic Parking Slots widget */}
        <div className="p-4 rounded-xl border border-luxury-darkBorder bg-luxury-darkCard/40 flex items-start space-x-3.5">
          <div className="p-2 h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-0.5">PARKING SPACES</span>
            <p className="text-sm font-extrabold text-white">{freeParkingSlots} Free Slots</p>
            <p className="text-[10px] text-slate-400 mt-1">Cap: 100 (2W & 4W)</p>
          </div>
        </div>

        {/* Active discount widget */}
        <div className="p-4 rounded-xl border border-luxury-darkBorder bg-luxury-darkCard/40 flex items-start space-x-3.5">
          <div className="p-2 h-10 w-10 flex items-center justify-center rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-0.5">SAVED SAVINGS</span>
            <p className="text-sm font-extrabold text-white">{savedCoupons.length} Active</p>
            <p className="text-[10px] text-slate-400 mt-1">Saved coupons on phone</p>
          </div>
        </div>
      </div>
    </div>
  );
};
