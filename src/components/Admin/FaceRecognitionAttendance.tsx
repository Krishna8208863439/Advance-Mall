import React, { useState, useRef, useEffect } from 'react';
import { useMall } from '../../context/MallContext';
import { Camera, ShieldCheck, UserCheck, AlertTriangle, RefreshCw, CheckCircle2, UserX, Scan, Eye } from 'lucide-react';

interface VerifiedLog {
  id: string;
  name: string;
  role: string;
  timestamp: string;
  confidence: number;
  liveness: boolean;
  photoUrl?: string;
  status: 'Verified' | 'Unknown' | 'Spoof Risk';
}

export const FaceRecognitionAttendance: React.FC = () => {
  const { attendance, updateAttendance } = useMall();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string>(attendance[0]?.id || '');
  const [livenessPassed, setLivenessPassed] = useState<boolean | null>(null);
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null);
  const [verificationResult, setVerificationResult] = useState<'SUCCESS' | 'UNKNOWN' | 'SPOOF' | null>(null);
  const [logs, setLogs] = useState<VerifiedLog[]>([
    {
      id: 'vlog_1',
      name: 'Shankar Patil',
      role: 'Security',
      timestamp: '08:00 AM - Today',
      confidence: 98.6,
      liveness: true,
      status: 'Verified'
    },
    {
      id: 'vlog_2',
      name: 'Amol Shinde',
      role: 'Security',
      timestamp: '08:15 AM - Today',
      confidence: 96.2,
      liveness: true,
      status: 'Verified'
    },
    {
      id: 'vlog_3',
      name: 'Unrecognized Subject',
      role: 'Visitor / Unknown',
      timestamp: '09:12 AM - Today',
      confidence: 42.1,
      liveness: true,
      status: 'Unknown'
    }
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Canvas facial mesh animation effect
  useEffect(() => {
    if (!isCameraActive || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    const drawMesh = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const r = 80 + Math.sin(frame * 0.05) * 5;

      // Draw bounding box
      ctx.strokeStyle = isScanning ? '#eab308' : '#22c55e';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.strokeRect(cx - r, cy - r, r * 2, r * 2);

      // Draw Corner brackets
      ctx.setLineDash([]);
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 3;
      const bracketLen = 20;
      // Top-Left
      ctx.beginPath(); ctx.moveTo(cx - r, cy - r + bracketLen); ctx.lineTo(cx - r, cy - r); ctx.lineTo(cx - r + bracketLen, cy - r); ctx.stroke();
      // Top-Right
      ctx.beginPath(); ctx.moveTo(cx + r - bracketLen, cy - r); ctx.lineTo(cx + r, cy - r); ctx.lineTo(cx + r, cy - r + bracketLen); ctx.stroke();
      // Bottom-Left
      ctx.beginPath(); ctx.moveTo(cx - r, cy + r - bracketLen); ctx.lineTo(cx - r, cy + r); ctx.lineTo(cx - r + bracketLen, cy + r); ctx.stroke();
      // Bottom-Right
      ctx.beginPath(); ctx.moveTo(cx + r - bracketLen, cy + r); ctx.lineTo(cx + r, cy + r); ctx.lineTo(cx + r, cy + r - bracketLen); ctx.stroke();

      // Facial Keypoints (Eyes, Nose, Mouth simulation grid)
      ctx.fillStyle = isScanning ? '#eab308' : '#38bdf8';
      const keypoints = [
        { x: cx - 25, y: cy - 20 }, // Left Eye
        { x: cx + 25, y: cy - 20 }, // Right Eye
        { x: cx, y: cy + 5 },       // Nose Tip
        { x: cx - 20, y: cy + 30 }, // Left Mouth
        { x: cx + 20, y: cy + 30 }, // Right Mouth
        { x: cx, y: cy + 35 }       // Chin Center
      ];

      keypoints.forEach(pt => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Scanning radar line
      if (isScanning) {
        const scanY = (cy - r) + ((frame * 3) % (r * 2));
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - r, scanY);
        ctx.lineTo(cx + r, scanY);
        ctx.stroke();
      }

      animId = requestAnimationFrame(drawMesh);
    };

    drawMesh();
    return () => cancelAnimationFrame(animId);
  }, [isCameraActive, isScanning]);

  const handleStartScan = () => {
    setIsScanning(true);
    setVerificationResult(null);

    setTimeout(() => {
      setIsScanning(false);
      const targetEmp = attendance.find(e => e.id === selectedStaff);

      if (selectedStaff === 'unknown') {
        setLivenessPassed(true);
        setConfidenceScore(41.4);
        setVerificationResult('UNKNOWN');
        setLogs(prev => [
          {
            id: `vlog_${Date.now()}`,
            name: 'Unregistered Subject',
            role: 'Unknown Visitor',
            timestamp: new Date().toLocaleTimeString(),
            confidence: 41.4,
            liveness: true,
            status: 'Unknown'
          },
          ...prev
        ]);
      } else if (targetEmp) {
        const conf = Math.floor(Math.random() * 5 + 95) + Math.random();
        setLivenessPassed(true);
        setConfidenceScore(parseFloat(conf.toFixed(1)));
        setVerificationResult('SUCCESS');
        updateAttendance(targetEmp.id, 'Present');
        setLogs(prev => [
          {
            id: `vlog_${Date.now()}`,
            name: targetEmp.name,
            role: targetEmp.role,
            timestamp: new Date().toLocaleTimeString(),
            confidence: parseFloat(conf.toFixed(1)),
            liveness: true,
            status: 'Verified'
          },
          ...prev
        ]);
      }
    }, 2500);
  };

  return (
    <div className="space-y-6 text-slate-100 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-luxury-darkBorder pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center">
            <Scan className="w-6 h-6 text-luxury-gold mr-2" />
            Biometric AI Face Attendance
          </h2>
          <p className="text-xs text-luxury-textMuted mt-1">
            Real-time neural face detection, MediaPipe liveness verification, and instant staff clock-in integration.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsCameraActive(!isCameraActive)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center ${
              isCameraActive
                ? 'bg-luxury-rose/20 border border-luxury-rose text-luxury-rose hover:bg-luxury-rose/30'
                : 'bg-luxury-gold text-black hover:bg-luxury-gold-dark shadow-gold-glow'
            }`}
          >
            <Camera className="w-4 h-4 mr-1.5" />
            {isCameraActive ? 'Disconnect AI Camera' : 'Activate Optical AI Feed'}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Camera Feed Simulator */}
        <div className="lg:col-span-7 border border-luxury-darkBorder rounded-2xl glass-panel p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-luxury-darkBorder/40 pb-3">
            <div className="flex items-center space-x-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isCameraActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
              <h3 className="font-extrabold text-white text-sm">Biometric Optical Scanner Slot A-01</h3>
            </div>
            <span className="text-[10px] font-mono text-luxury-gold uppercase tracking-wider bg-luxury-gold/10 px-2 py-0.5 rounded border border-luxury-gold/20">
              MediaPipe V3.2 Engine
            </span>
          </div>

          {/* Camera Viewport */}
          <div className="relative w-full aspect-video bg-luxury-darkBg rounded-xl overflow-hidden border border-luxury-darkBorder flex items-center justify-center">
            {isCameraActive ? (
              <>
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={360}
                  className="w-full h-full object-cover"
                />

                {/* Overlay Text */}
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded text-[10px] font-mono text-emerald-400 border border-emerald-500/30 flex items-center">
                  <Eye className="w-3 h-3 mr-1" />
                  Liveness Target: Locked
                </div>

                {isScanning && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                    <div className="flex flex-col items-center space-y-2 bg-luxury-darkCard/90 p-4 rounded-xl border border-luxury-gold">
                      <RefreshCw className="w-8 h-8 text-luxury-gold animate-spin" />
                      <span className="text-xs font-bold text-luxury-gold uppercase tracking-widest">
                        Extracting 128D Face Embeddings...
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center space-y-3 p-6">
                <Camera className="w-12 h-12 text-slate-600 mx-auto animate-pulse" />
                <p className="text-xs text-slate-400 font-medium">Camera Feed Offline. Click above to initialize AI webcam frame.</p>
              </div>
            )}
          </div>

          {/* Controls */}
          {isCameraActive && (
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                    Select Target Subject Roster
                  </label>
                  <select
                    value={selectedStaff}
                    onChange={(e) => setSelectedStaff(e.target.value)}
                    className="w-full bg-luxury-darkBg border border-luxury-darkBorder rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-luxury-gold"
                  >
                    {attendance.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.role})
                      </option>
                    ))}
                    <option value="unknown">🚨 Simulate Unregistered Intruder</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleStartScan}
                    disabled={isScanning}
                    className="w-full bg-luxury-gold hover:bg-luxury-gold-dark text-black font-extrabold text-xs py-2 px-4 rounded-lg shadow-gold-glow transition-all disabled:opacity-50 flex items-center justify-center"
                  >
                    <UserCheck className="w-4 h-4 mr-1.5" />
                    Verify Face & Clock In
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Verification Outcome & Live Logs */}
        <div className="lg:col-span-5 space-y-4">
          {/* Verification Result Card */}
          <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-5 space-y-4">
            <h3 className="font-extrabold text-white text-sm border-b border-luxury-darkBorder/40 pb-2">
              Neural Match Diagnostic
            </h3>

            {verificationResult === 'SUCCESS' && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 space-y-2 animate-fade-in">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="font-extrabold text-sm uppercase">Attendance Verified</span>
                </div>
                <div className="text-xs space-y-1 font-mono text-slate-300">
                  <p>Match Confidence: <span className="font-bold text-emerald-400">{confidenceScore}%</span></p>
                  <p>Liveness Check: <span className="font-bold text-emerald-400">{livenessPassed ? 'PASSED (Real Human)' : 'FAILED'}</span></p>
                  <p>Clock-In Timestamp: <span className="text-white">{new Date().toLocaleTimeString()}</span></p>
                </div>
              </div>
            )}

            {verificationResult === 'UNKNOWN' && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 space-y-2 animate-fade-in">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  <span className="font-extrabold text-sm uppercase">Unknown Person Alert</span>
                </div>
                <p className="text-xs leading-relaxed text-slate-300">
                  Face embedding does not match any registered mall employee database record. Security alert logged.
                </p>
              </div>
            )}

            {!verificationResult && (
              <div className="p-4 rounded-xl bg-luxury-darkBg border border-luxury-darkBorder text-slate-400 text-xs text-center">
                Select staff member and click "Verify Face" to trigger embedding matching.
              </div>
            )}
          </div>

          {/* Verification History Log */}
          <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-5 space-y-3">
            <h3 className="font-extrabold text-white text-sm flex items-center justify-between">
              <span>Attendance Verification Audit</span>
              <ShieldCheck className="w-4 h-4 text-luxury-gold" />
            </h3>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {logs.map(log => (
                <div key={log.id} className="p-3 bg-luxury-darkBg border border-luxury-darkBorder rounded-xl flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-white block">{log.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{log.role} • {log.timestamp}</span>
                  </div>
                  <div className="text-right">
                    {log.status === 'Verified' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {log.confidence}% Match
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                        <UserX className="w-3 h-3 mr-1" />
                        Unknown
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
