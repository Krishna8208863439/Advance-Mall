import React, { useState, useMemo } from 'react';
import { useMall } from '../../context/MallContext';
import { Info, Compass, HelpCircle } from 'lucide-react';

type FloorType = 'Lower Ground' | 'Ground' | 'First' | 'Second';

export const FloorMap: React.FC = () => {
  const { stores, rooms } = useMall();
  const [selectedFloor, setSelectedFloor] = useState<FloorType>('Ground');
  const [hoveredRoom, setHoveredRoom] = useState<number | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(30); // Default select room 30

  const floors: FloorType[] = ['Lower Ground', 'Ground', 'First', 'Second'];

  // Filter stores on active floor
  const floorStores = useMemo(() => {
    return stores.filter(s => s.floor === selectedFloor);
  }, [stores, selectedFloor]);

  // Grid coordinates mapping for 25 rooms on a floor (5x5 grid or customized rect locations)
  // Let's create an layout coordinate list for 25 rooms
  const mapLayout = useMemo(() => {
    const layout = [];
    const roomsStart = selectedFloor === 'Lower Ground' ? 1 
                      : selectedFloor === 'Ground' ? 26
                      : selectedFloor === 'First' ? 51
                      : 76;

    // We have 25 rooms: index 0 to 24
    // Top Row: 10 rooms (index 0 to 9)
    // Bottom Row: 10 rooms (index 10 to 19)
    // Anchored slots for utilities: 
    // Left: Restroom, Elevator
    // Right: ATM, Security desk
    // Middle: Wide corridor walkway

    for (let i = 0; i < 25; i++) {
      const roomNo = roomsStart + i;
      const store = floorStores.find(s => s.roomNumber === roomNo);
      
      let x: number;
      let y: number;
      let width = 72;
      let height = 65;

      if (i < 10) {
        // Top row
        x = 90 + i * 80;
        y = 30;
      } else if (i < 20) {
        // Bottom row
        x = 90 + (i - 10) * 80;
        y = 230;
      } else {
        // Center-right row or side kiosks
        x = 90 + (i - 20) * 120;
        y = 135;
        width = 100;
        height = 55;
      }

      layout.push({
        roomNumber: roomNo,
        x,
        y,
        width,
        height,
        store,
      });
    }
    return layout;
  }, [selectedFloor, floorStores]);

  // Get active selected room data
  const selectedRoomData = useMemo(() => {
    if (!selectedRoom) return null;
    const roomInfo = rooms.find(r => r.roomNumber === selectedRoom);
    const storeInfo = stores.find(s => s.roomNumber === selectedRoom);
    return {
      roomNumber: selectedRoom,
      tenant: roomInfo,
      store: storeInfo,
    };
  }, [selectedRoom, rooms, stores]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-white flex items-center">
            <Compass className="w-5 h-5 text-luxury-gold mr-2" />
            Interactive Floor Map
          </h2>
          <p className="text-xs text-luxury-textMuted mt-1">
            Browse floor arrangements, utilities, and tap individual units for boutique information.
          </p>
        </div>

        {/* Floor Switcher tabs */}
        <div className="bg-luxury-darkCard p-1 rounded-lg border border-luxury-darkBorder flex">
          {floors.map(f => (
            <button
              key={f}
              onClick={() => {
                setSelectedFloor(f);
                // Select first room of that floor by default
                const base = f === 'Lower Ground' ? 1 
                           : f === 'Ground' ? 26
                           : f === 'First' ? 51
                           : 76;
                setSelectedRoom(base);
              }}
              className={`px-3 py-1.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 ${
                selectedFloor === f
                  ? 'bg-luxury-gold text-black shadow-gold-glow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Main Floor Map Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* SVG Canvas Map (3 Columns on wide screens) */}
        <div className="xl:col-span-3 border border-luxury-darkBorder rounded-2xl glass-panel p-4 overflow-auto relative">
          
          {/* Map Legend Banner */}
          <div className="flex flex-wrap gap-4 mb-4 text-[10px] uppercase font-bold tracking-widest text-slate-400 border-b border-luxury-darkBorder/40 pb-3">
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 bg-luxury-gold/20 border border-luxury-gold/50 rounded" />
              <span>Premium Brand</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 bg-luxury-darkCard border border-luxury-darkBorder rounded" />
              <span>Vacant Space</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded" />
              <span>Restrooms (WC)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 bg-purple-500/10 border border-purple-500/30 rounded" />
              <span>Escalator/Lift</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 bg-sky-500/10 border border-sky-500/30 rounded" />
              <span>Express ATM</span>
            </div>
          </div>

          {/* SVG Map Container */}
          <div className="min-w-[900px] py-4">
            <svg 
              viewBox="0 0 920 330" 
              className="w-full h-auto text-slate-400 select-none"
            >
              {/* Walkway corridor corridor path */}
              <rect x="80" y="115" width="810" height="95" rx="8" fill="#0c111c" stroke="#1c2535" strokeWidth="1" />
              <text x="450" y="165" fill="#2c3c54" fontSize="11" fontWeight="800" letterSpacing="4" textAnchor="middle">
                MAIN LUXURY CORRIDOR WALKWAY
              </text>

              {/* Utility block: Left Side (Restrooms and Elevators) */}
              {/* WC */}
              <g>
                <rect x="15" y="30" width="60" height="95" rx="6" fill="rgba(16, 185, 129, 0.08)" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="1.5" />
                <text x="45" y="70" fill="#10b981" fontSize="10" fontWeight="bold" textAnchor="middle">WC</text>
                <text x="45" y="85" fill="#4ade80" fontSize="8" textAnchor="middle">RESTROOM</text>
              </g>
              {/* Lift */}
              <g>
                <rect x="15" y="200" width="60" height="95" rx="6" fill="rgba(168, 85, 247, 0.08)" stroke="rgba(168, 85, 247, 0.25)" strokeWidth="1.5" />
                <text x="45" y="240" fill="#a855f7" fontSize="10" fontWeight="bold" textAnchor="middle">LIFT</text>
                <text x="45" y="255" fill="#c084fc" fontSize="8" textAnchor="middle">ELEVATOR</text>
              </g>

              {/* Utility block: Right Side (ATM & Lounge) */}
              {/* ATM */}
              <g>
                <rect x="845" y="30" width="60" height="95" rx="6" fill="rgba(14, 165, 233, 0.08)" stroke="rgba(14, 165, 233, 0.25)" strokeWidth="1.5" />
                <text x="875" y="70" fill="#0ea5e9" fontSize="10" fontWeight="bold" textAnchor="middle">ATM</text>
                <text x="875" y="85" fill="#38bdf8" fontSize="8" textAnchor="middle">EXPRESS</text>
              </g>
              {/* Lounge */}
              <g>
                <rect x="845" y="200" width="60" height="95" rx="6" fill="rgba(212, 175, 55, 0.08)" stroke="rgba(212, 175, 55, 0.25)" strokeWidth="1.5" />
                <text x="875" y="240" fill="#d4af37" fontSize="10" fontWeight="bold" textAnchor="middle">VIP</text>
                <text x="875" y="255" fill="#f3e5ab" fontSize="8" textAnchor="middle">LOUNGE</text>
              </g>

              {/* Render 25 Rooms */}
              {mapLayout.map((cell) => {
                const isHovered = hoveredRoom === cell.roomNumber;
                const isSelected = selectedRoom === cell.roomNumber;
                const isOccupied = !!cell.store;

                // Color configuration based on status
                let fill = 'rgba(21, 28, 44, 0.6)';
                let stroke = 'rgba(35, 46, 68, 0.8)';
                let strokeWidth = '1';

                if (isOccupied) {
                  fill = isSelected 
                    ? 'rgba(212, 175, 55, 0.25)' 
                    : isHovered 
                    ? 'rgba(212, 175, 55, 0.15)' 
                    : 'rgba(212, 175, 55, 0.08)';
                  stroke = isSelected 
                    ? '#d4af37' 
                    : isHovered 
                    ? 'rgba(212, 175, 55, 0.8)' 
                    : 'rgba(212, 175, 55, 0.4)';
                  strokeWidth = isSelected ? '2' : '1.2';
                } else {
                  if (isSelected) {
                    fill = 'rgba(255, 255, 255, 0.08)';
                    stroke = '#ffffff';
                    strokeWidth = '1.8';
                  } else if (isHovered) {
                    fill = 'rgba(255, 255, 255, 0.04)';
                    stroke = 'rgba(255, 255, 255, 0.4)';
                  }
                }

                return (
                  <g 
                    key={cell.roomNumber}
                    className="cursor-pointer transition-all duration-300"
                    onMouseEnter={() => setHoveredRoom(cell.roomNumber)}
                    onMouseLeave={() => setHoveredRoom(null)}
                    onClick={() => setSelectedRoom(cell.roomNumber)}
                  >
                    {/* Room Box */}
                    <rect
                      x={cell.x}
                      y={cell.y}
                      width={cell.width}
                      height={cell.height}
                      rx="5"
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                      className="transition-all duration-300"
                    />

                    {/* Room number indicator */}
                    <text
                      x={cell.x + 8}
                      y={cell.y + 16}
                      fill={isOccupied ? '#d4af37' : '#475569'}
                      fontSize="9"
                      fontWeight="bold"
                    >
                      #{cell.roomNumber}
                    </text>

                    {/* Occupant Shop Name Label */}
                    {isOccupied ? (
                      <g>
                        <text
                          x={cell.x + cell.width / 2}
                          y={cell.y + cell.height / 2 + 5}
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                          className="font-sans"
                        >
                          {cell.store!.name.split(' ')[0]}
                        </text>
                        <text
                          x={cell.x + cell.width / 2}
                          y={cell.y + cell.height / 2 + 16}
                          fill="#d4af37"
                          fontSize="7"
                          fontWeight="normal"
                          textAnchor="middle"
                          letterSpacing="0.5"
                        >
                          {cell.store!.category.substring(0, 10)}
                        </text>
                      </g>
                    ) : (
                      <text
                        x={cell.x + cell.width / 2}
                        y={cell.y + cell.height / 2 + 5}
                        fill="#334155"
                        fontSize="8"
                        textAnchor="middle"
                      >
                        Vacant
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Selected Room Details Panel (1 Column) */}
        <div className="xl:col-span-1">
          {selectedRoomData ? (
            <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-5 h-full flex flex-col justify-between space-y-4">
              <div className="space-y-4 animate-fade-in">
                {/* Title */}
                <div className="flex items-start justify-between border-b border-luxury-darkBorder/40 pb-3">
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-widest text-luxury-gold">
                      Unit Location Profile
                    </span>
                    <h3 className="text-lg font-extrabold text-white">
                      Space Room #{selectedRoomData.roomNumber}
                    </h3>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase bg-luxury-darkBorder/60 text-slate-300 px-2 py-0.5 rounded border border-luxury-darkBorder/50">
                    {selectedFloor}
                  </span>
                </div>

                {/* Details logic */}
                {selectedRoomData.store ? (
                  <div className="space-y-4">
                    {/* Brand details */}
                    <div>
                      <h4 className="text-sm font-extrabold text-white">
                        {selectedRoomData.store.name}
                      </h4>
                      <p className="text-[10px] text-luxury-gold font-bold uppercase tracking-wider mt-0.5">
                        Category: {selectedRoomData.store.category}
                      </p>
                      <p className="text-xs text-slate-300 leading-relaxed font-light mt-2">
                        {selectedRoomData.store.description}
                      </p>
                    </div>

                    {/* Meta stats */}
                    <div className="grid grid-cols-2 gap-3 bg-luxury-darkBg/50 p-3 rounded-lg border border-luxury-darkBorder/30 text-[10px] text-slate-300">
                      <div>
                        <span className="block text-slate-500 font-bold uppercase mb-0.5">Hours</span>
                        <span className="font-semibold">{selectedRoomData.store.hours}</span>
                      </div>
                      <div>
                        <span className="block text-slate-500 font-bold uppercase mb-0.5">Contact</span>
                        <span className="font-semibold">{selectedRoomData.store.contact}</span>
                      </div>
                    </div>

                    {/* Offers details */}
                    {selectedRoomData.store.offers && selectedRoomData.store.offers.length > 0 && (
                      <div className="bg-luxury-gold/5 border border-luxury-gold/20 p-3 rounded-lg space-y-1">
                        <span className="text-[9px] font-extrabold uppercase text-luxury-gold tracking-widest block">
                          Active Store Offer
                        </span>
                        <p className="text-xs font-bold text-slate-200">
                          {selectedRoomData.store.offers[0].title}
                        </p>
                        <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1">
                          <span>Code: <code className="bg-luxury-darkBg px-1 py-0.2 rounded text-luxury-gold font-mono font-bold text-[9px]">{selectedRoomData.store.offers[0].code}</code></span>
                          <span>Expires: {selectedRoomData.store.offers[0].expires}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // If vacant, show leasing details
                  <div className="space-y-4 py-4 text-center">
                    <span className="text-4xl block">🏢</span>
                    <div className="space-y-1">
                      <h4 className="text-sm font-extrabold text-slate-200">Room is Available for Lease</h4>
                      <p className="text-xs text-slate-500">
                        This retail unit is currently vacant and open for tenant applications.
                      </p>
                    </div>

                    <div className="bg-luxury-darkBg/60 p-3 rounded-lg border border-luxury-darkBorder text-left space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Area Category:</span>
                        <span className="font-semibold text-slate-300">{selectedRoomData.tenant?.floor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Suggested Rent:</span>
                        <span className="font-bold text-luxury-gold">₹{selectedRoomData.tenant?.monthlyRent.toLocaleString()}/mo</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Informative Helper Card */}
              <div className="p-3 bg-luxury-darkCardLighter rounded-lg border border-luxury-darkBorder/40 text-[10px] text-slate-400 flex items-start space-x-2">
                <Info className="w-3.5 h-3.5 text-luxury-gold shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Go to <strong className="text-slate-300">Admin Control Panel</strong> to onboard new brands or update details for any room (1 to 100).
                </p>
              </div>
            </div>
          ) : (
            <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-5 h-full flex flex-col justify-center items-center text-center text-slate-500 space-y-2">
              <HelpCircle className="w-8 h-8 text-luxury-darkBorder" />
              <p className="text-xs font-semibold text-slate-400">Select a retail space room on the map to view details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
