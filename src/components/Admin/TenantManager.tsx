import React, { useState, useMemo } from 'react';
import { useMall } from '../../context/MallContext';
import { UserPlus, DollarSign, Download, Phone } from 'lucide-react';

export const TenantManager: React.FC = () => {
  const { rooms, onboardTenant, togglePaymentStatus, exportRevenueSummary } = useMall();
  
  // Selected Room for Editing
  const [selectedRoomNo, setSelectedRoomNo] = useState<number>(1);
  const [reportText, setReportText] = useState<string | null>(null);

  // Form Fields
  const [shopName, setShopName] = useState(() => {
    const activeRoom = rooms.find(r => r.roomNumber === 1);
    return activeRoom && activeRoom.tenantName !== 'Unoccupied' ? activeRoom.shopName : '';
  });
  const [tenantName, setTenantName] = useState(() => {
    const activeRoom = rooms.find(r => r.roomNumber === 1);
    return activeRoom && activeRoom.tenantName !== 'Unoccupied' ? activeRoom.tenantName : '';
  });
  const [phone, setPhone] = useState(() => {
    const activeRoom = rooms.find(r => r.roomNumber === 1);
    return activeRoom && activeRoom.tenantName !== 'Unoccupied' ? activeRoom.phone : '';
  });
  const [address, setAddress] = useState(() => {
    const activeRoom = rooms.find(r => r.roomNumber === 1);
    return activeRoom && activeRoom.tenantName !== 'Unoccupied' ? activeRoom.address : '';
  });
  const [monthlyRent, setMonthlyRent] = useState<number>(() => {
    const activeRoom = rooms.find(r => r.roomNumber === 1);
    return activeRoom && activeRoom.tenantName !== 'Unoccupied' ? activeRoom.monthlyRent : 100000;
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Select Room handler to populate state values
  const selectRoom = (roomNo: number) => {
    setSelectedRoomNo(roomNo);
    const activeRoom = rooms.find(r => r.roomNumber === roomNo);
    if (activeRoom) {
      if (activeRoom.tenantName === 'Unoccupied') {
        setShopName('');
        setTenantName('');
        setPhone('');
        setAddress('');
        setMonthlyRent(roomNo <= 25 ? 100000 : roomNo <= 50 ? 150000 : roomNo <= 75 ? 200000 : 250000);
      } else {
        setShopName(activeRoom.shopName);
        setTenantName(activeRoom.tenantName);
        setPhone(activeRoom.phone);
        setAddress(activeRoom.address);
        setMonthlyRent(activeRoom.monthlyRent);
      }
      setFormError('');
      setFormSuccess('');
    }
  };

  // Form Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Form Validations
    if (!shopName.trim()) {
      setFormError('Shop/Brand Name is required.');
      return;
    }
    if (!tenantName.trim()) {
      setFormError('Tenant Owner Name is required.');
      return;
    }
    // Phone validation (very simple)
    const phoneRegex = /^[+]?[0-9\s-]{10,15}$/;
    if (!phoneRegex.test(phone.trim())) {
      setFormError('Please enter a valid phone number (10-15 digits).');
      return;
    }
    if (monthlyRent <= 0) {
      setFormError('Rental amount must be greater than zero.');
      return;
    }

    // Call Onboard operation
    onboardTenant({
      roomNumber: selectedRoomNo,
      shopName: shopName.trim(),
      tenantName: tenantName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      monthlyRent,
      paymentStatus: 'Paid' // default to Paid on initial onboarding
    });

    setFormSuccess(`Unit #${selectedRoomNo} Onboarded Successfully!`);
  };

  // Set unit to vacant space
  const handleVacate = () => {
    onboardTenant({
      roomNumber: selectedRoomNo,
      shopName: 'Vacant Space',
      tenantName: 'Unoccupied',
      phone: '--',
      address: '--',
      monthlyRent: selectedRoomNo <= 25 ? 100000 : selectedRoomNo <= 50 ? 150000 : selectedRoomNo <= 75 ? 200000 : 250000,
      paymentStatus: 'Pending'
    });
    setShopName('');
    setTenantName('');
    setPhone('');
    setAddress('');
    setMonthlyRent(selectedRoomNo <= 25 ? 100000 : selectedRoomNo <= 50 ? 150000 : selectedRoomNo <= 75 ? 200000 : 250000);
    setFormSuccess(`Unit #${selectedRoomNo} has been reset to Vacant.`);
  };

  // Metrics Calculations
  const occupiedCount = useMemo(() => rooms.filter(r => r.tenantName !== 'Unoccupied').length, [rooms]);
  const financialTotals = useMemo(() => {
    const list = rooms.filter(r => r.tenantName !== 'Unoccupied');
    const collected = list.reduce((sum, r) => sum + (r.paymentStatus === 'Paid' ? r.monthlyRent : 0), 0);
    const pending = list.reduce((sum, r) => sum + (r.paymentStatus === 'Pending' ? r.monthlyRent : 0), 0);
    const overdue = list.reduce((sum, r) => sum + (r.paymentStatus === 'Overdue' ? r.monthlyRent : 0), 0);
    return { collected, pending, overdue };
  }, [rooms]);

  // Export report down to phone file
  const handleExportFile = () => {
    const content = exportRevenueSummary();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Amanora_Revenue_Report_${new Date().toISOString().slice(0,10)}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      {/* Top Banner Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Occupied room slots count */}
        <div className="p-4 rounded-xl border border-luxury-darkBorder bg-luxury-darkCard/40">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest mb-1">Room Occupancy</span>
          <p className="text-xl font-extrabold text-white">{occupiedCount} <span className="text-xs font-normal text-slate-400">/ 100 Units</span></p>
          <div className="w-full bg-luxury-darkBorder rounded-full h-1.5 mt-2">
            <div className="bg-luxury-gold h-1.5 rounded-full" style={{ width: `${occupiedCount}%` }} />
          </div>
        </div>

        {/* Collected cash */}
        <div className="p-4 rounded-xl border border-luxury-darkBorder bg-luxury-darkCard/40 flex items-start justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest mb-1">Paid Revenue</span>
            <p className="text-lg font-black text-luxury-emerald">₹{financialTotals.collected.toLocaleString()}</p>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-luxury-emerald animate-pulse mt-1" />
        </div>

        {/* Pending cash */}
        <div className="p-4 rounded-xl border border-luxury-darkBorder bg-luxury-darkCard/40 flex items-start justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest mb-1">Pending Ledger</span>
            <p className="text-lg font-black text-luxury-amber">₹{financialTotals.pending.toLocaleString()}</p>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-luxury-amber animate-pulse mt-1" />
        </div>

        {/* Overdue cash */}
        <div className="p-4 rounded-xl border border-luxury-darkBorder bg-luxury-darkCard/40 flex items-start justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest mb-1">Overdue Rent</span>
            <p className="text-lg font-black text-luxury-rose">₹{financialTotals.overdue.toLocaleString()}</p>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-luxury-rose animate-pulse mt-1" />
        </div>
      </div>

      {/* Grid of 100 Rooms & Form Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Visual 100-Unit Grid (2 Columns) */}
        <div className="xl:col-span-2 border border-luxury-darkBorder rounded-2xl glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-luxury-darkBorder/40 pb-3">
            <div>
              <h3 className="font-extrabold text-white text-base">100-Unit Retail Grid Layout</h3>
              <p className="text-xs text-luxury-textMuted mt-0.5">Click any numbered space to load profile / onboard</p>
            </div>
            {/* Color key guide */}
            <div className="flex space-x-2 text-[8px] uppercase tracking-wider font-extrabold">
              <span className="px-1.5 py-0.5 bg-luxury-emerald/20 border border-luxury-emerald/40 rounded text-luxury-emerald">Paid</span>
              <span className="px-1.5 py-0.5 bg-luxury-amber/20 border border-luxury-amber/40 rounded text-luxury-amber">Pend</span>
              <span className="px-1.5 py-0.5 bg-luxury-rose/20 border border-luxury-rose/40 rounded text-luxury-rose">Over</span>
              <span className="px-1.5 py-0.5 bg-luxury-darkCard border border-luxury-darkBorder rounded text-slate-400">Vac</span>
            </div>
          </div>

          {/* Grid render */}
          <div className="grid grid-cols-10 gap-2 overflow-x-auto pb-1 select-none">
            {rooms.map(room => {
              const isSelected = selectedRoomNo === room.roomNumber;
              const isOccupied = room.tenantName !== 'Unoccupied';
              
              let bg = 'bg-luxury-darkCard/80 hover:bg-luxury-darkCardLighter border-luxury-darkBorder';
              let textColor = 'text-slate-400';
              if (isOccupied) {
                if (room.paymentStatus === 'Paid') {
                  bg = 'bg-luxury-emerald/15 hover:bg-luxury-emerald/25 border-luxury-emerald/40';
                  textColor = 'text-luxury-emerald';
                } else if (room.paymentStatus === 'Pending') {
                  bg = 'bg-luxury-amber/15 hover:bg-luxury-amber/25 border-luxury-amber/40';
                  textColor = 'text-luxury-amber';
                } else {
                  bg = 'bg-luxury-rose/15 hover:bg-luxury-rose/25 border-luxury-rose/40';
                  textColor = 'text-luxury-rose';
                }
              }

              if (isSelected) {
                bg += ' ring-2 ring-luxury-gold ring-offset-2 ring-offset-luxury-darkBg';
              }

              return (
                <button
                  key={room.roomNumber}
                  onClick={() => selectRoom(room.roomNumber)}
                  className={`h-9 min-w-[32px] rounded border flex flex-col items-center justify-center text-[10px] font-extrabold transition-all duration-200 ${bg} ${textColor}`}
                >
                  <span>{room.roomNumber}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Onboarding Form (1 Column) */}
        <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-5">
          <div className="border-b border-luxury-darkBorder/40 pb-3 mb-4">
            <h3 className="font-extrabold text-white text-base flex items-center">
              <UserPlus className="w-4 h-4 text-luxury-gold mr-2" />
              Onboarding Form (Unit #{selectedRoomNo})
            </h3>
            <p className="text-xs text-luxury-textMuted mt-0.5">Edit status profiles or add tenant lease info</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
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
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Brand/Shop Name</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. Nike Premium Boutique"
                className="w-full bg-luxury-darkBg border border-luxury-darkBorder rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-luxury-gold/50"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Owner (Tenant) Full Name</label>
              <input
                type="text"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-luxury-darkBg border border-luxury-darkBorder rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-luxury-gold/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="w-full bg-luxury-darkBg border border-luxury-darkBorder rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-luxury-gold/50"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Monthly Lease Rent (₹)</label>
                <input
                  type="number"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(Number(e.target.value))}
                  className="w-full bg-luxury-darkBg border border-luxury-darkBorder rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-luxury-gold/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Permanent Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter permanent billing address..."
                rows={2}
                className="w-full bg-luxury-darkBg border border-luxury-darkBorder rounded-lg p-2 text-xs text-white focus:outline-none focus:border-luxury-gold/50 resize-none"
              />
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-luxury-gold hover:bg-luxury-gold-dark text-black font-extrabold text-xs py-2 rounded-lg transition-colors"
              >
                Onboard / Update
              </button>
              {rooms.find(r => r.roomNumber === selectedRoomNo)?.tenantName !== 'Unoccupied' && (
                <button
                  type="button"
                  onClick={handleVacate}
                  className="px-3 border border-luxury-rose/30 hover:bg-luxury-rose/10 text-luxury-rose font-bold text-xs rounded-lg transition-colors"
                >
                  Vacate Unit
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Rent & Payment Ledger Table */}
      <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-luxury-darkBorder/40 pb-3">
          <div>
            <h3 className="font-extrabold text-white text-base">Rent & Payment Ledger Table</h3>
            <p className="text-xs text-luxury-textMuted mt-0.5">Overview of monthly revenue audits and ledger collections</p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setReportText(exportRevenueSummary())}
              className="flex items-center space-x-1 px-3.5 py-1.5 bg-luxury-darkCard border border-luxury-darkBorder rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:border-luxury-gold/30 transition-all"
            >
              <span>Scan Report</span>
            </button>
            
            <button
              onClick={handleExportFile}
              className="flex items-center space-x-1 px-3.5 py-1.5 bg-luxury-gold hover:bg-luxury-gold-dark rounded-lg text-xs font-extrabold text-black transition-all shadow-gold-glow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Ledger</span>
            </button>
          </div>
        </div>

        {/* Ledger Table scroll element */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs text-slate-300">
            <thead>
              <tr className="border-b border-luxury-darkBorder/60 text-slate-500 uppercase tracking-widest text-[9px] font-bold">
                <th className="py-2.5 px-3">Unit No</th>
                <th className="py-2.5 px-3">Shop/Brand Name</th>
                <th className="py-2.5 px-3">Owner Name</th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-3">Lease Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Ledger Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-darkBorder/40">
              {rooms.filter(r => r.tenantName !== 'Unoccupied').map(room => (
                <tr key={room.roomNumber} className="hover:bg-luxury-darkCard/20 transition-all">
                  <td className="py-3 px-3 font-bold text-luxury-gold">#{room.roomNumber}</td>
                  <td className="py-3 px-3 font-extrabold text-white">{room.shopName}</td>
                  <td className="py-3 px-3">{room.tenantName}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-1">
                      <Phone className="w-3 h-3 text-slate-500" />
                      <span>{room.phone}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-bold">₹{room.monthlyRent.toLocaleString()}</td>
                  <td className="py-3 px-3">
                    {room.paymentStatus === 'Paid' ? (
                      <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-luxury-emerald/15 text-luxury-emerald border border-luxury-emerald/30 uppercase">Paid</span>
                    ) : room.paymentStatus === 'Pending' ? (
                      <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-luxury-amber/15 text-luxury-amber border border-luxury-amber/30 uppercase">Pending</span>
                    ) : (
                      <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-luxury-rose/15 text-luxury-rose border border-luxury-rose/30 uppercase animate-pulse">Overdue</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => togglePaymentStatus(room.roomNumber)}
                      className="px-2.5 py-1 text-[10px] uppercase font-bold border border-luxury-darkBorder bg-luxury-darkCard text-slate-300 hover:text-luxury-gold hover:border-luxury-gold/50 rounded transition-all"
                    >
                      Audit Payment
                    </button>
                  </td>
                </tr>
              ))}
              {rooms.filter(r => r.tenantName !== 'Unoccupied').length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-500 font-light italic">
                    No active tenants registered in the ledger. Select a room in the grid to onboard a tenant.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scannable Revenue Report Modal Overlay */}
      {reportText && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-luxury-darkCard border border-luxury-darkBorder rounded-2xl w-full max-w-lg overflow-hidden flex flex-col justify-between shadow-gold-glow animate-fade-in max-h-[85vh]">
            <div className="p-5 border-b border-luxury-darkBorder/60 flex items-center justify-between bg-luxury-darkBg/60">
              <h3 className="font-extrabold text-white text-sm flex items-center">
                <DollarSign className="w-4 h-4 text-luxury-gold mr-1" />
                Revenue Summary Report Auditor
              </h3>
              <button 
                onClick={() => setReportText(null)}
                className="text-slate-400 hover:text-white font-bold text-xs"
              >
                ✕ Close
              </button>
            </div>
            
            <div className="p-5 overflow-auto flex-1 font-mono text-xs text-slate-300 leading-relaxed bg-[#05070d] max-h-[50vh]">
              <pre className="whitespace-pre-wrap">{reportText}</pre>
            </div>

            <div className="p-4 border-t border-luxury-darkBorder/60 bg-luxury-darkBg/60 flex space-x-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(reportText);
                  alert('Revenue report copied to clipboard!');
                }}
                className="flex-1 border border-luxury-gold/30 hover:bg-luxury-gold/10 text-luxury-gold text-xs font-bold py-2 rounded-lg transition-colors"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={handleExportFile}
                className="flex-1 bg-luxury-gold hover:bg-luxury-gold-dark text-black text-xs font-extrabold py-2 rounded-lg transition-colors"
              >
                Download TXT Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
