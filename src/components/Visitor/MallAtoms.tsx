import React, { useState } from 'react';
import { useMall } from '../../context/MallContext';
import { Store, ShoppingBag, Search, AlertTriangle, CheckCircle, Car, ArrowRight, ShieldCheck, Ticket, X } from 'lucide-react';

export const MallAtoms: React.FC = () => {
  const { products, productBookings, reserveProduct, parkingLogs, language, t } = useMall();
  
  // Tabs: Catalog vs Reservations
  const [activeTab, setActiveTab] = useState<'catalog' | 'reservations'>('catalog');
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Booking modal state
  const [bookingProduct, setBookingProduct] = useState<any>(null);
  const [customerName, setCustomerName] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [bookingQty, setBookingQty] = useState(1);
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);
  const [bookingError, setBookingError] = useState('');

  // Categories list
  const categories = ['All', 'Groceries', 'Eyewear', 'Ethnicwear', 'Beauty & Skincare', 'Jewellery', 'Watches', 'Electronics', 'Bags & Accessories'];

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.storeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Check if plate matches parking
  const checkPlateMatch = (plate: string) => {
    if (!plate.trim()) return null;
    return parkingLogs.find(log => log.licensePlate.toLowerCase() === plate.trim().toLowerCase());
  };

  const activeVehicle = checkPlateMatch(licensePlate);
  const hasGeoDiscount = !!activeVehicle;

  const [paymentMethod, setPaymentMethod] = useState<'Razorpay' | 'In-Store'>('In-Store');

  const loadRazorpayScript = () => {
    return new Promise<boolean>((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Handle reserve submit
  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess(null);

    if (!customerName.trim()) {
      setBookingError('Please enter your name.');
      return;
    }
    if (bookingQty <= 0) {
      setBookingError('Please select a valid quantity.');
      return;
    }
    if (bookingQty > bookingProduct.stock) {
      setBookingError('Insufficient stock for selected quantity.');
      return;
    }

    // Calculate total
    let discountMultiplier = 1.0;
    if (hasGeoDiscount) discountMultiplier -= 0.15;
    if (paymentMethod === 'Razorpay') discountMultiplier -= 0.10;
    const finalPrice = bookingProduct.price * discountMultiplier;
    const netAmount = finalPrice * bookingQty;

    if (paymentMethod === 'Razorpay') {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setBookingError('Razorpay payment gateway failed to load. Please check your network.');
        return;
      }

      const options = {
        key: 'rzp_test_dummykey12345',
        amount: Math.round(netAmount * 100),
        currency: 'INR',
        name: 'Amanora Plaza',
        description: `Online Booking: ${bookingProduct.name}`,
        handler: function (response: any) {
          const payId = response.razorpay_payment_id || `pay_${Date.now()}`;
          const result = reserveProduct(bookingProduct.id, bookingQty, customerName.trim(), licensePlate.trim(), payId, 'Razorpay');
          if (result.success && result.booking) {
            setBookingSuccess(result.booking);
            setCustomerName('');
            setLicensePlate('');
            setBookingQty(1);
          } else {
            setBookingError(result.error || 'Failed to capture booking reservation.');
          }
        },
        prefill: {
          name: customerName,
          email: 'customer@amanoraplazamall.com',
          contact: '9876543210'
        },
        theme: {
          color: '#d4af37'
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } else {
      // In-store hold
      const result = reserveProduct(bookingProduct.id, bookingQty, customerName.trim(), licensePlate.trim(), undefined, 'In-Store');
      if (result.success && result.booking) {
        setBookingSuccess(result.booking);
        setCustomerName('');
        setLicensePlate('');
        setBookingQty(1);
      } else {
        setBookingError(result.error || 'Failed to complete reservation.');
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-white flex items-center">
            <ShoppingBag className="w-5 h-5 text-luxury-gold mr-2" />
            {t('shop.title')}
          </h2>
          <p className="text-xs text-luxury-textMuted mt-1">
            {t('shop.sub')}
          </p>
        </div>

        {/* View Switcher Toggles */}
        <div className="bg-luxury-darkCard p-1 rounded-lg border border-luxury-darkBorder flex self-start sm:self-auto space-x-1">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3 py-1.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 flex items-center ${
              activeTab === 'catalog'
                ? 'bg-luxury-gold text-black shadow-gold-glow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
            {t('shop.browse')}
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`px-3 py-1.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 flex items-center ${
              activeTab === 'reservations'
                ? 'bg-luxury-gold text-black shadow-gold-glow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Ticket className="w-3.5 h-3.5 mr-1.5" />
            {t('shop.myReservations')} ({productBookings.length})
          </button>
        </div>
      </div>

      {activeTab === 'catalog' ? (
        /* ================= BROWSE CATALOG VIEW ================= */
        <div className="space-y-6">
          {/* Geolocation Banner Promo */}
          <div className="bg-gradient-to-r from-luxury-gold/20 via-luxury-gold/5 to-transparent border border-luxury-gold/30 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-luxury-gold/15 rounded-xl text-luxury-gold animate-pulse">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">{t('shop.geoBannerTitle')}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                  {t('shop.geoBannerDesc')}
                </p>
              </div>
            </div>
            <span className="text-[9px] uppercase font-extrabold tracking-widest text-luxury-gold border border-luxury-gold/25 px-2.5 py-1 rounded bg-black/45">
              {t('shop.code')}: GEO-DISPATCH
            </span>
          </div>

          {/* Filters and Search toolbar */}
          <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input 
                type="text" 
                placeholder={t('shop.search')} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-luxury-darkBg border border-luxury-darkBorder rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-luxury-gold/50"
              />
            </div>

            {/* Category horizontal scrolling bar */}
            <div className="flex items-center space-x-2 overflow-x-auto max-w-full pb-1 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] uppercase font-bold tracking-wider transition-all duration-300 border ${
                    selectedCategory === cat
                      ? 'bg-luxury-gold text-black border-luxury-gold shadow-gold-glow'
                      : 'bg-luxury-darkCard/50 border-luxury-darkBorder text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(prod => {
              const isLowStock = prod.stock > 0 && prod.stock <= 3;
              const isOutOfStock = prod.stock === 0;

              return (
                <div 
                  key={prod.id}
                  className="border border-luxury-darkBorder rounded-2xl bg-luxury-darkCard p-5 flex flex-col justify-between space-y-4 hover:border-luxury-gold/40 hover:shadow-gold-glow transition-all duration-300 group"
                >
                  <div>
                    {/* Store Title Bar */}
                    <div className="flex justify-between items-center border-b border-luxury-darkBorder/40 pb-2 mb-3">
                      <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-luxury-gold flex items-center">
                        <Store className="w-3 h-3 mr-1" />
                        {prod.storeName.split(' ')[0]}
                      </span>
                      <span className="text-[9px] uppercase font-bold text-slate-500 bg-luxury-darkBg px-2 py-0.5 rounded border border-luxury-darkBorder">
                        {prod.category}
                      </span>
                    </div>

                    {/* Product Name */}
                    <h3 className="font-extrabold text-sm text-white group-hover:text-luxury-gold transition-colors">
                      {prod.name}
                    </h3>
                    
                    {/* Price and Stock Indicators */}
                    <div className="flex justify-between items-center mt-3.5">
                      <span className="text-base font-black text-white">
                        ₹{prod.price.toLocaleString()}
                      </span>

                      {/* Stock Badges */}
                      {isOutOfStock ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[8.5px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/25 uppercase">
                          {t('shop.outOfStock')}
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[8.5px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25 uppercase animate-pulse">
                          <AlertTriangle className="w-3 h-3 mr-0.5 text-amber-400" />
                          {language === 'en' ? `Only ${prod.stock} Left` : `केवल ${prod.stock} शेष`}
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-[8.5px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 uppercase">
                          {prod.stock} {t('shop.stock')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Reserve Button */}
                  <button
                    disabled={isOutOfStock}
                    onClick={() => {
                      setBookingProduct(prod);
                      setBookingSuccess(null);
                      setBookingError('');
                      setBookingQty(1);
                    }}
                    className={`w-full font-extrabold text-xs py-2 rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                      isOutOfStock 
                        ? 'bg-luxury-darkBorder text-slate-500 cursor-not-allowed'
                        : 'bg-luxury-darkCard border border-luxury-darkBorder text-luxury-gold hover:bg-luxury-gold hover:text-black hover:shadow-gold-glow'
                    }`}
                  >
                    <span>{t('shop.reserveBtn')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ================= MY RESERVATIONS VIEW ================= */
        <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-5 space-y-4">
          <div>
            <h3 className="font-extrabold text-white text-base">Active Visitor Bookings Ledger</h3>
            <p className="text-xs text-luxury-textMuted mt-0.5">Bring your booking Reference ID to the respective stores to complete checkout and pickup.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs text-slate-300">
              <thead>
                <tr className="border-b border-luxury-darkBorder/60 text-slate-500 uppercase tracking-widest text-[9px] font-bold">
                  <th className="py-2.5 px-3">Booking ID</th>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Retail Outlet</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Quantity</th>
                  <th className="py-2.5 px-3">Total Cost</th>
                  <th className="py-2.5 px-3">Discount Code</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-darkBorder/40">
                {productBookings.length > 0 ? (
                  productBookings.map(book => (
                    <tr key={book.id} className="hover:bg-luxury-darkCard/20 transition-all">
                      <td className="py-3 px-3 font-mono font-bold text-slate-400">{book.id}</td>
                      <td className="py-3 px-3 font-extrabold text-white">{book.productName}</td>
                      <td className="py-3 px-3 text-slate-300">
                        <span className="inline-flex items-center text-[10px] text-luxury-gold uppercase font-mono font-semibold">
                          <Store className="w-3.5 h-3.5 mr-1" />
                          {book.storeName}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400">{book.customerName}</td>
                      <td className="py-3 px-3 text-center text-white font-bold">{book.quantity}x</td>
                      <td className="py-3 px-3 font-black text-white">₹{book.total.toLocaleString()}</td>
                      <td className="py-3 px-3">
                        {book.isGeoDiscount ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] bg-luxury-gold/20 text-luxury-gold border border-luxury-gold/30 uppercase font-mono">
                            GEO-15% OFF
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">None</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {book.status === 'Reserved' ? (
                          <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/35 uppercase animate-pulse">Reserved</span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/35 uppercase">Picked Up</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 font-medium">
                      You have no online product reservations registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= ONLINE RESERVATION FORM DIALOG ================= */}
      {bookingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md border border-luxury-darkBorder bg-luxury-darkCard p-6 rounded-2xl glass-panel relative shadow-2xl">
            
            <button 
              onClick={() => {
                setBookingProduct(null);
                setBookingSuccess(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {bookingSuccess ? (
              /* Success view */
              <div className="flex flex-col items-center py-4 space-y-4 animate-fade-in">
                <div className="w-14 h-14 bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="font-extrabold text-white text-base">Reservation Registered!</h3>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Product Hold Locked</p>
                </div>

                <div className="w-full bg-luxury-darkBg border border-luxury-darkBorder p-4 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between border-b border-luxury-darkBorder/40 pb-2 mb-2">
                    <span className="text-slate-500 font-bold uppercase text-[9px]">Receipt Summary</span>
                    <span className="text-[9px] font-mono text-slate-400">{bookingSuccess.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Store:</span>
                    <span className="font-semibold text-luxury-gold font-mono">{bookingSuccess.storeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Item Name:</span>
                    <span className="font-semibold text-white">{bookingSuccess.productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Quantity:</span>
                    <span className="font-semibold text-slate-300">{bookingSuccess.quantity}x</span>
                  </div>
                  
                  {bookingSuccess.isGeoDiscount && (
                    <div className="flex justify-between text-luxury-gold">
                      <span>Smart Pickup Discount:</span>
                      <span className="font-bold">-₹{bookingSuccess.discount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between border-t border-luxury-darkBorder/40 pt-2 mt-2">
                    <span className="text-slate-400 font-bold">Total Bill:</span>
                    <span className="font-extrabold text-white text-sm">
                      ₹{bookingSuccess.total.toLocaleString()}
                    </span>
                  </div>
                </div>

                <p className="text-[10.5px] text-center text-slate-400 font-light leading-relaxed">
                  Your items will be held at <strong>{bookingSuccess.storeName}</strong> for up to 24 hours. Show this receipt reference code on pickup.
                </p>

                <button
                  onClick={() => setBookingProduct(null)}
                  className="w-full bg-luxury-gold hover:bg-luxury-gold-dark text-black font-extrabold text-xs py-2 rounded-lg shadow-gold-glow transition"
                >
                  Return to Catalog
                </button>
              </div>
            ) : (
              /* Booking Reservation Form view */
              <div className="space-y-4">
                <div className="border-b border-luxury-darkBorder/40 pb-3">
                  <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-luxury-gold">
                    Secure Product Reservation
                  </span>
                  <h3 className="font-extrabold text-white text-base">
                    Reserve "{bookingProduct.name}"
                  </h3>
                  <p className="text-xs text-luxury-textMuted mt-0.5 font-light">
                    Store Outlet: {bookingProduct.storeName} • Stock: {bookingProduct.stock} left
                  </p>
                </div>

                <form onSubmit={handleReserve} className="space-y-4">
                  {bookingError && (
                    <div className="p-2.5 rounded bg-luxury-rose/10 border border-luxury-rose/30 text-[11px] text-luxury-rose font-bold">
                      {bookingError}
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                      Customer Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Vikram Bajaj"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-luxury-darkBg border border-luxury-darkBorder rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-luxury-gold/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                        Select Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={bookingProduct.stock}
                        value={bookingQty}
                        onChange={(e) => setBookingQty(parseInt(e.target.value) || 1)}
                        className="w-full bg-luxury-darkBg border border-luxury-darkBorder rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-luxury-gold/50 font-bold font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                        Vehicle License Plate (Promo)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. MH-12-RS-9988"
                        value={licensePlate}
                        onChange={(e) => setLicensePlate(e.target.value)}
                        className="w-full bg-luxury-darkBg border border-luxury-darkBorder rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-luxury-gold/50 font-mono"
                      />
                    </div>
                  </div>

                  {/* Geolocation Verification Message */}
                  {licensePlate.trim() && (
                    <div className={`p-3 rounded-lg border transition-all duration-300 text-[11px] ${
                      hasGeoDiscount
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                        : 'bg-luxury-darkCard border-luxury-darkBorder text-slate-400'
                    }`}>
                      {hasGeoDiscount ? (
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1.5 font-bold">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span>Vehicle Triangulated! 15% Discount Approved</span>
                          </div>
                          <p className="text-[10px] leading-relaxed text-emerald-400/80">
                            Parking Slot: <strong>{activeVehicle.slotAllocation}</strong> • Active since {new Date(activeVehicle.timeIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-start space-x-1.5">
                          <Car className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                          <p className="leading-relaxed">
                            Plate not detected in current parking logs. Please verify license plate spelling, or register plate in <strong>Basement Parking</strong>.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payment Method Option Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                      Checkout Gateway Option
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('In-Store')}
                        className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all duration-300 ${
                          paymentMethod === 'In-Store'
                            ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-gold-glow'
                            : 'bg-luxury-darkBg border-luxury-darkBorder text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="font-extrabold text-[10px]">Hold & Pay In-Store</span>
                        <span className="text-[7.5px] text-slate-500 font-light mt-0.5">Hold items for 24h at outlet.</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('Razorpay')}
                        className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all duration-300 relative ${
                          paymentMethod === 'Razorpay'
                            ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-gold-glow'
                            : 'bg-luxury-darkBg border-luxury-darkBorder text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="absolute -top-2 right-2 bg-luxury-gold text-black font-black text-[7px] px-1 rounded animate-pulse">
                          EXTRA 10% OFF
                        </span>
                        <span className="font-extrabold text-[10px] flex items-center">
                          Razorpay Pre-pay
                        </span>
                        <span className="text-[7.5px] text-slate-500 font-light mt-0.5">Instant online secure card/UPI.</span>
                      </button>
                    </div>
                  </div>

                  {/* Bill Summary */}
                  <div className="bg-luxury-darkBg/60 border border-luxury-darkBorder/40 p-3 rounded-xl space-y-1.5 text-[11px]">
                    <div className="flex justify-between text-slate-500">
                      <span>Retail Base Price:</span>
                      <span>₹{(bookingProduct.price * bookingQty).toLocaleString()}</span>
                    </div>
                    {hasGeoDiscount && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Geolocation Discount (15%):</span>
                        <span>-₹{((bookingProduct.price * 0.15) * bookingQty).toLocaleString()}</span>
                      </div>
                    )}
                    {paymentMethod === 'Razorpay' && (
                      <div className="flex justify-between text-luxury-gold">
                        <span>Online Prepayment Promo (10%):</span>
                        <span>-₹{((bookingProduct.price * 0.10) * bookingQty).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-luxury-darkBorder/40 pt-1.5 mt-1 text-xs font-bold">
                      <span className="text-slate-300">Final Price to Pay:</span>
                      <span className="text-luxury-gold font-mono font-black text-sm">
                        ₹{Math.round(
                          (bookingProduct.price * (1.0 - (hasGeoDiscount ? 0.15 : 0) - (paymentMethod === 'Razorpay' ? 0.10 : 0))) * bookingQty
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setBookingProduct(null)}
                      className="flex-1 bg-luxury-darkBg border border-luxury-darkBorder text-slate-400 text-xs font-bold py-2 rounded-lg hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-luxury-gold hover:bg-luxury-gold-dark text-black font-extrabold text-xs py-2 rounded-lg shadow-gold-glow transition-colors"
                    >
                      Confirm Reservation
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
