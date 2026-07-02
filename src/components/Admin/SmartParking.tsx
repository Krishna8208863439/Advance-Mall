import React, { useState, useEffect, useMemo } from 'react';
import { useMall } from '../../context/MallContext';
import { Car, Bike, Plus, Key } from 'lucide-react';

// Live duration renderer helper
const ElapsedTime: React.FC<{ timeInISO: string }> = ({ timeInISO }) => {
  const [elapsed, setElapsed] = useState(() => {
    const diff = Date.now() - new Date(timeInISO).getTime();
    if (diff <= 0) return '0m';
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return hrs > 0 ? `${hrs}h ${remainingMins}m` : `${remainingMins}m`;
  });

  useEffect(() => {
    const calc = () => {
      const diff = Date.now() - new Date(timeInISO).getTime();
      if (diff <= 0) return '0m';
      const mins = Math.floor(diff / 60000);
      const hrs = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return hrs > 0 ? `${hrs}h ${remainingMins}m` : `${remainingMins}m`;
    };
    
    const interval = setInterval(() => {
      setElapsed(calc());
    }, 10000); // update every 10 seconds

    return () => clearInterval(interval);
  }, [timeInISO]);

  return <span>{elapsed}</span>;
};

export const SmartParking: React.FC = () => {
  const { parkingLogs, registerVehicle, checkoutVehicle } = useMall();

  // Form Fields
  const [plate, setPlate] = useState('');
  const [type, setType] = useState<'2W' | '4W'>('4W');
  const [slot, setSlot] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Capacity definitions
  const totalSlots = 100;
  const activeCount = parkingLogs.length;
  const availableSpaces = totalSlots - activeCount;

  // Form Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Validations
    if (!plate.trim()) {
      setFormError('License Plate number is required.');
      return;
    }
    // Simple format plate MH-12-XX-1234 or similar
    const cleanPlate = plate.trim().toUpperCase();
    
    if (!slot.trim()) {
      setFormError('Bay/Slot allocation is required.');
      return;
    }
    const cleanSlot = slot.trim().toUpperCase();

    // Register vehicle
    const success = registerVehicle({
      licensePlate: cleanPlate,
      vehicleType: type,
      slotAllocation: cleanSlot
    });

    if (success) {
      setFormSuccess(`Vehicle ${cleanPlate} registered at Slot ${cleanSlot}`);
      setPlate('');
      setSlot('');
    } else {
      setFormError('Registration failed. Slot already occupied or license plate duplicate.');
    }
  };

  const [nowTime, setNowTime] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNowTime(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Total elapsed parked hours calculations (summed up for all parked cars)
  const totalParkedHours = useMemo(() => {
    let totalHrs = 0;
    parkingLogs.forEach(log => {
      const diff = nowTime - new Date(log.timeIn).getTime();
      const hrs = diff / (3600000); // hours decimal
      if (hrs > 0) totalHrs += hrs;
    });
    return Math.round(totalHrs * 10) / 10;
  }, [parkingLogs, nowTime]);

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      {/* Page Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-white flex items-center">
          <Car className="w-5 h-5 text-luxury-gold mr-2" />
          Smart Vehicle Parking System
        </h2>
        <p className="text-xs text-luxury-textMuted mt-1">
          Monitor real-time inbound logs, assign terminal slots, and execute checkouts.
        </p>
      </div>

      {/* Live Counter Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Allocated Slots Card */}
        <div className="p-4 rounded-xl border border-luxury-darkBorder bg-luxury-darkCard/40 flex items-start justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest mb-1">Allocated Bays</span>
            <p className="text-xl font-extrabold text-white">{activeCount} <span className="text-xs font-normal text-slate-400">/ {totalSlots} slots</span></p>
            <span className="text-[10px] text-slate-500 mt-1 block">Active parked vehicles</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-luxury-gold mt-1 animate-pulse" />
        </div>

        {/* Available Slots Card */}
        <div className="p-4 rounded-xl border border-luxury-darkBorder bg-luxury-darkCard/40 flex items-start justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest mb-1">Available Bays</span>
            <p className="text-xl font-extrabold text-luxury-emerald">{availableSpaces} slots</p>
            <span className="text-[10px] text-slate-500 mt-1 block">Ready for parking arrivals</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-luxury-emerald mt-1 animate-ping" />
        </div>

        {/* Active Parked Hours Card */}
        <div className="p-4 rounded-xl border border-luxury-darkBorder bg-luxury-darkCard/40 flex items-start justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest mb-1">Active Parked Hours</span>
            <p className="text-xl font-extrabold text-indigo-400">{totalParkedHours} hours</p>
            <span className="text-[10px] text-slate-500 mt-1 block">Cumulative parking durations</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-indigo-400 mt-1 animate-pulse" />
        </div>
      </div>

      {/* Inputs Form & Live Table */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Registration Form (1 Column) */}
        <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-5">
          <div className="border-b border-luxury-darkBorder/40 pb-3 mb-4">
            <h3 className="font-extrabold text-white text-sm flex items-center">
              <Plus className="w-4 h-4 text-luxury-gold mr-1" />
              Inbound Registration Form
            </h3>
            <p className="text-xs text-luxury-textMuted mt-0.5">Log arrival license plates and assign parking bays</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-2.5 rounded bg-luxury-rose/10 border border-luxury-rose/30 text-[11px] text-luxury-rose font-bold">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="p-2.5 rounded bg-luxury-emerald/10 border border-luxury-emerald/30 text-[11px] text-luxury-emerald font-bold">
                {formSuccess}
              </div>
            )}

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">License Plate Number</label>
              <input
                type="text"
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                placeholder="e.g. MH-12-AB-1234"
                className="w-full bg-luxury-darkBg border border-luxury-darkBorder rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-luxury-gold/50 placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Vehicle Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType('4W')}
                  className={`flex items-center justify-center space-x-2 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                    type === '4W'
                      ? 'bg-luxury-gold text-black border-luxury-gold shadow-gold-glow'
                      : 'bg-luxury-darkBg border-luxury-darkBorder text-slate-400 hover:text-white'
                  }`}
                >
                  <Car className="w-4 h-4" />
                  <span>4-Wheeler</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType('2W')}
                  className={`flex items-center justify-center space-x-2 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                    type === '2W'
                      ? 'bg-luxury-gold text-black border-luxury-gold shadow-gold-glow'
                      : 'bg-luxury-darkBg border-luxury-darkBorder text-slate-400 hover:text-white'
                  }`}
                >
                  <Bike className="w-4 h-4" />
                  <span>2-Wheeler</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Bay/Slot Allocation</label>
              <input
                type="text"
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
                placeholder="e.g. A-15 or M-22"
                className="w-full bg-luxury-darkBg border border-luxury-darkBorder rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-luxury-gold/50 placeholder-slate-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-luxury-gold hover:bg-luxury-gold-dark text-black font-extrabold text-xs py-2 rounded-lg transition-colors flex items-center justify-center space-x-1.5 shadow-gold-glow"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Register Inbound Vehicle</span>
            </button>
          </form>
        </div>

        {/* Real-time Parked Vehicles Data Table (2 Columns) */}
        <div className="xl:col-span-2 border border-luxury-darkBorder rounded-2xl glass-panel p-5 space-y-4">
          <div className="border-b border-luxury-darkBorder/40 pb-3">
            <h3 className="font-extrabold text-white text-base">Real-Time Parking Activity Ledger</h3>
            <p className="text-xs text-luxury-textMuted mt-0.5">Logs of active vehicles currently stationed inside terminals</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs text-slate-300">
              <thead>
                <tr className="border-b border-luxury-darkBorder/60 text-slate-500 uppercase tracking-widest text-[9px] font-bold">
                  <th className="py-2.5 px-3">Vehicle Plate</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Allocated Bay</th>
                  <th className="py-2.5 px-3">Clock-In Time</th>
                  <th className="py-2.5 px-3">Active Duration</th>
                  <th className="py-2.5 px-3 text-right">Audit Release</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-darkBorder/40">
                {parkingLogs.map(log => (
                  <tr key={log.licensePlate} className="hover:bg-luxury-darkCard/20 transition-all">
                    <td className="py-3 px-3 font-extrabold text-white tracking-wider font-mono">{log.licensePlate}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-1">
                        {log.vehicleType === '4W' ? (
                          <>
                            <Car className="w-3.5 h-3.5 text-sky-400" />
                            <span className="text-[10px] text-slate-400">4-Wheel</span>
                          </>
                        ) : (
                          <>
                            <Bike className="w-3.5 h-3.5 text-luxury-gold" />
                            <span className="text-[10px] text-slate-400">2-Wheel</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-bold text-luxury-gold">{log.slotAllocation}</td>
                    <td className="py-3 px-3 text-slate-400">{new Date(log.timeIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="py-3 px-3 font-semibold text-slate-200">
                      <ElapsedTime timeInISO={log.timeIn} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => checkoutVehicle(log.licensePlate)}
                        className="px-2.5 py-1 text-[10px] uppercase font-bold border border-luxury-rose/30 bg-luxury-darkCard text-luxury-rose hover:bg-luxury-rose/10 rounded transition-all"
                      >
                        Checkout
                      </button>
                    </td>
                  </tr>
                ))}
                {parkingLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-slate-500 font-light italic">
                      No vehicles checked in. Fill the inbound form to register new vehicles.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
