import React, { useState, useEffect } from 'react';
import { Zap, Droplets, Wind, Leaf, AlertTriangle, Activity, Cpu, TrendingDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const SmartEnergy: React.FC = () => {
  const [electricityKwh, setElectricityKwh] = useState(4820);
  const [waterLiters, setWaterLiters] = useState(18400);
  const [hvacKw, setHvacKw] = useState(1250);
  const [carbonScore] = useState(84.2);
  const [anomalyDetected, setAnomalyDetected] = useState(false);

  // Live IoT metric oscillation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setElectricityKwh(prev => Math.round(prev + (Math.random() * 20 - 10)));
      setWaterLiters(prev => Math.round(prev + (Math.random() * 50 - 25)));
      setHvacKw(prev => Math.round(prev + (Math.random() * 10 - 5)));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const energyChartData = [
    { time: '06:00', electricity: 2400, water: 8000, hvac: 600 },
    { time: '09:00', electricity: 3800, water: 12000, hvac: 950 },
    { time: '12:00', electricity: 5200, water: 19500, hvac: 1400 },
    { time: '15:00', electricity: 4900, water: 17800, hvac: 1300 },
    { time: '18:00', electricity: 5800, water: 21000, hvac: 1550 },
    { time: '21:00', electricity: 4100, water: 14000, hvac: 1050 }
  ];

  return (
    <div className="space-y-6 text-slate-100 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-luxury-darkBorder pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center">
            <Zap className="w-6 h-6 text-luxury-gold mr-2" />
            Smart Energy & IoT Resource Monitoring
          </h2>
          <p className="text-xs text-luxury-textMuted mt-1">
            Real-time IoT smart meter telemetry, HVAC chillers load, water distribution, and carbon offset rating.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded border border-emerald-500/20 flex items-center">
            <Cpu className="w-3.5 h-3.5 mr-1 animate-pulse" />
            MQTT IoT Telemetry Live
          </span>
        </div>
      </div>

      {/* Anomaly Banner if triggered */}
      {anomalyDetected && (
        <div className="p-4 rounded-xl bg-amber-500/20 border border-amber-500 text-amber-300 flex items-center justify-between animate-fade-in">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-extrabold text-sm uppercase block">HVAC Zone 3 Surge Warning</span>
              <span className="text-xs">Chiller #2 drawing 18% higher current than baseline. AI auto-throttled setpoint.</span>
            </div>
          </div>
          <button
            onClick={() => setAnomalyDetected(false)}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-black font-bold text-xs rounded-lg"
          >
            Dismiss Alert
          </button>
        </div>
      )}

      {/* Gauges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Electricity */}
        <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-5 space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Grid Power</span>
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-black text-white font-mono">{electricityKwh.toLocaleString()}</span>
            <span className="text-xs text-slate-400 font-bold">kWh</span>
          </div>
          <div className="w-full bg-luxury-darkBg rounded-full h-1.5 border border-luxury-darkBorder">
            <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: '68%' }} />
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">Capacity: 68% of 7,000 kWh peak</span>
        </div>

        {/* Water */}
        <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-5 space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Water Flow</span>
            <Droplets className="w-5 h-5 text-sky-400" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-black text-white font-mono">{waterLiters.toLocaleString()}</span>
            <span className="text-xs text-slate-400 font-bold">Liters</span>
          </div>
          <div className="w-full bg-luxury-darkBg rounded-full h-1.5 border border-luxury-darkBorder">
            <div className="bg-sky-400 h-1.5 rounded-full" style={{ width: '54%' }} />
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">Recycled Graywater: 32%</span>
        </div>

        {/* HVAC */}
        <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-5 space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">HVAC Load</span>
            <Wind className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-black text-white font-mono">{hvacKw.toLocaleString()}</span>
            <span className="text-xs text-slate-400 font-bold">kW</span>
          </div>
          <div className="w-full bg-luxury-darkBg rounded-full h-1.5 border border-luxury-darkBorder">
            <div className="bg-indigo-400 h-1.5 rounded-full" style={{ width: '72%' }} />
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">Ambient Temp: 22.4°C Target</span>
        </div>

        {/* Carbon Rating */}
        <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-5 space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Eco Score</span>
            <Leaf className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-black text-emerald-400 font-mono">{carbonScore}</span>
            <span className="text-xs text-slate-400 font-bold">/ 100</span>
          </div>
          <div className="w-full bg-luxury-darkBg rounded-full h-1.5 border border-luxury-darkBorder">
            <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${carbonScore}%` }} />
          </div>
          <span className="text-[10px] text-emerald-400 block font-mono flex items-center">
            <TrendingDown className="w-3 h-3 mr-1" />
            -12% Carbon vs Last Month
          </span>
        </div>
      </div>

      {/* Main Telemetry Chart */}
      <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-luxury-darkBorder/40 pb-3">
          <div>
            <h3 className="font-extrabold text-white text-base">Diurnal Energy Telemetry</h3>
            <p className="text-xs text-luxury-textMuted mt-0.5">Real-time load profile across mall grid zones</p>
          </div>
          <button
            onClick={() => setAnomalyDetected(true)}
            className="px-3 py-1 bg-luxury-darkBg border border-luxury-darkBorder hover:bg-luxury-darkCardLighter text-slate-300 text-xs font-bold rounded-lg flex items-center"
          >
            <Activity className="w-3.5 h-3.5 mr-1 text-luxury-gold" />
            Simulate Grid Anomaly
          </button>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={energyChartData}>
              <defs>
                <linearGradient id="elecGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="hvacGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#d4af37', borderRadius: '8px' }}
                itemStyle={{ color: '#fff', fontSize: '11px' }}
              />
              <Area type="monotone" dataKey="electricity" stroke="#f59e0b" fillOpacity={1} fill="url(#elecGrad)" />
              <Area type="monotone" dataKey="hvac" stroke="#6366f1" fillOpacity={1} fill="url(#hvacGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
