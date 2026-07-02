import React, { useEffect, useRef, useState } from 'react';
import { Video, ShieldAlert, Maximize2, Minimize2, Eye } from 'lucide-react';

interface CameraFeed {
  id: string;
  label: string;
  code: string;
  fps: number;
}

const FEEDS: CameraFeed[] = [
  { id: 'cam1', label: 'Main Gate Entrance', code: 'CAM-01-GATE', fps: 24 },
  { id: 'cam2', label: 'Parking Basement A', code: 'CAM-02-PRK-A', fps: 18 },
  { id: 'cam3', label: 'Food Court East', code: 'CAM-03-FOOD-E', fps: 30 },
  { id: 'cam4', label: 'Gold Souk Wing', code: 'CAM-04-GOLD-W', fps: 24 }
];

// Sub-component for individual canvas feed
const CCTVFeed: React.FC<{ feed: CameraFeed; isFull: boolean; onExpand: () => void }> = ({ feed, isFull, onExpand }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [infrared, setInfrared] = useState(false);
  const [timestamp, setTimestamp] = useState('');

  // Clock ticks
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimestamp(now.toLocaleString());
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Canvas drawings
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    // Simulated targets moving in space
    const entities = Array.from({ length: 6 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      size: Math.random() * 6 + 4,
      type: Math.random() > 0.5 ? 'pedestrian' : 'vehicle',
      id: Math.floor(Math.random() * 9000) + 1000
    }));

    const render = () => {
      frame++;
      
      // Clear canvas
      ctx.fillStyle = infrared ? '#021808' : '#0c111c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render grid grid lines
      ctx.strokeStyle = infrared ? 'rgba(16, 185, 129, 0.08)' : 'rgba(35, 46, 68, 0.25)';
      ctx.lineWidth = 0.5;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Drawing sweeping panning scanner lines
      const sweepY = (frame * 1.5) % canvas.height;
      ctx.strokeStyle = infrared ? 'rgba(16, 185, 129, 0.2)' : 'rgba(212, 175, 55, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, sweepY);
      ctx.lineTo(canvas.width, sweepY);
      ctx.stroke();

      // Render tracking entities
      entities.forEach(ent => {
        // Move entity
        ent.x += ent.vx;
        ent.y += ent.vy;

        // Bounce walls
        if (ent.x < 0 || ent.x > canvas.width) ent.vx *= -1;
        if (ent.y < 0 || ent.y > canvas.height) ent.vy *= -1;

        // Draw targets
        ctx.strokeStyle = infrared ? '#10b981' : '#d4af37';
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Crosshair
        ctx.arc(ent.x, ent.y, ent.size, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(ent.x - ent.size - 4, ent.y);
        ctx.lineTo(ent.x + ent.size + 4, ent.y);
        ctx.moveTo(ent.x, ent.y - ent.size - 4);
        ctx.lineTo(ent.x, ent.y + ent.size + 4);
        ctx.stroke();

        // Label details text
        ctx.fillStyle = infrared ? '#4ade80' : '#ffffff';
        ctx.font = '8px monospace';
        ctx.fillText(`TRK-${ent.type === 'pedestrian' ? 'PED' : 'VEH'}-${ent.id}`, ent.x + ent.size + 6, ent.y - 2);
        ctx.fillText(`X:${Math.round(ent.x)} Y:${Math.round(ent.y)}`, ent.x + ent.size + 6, ent.y + 6);
      });

      // Analog static scanline overlay (simulating signal lines)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      for (let i = 0; i < canvas.height; i += 4) {
        if (Math.random() > 0.4) {
          ctx.fillRect(0, i, canvas.width, 1);
        }
      }

      // Camera coordinates HUD
      ctx.fillStyle = infrared ? '#10b981' : '#d4af37';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`${feed.code}`, 15, 25);
      
      // REC Blink dots
      if (Math.floor(frame / 25) % 2 === 0) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(canvas.width - 25, 22, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = infrared ? '#4ade80' : '#ffffff';
        ctx.fillText('REC', canvas.width - 45, 25);
      } else {
        ctx.fillStyle = '#64748b';
        ctx.fillText('REC', canvas.width - 45, 25);
      }

      // Text Overlays
      ctx.fillStyle = infrared ? '#10b981' : '#94a3b8';
      ctx.font = '9px monospace';
      ctx.fillText(`FPS: ${feed.fps}`, 15, canvas.height - 15);
      ctx.fillText(timestamp, canvas.width - 165, canvas.height - 15);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [infrared, feed, timestamp]);

  return (
    <div className={`relative border border-luxury-darkBorder rounded-xl overflow-hidden glass-panel flex flex-col justify-between ${
      isFull ? 'h-[75vh]' : 'h-[240px]'
    }`}>
      {/* Stream Label Header */}
      <div className="absolute top-3 left-4 z-10 flex items-center space-x-2 bg-luxury-darkBg/80 px-2.5 py-1 rounded border border-luxury-darkBorder text-[10px] uppercase font-bold tracking-wider">
        <span className="w-1.5 h-1.5 rounded-full bg-luxury-emerald animate-pulse" />
        <span className="text-white">{feed.label}</span>
      </div>

      {/* Control bar inside feed */}
      <div className="absolute top-3 right-4 z-10 flex items-center space-x-1.5">
        <button
          onClick={() => setInfrared(!infrared)}
          className={`p-1.5 rounded border transition-all ${
            infrared 
              ? 'bg-luxury-emerald text-black border-luxury-emerald' 
              : 'bg-luxury-darkBg/80 text-slate-400 border-luxury-darkBorder hover:text-white'
          }`}
          title="Toggle IR Mode"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onExpand}
          className="p-1.5 rounded bg-luxury-darkBg/80 text-slate-400 border border-luxury-darkBorder hover:text-white transition-all"
        >
          {isFull ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Canvas Canvas Stream */}
      <canvas 
        ref={canvasRef} 
        width={640} 
        height={400} 
        className="w-full h-full object-cover shrink"
      />
    </div>
  );
};

export const CCTVControl: React.FC = () => {
  const [expandedFeedId, setExpandedFeedId] = useState<string | null>(null);
  const [securityStatus, setSecurityStatus] = useState<'NOMINAL' | 'ALERT'>('NOMINAL');

  const toggleAlert = () => {
    setSecurityStatus(prev => prev === 'NOMINAL' ? 'ALERT' : 'NOMINAL');
  };

  const activeExpandedFeed = FEEDS.find(f => f.id === expandedFeedId);

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-luxury-darkBorder pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-white flex items-center">
            <Video className="w-5 h-5 text-luxury-gold mr-2" />
            Live CCTV Security Matrix
          </h2>
          <p className="text-xs text-luxury-textMuted mt-1">
            Simulate high-fidelity security feeds monitoring primary customer wings.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Alert trigger */}
          <button
            onClick={toggleAlert}
            className={`flex items-center space-x-1 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
              securityStatus === 'ALERT'
                ? 'bg-luxury-rose text-black animate-bounce shadow-lg shadow-luxury-rose/20'
                : 'bg-luxury-rose/10 border border-luxury-rose/30 text-luxury-rose hover:bg-luxury-rose/25'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{securityStatus === 'ALERT' ? 'Mute Security Alarm' : 'Trigger Drill Alarm'}</span>
          </button>
        </div>
      </div>

      {/* System Health Overlay */}
      {securityStatus === 'ALERT' && (
        <div className="p-4 rounded-xl bg-luxury-rose/10 border border-luxury-rose/40 animate-pulse flex items-start space-x-3.5 text-xs text-luxury-rose">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-black uppercase tracking-wider">CRITICAL SYSTEM BROADCAST: SECURITY DRILL ACTIVE</strong>
            <p className="mt-1 leading-relaxed text-[11px]">
              Panic alert triggers broadcasted to local authorities. Feeds are logging coordinates. Secure all mall entrances and coordinate with emergency coordinators.
            </p>
          </div>
        </div>
      )}

      {/* 2x2 CCTV Grid Matrix */}
      {!expandedFeedId ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEEDS.map(feed => (
            <CCTVFeed 
              key={feed.id} 
              feed={feed} 
              isFull={false} 
              onExpand={() => setExpandedFeedId(feed.id)} 
            />
          ))}
        </div>
      ) : (
        /* Focused Expanded Feed Display */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Focused feed: <strong className="text-white">{activeExpandedFeed?.label}</strong></span>
            <button 
              onClick={() => setExpandedFeedId(null)}
              className="text-luxury-gold font-bold hover:underline"
            >
              ← Back to Multi-Matrix View
            </button>
          </div>
          {activeExpandedFeed && (
            <CCTVFeed 
              feed={activeExpandedFeed} 
              isFull={true} 
              onExpand={() => setExpandedFeedId(null)} 
            />
          )}
        </div>
      )}

    </div>
  );
};
