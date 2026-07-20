import React from 'react';
import { TrendingUp, Users, Car, CloudSun, Sparkles, Flame, Clock } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const AiAnalyticsPredictions: React.FC = () => {
  const revenueForecastData = [
    { month: 'Jan', actual: 42, predicted: 42 },
    { month: 'Feb', actual: 45, predicted: 44 },
    { month: 'Mar', actual: 48, predicted: 47 },
    { month: 'Apr', actual: 52, predicted: 51 },
    { month: 'May', actual: 58, predicted: 56 },
    { month: 'Jun', actual: 64, predicted: 62 },
    { month: 'Jul (Current)', actual: 68, predicted: 67 },
    { month: 'Aug (AI)', actual: null, predicted: 74 },
    { month: 'Sep (AI)', actual: null, predicted: 81 },
    { month: 'Oct (Festive)', actual: null, predicted: 98 }
  ];

  const footfallPredictionData = [
    { hour: '10 AM', visitors: 2400, parking: 450 },
    { hour: '12 PM', visitors: 6800, parking: 1200 },
    { hour: '02 PM', visitors: 11200, parking: 2100 },
    { hour: '04 PM', visitors: 15400, parking: 2850 },
    { hour: '06 PM (Peak)', visitors: 19800, parking: 3400 },
    { hour: '08 PM', visitors: 16500, parking: 2900 },
    { hour: '10 PM', visitors: 7200, parking: 1400 }
  ];

  const storePopularityData = [
    { name: 'Spar Hypermarket', score: 98 },
    { name: 'Apple Store', score: 94 },
    { name: 'Louis Vuitton', score: 91 },
    { name: 'PVR IMAX', score: 89 },
    { name: 'Mercedes Pavilion', score: 86 },
    { name: 'Chanel Beauté', score: 83 }
  ];

  return (
    <div className="space-y-6 text-slate-100 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-luxury-darkBorder pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center">
            <Sparkles className="w-6 h-6 text-luxury-gold mr-2" />
            AI Predictive Analytics & Machine Learning Intelligence
          </h2>
          <p className="text-xs text-luxury-textMuted mt-1">
            Predictive revenue modeling, visitor footfall forecasting, parking demand heatmaps, and weather impact analytics.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono text-luxury-gold bg-luxury-gold/10 px-3 py-1.5 rounded border border-luxury-gold/20 flex items-center">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            Accuracy Score: 96.4%
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-4 flex items-center space-x-3.5">
          <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Q3 Revenue Forecast</span>
            <span className="text-lg font-black text-emerald-400">₹2.53 Crores</span>
          </div>
        </div>

        <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-4 flex items-center space-x-3.5">
          <div className="p-2.5 bg-sky-500/10 rounded-lg text-sky-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Peak Footfall Today</span>
            <span className="text-lg font-black text-white">19,800 Visitors</span>
          </div>
        </div>

        <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-4 flex items-center space-x-3.5">
          <div className="p-2.5 bg-amber-500/10 rounded-lg text-amber-400">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Predicted EV Demand</span>
            <span className="text-lg font-black text-amber-400">+34% Surge (6-8 PM)</span>
          </div>
        </div>

        <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-4 flex items-center space-x-3.5">
          <div className="p-2.5 bg-purple-500/10 rounded-lg text-purple-400">
            <CloudSun className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Weather Impact Score</span>
            <span className="text-lg font-black text-purple-400">+18% Indoor Boost</span>
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Forecast Chart */}
        <div className="lg:col-span-7 border border-luxury-darkBorder rounded-2xl glass-panel p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-luxury-darkBorder/40 pb-3">
            <div>
              <h3 className="font-extrabold text-white text-base">Predictive Revenue Model (Lakhs ₹)</h3>
              <p className="text-xs text-luxury-textMuted mt-0.5">Historical vs AI ML Projected Quarterly Growth</p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueForecastData}>
                <defs>
                  <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#d4af37', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="actual" stroke="#d4af37" fillOpacity={1} fill="url(#actualGrad)" name="Actual Revenue" />
                <Area type="monotone" dataKey="predicted" stroke="#10b981" strokeDasharray="4 4" fillOpacity={1} fill="url(#predGrad)" name="AI Forecast" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Store Popularity Leaderboard */}
        <div className="lg:col-span-5 border border-luxury-darkBorder rounded-2xl glass-panel p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-luxury-darkBorder/40 pb-3">
            <div>
              <h3 className="font-extrabold text-white text-base flex items-center">
                <Flame className="w-4 h-4 text-amber-500 mr-1.5" />
                Store Popularity Heatmap
              </h3>
              <p className="text-xs text-luxury-textMuted mt-0.5">Dwell time & customer interest score</p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {storePopularityData.map(st => (
              <div key={st.name} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-white">{st.name}</span>
                  <span className="text-luxury-gold font-mono">{st.score} / 100</span>
                </div>
                <div className="w-full bg-luxury-darkBg rounded-full h-2 border border-luxury-darkBorder">
                  <div
                    className="bg-gradient-to-r from-luxury-gold to-amber-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${st.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Footfall & Parking Hourly Bar Chart */}
      <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-luxury-darkBorder/40 pb-3">
          <div>
            <h3 className="font-extrabold text-white text-base flex items-center">
              <Clock className="w-4 h-4 text-sky-400 mr-1.5" />
              Hourly Visitor Footfall vs Parking Occupancy Prediction
            </h3>
            <p className="text-xs text-luxury-textMuted mt-0.5">Peak hour congestion AI forecasting</p>
          </div>
        </div>

        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={footfallPredictionData}>
              <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#38bdf8', borderRadius: '8px' }}
                itemStyle={{ color: '#fff', fontSize: '11px' }}
              />
              <Bar dataKey="visitors" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Predicted Visitors" />
              <Bar dataKey="parking" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Parking Vehicles" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
