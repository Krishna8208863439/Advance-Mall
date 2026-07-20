import React, { useState } from 'react';
import { useMall } from '../../context/MallContext';
import { DollarSign, FileText, Send, CheckCircle2, Clock, AlertCircle, ShieldCheck } from 'lucide-react';

interface InvoiceItem {
  id: string;
  shopNumber: number;
  shopName: string;
  tenantName: string;
  month: string;
  baseRent: number;
  maintenanceFee: number;
  electricityFee: number;
  waterFee: number;
  parkingFee: number;
  gstAmount: number;
  lateFee: number;
  totalAmount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
}

export const FinanceBilling: React.FC = () => {
  const { rooms, togglePaymentStatus, addActivityLog } = useMall();
  const [currentMonth] = useState('July 2026');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Paid' | 'Pending' | 'Overdue'>('All');
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [checkoutGateway, setCheckoutGateway] = useState<'Razorpay' | 'Stripe' | null>(null);

  // Generate Invoices from Mall Rooms state
  const activeTenants = rooms.filter(r => r.tenantName !== 'Unoccupied');

  const invoices: InvoiceItem[] = activeTenants.map(t => {
    const baseRent = t.monthlyRent;
    const maintenanceFee = Math.round(baseRent * 0.12);
    const electricityFee = 14500;
    const waterFee = 3200;
    const parkingFee = 8500;
    const subtotal = baseRent + maintenanceFee + electricityFee + waterFee + parkingFee;
    const gstAmount = Math.round(subtotal * 0.18);
    const lateFee = t.paymentStatus === 'Overdue' ? 15000 : 0;
    const totalAmount = subtotal + gstAmount + lateFee;

    return {
      id: `inv_2026_${t.roomNumber}`,
      shopNumber: t.roomNumber,
      shopName: t.shopName,
      tenantName: t.tenantName,
      month: currentMonth,
      baseRent,
      maintenanceFee,
      electricityFee,
      waterFee,
      parkingFee,
      gstAmount,
      lateFee,
      totalAmount,
      status: t.paymentStatus
    };
  });

  const filteredInvoices = invoices.filter(inv => {
    if (filterStatus === 'All') return true;
    return inv.status === filterStatus;
  });

  // Financial Stats
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalCollected = invoices.filter(inv => inv.status === 'Paid').reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalPending = invoices.filter(inv => inv.status === 'Pending').reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalOverdue = invoices.filter(inv => inv.status === 'Overdue').reduce((sum, inv) => sum + inv.totalAmount, 0);

  const handleSendReminder = (inv: InvoiceItem) => {
    addActivityLog('Payment Reminder Sent', `Automated WhatsApp & Email payment reminder dispatched to ${inv.tenantName} (${inv.shopName})`, 'Admin');
  };

  const handleProcessPayment = () => {
    if (!selectedInvoice) return;
    togglePaymentStatus(selectedInvoice.shopNumber);
    addActivityLog('Invoice Paid', `Invoice #${selectedInvoice.id} paid via ${checkoutGateway} for ${selectedInvoice.shopName}`, 'Admin');
    setCheckoutGateway(null);
    setSelectedInvoice(null);
  };

  return (
    <div className="space-y-6 text-slate-100 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-luxury-darkBorder pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center">
            <DollarSign className="w-6 h-6 text-luxury-gold mr-2" />
            Finance & Automated Tenant Billing
          </h2>
          <p className="text-xs text-luxury-textMuted mt-1">
            Automated rent generation, maintenance breakdown, GST calculations, Razorpay/Stripe checkout, and payment reminders.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono font-bold text-luxury-gold bg-luxury-gold/10 px-3 py-1.5 rounded border border-luxury-gold/20">
            Billing Cycle: {currentMonth}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-4 flex items-center space-x-3.5">
          <div className="p-2.5 bg-sky-500/10 rounded-lg text-sky-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Invoiced</span>
            <span className="text-lg font-black text-white">₹{(totalInvoiced / 100000).toFixed(2)} Lakhs</span>
          </div>
        </div>

        <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-4 flex items-center space-x-3.5">
          <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Collected (Paid)</span>
            <span className="text-lg font-black text-emerald-400">₹{(totalCollected / 100000).toFixed(2)} Lakhs</span>
          </div>
        </div>

        <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-4 flex items-center space-x-3.5">
          <div className="p-2.5 bg-amber-500/10 rounded-lg text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Pending Clearance</span>
            <span className="text-lg font-black text-amber-400">₹{(totalPending / 100000).toFixed(2)} Lakhs</span>
          </div>
        </div>

        <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-4 flex items-center space-x-3.5">
          <div className="p-2.5 bg-rose-500/10 rounded-lg text-rose-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Overdue Default</span>
            <span className="text-lg font-black text-rose-400">₹{(totalOverdue / 100000).toFixed(2)} Lakhs</span>
          </div>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-luxury-darkBorder/40 pb-3">
          <h3 className="font-extrabold text-white text-base">Monthly Tenant Invoices</h3>

          {/* Filter Toggles */}
          <div className="flex bg-luxury-darkBg p-1 rounded-lg border border-luxury-darkBorder space-x-1 self-start sm:self-auto">
            {(['All', 'Paid', 'Pending', 'Overdue'] as const).map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded text-[10px] font-extrabold uppercase transition ${
                  filterStatus === st
                    ? 'bg-luxury-gold text-black shadow-gold-glow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs text-slate-300">
            <thead>
              <tr className="border-b border-luxury-darkBorder/60 text-slate-500 uppercase tracking-widest text-[9px] font-bold">
                <th className="py-2.5 px-3">Inv ID</th>
                <th className="py-2.5 px-3">Unit #</th>
                <th className="py-2.5 px-3">Shop & Tenant</th>
                <th className="py-2.5 px-3">Base Rent</th>
                <th className="py-2.5 px-3">Maintenance & Utilities</th>
                <th className="py-2.5 px-3">GST (18%)</th>
                <th className="py-2.5 px-3">Total Payable</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-darkBorder/40">
              {filteredInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-luxury-darkCard/30 transition-all">
                  <td className="py-3 px-3 font-mono font-bold text-slate-400">{inv.id}</td>
                  <td className="py-3 px-3 font-bold text-luxury-gold">Unit #{inv.shopNumber}</td>
                  <td className="py-3 px-3">
                    <span className="font-extrabold text-white block">{inv.shopName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{inv.tenantName}</span>
                  </td>
                  <td className="py-3 px-3 font-mono">₹{inv.baseRent.toLocaleString()}</td>
                  <td className="py-3 px-3 font-mono text-slate-400">
                    ₹{(inv.maintenanceFee + inv.electricityFee + inv.waterFee + inv.parkingFee).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">₹{inv.gstAmount.toLocaleString()}</td>
                  <td className="py-3 px-3 font-extrabold text-white font-mono">₹{inv.totalAmount.toLocaleString()}</td>
                  <td className="py-3 px-3">
                    {inv.status === 'Paid' ? (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase">Paid</span>
                    ) : inv.status === 'Pending' ? (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase">Pending</span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-rose-500/15 text-rose-400 border border-rose-500/30 uppercase">Overdue</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      {inv.status !== 'Paid' && (
                        <>
                          <button
                            onClick={() => handleSendReminder(inv)}
                            className="p-1.5 bg-luxury-darkBg hover:bg-luxury-darkCardLighter border border-luxury-darkBorder text-slate-300 hover:text-white rounded text-[10px] font-bold"
                            title="Send WhatsApp & Email Payment Reminder"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => { setSelectedInvoice(inv); setCheckoutGateway('Razorpay'); }}
                            className="px-2 py-1 bg-luxury-gold hover:bg-luxury-gold-dark text-black rounded text-[10px] font-extrabold shadow-gold-glow"
                          >
                            Pay Online
                          </button>
                        </>
                      )}
                      {inv.status === 'Paid' && (
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="px-2 py-1 bg-luxury-darkBg hover:bg-luxury-darkCardLighter border border-luxury-darkBorder text-slate-300 hover:text-white rounded text-[10px] font-bold"
                        >
                          View Breakdown
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Gateway Modal Simulator */}
      {checkoutGateway && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md border border-luxury-gold/40 bg-luxury-darkCard p-6 rounded-2xl glass-panel relative shadow-2xl space-y-4">
            <h3 className="font-extrabold text-white text-base border-b border-luxury-darkBorder/40 pb-2 flex items-center justify-between">
              <span>{checkoutGateway} Checkout Portal</span>
              <ShieldCheck className="w-5 h-5 text-luxury-gold" />
            </h3>

            <div className="bg-luxury-darkBg p-3 rounded-xl border border-luxury-darkBorder space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Target Tenant:</span>
                <span className="font-bold text-white">{selectedInvoice.shopName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Invoice ID:</span>
                <span className="font-mono text-slate-300">{selectedInvoice.id}</span>
              </div>
              <div className="flex justify-between border-t border-luxury-darkBorder pt-1.5">
                <span className="text-slate-300 font-bold">Total Amount Due:</span>
                <span className="font-black text-luxury-gold text-sm font-mono">
                  ₹{selectedInvoice.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment method selector */}
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setCheckoutGateway('Razorpay')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold border ${checkoutGateway === 'Razorpay' ? 'bg-sky-500/20 border-sky-400 text-sky-400' : 'bg-luxury-darkBg border-luxury-darkBorder text-slate-400'}`}
              >
                Razorpay API
              </button>
              <button
                type="button"
                onClick={() => setCheckoutGateway('Stripe')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold border ${checkoutGateway === 'Stripe' ? 'bg-indigo-500/20 border-indigo-400 text-indigo-400' : 'bg-luxury-darkBg border-luxury-darkBorder text-slate-400'}`}
              >
                Stripe Elements
              </button>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setCheckoutGateway(null)}
                className="flex-1 bg-luxury-darkBg border border-luxury-darkBorder text-slate-400 text-xs font-bold py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessPayment}
                className="flex-1 bg-luxury-gold hover:bg-luxury-gold-dark text-black font-extrabold text-xs py-2 rounded-lg shadow-gold-glow"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
