import React, { useState, useMemo } from 'react';
import { useMall } from '../../context/MallContext';
import { Search, Phone, Clock, Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, Tag } from 'lucide-react';

const isStoreOpen = (hoursStr: string): boolean => {
  try {
    const parts = hoursStr.split('-');
    if (parts.length !== 2) return true;
    
    const parseTime = (timeStr: string) => {
      const clean = timeStr.trim().toUpperCase();
      const match = clean.match(/^(\d+):(\d+)\s*(AM|PM)$/);
      if (!match) return null;
      let hrs = parseInt(match[1], 10);
      const mins = parseInt(match[2], 10);
      const ampm = match[3];
      if (ampm === 'PM' && hrs < 12) hrs += 12;
      if (ampm === 'AM' && hrs === 12) hrs = 0;
      return hrs * 60 + mins;
    };

    const startMinutes = parseTime(parts[0]);
    const endMinutes = parseTime(parts[1]);
    
    if (startMinutes === null || endMinutes === null) return true;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    if (endMinutes < startMinutes) {
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  } catch (e) {
    return true;
  }
};

export const Directory: React.FC = () => {
  const { stores, savedCoupons, toggleSaveCoupon } = useMall();
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Types');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Categories list
  const categories = [
    'All Types', 'Automobile', 'Bags & Accessories', 'Beauty & Skincare', 
    'Denims & Casuals', 'Electronics', 'Ethnicwear', 'Eyewear', 
    'Food & Dine', 'Entertainment', 'Home & Lifestyle', 'Hypermarket', 
    'Jewellery', 'Kids Care', 'Watches'
  ];

  // Filters application
  const filteredStores = useMemo(() => {
    return stores.filter(store => {
      const matchesSearch = 
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        store.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.roomNumber.toString().includes(searchTerm);
      
      const matchesCategory = 
        selectedCategory === 'All Types' || 
        store.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [stores, searchTerm, selectedCategory]);

  // Reset page when filters change is now handled event-driven in onChange/onClick handlers.

  // Pagination calculation
  const totalPages = Math.ceil(filteredStores.length / itemsPerPage) || 1;
  const paginatedStores = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredStores.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredStores, currentPage]);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-white">
            Brand Directory
          </h2>
          <p className="text-xs text-luxury-textMuted mt-1">
            Search and locate {stores.length} premium brands across Amanora Plaza
          </p>
        </div>

        {/* Premium Search Input */}
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search brand, category, or room..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-luxury-darkCard border border-luxury-darkBorder rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-luxury-gold/50 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Category Horizontal Tab Filters */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-luxury-darkBorder">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setCurrentPage(1);
            }}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 border ${
              selectedCategory === cat
                ? 'bg-luxury-gold text-black border-luxury-gold font-bold shadow-gold-glow'
                : 'bg-luxury-darkCard/60 border-luxury-darkBorder text-slate-300 hover:border-luxury-gold/30 hover:text-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Stores */}
      {paginatedStores.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedStores.map(store => (
            <div 
              key={store.id} 
              className="glass-panel glass-panel-hover rounded-xl p-5 flex flex-col justify-between h-[280px] relative overflow-hidden"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3.5">
                    {/* Brand Logo Initial Icon */}
                    <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-luxury-darkBorder to-luxury-darkCardLighter flex items-center justify-center border border-luxury-darkBorder shadow-inner shrink-0 text-luxury-gold font-bold text-xs tracking-tighter">
                      {store.logoText.substring(0, 4)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-white tracking-wide truncate max-w-[150px]">
                        {store.name}
                      </h3>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-luxury-gold">
                          {store.category}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-600" />
                        {isStoreOpen(store.hours) ? (
                          <span className="flex items-center text-[9px] text-luxury-emerald font-extrabold tracking-wider uppercase">
                            <span className="w-1 h-1 bg-luxury-emerald rounded-full mr-1 animate-pulse" />
                            Open
                          </span>
                        ) : (
                          <span className="flex items-center text-[9px] text-luxury-rose font-extrabold tracking-wider uppercase">
                            <span className="w-1 h-1 bg-luxury-rose rounded-full mr-1" />
                            Closed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Floor and Location Badge */}
                  <span className="text-[9px] font-extrabold uppercase bg-luxury-darkBorder px-2.5 py-0.8 rounded text-slate-300 border border-luxury-darkBorder/40">
                    Room {store.roomNumber} • {store.floor}
                  </span>
                </div>

                {/* Description */}
                <p className="text-[11px] text-slate-300 font-light mt-3.5 leading-relaxed line-clamp-3">
                  {store.description}
                </p>
              </div>

              {/* Card Footer Details */}
              <div className="pt-3 border-t border-luxury-darkBorder/40 space-y-2.5">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-luxury-gold" />
                    <span>{store.hours}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-luxury-gold" />
                    <span>{store.contact}</span>
                  </div>
                </div>

                {/* Coupons / Offers details */}
                {store.offers && store.offers.length > 0 ? (
                  <div className="flex items-center justify-between bg-luxury-darkBg/60 px-3 py-1.5 rounded-lg border border-luxury-darkBorder/40">
                    <div className="flex items-center space-x-1.5">
                      <Tag className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                      <span className="text-[10px] font-extrabold text-slate-200 truncate max-w-[150px]">
                        {store.offers[0].title}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleSaveCoupon(store.offers[0].id)}
                      className="text-slate-400 hover:text-luxury-gold transition-colors focus:outline-none"
                      title={savedCoupons.includes(store.offers[0].id) ? "Saved" : "Save Coupon"}
                    >
                      {savedCoupons.includes(store.offers[0].id) ? (
                        <BookmarkCheck className="w-4 h-4 text-luxury-gold animate-bounce" />
                      ) : (
                        <Bookmark className="w-4 h-4 hover:scale-110" />
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="h-8 flex items-center justify-center border border-dashed border-luxury-darkBorder/40 rounded-lg">
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest">No active offers</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 border border-dashed border-luxury-darkBorder rounded-2xl glass-panel text-center">
          <span className="text-3xl mb-2">🔍</span>
          <h3 className="font-extrabold text-slate-200">No stores found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            We couldn't find any brands matching "{searchTerm}" or under the category "{selectedCategory}".
          </p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-luxury-darkBorder">
          <p className="text-xs text-slate-400 font-medium">
            Showing Page <span className="text-luxury-gold font-bold">{currentPage}</span> of <span className="text-slate-200 font-bold">{totalPages}</span>
          </p>
          <div className="flex space-x-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="flex items-center justify-center p-2 rounded-lg border border-luxury-darkBorder bg-luxury-darkCard text-slate-400 hover:text-luxury-gold hover:border-luxury-gold/40 disabled:opacity-30 disabled:pointer-events-none transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center p-2 rounded-lg border border-luxury-darkBorder bg-luxury-darkCard text-slate-400 hover:text-luxury-gold hover:border-luxury-gold/40 disabled:opacity-30 disabled:pointer-events-none transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
