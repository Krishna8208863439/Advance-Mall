import React, { useState } from 'react';
import { useMall } from '../../context/MallContext';
import { ShieldAlert, Flame, Stethoscope, Shield, Megaphone, Radio } from 'lucide-react';

export const EmergencyModule: React.FC = () => {
  const { addActivityLog } = useMall();
  const [activeBroadcast, setActiveBroadcast] = useState<{
    type: 'FIRE' | 'MEDICAL' | 'SECURITY' | 'EVACUATION';
    message: string;
    timestamp: string;
  } | null>(null);

  const [broadcastMessageInput, setBroadcastMessageInput] = useState('');

  const handleTriggerEmergency = (type: 'FIRE' | 'MEDICAL' | 'SECURITY' | 'EVACUATION') => {
    const messages = {
      FIRE: '🚨 FIRE ALARM ACTIVATED: Evacuate via nearest stairwells immediately. Do not use elevators.',
      MEDICAL: '🚑 MEDICAL EMERGENCY BROADCAST: Medical response team dispatched to Central Atrium Ground Floor.',
      SECURITY: '🛡️ SECURITY LOCKDOWN: Security protocol activated for South Wing.',
      EVACUATION: '⚠️ MALL-WIDE EVACUATION: Please proceed calmly to emergency exit gates.'
    };

    const msg = broadcastMessageInput.trim() || messages[type];
    setActiveBroadcast({
      type,
      message: msg,
      timestamp: new Date().toLocaleTimeString()
    });

    addActivityLog('Emergency Protocol Activated', `Triggered ${type} Emergency Protocol: ${msg}`, 'Admin');
    setBroadcastMessageInput('');
  };

  const handleClearEmergency = () => {
    if (activeBroadcast) {
      addActivityLog('Emergency Cleared', `Emergency broadcast for ${activeBroadcast.type} deactivated by Admin`, 'Admin');
    }
    setActiveBroadcast(null);
  };

  return (
    <div className="space-y-6 text-slate-100 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-luxury-darkBorder pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center">
            <ShieldAlert className="w-6 h-6 text-rose-500 mr-2 animate-pulse" />
            Emergency Protocol & Panic Broadcast Module
          </h2>
          <p className="text-xs text-luxury-textMuted mt-1">
            One-touch panic buttons for Fire, Medical, Security, Evacuation routes, and mall-wide public address broadcast.
          </p>
        </div>

        {activeBroadcast && (
          <button
            onClick={handleClearEmergency}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-lg transition"
          >
            Clear All Emergency Broadcasts
          </button>
        )}
      </div>

      {/* Active Broadcast Banner */}
      {activeBroadcast && (
        <div className="p-5 rounded-2xl bg-rose-600/20 border-2 border-rose-500 text-rose-200 space-y-2 animate-bounce">
          <div className="flex items-center space-x-3">
            <Radio className="w-6 h-6 text-rose-400 shrink-0" />
            <span className="font-extrabold text-base uppercase tracking-wider">
              CRITICAL EMERGENCY BROADCAST LIVE [{activeBroadcast.type}]
            </span>
          </div>
          <p className="text-sm font-semibold pl-9">{activeBroadcast.message}</p>
          <span className="text-[10px] font-mono text-rose-300 block pl-9">Triggered at: {activeBroadcast.timestamp}</span>
        </div>
      )}

      {/* Panic Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fire */}
        <button
          onClick={() => handleTriggerEmergency('FIRE')}
          className="border-2 border-rose-500/50 hover:border-rose-500 bg-rose-500/10 hover:bg-rose-500/20 p-5 rounded-2xl text-left space-y-3 transition group"
        >
          <div className="p-3 bg-rose-500 text-white rounded-xl w-fit group-hover:scale-110 transition">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">FIRE PANIC ALARM</h3>
            <p className="text-xs text-rose-300 mt-1">Auto-open fire doors & trigger sprinklers</p>
          </div>
        </button>

        {/* Medical */}
        <button
          onClick={() => handleTriggerEmergency('MEDICAL')}
          className="border-2 border-sky-500/50 hover:border-sky-500 bg-sky-500/10 hover:bg-sky-500/20 p-5 rounded-2xl text-left space-y-3 transition group"
        >
          <div className="p-3 bg-sky-500 text-white rounded-xl w-fit group-hover:scale-110 transition">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">MEDICAL RESPONSE</h3>
            <p className="text-xs text-sky-300 mt-1">Dispatch onsite paramedic & ambulance</p>
          </div>
        </button>

        {/* Security */}
        <button
          onClick={() => handleTriggerEmergency('SECURITY')}
          className="border-2 border-amber-500/50 hover:border-amber-500 bg-amber-500/10 hover:bg-amber-500/20 p-5 rounded-2xl text-left space-y-3 transition group"
        >
          <div className="p-3 bg-amber-500 text-black rounded-xl w-fit group-hover:scale-110 transition">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">SECURITY LOCKDOWN</h3>
            <p className="text-xs text-amber-300 mt-1">Lock perimeter turnstiles & alert police</p>
          </div>
        </button>

        {/* Evacuation */}
        <button
          onClick={() => handleTriggerEmergency('EVACUATION')}
          className="border-2 border-purple-500/50 hover:border-purple-500 bg-purple-500/10 hover:bg-purple-500/20 p-5 rounded-2xl text-left space-y-3 transition group"
        >
          <div className="p-3 bg-purple-500 text-white rounded-xl w-fit group-hover:scale-110 transition">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">MALL EVACUATION</h3>
            <p className="text-xs text-purple-300 mt-1">Broadcast audio & digital display guide</p>
          </div>
        </button>
      </div>

      {/* Custom Broadcast Message Dispatcher */}
      <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-5 space-y-4">
        <h3 className="font-extrabold text-white text-base border-b border-luxury-darkBorder/40 pb-2">
          Custom Public Address PA Announcement
        </h3>

        <div className="space-y-3">
          <textarea
            rows={3}
            placeholder="Type custom emergency announcement message here..."
            value={broadcastMessageInput}
            onChange={(e) => setBroadcastMessageInput(e.target.value)}
            className="w-full bg-luxury-darkBg border border-luxury-darkBorder rounded-xl p-3 text-xs text-white focus:outline-none focus:border-luxury-gold"
          />

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => handleTriggerEmergency('SECURITY')}
              className="bg-luxury-gold hover:bg-luxury-gold-dark text-black font-extrabold text-xs py-2 px-5 rounded-lg shadow-gold-glow transition"
            >
              Broadcast Announcement Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
