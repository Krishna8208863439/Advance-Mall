import React, { useState } from 'react';
import { useMall } from '../../context/MallContext';
import { Activity, ShieldAlert, User, Search, RefreshCw, Filter } from 'lucide-react';

export const SystemHistory: React.FC = () => {
  const { activityLogs, language } = useMall();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUserType, setFilterUserType] = useState<'All' | 'Admin' | 'Visitor'>('All');

  // Filter logic
  const filteredLogs = activityLogs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesUser = filterUserType === 'All' || log.userType === filterUserType;
    
    return matchesSearch && matchesUser;
  });

  // Calculate stats
  const totalLogs = activityLogs.length;
  const adminLogs = activityLogs.filter(l => l.userType === 'Admin').length;
  const visitorLogs = activityLogs.filter(l => l.userType === 'Visitor').length;

  // Format ISO timestamp to readable date/time
  const formatTimestamp = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  // Get action category styling
  const getActionBadgeStyle = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('payroll') || act.includes('salary')) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
    if (act.includes('tenant') || act.includes('lease')) {
      return 'bg-luxury-gold/15 text-luxury-gold border-luxury-gold/30';
    }
    if (act.includes('vehicle') || act.includes('parking')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
    if (act.includes('ev') || act.includes('charging')) {
      return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    }
    if (act.includes('product') || act.includes('reserved') || act.includes('booking')) {
      return 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30';
    }
    return 'bg-slate-500/10 text-slate-300 border-slate-500/30';
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-white flex items-center">
            <Activity className="w-5 h-5 text-luxury-gold mr-2" />
            {language === 'en' ? 'Global System Activity Logger' : 'ग्लोबल सिस्टम गतिविधि लॉग'}
          </h2>
          <p className="text-xs text-luxury-textMuted mt-1">
            {language === 'en' 
              ? 'Centralized audit trail documenting real-time telemetry, state modifications, and user interactions.'
              : 'वास्तविक समय टेलीमेट्री, राज्य संशोधनों और उपयोगकर्ता इंटरैक्शन का दस्तावेजीकरण करने वाला केंद्रीकृत ऑडिट निशान।'}
          </p>
        </div>

        <button 
          onClick={() => {
            setSearchQuery('');
            setFilterUserType('All');
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-luxury-darkCard border border-luxury-darkBorder text-slate-400 hover:text-white rounded-lg text-xs font-semibold transition-all duration-300"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'Reset Filters' : 'फ़िल्टर रीसेट करें'}</span>
        </button>
      </div>

      {/* Stats Counter Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-4 flex items-center space-x-3.5">
          <div className="p-2.5 bg-luxury-gold/10 rounded-lg text-luxury-gold">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block">{language === 'en' ? 'Total Audit Trail' : 'कुल गतिविधि लॉग'}</span>
            <span className="text-lg font-black text-white">{totalLogs} {language === 'en' ? 'entries' : 'प्रविष्टियाँ'}</span>
          </div>
        </div>

        <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-4 flex items-center space-x-3.5">
          <div className="p-2.5 bg-rose-500/10 rounded-lg text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block">{language === 'en' ? 'Admin Interventions' : 'एडमिन हस्तक्षेप'}</span>
            <span className="text-lg font-black text-white">{adminLogs} {language === 'en' ? 'actions' : 'कार्रवाई'}</span>
          </div>
        </div>

        <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-4 flex items-center space-x-3.5">
          <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block">Visitor Actions</span>
            <span className="text-lg font-black text-white">{visitorLogs} actions</span>
          </div>
        </div>
      </div>

      {/* Table & Filtering */}
      <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-5 space-y-4">
        
        {/* Search and Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
          {/* Search Box */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search audit trail details..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-luxury-darkBg border border-luxury-darkBorder rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-luxury-gold/50"
            />
          </div>

          {/* User Type Filter buttons */}
          <div className="flex items-center space-x-1.5 self-end sm:self-auto">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-500 flex items-center mr-1.5">
              <Filter className="w-3 h-3 text-luxury-gold mr-1" />
              Source:
            </span>
            <button
              onClick={() => setFilterUserType('All')}
              className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded transition-all border ${
                filterUserType === 'All'
                  ? 'bg-luxury-gold text-black border-luxury-gold font-black'
                  : 'bg-luxury-darkCard border-luxury-darkBorder text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterUserType('Admin')}
              className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded transition-all border ${
                filterUserType === 'Admin'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-black'
                  : 'bg-luxury-darkCard border-luxury-darkBorder text-slate-400 hover:text-white'
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => setFilterUserType('Visitor')}
              className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded transition-all border ${
                filterUserType === 'Visitor'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-black'
                  : 'bg-luxury-darkCard border-luxury-darkBorder text-slate-400 hover:text-white'
              }`}
            >
              Visitor
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs text-slate-300">
            <thead>
              <tr className="border-b border-luxury-darkBorder/60 text-slate-500 uppercase tracking-widest text-[9px] font-bold">
                <th className="py-2.5 px-3 w-1/4">Timestamp (Local)</th>
                <th className="py-2.5 px-3 w-1/6">Category</th>
                <th className="py-2.5 px-3 w-1/2">Event Log / Details</th>
                <th className="py-2.5 px-3 text-right">Actor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-darkBorder/40">
              {filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-luxury-darkCard/25 transition-all">
                    {/* Timestamp */}
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    {/* Category */}
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${getActionBadgeStyle(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    {/* Details */}
                    <td className="py-3 px-3 font-light text-slate-200">
                      {log.details}
                    </td>
                    {/* User Type Actor */}
                    <td className="py-3 px-3 text-right">
                      {log.userType === 'Admin' ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[9px] font-extrabold bg-rose-500/10 text-rose-400 border border-rose-500/25 tracking-wider uppercase">
                          System Admin
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 tracking-wider uppercase">
                          Mall Visitor
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500 font-medium">
                    No logs found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
