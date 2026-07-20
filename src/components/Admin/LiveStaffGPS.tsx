import React, { useState, useEffect } from 'react';
import { useMall } from '../../context/MallContext';
import { Radio, MapPin, Play, Pause, AlertOctagon, CheckCircle2, Send } from 'lucide-react';

interface StaffPin {
  id: string;
  name: string;
  role: string;
  zone: string;
  floor: number;
  x: number; // Percentage on map
  y: number; // Percentage on map
  battery: number;
  isSos: boolean;
  status: 'Patrolling' | 'Stationary' | 'Responding';
}

export const LiveStaffGPS: React.FC = () => {
  const { addActivityLog } = useMall();
  const [selectedFloor, setSelectedFloor] = useState<number>(0); // 0 = LG, 1 = G, 2 = 1st, 3 = 2nd
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayTime, setReplayTime] = useState(100); // 0 to 100%
  const [activeSosStaffId, setActiveSosStaffId] = useState<string | null>(null);

  // Task Dispatcher state
  const [dispatchTaskTitle, setDispatchTaskTitle] = useState('');
  const [dispatchStaffId, setDispatchStaffId] = useState('');
  const [dispatchSuccess, setDispatchSuccess] = useState(false);

  const [pins, setPins] = useState<StaffPin[]>([
    { id: 'emp_1', name: 'Shankar Patil', role: 'Security Lead', zone: 'North Atrium', floor: 1, x: 35, y: 42, battery: 88, isSos: false, status: 'Patrolling' },
    { id: 'emp_2', name: 'Amol Shinde', role: 'Security', zone: 'Gold Souk Aisle', floor: 1, x: 68, y: 30, battery: 94, isSos: false, status: 'Stationary' },
    { id: 'emp_3', name: 'Sunita Gavade', role: 'Customer Desk', zone: 'Information Kiosk', floor: 1, x: 50, y: 55, battery: 76, isSos: false, status: 'Stationary' },
    { id: 'emp_4', name: 'Ramesh Sawant', role: 'Facilities', zone: 'HVAC Duct B2', floor: 0, x: 22, y: 70, battery: 62, isSos: false, status: 'Patrolling' },
    { id: 'emp_6', name: 'Vikram Phalke', role: 'Security', zone: 'Cinema Corridor', floor: 3, x: 80, y: 25, battery: 51, isSos: false, status: 'Responding' }
  ]);

  // Replay animation effect
  useEffect(() => {
    if (!isReplaying) return;
    const interval = setInterval(() => {
      setReplayTime(prev => {
        if (prev <= 0) {
          setIsReplaying(false);
          return 100;
        }
        return prev - 5;
      });
    }, 300);
    return () => clearInterval(interval);
  }, [isReplaying]);

  const handleTriggerSos = (staffId: string) => {
    setPins(prev => prev.map(p => p.id === staffId ? { ...p, isSos: !p.isSos, status: 'Responding' } : p));
    const target = pins.find(p => p.id === staffId);
    if (target) {
      setActiveSosStaffId(target.isSos ? null : staffId);
      addActivityLog('SOS Alert Triggered', `Emergency SOS signal received from ${target.name} at ${target.zone}`, 'Admin');
    }
  };

  const handleDispatchTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchTaskTitle.trim() || !dispatchStaffId) return;

    const staff = pins.find(p => p.id === dispatchStaffId);
    addActivityLog('Task Dispatched', `Assigned task "${dispatchTaskTitle}" to ${staff?.name} in Zone: ${staff?.zone}`, 'Admin');
    setDispatchSuccess(true);
    setDispatchTaskTitle('');
    setTimeout(() => setDispatchSuccess(false), 3000);
  };

  const filteredPins = pins.filter(p => p.floor === selectedFloor);

  return (
    <div className="space-y-6 text-slate-100 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-luxury-darkBorder pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center">
            <Radio className="w-6 h-6 text-luxury-gold mr-2 animate-pulse" />
            Live Staff GPS & Indoor Radar
          </h2>
          <p className="text-xs text-luxury-textMuted mt-1">
            Real-time coordinates, floor positioning, battery metrics, movement history replay, and nearby task dispatching.
          </p>
        </div>

        {/* Floor selector */}
        <div className="flex bg-luxury-darkCard p-1 rounded-xl border border-luxury-darkBorder space-x-1">
          {['Lower Ground', 'Ground Floor', 'First Floor', 'Second Floor'].map((label, idx) => (
            <button
              key={label}
              onClick={() => setSelectedFloor(idx)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase transition-all ${
                selectedFloor === idx
                  ? 'bg-luxury-gold text-black shadow-gold-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Emergency SOS Banner if triggered */}
      {activeSosStaffId && (
        <div className="p-4 rounded-xl bg-rose-500/20 border-2 border-rose-500 text-rose-300 flex items-center justify-between animate-bounce">
          <div className="flex items-center space-x-3">
            <AlertOctagon className="w-6 h-6 text-rose-400 shrink-0" />
            <div>
              <span className="font-extrabold text-sm uppercase block">🚨 EMERGENCY SOS ALARM ACTIVE</span>
              <span className="text-xs">
                Staff member {pins.find(p => p.id === activeSosStaffId)?.name} pressed Panic Button at Zone: {pins.find(p => p.id === activeSosStaffId)?.zone}
              </span>
            </div>
          </div>
          <button
            onClick={() => handleTriggerSos(activeSosStaffId)}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition"
          >
            Acknowledge & Mute SOS
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Map Radar Viewport */}
        <div className="lg:col-span-8 border border-luxury-darkBorder rounded-2xl glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-luxury-darkBorder/40 pb-3">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-luxury-gold" />
              <h3 className="font-extrabold text-white text-sm">
                Floor {selectedFloor === 0 ? 'LG' : selectedFloor === 1 ? 'G' : selectedFloor === 2 ? 'L1' : 'L2'} Interactive Radar
              </h3>
            </div>

            {/* Replay controller */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsReplaying(!isReplaying)}
                className="px-3 py-1 bg-luxury-darkBg hover:bg-luxury-darkCardLighter border border-luxury-darkBorder rounded text-[10px] font-bold text-luxury-gold flex items-center"
              >
                {isReplaying ? <Pause className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
                {isReplaying ? 'Pause Replay' : 'Replay Movement Trail'}
              </button>
              <span className="text-[10px] font-mono text-slate-400">T: {replayTime}%</span>
            </div>
          </div>

          {/* SVG Map Layout Container */}
          <div className="relative w-full aspect-[16/9] bg-luxury-darkBg rounded-xl border border-luxury-darkBorder overflow-hidden p-4">
            {/* Grid background lines */}
            <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#d4af37" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Simulated Zones */}
            <div className="absolute inset-4 border border-luxury-gold/30 rounded-lg p-2 pointer-events-none flex flex-col justify-between text-[10px] text-slate-500 font-mono">
              <div className="flex justify-between">
                <span>ZONE-NORTH (LUXURY BAY)</span>
                <span>ZONE-EAST (FOOD COURT)</span>
              </div>
              <div className="flex justify-between">
                <span>ZONE-WEST (AUTOMOBILE)</span>
                <span>ZONE-SOUTH (ATRIUM)</span>
              </div>
            </div>

            {/* Render Staff Pins */}
            {filteredPins.map(pin => {
              // Adjust position based on replay time for visual motion effect
              const computedX = isReplaying ? pin.x + (Math.sin(replayTime * 0.1) * 5) : pin.x;
              const computedY = isReplaying ? pin.y + (Math.cos(replayTime * 0.1) * 5) : pin.y;

              return (
                <div
                  key={pin.id}
                  style={{ left: `${computedX}%`, top: `${computedY}%` }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-20 cursor-pointer"
                >
                  <div className="relative flex items-center justify-center">
                    {/* Pulse Ring */}
                    <span className={`absolute w-8 h-8 rounded-full animate-ping opacity-75 ${pin.isSos ? 'bg-rose-500' : 'bg-luxury-gold/50'}`} />
                    
                    {/* Radar Marker */}
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-[9px] shadow-lg transition-transform group-hover:scale-125 ${
                      pin.isSos
                        ? 'bg-rose-600 border-white text-white'
                        : pin.status === 'Responding'
                        ? 'bg-amber-500 border-black text-black'
                        : 'bg-luxury-gold border-black text-black'
                    }`}>
                      {pin.name.substring(0, 1)}
                    </div>
                  </div>

                  {/* Hover Tooltip */}
                  <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-black/90 backdrop-blur-md border border-luxury-gold p-2.5 rounded-lg text-[10px] text-white shadow-2xl z-30 pointer-events-none">
                    <span className="font-extrabold text-luxury-gold block">{pin.name}</span>
                    <p className="text-slate-300 font-mono">{pin.role} • {pin.zone}</p>
                    <div className="flex justify-between items-center mt-1 text-[9px]">
                      <span>Battery: {pin.battery}%</span>
                      <span className="uppercase text-emerald-400">{pin.status}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredPins.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs font-mono">
                No active staff pins currently registered on this floor level.
              </div>
            )}
          </div>
        </div>

        {/* Right: Staff Roster & Task Dispatcher */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quick Task Dispatcher */}
          <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-5 space-y-3">
            <h3 className="font-extrabold text-white text-sm border-b border-luxury-darkBorder/40 pb-2 flex items-center">
              <Send className="w-4 h-4 text-luxury-gold mr-1.5" />
              Nearby Task Dispatcher
            </h3>

            {dispatchSuccess && (
              <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1.5 shrink-0" />
                Task Dispatched to Crew Member!
              </div>
            )}

            <form onSubmit={handleDispatchTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Task Title / Instruction
                </label>
                <input
                  type="text"
                  placeholder="e.g. Inspect Escalator B Spill"
                  value={dispatchTaskTitle}
                  onChange={(e) => setDispatchTaskTitle(e.target.value)}
                  className="w-full bg-luxury-darkBg border border-luxury-darkBorder rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-luxury-gold"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Assign Nearby Staff
                </label>
                <select
                  value={dispatchStaffId}
                  onChange={(e) => setDispatchStaffId(e.target.value)}
                  className="w-full bg-luxury-darkBg border border-luxury-darkBorder rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-luxury-gold"
                >
                  <option value="">Select Staff Member...</option>
                  {pins.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.role} - {p.zone})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-luxury-gold hover:bg-luxury-gold-dark text-black font-extrabold py-2 rounded-lg shadow-gold-glow transition"
              >
                Dispatch Task Now
              </button>
            </form>
          </div>

          {/* Active Staff List */}
          <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-5 space-y-3">
            <h3 className="font-extrabold text-white text-sm border-b border-luxury-darkBorder/40 pb-2">
              Staff GPS Radar Roster
            </h3>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {pins.map(p => (
                <div key={p.id} className="p-3 bg-luxury-darkBg border border-luxury-darkBorder rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-extrabold text-white block">{p.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{p.zone} • Batt: {p.battery}%</span>
                  </div>

                  <button
                    onClick={() => handleTriggerSos(p.id)}
                    className={`px-2 py-1 text-[9px] font-bold rounded uppercase transition ${
                      p.isSos
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-luxury-darkCard border border-luxury-darkBorder text-slate-300 hover:text-rose-400'
                    }`}
                  >
                    {p.isSos ? 'SOS ACTIVE' : 'Trigger SOS'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
