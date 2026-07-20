import React, { useState } from 'react';
import { useMall } from '../../context/MallContext';
import { Gavel, Store, CheckCircle2, Clock, ArrowUpRight, Award } from 'lucide-react';

interface AuctionItem {
  id: string;
  shopNumber: number;
  floor: string;
  areaSqFt: number;
  baseBidRent: number;
  highestBid: number;
  highestBidder: string;
  bidCount: number;
  endsIn: string;
  status: 'AUCTION_OPEN' | 'PENDING_APPROVAL' | 'APPROVED';
}

export const DynamicLeasing: React.FC = () => {
  const { onboardTenant, addActivityLog } = useMall();
  const [auctions, setAuctions] = useState<AuctionItem[]>([
    {
      id: 'auc_78',
      shopNumber: 78,
      floor: 'Second Floor',
      areaSqFt: 2400,
      baseBidRent: 220000,
      highestBid: 285000,
      highestBidder: 'Gucci India Retail Pvt Ltd',
      bidCount: 7,
      endsIn: '04h 12m',
      status: 'AUCTION_OPEN'
    },
    {
      id: 'auc_82',
      shopNumber: 82,
      floor: 'Second Floor',
      areaSqFt: 3100,
      baseBidRent: 250000,
      highestBid: 340000,
      highestBidder: 'Prada Luxury Fashion House',
      bidCount: 12,
      endsIn: '00h 00m',
      status: 'PENDING_APPROVAL'
    },
    {
      id: 'auc_60',
      shopNumber: 60,
      floor: 'First Floor',
      areaSqFt: 1800,
      baseBidRent: 180000,
      highestBid: 215000,
      highestBidder: 'Balenciaga Couture',
      bidCount: 5,
      endsIn: '18h 45m',
      status: 'AUCTION_OPEN'
    }
  ]);

  const [placeBidModalId, setPlaceBidModalId] = useState<string | null>(null);
  const [bidBrandName, setBidBrandName] = useState('');
  const [bidAmountInput, setBidAmountInput] = useState('');

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!placeBidModalId || !bidBrandName.trim() || !bidAmountInput) return;
    const amount = parseFloat(bidAmountInput);
    if (isNaN(amount) || amount <= 0) return;

    setAuctions(prev => prev.map(auc => {
      if (auc.id === placeBidModalId) {
        if (amount <= auc.highestBid) return auc;
        addActivityLog('Bid Placed', `Brand "${bidBrandName}" placed a bid of ₹${amount.toLocaleString()} on Shop #${auc.shopNumber}`, 'Visitor');
        return {
          ...auc,
          highestBid: amount,
          highestBidder: bidBrandName.trim(),
          bidCount: auc.bidCount + 1
        };
      }
      return auc;
    }));

    setPlaceBidModalId(null);
    setBidBrandName('');
    setBidAmountInput('');
  };

  const handleApproveBid = (auc: AuctionItem) => {
    onboardTenant({
      roomNumber: auc.shopNumber,
      shopName: auc.highestBidder,
      tenantName: `${auc.highestBidder} Representative`,
      address: 'Amanora Mall Plaza',
      phone: '+91 98000 11122',
      monthlyRent: auc.highestBid,
      paymentStatus: 'Paid'
    });

    setAuctions(prev => prev.map(a => a.id === auc.id ? { ...a, status: 'APPROVED' } : a));
    addActivityLog('Lease Auction Approved', `Super Admin approved high bid of ₹${auc.highestBid.toLocaleString()} for Shop #${auc.shopNumber} by ${auc.highestBidder}`, 'Admin');
  };

  return (
    <div className="space-y-6 text-slate-100 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-luxury-darkBorder pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center">
            <Gavel className="w-6 h-6 text-luxury-gold mr-2" />
            Dynamic Shop Leasing & Online Auctions
          </h2>
          <p className="text-xs text-luxury-textMuted mt-1">
            Vacant shop spaces converted into dynamic digital auctions. Luxury brands place bids online with Admin approval workflow.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono text-luxury-gold bg-luxury-gold/10 px-3 py-1.5 rounded border border-luxury-gold/20 flex items-center">
            <Award className="w-3.5 h-3.5 mr-1" />
            High-Yield Lease Engine
          </span>
        </div>
      </div>

      {/* Auction Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {auctions.map(auc => (
          <div key={auc.id} className="border border-luxury-darkBorder rounded-2xl glass-panel p-5 space-y-4 flex flex-col justify-between relative overflow-hidden">
            
            {/* Status Badge */}
            <div className="flex justify-between items-center border-b border-luxury-darkBorder/40 pb-3">
              <div className="flex items-center space-x-2">
                <Store className="w-4 h-4 text-luxury-gold" />
                <h3 className="font-extrabold text-white text-sm">Vacant Unit #{auc.shopNumber}</h3>
              </div>
              
              {auc.status === 'AUCTION_OPEN' && (
                <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase flex items-center">
                  <Clock className="w-3 h-3 mr-1 animate-pulse" />
                  Ends: {auc.endsIn}
                </span>
              )}
              {auc.status === 'PENDING_APPROVAL' && (
                <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-sky-500/15 text-sky-400 border border-sky-500/30 uppercase">
                  Pending Admin Approval
                </span>
              )}
              {auc.status === 'APPROVED' && (
                <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase">
                  Lease Awarded
                </span>
              )}
            </div>

            {/* Shop Details */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Floor Level:</span>
                <span className="font-bold text-white">{auc.floor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Area Coverage:</span>
                <span className="font-bold text-white">{auc.areaSqFt} sq. ft.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Base Reserve Rent:</span>
                <span className="font-mono text-slate-300">₹{auc.baseBidRent.toLocaleString()} / mo</span>
              </div>
            </div>

            {/* Bidding Summary Box */}
            <div className="bg-luxury-darkBg border border-luxury-darkBorder p-3 rounded-xl space-y-1.5 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Leading Bidder ({auc.bidCount} Bids)</span>
              <div className="flex justify-between items-baseline">
                <span className="font-extrabold text-white text-sm truncate max-w-[170px]">{auc.highestBidder}</span>
                <span className="font-black text-luxury-gold text-base font-mono">₹{auc.highestBid.toLocaleString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2">
              {auc.status === 'AUCTION_OPEN' && (
                <button
                  onClick={() => setPlaceBidModalId(auc.id)}
                  className="w-full bg-luxury-gold hover:bg-luxury-gold-dark text-black font-extrabold text-xs py-2 rounded-lg shadow-gold-glow transition flex items-center justify-center"
                >
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  Submit Brand Bid
                </button>
              )}

              {auc.status === 'PENDING_APPROVAL' && (
                <button
                  onClick={() => handleApproveBid(auc)}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs py-2 rounded-lg transition flex items-center justify-center shadow-lg"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Approve & Generate Lease
                </button>
              )}

              {auc.status === 'APPROVED' && (
                <div className="text-center text-xs font-bold text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                  Tenant Onboarded to Directory
                </div>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* Place Bid Modal */}
      {placeBidModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md border border-luxury-gold/40 bg-luxury-darkCard p-6 rounded-2xl glass-panel relative shadow-2xl space-y-4">
            <h3 className="font-extrabold text-white text-base border-b border-luxury-darkBorder/40 pb-2">
              Online Luxury Brand Bidding Portal
            </h3>

            <form onSubmit={handlePlaceBid} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Brand / Company Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dior International"
                  value={bidBrandName}
                  onChange={(e) => setBidBrandName(e.target.value)}
                  className="w-full bg-luxury-darkBg border border-luxury-darkBorder rounded-lg px-3 py-2 text-white focus:outline-none focus:border-luxury-gold"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Monthly Rent Bid Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="Must exceed current highest bid"
                  value={bidAmountInput}
                  onChange={(e) => setBidAmountInput(e.target.value)}
                  className="w-full bg-luxury-darkBg border border-luxury-darkBorder rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-luxury-gold"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPlaceBidModalId(null)}
                  className="flex-1 bg-luxury-darkBg border border-luxury-darkBorder text-slate-400 text-xs font-bold py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-luxury-gold hover:bg-luxury-gold-dark text-black font-extrabold text-xs py-2 rounded-lg shadow-gold-glow"
                >
                  Confirm Bid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
