import React, { useState, useMemo } from 'react';
import { useMall, type Store } from '../../context/MallContext';
import { 
  Sparkles, 
  Zap, 
  Car, 
  ShoppingBag, 
  Calendar, 
  Coffee, 
  Compass, 
  Plus, 
  Trash2, 
  Check, 
  Search, 
  Ticket, 
  ChevronRight, 
  Activity 
} from 'lucide-react';

export const VipConcierge: React.FC = () => {
  const {
    stores,
    parkingLogs,
    evReservations,
    handsFreeDeliveries,
    vipReservations,
    foodCourtCart,
    foodCourtOrders,
    tableReservations,
    bookEvSlot,
    requestValetDelivery,
    bookVipEvent,
    addToFoodCart,
    removeFromFoodCart,
    clearFoodCart,
    checkoutFoodCart,
    bookTableWithPreorder
  } = useMall();

  const [activeTab, setActiveTab] = useState<'itinerary' | 'ev' | 'findcar' | 'valet' | 'events' | 'food'>('itinerary');

  // ----------------------------------------------------
  // FEATURE 1: AI ITINERARY PLANNER STATES & CALCULATIONS
  // ----------------------------------------------------
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [showItinerary, setShowItinerary] = useState(false);

  const itineraryGoals = [
    { id: 'cinema', label: 'Watch an IMAX Movie', category: 'Entertainment' },
    { id: 'apparel', label: 'Buy Formal/Celebration Wear', category: 'Ethnicwear' },
    { id: 'grocery', label: 'Buy Gourmet Groceries', category: 'Hypermarket' },
    { id: 'dine', label: 'Fine Dining Dinner', category: 'Food & Dine' },
    { id: 'skincare', label: 'Luxury Cosmetic Consultation', category: 'Beauty & Skincare' },
    { id: 'watch', label: 'Swiss Watch Valuation', category: 'Watches' }
  ];

  const handleToggleGoal = (goalId: string) => {
    setShowItinerary(false);
    setSelectedGoals(prev => 
      prev.includes(goalId) ? prev.filter(id => id !== goalId) : [...prev, goalId]
    );
  };

  const calculatedItinerary = useMemo(() => {
    if (selectedGoals.length === 0) return null;
    
    // Resolve matching stores and their locations
    const steps: { store: Store; goalLabel: string; savings: string }[] = [];
    let totalEstimatedSavings = 0;

    selectedGoals.forEach(goalId => {
      const goal = itineraryGoals.find(g => g.id === goalId);
      if (!goal) return;

      const matchingStore = stores.find(s => s.category.toLowerCase() === goal.category.toLowerCase());
      if (matchingStore) {
        let savingsText = 'Complimentary consultation/VIP entry';
        if (matchingStore.offers && matchingStore.offers.length > 0) {
          const offer = matchingStore.offers[0];
          savingsText = `Save ${offer.discount} (Code: ${offer.code})`;
          
          // Calculate numerical savings for total
          const disc = offer.discount;
          if (disc.includes('%')) {
            totalEstimatedSavings += 450; // mock average savings
          } else if (disc.includes('₹')) {
            const num = parseInt(disc.replace(/[^0-9]/g, ''), 10);
            if (!isNaN(num)) totalEstimatedSavings += num;
          }
        }
        steps.push({
          store: matchingStore,
          goalLabel: goal.label,
          savings: savingsText
        });
      }
    });

    // Sort steps logically by floor (Lower Ground -> Ground -> First -> Second) for path optimization
    const floorOrder = { 'Lower Ground': 0, 'Ground': 1, 'First': 2, 'Second': 3 };
    steps.sort((a, b) => floorOrder[a.store.floor] - floorOrder[b.store.floor]);

    return {
      steps,
      totalSavings: totalEstimatedSavings
    };
  }, [selectedGoals, stores]);

  // ----------------------------------------------------
  // FEATURE 2: EV ECOSYSTEM STATES & ACTIONS
  // ----------------------------------------------------
  const [evBay, setEvBay] = useState('EV-01');
  const [evPlate, setEvPlate] = useState('');
  const [evTime, setEvTime] = useState('10:00 AM - 12:00 PM');
  const [evSuccess, setEvSuccess] = useState('');
  const [evError, setEvError] = useState('');

  const evBays = ['EV-01', 'EV-02', 'EV-03', 'EV-04'];
  const timeSlots = [
    '10:00 AM - 12:00 PM',
    '12:00 PM - 02:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM',
    '06:00 PM - 08:00 PM',
    '08:00 PM - 10:00 PM'
  ];

  const handleBookEv = (e: React.FormEvent) => {
    e.preventDefault();
    setEvSuccess('');
    setEvError('');

    if (!evPlate.trim()) {
      setEvError('Please enter your license plate number.');
      return;
    }

    const success = bookEvSlot(evBay, evPlate, evTime);
    if (success) {
      setEvSuccess(`EV charging bay ${evBay} successfully pre-booked for ${evPlate}!`);
      setEvPlate('');
    } else {
      setEvError(`Bay ${evBay} is already reserved for this slot. Please choose another.`);
    }
  };

  // ----------------------------------------------------
  // FEATURE 3: FIND MY CAR (AR NAVIGATION)
  // ----------------------------------------------------
  const [carPlateQuery, setCarPlateQuery] = useState('');
  const [activeCarPath, setActiveCarPath] = useState<{ plate: string; slot: string; type: string } | null>(null);
  const [arNavigationStep, setArNavigationStep] = useState(0);
  const [arFeedError, setArFeedError] = useState('');

  const handleSearchCar = (e: React.FormEvent) => {
    e.preventDefault();
    setArFeedError('');
    setActiveCarPath(null);
    setArNavigationStep(0);

    const plateClean = carPlateQuery.trim().toUpperCase();
    if (!plateClean) return;

    // First check real-time active parking logs
    const foundLog = parkingLogs.find(log => log.licensePlate.toUpperCase() === plateClean);
    if (foundLog) {
      setActiveCarPath({
        plate: foundLog.licensePlate,
        slot: foundLog.slotAllocation,
        type: foundLog.vehicleType
      });
    } else {
      // Simulate search query result for ticket numbers
      if (plateClean.startsWith('TKT-') || plateClean.length > 5) {
        setActiveCarPath({
          plate: plateClean,
          slot: 'Basement B - Zone 4 (Slot B-08)',
          type: '4W'
        });
      } else {
        setArFeedError('No active vehicle found with this plate. Try "MH-12-RS-9988" or enter ticket code "TKT-4921".');
      }
    }
  };

  const arDirections = [
    { text: 'Start at Central Atrium on Ground Floor. Walk towards Rolex Boutique.', arrow: 'straight' },
    { text: 'Locate the elevator next to Chanel Beauté and select Basement A.', arrow: 'right' },
    { text: 'Exit the lift. Follow the green glowing directional guides overhead.', arrow: 'left' },
    { text: 'Walk 15 meters straight towards Zone A-12.', arrow: 'straight' },
    { text: 'Arrive at Slot A-12! Your Mercedes-Benz EQ is directly ahead.', arrow: 'arrive' }
  ];

  // ----------------------------------------------------
  // FEATURE 4: HANDS-FREE VALET DELIVERIES
  // ----------------------------------------------------
  const [hfdStore, setHfdStore] = useState('');
  const [hfdValetCode, setHfdValetCode] = useState('');
  const [hfdLocation, setHfdLocation] = useState('Valet Car - Slot A-12');
  const [hfdSuccess, setHfdSuccess] = useState('');

  const activeBoutiques = useMemo(() => {
    return stores.filter(s => s.category !== 'Food & Dine' && s.category !== 'Entertainment');
  }, [stores]);

  const handleCreateHfd = (e: React.FormEvent) => {
    e.preventDefault();
    setHfdSuccess('');

    if (!hfdStore || !hfdValetCode.trim()) return;

    requestValetDelivery(hfdStore, hfdValetCode.toUpperCase(), hfdLocation);
    setHfdSuccess('Valet delivery requested successfully! A mall concierge will collect your bags shortly.');
    setHfdValetCode('');
  };

  // ----------------------------------------------------
  // FEATURE 5: VIP EVENTS RSVP
  // ----------------------------------------------------
  const [selectedEventId, setSelectedEventId] = useState('ann_3');
  const [userName, setUserName] = useState('');
  const [vipSeat, setVipSeat] = useState('VIP Row A - Seat 05');
  const [vipSuccess, setVipSuccess] = useState('');

  const upcomingVipEvents = [
    { id: 'ann_3', title: 'Amanora Summer Runway (Fashion Show)', date: 'June 20, 2026', desc: 'Haute couture runway show featuring front-row seat options and lounge dining.' },
    { id: 'ann_1', title: 'Luxury Gold Souk Bridal Exhibition', date: 'June 25, 2026', desc: 'Private consultation, champagne reception, and exclusive bridal showcase previews.' }
  ];

  const loadRazorpayScript = () => {
    return new Promise<boolean>((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleVipBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setVipSuccess('');

    if (!userName.trim()) return;

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      alert('Razorpay Checkout failed to load.');
      return;
    }

    const options = {
      key: 'rzp_test_dummykey12345',
      amount: 1500 * 100, // ₹1,500 ticket fee
      currency: 'INR',
      name: 'Amanora Plaza - VIP Concierge',
      description: 'VIP Event Front-Row RSVP Ticket Purchase',
      handler: function (response: any) {
        const payId = response.razorpay_payment_id || `pay_${Date.now()}`;
        bookVipEvent(selectedEventId, userName, 1, vipSeat, payId);
        setVipSuccess(`Front-row RSVP confirmed for ${userName}! Ticket Fee ₹1,500 Paid via Razorpay (ID: ${payId}). Digital pass generated.`);
        setUserName('');
      },
      prefill: {
        name: userName,
      },
      theme: {
        color: '#d4af37'
      }
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
  };

  const handleFoodCheckout = async () => {
    const total = foodCourtCart.reduce((sum, item) => sum + item.price * item.qty, 0);
    if (total <= 0) return;

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      alert('Razorpay Checkout failed to load.');
      return;
    }

    const options = {
      key: 'rzp_test_dummykey12345',
      amount: total * 100,
      currency: 'INR',
      name: 'Amanora Plaza - Unified Food Court',
      description: 'Unified Food Tray Checkout Payment',
      handler: function (response: any) {
        const payId = response.razorpay_payment_id || `pay_${Date.now()}`;
        checkoutFoodCart(payId);
      },
      prefill: {
        name: 'Food Court Customer',
      },
      theme: {
        color: '#d4af37'
      }
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
  };

  // ----------------------------------------------------
  // FEATURE 6: SMART FOOD COURT & RESTAURANT ORDERING
  // ----------------------------------------------------
  const [foodMenuFilter, setFoodMenuFilter] = useState<'all' | 'indigo' | 'pvr' | 'spar'>('all');
  const [tableRestaurant, setTableRestaurant] = useState('s12'); // Indigo Deli default
  const [tableGuests, setTableGuests] = useState(2);
  const [tableTime, setTableTime] = useState('08:00 PM');
  const [tableSuccess, setTableSuccess] = useState('');

  const foodMenus = [
    { id: 'fd_1', name: 'Artisanal White Truffle Pasta', price: 650, restaurant: 'Indigo Delicatessen', logo: 'INDIGO' },
    { id: 'fd_2', name: 'Wood-fired Pepperoni & Burrata Pizza', price: 550, restaurant: 'Indigo Delicatessen', logo: 'INDIGO' },
    { id: 'fd_3', name: 'IMAX Butter Popcorn Large', price: 290, restaurant: "PVR IMAX Director's Cut", logo: 'PVR' },
    { id: 'fd_4', name: 'Gourmet Grilled Chicken Club Sandwich', price: 420, restaurant: "PVR IMAX Director's Cut", logo: 'PVR' },
    { id: 'fd_5', name: 'International Cheese Board Assortment', price: 950, restaurant: 'Spar Luxury Hypermarket Cafe', logo: 'SPAR' }
  ];

  const filteredMenus = useMemo(() => {
    if (foodMenuFilter === 'all') return foodMenus;
    if (foodMenuFilter === 'indigo') return foodMenus.filter(m => m.restaurant.includes('Indigo'));
    if (foodMenuFilter === 'pvr') return foodMenus.filter(m => m.restaurant.includes('PVR'));
    return foodMenus.filter(m => m.restaurant.includes('Spar'));
  }, [foodMenuFilter]);

  const handleBookTable = (e: React.FormEvent) => {
    e.preventDefault();
    setTableSuccess('');

    // Preorder whatever is in the cart
    bookTableWithPreorder(tableRestaurant, tableGuests, tableTime, [...foodCourtCart]);
    const resName = stores.find(s => s.id === tableRestaurant)?.name || 'Fine Dining outlet';
    setTableSuccess(`Table for ${tableGuests} reserved at ${resName} for ${tableTime}! ${foodCourtCart.length > 0 ? 'Pre-ordered meals bundled.' : ''}`);
    clearFoodCart();
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      {/* Page Title Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-white flex items-center">
          <Sparkles className="w-5 h-5 text-luxury-gold mr-2" />
          VIP Luxury Concierge & Smart Services
        </h2>
        <p className="text-xs text-luxury-textMuted mt-1">
          Access premium valet delivery, book EV slots, plan itineraries, reservation tables, and get AR parking guidance.
        </p>
      </div>

      {/* Grid Menu Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 bg-luxury-darkCard p-1 rounded-xl border border-luxury-darkBorder">
        <button
          onClick={() => setActiveTab('itinerary')}
          className={`flex flex-col items-center justify-center p-3 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 ${
            activeTab === 'itinerary' ? 'bg-luxury-gold text-black shadow-gold-glow' : 'text-slate-400 hover:text-slate-200 hover:bg-luxury-darkCardLighter/40'
          }`}
        >
          <Compass className="w-4 h-4 mb-1" />
          AI Planner
        </button>

        <button
          onClick={() => setActiveTab('ev')}
          className={`flex flex-col items-center justify-center p-3 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 ${
            activeTab === 'ev' ? 'bg-luxury-gold text-black shadow-gold-glow' : 'text-slate-400 hover:text-slate-200 hover:bg-luxury-darkCardLighter/40'
          }`}
        >
          <Zap className="w-4 h-4 mb-1" />
          EV Booking
        </button>

        <button
          onClick={() => setActiveTab('findcar')}
          className={`flex flex-col items-center justify-center p-3 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 ${
            activeTab === 'findcar' ? 'bg-luxury-gold text-black shadow-gold-glow' : 'text-slate-400 hover:text-slate-200 hover:bg-luxury-darkCardLighter/40'
          }`}
        >
          <Car className="w-4 h-4 mb-1" />
          Find My Car
        </button>

        <button
          onClick={() => setActiveTab('valet')}
          className={`flex flex-col items-center justify-center p-3 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 ${
            activeTab === 'valet' ? 'bg-luxury-gold text-black shadow-gold-glow' : 'text-slate-400 hover:text-slate-200 hover:bg-luxury-darkCardLighter/40'
          }`}
        >
          <ShoppingBag className="w-4 h-4 mb-1" />
          Hands-Free
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`flex flex-col items-center justify-center p-3 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 ${
            activeTab === 'events' ? 'bg-luxury-gold text-black shadow-gold-glow' : 'text-slate-400 hover:text-slate-200 hover:bg-luxury-darkCardLighter/40'
          }`}
        >
          <Calendar className="w-4 h-4 mb-1" />
          VIP RSVP
        </button>

        <button
          onClick={() => setActiveTab('food')}
          className={`flex flex-col items-center justify-center p-3 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 ${
            activeTab === 'food' ? 'bg-luxury-gold text-black shadow-gold-glow' : 'text-slate-400 hover:text-slate-200 hover:bg-luxury-darkCardLighter/40'
          }`}
        >
          <Coffee className="w-4 h-4 mb-1" />
          Food Court
        </button>
      </div>

      {/* Dynamic Content Views */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Main Interface Console (2 Columns) */}
        <div className="xl:col-span-2 space-y-6">

          {/* TAB 1: AI SMART ITINERARY PLANNER */}
          {activeTab === 'itinerary' && (
            <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-6 space-y-6 animate-fade-in">
              <div className="border-b border-luxury-darkBorder/40 pb-3">
                <h3 className="text-base font-extrabold text-white flex items-center">
                  <Compass className="w-5 h-5 text-luxury-gold mr-2" />
                  AI Smart Itinerary Planner & Flash Coupons
                </h3>
                <p className="text-xs text-luxury-textMuted mt-0.5">Select activities and compute the most optimal route with active discounts.</p>
              </div>

              {/* Goal Checklist Selection */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-extrabold tracking-widest text-slate-400">Choose what you wish to accomplish today:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {itineraryGoals.map(goal => {
                    const isChecked = selectedGoals.includes(goal.id);
                    return (
                      <button
                        key={goal.id}
                        onClick={() => handleToggleGoal(goal.id)}
                        className={`flex items-center text-left p-3 rounded-xl border text-xs font-semibold transition-all ${
                          isChecked 
                            ? 'bg-luxury-gold/15 border-luxury-gold text-luxury-gold shadow-gold-glow' 
                            : 'bg-luxury-darkBg/60 border-luxury-darkBorder text-slate-300 hover:border-luxury-gold/30'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 transition-colors ${
                          isChecked ? 'bg-luxury-gold border-luxury-gold text-black' : 'border-slate-500'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <p className="font-bold">{goal.label}</p>
                          <span className="text-[9px] uppercase tracking-wider opacity-60 font-normal">{goal.category}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Calculate Action */}
              <div className="flex justify-between items-center pt-2">
                <p className="text-xs text-slate-400">
                  Selected Activities: <strong className="text-white">{selectedGoals.length}</strong>
                </p>
                <button
                  onClick={() => setShowItinerary(true)}
                  disabled={selectedGoals.length === 0}
                  className="bg-luxury-gold hover:bg-luxury-gold-dark text-black font-extrabold text-xs px-6 py-2 rounded-lg shadow-gold-glow disabled:opacity-30 transition-all"
                >
                  Generate Optimized Path
                </button>
              </div>

              {/* Render Itinerary Results */}
              {showItinerary && calculatedItinerary && (
                <div className="border border-luxury-gold/20 bg-luxury-gold/5 rounded-xl p-5 space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-luxury-gold/20 pb-3">
                    <span className="text-xs uppercase font-extrabold tracking-widest text-luxury-gold">Optimized Mall Route Guide</span>
                    <span className="text-xs font-black text-white">Estimated Savings: ₹{calculatedItinerary.totalSavings}</span>
                  </div>

                  <div className="relative border-l border-luxury-gold/30 ml-3.5 pl-5 space-y-5">
                    {calculatedItinerary.steps.map((step, idx) => (
                      <div key={idx} className="relative">
                        {/* Timeline bubble */}
                        <span className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-black border-2 border-luxury-gold flex items-center justify-center text-[8px] font-bold text-luxury-gold">
                          {idx + 1}
                        </span>
                        
                        <div className="space-y-0.5">
                          <h5 className="text-xs font-extrabold text-white flex items-center">
                            {step.store.name}
                            <span className="ml-2 text-[9px] font-bold uppercase tracking-wider text-luxury-gold bg-luxury-gold/15 px-1.5 py-0.2 rounded border border-luxury-gold/20">
                              {step.store.floor} • Room {step.store.roomNumber}
                            </span>
                          </h5>
                          <p className="text-[11px] text-slate-300 font-light">{step.goalLabel}</p>
                          <p className="text-[10px] text-emerald-400 font-semibold">{step.savings}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Simulated push notification flash discount */}
                  <div className="p-3.5 bg-pink-500/10 border border-pink-500/20 rounded-lg flex items-start space-x-3.5 animate-pulse mt-4">
                    <Sparkles className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[9px] uppercase font-bold text-pink-400 tracking-wider">Geo-Fenced Proximity Flash Deal</span>
                      <h6 className="text-xs font-extrabold text-white">You are passing Louis Vuitton Paris!</h6>
                      <p className="text-[10px] text-slate-300 font-light mt-0.5">Get a 10% flash discount code: <strong>LVPARIS10</strong> valid only for the next 15 minutes.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EV ECOSYSTEM PRE-BOOKING */}
          {activeTab === 'ev' && (
            <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-6 space-y-6 animate-fade-in">
              <div className="border-b border-luxury-darkBorder/40 pb-3">
                <h3 className="text-base font-extrabold text-white flex items-center">
                  <Zap className="w-5 h-5 text-luxury-gold mr-2" />
                  Pre-Book EV Fast Chargers
                </h3>
                <p className="text-xs text-luxury-textMuted mt-0.5">Reserve high-output DC charging bays in Basement A before your arrival.</p>
              </div>

              <form onSubmit={handleBookEv} className="space-y-4">
                {evError && <div className="p-2.5 rounded bg-luxury-rose/10 border border-luxury-rose/30 text-[11px] text-luxury-rose font-bold">{evError}</div>}
                {evSuccess && <div className="p-2.5 rounded bg-luxury-emerald/10 border border-luxury-emerald/30 text-[11px] text-luxury-emerald font-bold">{evSuccess}</div>}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Select Bay</label>
                    <select
                      value={evBay}
                      onChange={(e) => setEvBay(e.target.value)}
                      className="w-full bg-luxury-darkBg border border-luxury-darkBorder rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-luxury-gold/50"
                    >
                      {evBays.map(bay => (
                        <option key={bay} value={bay}>{bay} (Basement A)</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Time Slot</label>
                    <select
                      value={evTime}
                      onChange={(e) => setEvTime(e.target.value)}
                      className="w-full bg-luxury-darkBg border border-luxury-darkBorder rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-luxury-gold/50"
                    >
                      {timeSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">License Plate</label>
                    <input
                      type="text"
                      placeholder="e.g. MH-12-RS-9988"
                      value={evPlate}
                      onChange={(e) => setEvPlate(e.target.value)}
                      className="w-full bg-luxury-darkBg border border-luxury-darkBorder rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-luxury-gold/50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-luxury-gold hover:bg-luxury-gold-dark text-black font-extrabold text-xs py-2 rounded-lg shadow-gold-glow transition-all"
                >
                  Reserve EV Fast Charger Bay
                </button>
              </form>

              {/* Bay Status grid */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase font-extrabold tracking-widest text-slate-400">Bay Occupancy Status (Current Slot)</h4>
                <div className="grid grid-cols-4 gap-3">
                  {evBays.map(bay => {
                    const isReserved = evReservations.some(r => r.bayId === bay && r.status === 'Active');
                    return (
                      <div key={bay} className={`p-3 rounded-lg border text-center ${
                        isReserved ? 'bg-luxury-rose/5 border-luxury-rose/30' : 'bg-luxury-emerald/5 border-luxury-emerald/30'
                      }`}>
                        <span className="block text-xs font-bold text-slate-200">{bay}</span>
                        <span className={`text-[8px] uppercase font-extrabold mt-0.5 inline-block ${
                          isReserved ? 'text-luxury-rose' : 'text-luxury-emerald'
                        }`}>
                          {isReserved ? 'Reserved' : 'Available'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FIND MY CAR (AR PATHFINDER NAVIGATION) */}
          {activeTab === 'findcar' && (
            <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-6 space-y-6 animate-fade-in">
              <div className="border-b border-luxury-darkBorder/40 pb-3">
                <h3 className="text-base font-extrabold text-white flex items-center">
                  <Car className="w-5 h-5 text-luxury-gold mr-2" />
                  Find My Car (AR Pathfinder)
                </h3>
                <p className="text-xs text-luxury-textMuted mt-0.5">Input your license plate or ticket details to simulate high-tech spatial directions back to your vehicle.</p>
              </div>

              <form onSubmit={handleSearchCar} className="flex space-x-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Enter License Plate (e.g. MH-12-RS-9988) or Ticket Code..."
                    value={carPlateQuery}
                    onChange={(e) => setCarPlateQuery(e.target.value)}
                    className="w-full bg-luxury-darkBg border border-luxury-darkBorder rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-luxury-gold/50"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-luxury-gold text-black font-extrabold text-xs px-5 py-2 rounded-lg hover:bg-luxury-gold-dark transition-colors shadow-gold-glow"
                >
                  Locate Vehicle
                </button>
              </form>

              {arFeedError && <p className="text-xs text-luxury-rose font-bold">{arFeedError}</p>}

              {activeCarPath && (
                <div className="space-y-4">
                  <div className="p-3 bg-luxury-darkBg/60 border border-luxury-darkBorder rounded-lg flex justify-between text-xs">
                    <div>
                      <span className="block text-[10px] text-slate-500 font-bold uppercase">Vehicle Found</span>
                      <strong className="text-white font-mono">{activeCarPath.plate}</strong>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 font-bold uppercase">Allocated Terminal</span>
                      <strong className="text-luxury-gold">{activeCarPath.slot}</strong>
                    </div>
                  </div>

                  {/* AR Camera Pathfinder view simulator */}
                  <div className="relative h-[250px] rounded-xl overflow-hidden border border-luxury-darkBorder bg-slate-950 flex flex-col justify-between p-4">
                    {/* Simulated Camera static scanline lines */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.03)_50%,rgba(0,0,0,0.12)_50%)] bg-[size:100%_4px] pointer-events-none z-10" />

                    {/* Matrix corridor animation backdrop */}
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.2),transparent_60%)] flex justify-center items-center">
                      <div className="w-[180px] h-[180px] border border-dashed border-luxury-gold/30 rounded-full animate-spin" />
                    </div>

                    {/* HUD Overlay Top */}
                    <div className="z-10 flex justify-between text-[9px] monospace text-emerald-400 font-extrabold select-none">
                      <div className="flex items-center">
                        <Activity className="w-3.5 h-3.5 mr-1 text-emerald-400 animate-pulse" />
                        AR PATHFINDER ACTIVE (LIDAR)
                      </div>
                      <span>SIGNAL: STABLE (98.4%)</span>
                    </div>

                    {/* Big Arrow Indicator Center */}
                    <div className="z-10 flex flex-col items-center justify-center flex-1">
                      {arDirections[arNavigationStep].arrow === 'straight' && (
                        <span className="text-5xl text-luxury-gold animate-bounce">⬆️</span>
                      )}
                      {arDirections[arNavigationStep].arrow === 'right' && (
                        <span className="text-5xl text-luxury-gold animate-pulse">➡️</span>
                      )}
                      {arDirections[arNavigationStep].arrow === 'left' && (
                        <span className="text-5xl text-luxury-gold animate-pulse">⬅️</span>
                      )}
                      {arDirections[arNavigationStep].arrow === 'arrive' && (
                        <span className="text-5xl text-luxury-emerald animate-bounce">🚗</span>
                      )}
                      <p className="text-xs text-white font-bold bg-black/80 px-4 py-1.5 rounded-full border border-luxury-darkBorder mt-3 text-center max-w-[80%]">
                        {arDirections[arNavigationStep].text}
                      </p>
                    </div>

                    {/* HUD Overlay Bottom Controls */}
                    <div className="z-10 flex justify-between items-center text-[10px] pt-2 border-t border-luxury-darkBorder/40">
                      <span className="text-slate-400 font-bold">Step {arNavigationStep + 1} of {arDirections.length}</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setArNavigationStep(s => Math.max(0, s - 1))}
                          disabled={arNavigationStep === 0}
                          className="px-2 py-0.5 bg-luxury-darkCard border border-luxury-darkBorder rounded text-slate-300 disabled:opacity-30"
                        >
                          Prev
                        </button>
                        <button
                          onClick={() => setArNavigationStep(s => Math.min(arDirections.length - 1, s + 1))}
                          disabled={arNavigationStep === arDirections.length - 1}
                          className="px-2 py-0.5 bg-luxury-gold text-black font-extrabold rounded disabled:opacity-30"
                        >
                          Next Step
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: HANDS-FREE SHOPPING (VALET BAG DELIVERY) */}
          {activeTab === 'valet' && (
            <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-6 space-y-6 animate-fade-in">
              <div className="border-b border-luxury-darkBorder/40 pb-3">
                <h3 className="text-base font-extrabold text-white flex items-center">
                  <ShoppingBag className="w-5 h-5 text-luxury-gold mr-2" />
                  Hands-Free Shopping (Valet Bag Delivery)
                </h3>
                <p className="text-xs text-luxury-textMuted mt-0.5">Leave shopping bags at store counters. Concierges collect and deliver them directly to your car.</p>
              </div>

              <form onSubmit={handleCreateHfd} className="space-y-4">
                {hfdSuccess && <div className="p-2.5 rounded bg-luxury-emerald/10 border border-luxury-emerald/30 text-[11px] text-luxury-emerald font-bold">{hfdSuccess}</div>}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Pick-up Boutique</label>
                    <select
                      value={hfdStore}
                      onChange={(e) => setHfdStore(e.target.value)}
                      className="w-full bg-luxury-darkBg border border-luxury-darkBorder rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-luxury-gold/50"
                    >
                      <option value="">Select Store...</option>
                      {activeBoutiques.map(s => (
                        <option key={s.id} value={s.id}>{s.name} (Room {s.roomNumber})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Valet Ticket ID / Locker</label>
                    <input
                      type="text"
                      placeholder="e.g. MH-12-RS-9988"
                      value={hfdValetCode}
                      onChange={(e) => setHfdValetCode(e.target.value)}
                      className="w-full bg-luxury-darkBg border border-luxury-darkBorder rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-luxury-gold/50 placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Delivery Destination</label>
                    <select
                      value={hfdLocation}
                      onChange={(e) => setHfdLocation(e.target.value)}
                      className="w-full bg-luxury-darkBg border border-luxury-darkBorder rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-luxury-gold/50"
                    >
                      <option value="Valet Car - Slot A-12">Valet Car (Slot A-12)</option>
                      <option value="VIP Lounge Pickup Locker B5">VIP Lounge Locker B5</option>
                      <option value="Central Desk Front Counter">Central Concierge Desk</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!hfdStore || !hfdValetCode.trim()}
                  className="w-full bg-luxury-gold hover:bg-luxury-gold-dark text-black font-extrabold text-xs py-2 rounded-lg shadow-gold-glow disabled:opacity-30 transition-all"
                >
                  Authorize Concierge Bag Pick-Up
                </button>
              </form>

              {/* Active Deliveries tracker */}
              <div className="space-y-3.5 pt-2">
                <h4 className="text-xs uppercase font-extrabold tracking-widest text-slate-400">Your Concierge Delivery Status Tracker</h4>
                <div className="space-y-2">
                  {handsFreeDeliveries.map(hfd => {
                    const storeName = stores.find(s => s.id === hfd.storeId)?.name || 'Boutique';
                    return (
                      <div key={hfd.id} className="p-3.5 bg-luxury-darkBg/60 border border-luxury-darkBorder rounded-xl flex items-center justify-between text-xs">
                        <div className="space-y-1">
                          <h5 className="font-extrabold text-white">{storeName} Bag</h5>
                          <p className="text-[10px] text-slate-400">Destination: <strong className="text-slate-300">{hfd.location}</strong></p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2.5 py-0.5 rounded text-[9px] uppercase font-extrabold tracking-wider border ${
                            hfd.status === 'Delivered' 
                              ? 'bg-luxury-emerald/15 border-luxury-emerald/40 text-luxury-emerald' 
                              : hfd.status === 'En Route' 
                              ? 'bg-sky-500/15 border-sky-500/40 text-sky-400' 
                              : 'bg-luxury-gold/15 border-luxury-gold/40 text-luxury-gold'
                          }`}>
                            {hfd.status}
                          </span>
                          <span className="block text-[8px] text-slate-500 mt-1">{new Date(hfd.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    );
                  })}
                  {handsFreeDeliveries.length === 0 && (
                    <p className="text-xs italic text-slate-500 text-center py-4 border border-dashed border-luxury-darkBorder rounded-xl">No active concierge delivery requests.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: VIP EVENT RSVP & EVENTS */}
          {activeTab === 'events' && (
            <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-6 space-y-6 animate-fade-in">
              <div className="border-b border-luxury-darkBorder/40 pb-3">
                <h3 className="text-base font-extrabold text-white flex items-center">
                  <Calendar className="w-5 h-5 text-luxury-gold mr-2" />
                  VIP Lounge & Flagship Event RSVPs
                </h3>
                <p className="text-xs text-luxury-textMuted mt-0.5">Secure front-row seating and private lounge access for Amanora flagship exhibitions.</p>
              </div>

              {/* Event Listings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingVipEvents.map(evt => {
                  const isSelected = selectedEventId === evt.id;
                  return (
                    <button
                      key={evt.id}
                      onClick={() => { setSelectedEventId(evt.id); setVipSuccess(''); }}
                      className={`text-left p-4 rounded-xl border flex flex-col justify-between transition-all ${
                        isSelected 
                          ? 'bg-luxury-gold/10 border-luxury-gold shadow-gold-glow' 
                          : 'bg-luxury-darkBg/60 border-luxury-darkBorder hover:border-luxury-gold/30'
                      }`}
                    >
                      <div>
                        <span className="text-[9px] uppercase font-bold text-luxury-gold tracking-widest block">{evt.date}</span>
                        <h4 className="font-extrabold text-sm text-white mt-1 leading-tight">{evt.title}</h4>
                        <p className="text-[11px] text-slate-400 font-light mt-2 leading-relaxed line-clamp-3">{evt.desc}</p>
                      </div>
                      {isSelected && (
                        <span className="text-[9px] uppercase font-extrabold text-luxury-gold tracking-wider mt-3.5 flex items-center">
                          Selected Event
                          <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* RSVP Form */}
              <form onSubmit={handleVipBooking} className="space-y-4 pt-3 border-t border-luxury-darkBorder/40">
                {vipSuccess && <div className="p-2.5 rounded bg-luxury-emerald/10 border border-luxury-emerald/30 text-[11px] text-luxury-emerald font-bold">{vipSuccess}</div>}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">VIP Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="Enter Member Name..."
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full bg-luxury-darkBg border border-luxury-darkBorder rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-luxury-gold/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Seating tier</label>
                    <select
                      value={vipSeat}
                      onChange={(e) => setVipSeat(e.target.value)}
                      className="w-full bg-luxury-darkBg border border-luxury-darkBorder rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-luxury-gold/50"
                    >
                      <option value="VIP Row A - Seat 05">VIP Front Row A (Seating Slot 5)</option>
                      <option value="VIP Row B - Seat 12">VIP Front Row B (Seating Slot 12)</option>
                      <option value="Exclusive Lounge Access with Champagne Pass">Elite Lounge Pass + Champagne Vouchers</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!userName.trim()}
                  className="w-full bg-luxury-gold hover:bg-luxury-gold-dark text-black font-extrabold text-xs py-2 rounded-lg shadow-gold-glow disabled:opacity-30 transition-all"
                >
                  Book RSVP Front Row Seating
                </button>
              </form>

              {/* VIP Reservation log list */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs uppercase font-extrabold tracking-widest text-slate-400">Your Reserved Events</h4>
                <div className="space-y-2">
                  {vipReservations.map(res => {
                    const evtName = upcomingVipEvents.find(e => e.id === res.eventId)?.title || 'Runway Event';
                    return (
                      <div key={res.id} className="p-3.5 bg-luxury-darkBg/60 border border-luxury-darkBorder rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <h5 className="font-extrabold text-white flex items-center">
                            <Ticket className="w-3.5 h-3.5 text-luxury-gold mr-1.5" />
                            {evtName}
                          </h5>
                          <p className="text-[10px] text-slate-400 mt-1">Ticket Holder: <strong className="text-slate-200">{res.userName}</strong></p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-luxury-gold font-bold">{res.seatType}</span>
                          <span className="block text-[8px] text-slate-500 mt-1">RSVP Recorded</span>
                        </div>
                      </div>
                    );
                  })}
                  {vipReservations.length === 0 && (
                    <p className="text-xs italic text-slate-500 text-center py-4 border border-dashed border-luxury-darkBorder rounded-xl">No event RSVPs booked yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SMART FOOD COURT & RESTAURANT ORDERS */}
          {activeTab === 'food' && (
            <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-6 space-y-6 animate-fade-in">
              <div className="border-b border-luxury-darkBorder/40 pb-3">
                <h3 className="text-base font-extrabold text-white flex items-center">
                  <Coffee className="w-5 h-5 text-luxury-gold mr-2" />
                  Unified Food Court Cart & Table Pre-Orders
                </h3>
                <p className="text-xs text-luxury-textMuted mt-0.5">Order simultaneously from multiple premium restaurants in a single unified cart.</p>
              </div>

              {/* Menu Filter */}
              <div className="flex space-x-1.5 overflow-x-auto pb-1">
                <button
                  onClick={() => setFoodMenuFilter('all')}
                  className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider transition-colors shrink-0 ${
                    foodMenuFilter === 'all' ? 'bg-luxury-gold text-black' : 'bg-luxury-darkBg border border-luxury-darkBorder text-slate-400'
                  }`}
                >
                  All Menus
                </button>
                <button
                  onClick={() => setFoodMenuFilter('indigo')}
                  className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider transition-colors shrink-0 ${
                    foodMenuFilter === 'indigo' ? 'bg-luxury-gold text-black' : 'bg-luxury-darkBg border border-luxury-darkBorder text-slate-400'
                  }`}
                >
                  Indigo Deli
                </button>
                <button
                  onClick={() => setFoodMenuFilter('pvr')}
                  className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider transition-colors shrink-0 ${
                    foodMenuFilter === 'pvr' ? 'bg-luxury-gold text-black' : 'bg-luxury-darkBg border border-luxury-darkBorder text-slate-400'
                  }`}
                >
                  PVR IMAX Lounge
                </button>
                <button
                  onClick={() => setFoodMenuFilter('spar')}
                  className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider transition-colors shrink-0 ${
                    foodMenuFilter === 'spar' ? 'bg-luxury-gold text-black' : 'bg-luxury-darkBg border border-luxury-darkBorder text-slate-400'
                  }`}
                >
                  Spar Cafe
                </button>
              </div>

              {/* Food Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMenus.map(item => {
                  return (
                    <div key={item.id} className="p-4 bg-luxury-darkBg/60 border border-luxury-darkBorder rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <span className="text-[9px] font-extrabold text-luxury-gold uppercase tracking-wider">{item.restaurant}</span>
                        <h4 className="font-bold text-white mt-0.5">{item.name}</h4>
                        <span className="block font-black text-white mt-1">₹{item.price}</span>
                      </div>
                      <button
                        onClick={() => addToFoodCart({ name: item.name, price: item.price, restaurant: item.restaurant })}
                        className="p-1.5 bg-luxury-gold text-black rounded-lg hover:bg-luxury-gold-dark transition-colors shadow-gold-glow flex items-center justify-center shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Pre-order Table Reservation form */}
              <div className="p-4 bg-luxury-darkCardLighter rounded-xl border border-luxury-darkBorder space-y-4">
                <div className="border-b border-luxury-darkBorder/40 pb-2">
                  <h4 className="text-xs uppercase font-extrabold tracking-widest text-slate-300">Book Table & Bundle Pre-Orders</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-light">Fine-dining reservation with served food matching arrival time.</p>
                </div>

                <form onSubmit={handleBookTable} className="space-y-3">
                  {tableSuccess && <div className="p-2.5 rounded bg-luxury-emerald/10 border border-luxury-emerald/30 text-[11px] text-luxury-emerald font-bold">{tableSuccess}</div>}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-1">Outlet</label>
                      <select
                        value={tableRestaurant}
                        onChange={(e) => setTableRestaurant(e.target.value)}
                        className="w-full bg-luxury-darkBg border border-luxury-darkBorder rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-luxury-gold/50"
                      >
                        <option value="s12">Indigo Delicatessen</option>
                        <option value="s13">PVR Director's Cut Lounge</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-1">Guests</label>
                      <input
                        type="number"
                        min={1}
                        value={tableGuests}
                        onChange={(e) => setTableGuests(parseInt(e.target.value, 10))}
                        className="w-full bg-luxury-darkBg border border-luxury-darkBorder rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-1">Arrival Time</label>
                      <select
                        value={tableTime}
                        onChange={(e) => setTableTime(e.target.value)}
                        className="w-full bg-luxury-darkBg border border-luxury-darkBorder rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                      >
                        <option value="07:30 PM">07:30 PM</option>
                        <option value="08:00 PM">08:00 PM</option>
                        <option value="08:30 PM">08:30 PM</option>
                        <option value="09:00 PM">09:00 PM</option>
                        <option value="09:30 PM">09:30 PM</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-luxury-gold hover:bg-luxury-gold-dark text-black font-extrabold text-xs py-1.5 rounded-lg shadow-gold-glow transition-all"
                  >
                    Confirm Table Reservation {foodCourtCart.length > 0 ? `+ Bundle Cart (${foodCourtCart.length} Items)` : ''}
                  </button>
                </form>
              </div>

              {/* Active Reservations log */}
              {tableReservations.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-luxury-darkBorder/40">
                  <h4 className="text-xs uppercase font-extrabold tracking-widest text-slate-400">Reserved Fine-Dining Tables</h4>
                  <div className="space-y-2">
                    {tableReservations.map(res => {
                      const outletName = stores.find(s => s.id === res.restaurantId)?.name || 'Gourmet Restaurant';
                      return (
                        <div key={res.id} className="p-3.5 bg-luxury-darkBg/60 border border-luxury-darkBorder rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <h5 className="font-extrabold text-white">{outletName}</h5>
                            <p className="text-[10px] text-slate-400 mt-0.5">Guests: <strong className="text-slate-200">{res.guests}</strong> • Arrival: <strong className="text-luxury-gold">{res.timeSlot}</strong></p>
                            {res.preorders.length > 0 && (
                              <p className="text-[9px] text-emerald-400 font-semibold mt-1">Pre-ordered meals bundled ({res.preorders.length} items)</p>
                            )}
                          </div>
                          <span className="text-[8px] uppercase bg-luxury-emerald/15 border border-luxury-emerald/30 text-luxury-emerald px-2 py-0.5 rounded font-extrabold">Booked</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Unified Cart & Prep Tracker (1 Column) */}
        <div className="xl:col-span-1 space-y-6">

          {/* Unified Cross-Restaurant Cart widget */}
          <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-5 space-y-4">
            <div className="border-b border-luxury-darkBorder/40 pb-3 flex justify-between items-center">
              <div>
                <span className="text-[9px] uppercase font-bold tracking-widest text-luxury-gold">Multi-Outlet Cart</span>
                <h3 className="text-sm font-extrabold text-white">Cross-Restaurant Tray</h3>
              </div>
              {foodCourtCart.length > 0 && (
                <button
                  onClick={clearFoodCart}
                  className="text-[9px] uppercase font-extrabold text-luxury-rose hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Cart list items */}
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {foodCourtCart.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="max-w-[70%] space-y-0.5">
                    <span className="text-[8px] uppercase tracking-wider text-luxury-gold block">{item.restaurant}</span>
                    <strong className="text-white block font-medium leading-snug">{item.name}</strong>
                    <span className="text-[10px] text-slate-400">Qty: {item.qty} • ₹{item.price} each</span>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="font-extrabold text-white text-xs">₹{item.price * item.qty}</span>
                    <button
                      onClick={() => removeFromFoodCart(item.name, item.restaurant)}
                      className="text-slate-500 hover:text-luxury-rose transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {foodCourtCart.length === 0 && (
                <p className="text-xs italic text-slate-500 text-center py-6">Your unified food court tray is empty.</p>
              )}
            </div>

            {/* Totals and Checkout */}
            {foodCourtCart.length > 0 && (
              <div className="pt-3 border-t border-luxury-darkBorder/40 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Subtotal Price</span>
                  <strong className="text-white font-extrabold text-sm">
                    ₹{foodCourtCart.reduce((sum, item) => sum + item.price * item.qty, 0)}
                  </strong>
                </div>

                {activeTab !== 'food' && (
                  <div className="p-2.5 rounded bg-luxury-gold/5 border border-luxury-gold/20 text-[9px] text-slate-300 leading-normal">
                    💡 Go to <strong>Food Court</strong> tab to book table pre-orders or checkout directly.
                  </div>
                )}

                {activeTab === 'food' && (
                  <button
                    onClick={handleFoodCheckout}
                    className="w-full bg-luxury-gold hover:bg-luxury-gold-dark text-black font-extrabold text-xs py-2 rounded-lg shadow-gold-glow transition-all"
                  >
                    Place Order & Pay Unified Bill
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Real-time Order prep trackers */}
          <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-5 space-y-4">
            <div className="border-b border-luxury-darkBorder/40 pb-3">
              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400">Kitchen Display Logs</span>
              <h3 className="text-sm font-extrabold text-white">Live Food Order Status</h3>
            </div>

            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
              {foodCourtOrders.map(order => (
                <div key={order.id} className="p-3 bg-luxury-darkBg/60 border border-luxury-darkBorder rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center border-b border-luxury-darkBorder/40 pb-1.5">
                    <span className="font-mono text-[9px] text-slate-500 font-bold">ID: {order.id.split('_')[2]}</span>
                    <span className={`px-2 py-0.5 rounded-[4px] text-[8px] uppercase font-extrabold border ${
                      order.status === 'Ready' 
                        ? 'bg-luxury-emerald/15 border-luxury-emerald/40 text-luxury-emerald animate-pulse'
                        : order.status === 'Picked Up'
                        ? 'bg-slate-500/15 border-slate-500/40 text-slate-400'
                        : 'bg-luxury-gold/15 border-luxury-gold/40 text-luxury-gold animate-bounce'
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-[10px] text-slate-300">
                        <span className="truncate max-w-[80%] font-medium">{item.name} <code className="text-slate-500">x{item.qty}</code></span>
                        <span className="font-bold text-[9px] text-luxury-gold shrink-0">{item.restaurant.substring(0, 8)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-1.5 border-t border-dashed border-luxury-darkBorder/40 text-[9px] text-slate-400">
                    <span>Total: <strong>₹{order.total}</strong></span>
                    <span>Placed: {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
              {foodCourtOrders.length === 0 && (
                <p className="text-xs italic text-slate-500 text-center py-6">No active food preparation orders.</p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
