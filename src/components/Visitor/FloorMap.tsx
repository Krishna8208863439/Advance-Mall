import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useMall } from '../../context/MallContext';
import { Info, Compass, HelpCircle, RotateCcw, ZoomIn, ZoomOut, Flame, Activity } from 'lucide-react';

interface FloorMapProps {
  isAdminView?: boolean;
}

type FloorType = 'Lower Ground' | 'Ground' | 'First' | 'Second';

// 3D Point Interface
interface Point3D {
  x: number;
  y: number;
  z: number;
}

// 3D Block Definition
interface Block3D {
  id: string;
  name: string;
  roomNumber: number;
  center: Point3D;
  size: Point3D; // width (x), height (y), depth (z)
  color: string;
  isUtility?: boolean;
  utilityType?: 'WC' | 'LIFT' | 'ATM' | 'LOUNGE';
}

export const FloorMap: React.FC<FloorMapProps> = ({ isAdminView = false }) => {
  const { stores, rooms, onboardTenant, language, t } = useMall();
  const [selectedFloor, setSelectedFloor] = useState<FloorType>('Ground');
  const [selectedRoom, setSelectedRoom] = useState<number | null>(30); // Default select room 30
  const [mapMode, setMapMode] = useState<'3d' | '2d'>('3d');
  const [userLocation, setUserLocation] = useState<number | null>(null);

  const translateCategory = (cat: string) => {
    if (language === 'hi') {
      const map: Record<string, string> = {
        'All Types': 'सभी श्रेणियां',
        'Automobile': 'ऑटोमोबाइल',
        'Bags & Accessories': 'बैग और सामान',
        'Beauty & Skincare': 'सुंदरता और त्वचा',
        'Denims & Casuals': 'डेनिम और कैजुअल',
        'Electronics': 'इलेक्ट्रॉनिक्स',
        'Ethnicwear': 'पारंपरिक परिधान',
        'Eyewear': 'चश्मा',
        'Food & Dine': 'भोजन और रेस्तरां',
        'Entertainment': 'मनोरंजन',
        'Home & Lifestyle': 'होम और लाइफस्टाइल',
        'Hypermarket': 'हाइपरमार्केट',
        'Jewellery': 'आभूषण',
        'Kids Care': 'बच्चों की देखभाल',
        'Watches': 'घड़ियाँ'
      };
      return map[cat] || cat;
    }
    return cat;
  };

  // Lease Modal State
  const [showLeaseModal, setShowLeaseModal] = useState(false);
  const [leaseBrandName, setLeaseBrandName] = useState('');
  const [leaseOwner, setLeaseOwner] = useState('');
  const [leasePhone, setLeasePhone] = useState('');
  const [leaseError, setLeaseError] = useState('');

  // 3D Orbit Camera State
  const [pitch, setPitch] = useState(30); // angle in degrees
  const [yaw, setYaw] = useState(45);   // angle in degrees
  const [zoom, setZoom] = useState(1.4);  // scale factor
  const [timeTicker, setTimeTicker] = useState(0);

  // Drag Interaction State
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const floors: FloorType[] = ['Lower Ground', 'Ground', 'First', 'Second'];

  // Seed simulated clock ticker for heatmap animations
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeTicker(prev => (prev + 5) % 100);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Filter stores on active floor
  const floorStores = useMemo(() => {
    return stores.filter(s => s.floor === selectedFloor);
  }, [stores, selectedFloor]);

  // Compute crowd score per room dynamically
  const getCrowdScore = (roomNumber: number) => {
    return (roomNumber * 19 + timeTicker) % 100;
  };

  // Define 3D blocks for the 25 rooms on a floor
  const blocks = useMemo(() => {
    const list: Block3D[] = [];
    const roomsStart = selectedFloor === 'Lower Ground' ? 1 
                      : selectedFloor === 'Ground' ? 26
                      : selectedFloor === 'First' ? 51
                      : 76;

    // Generate 25 retail spaces in 3D layout
    // Arranged in two corridors: Top Row (x: -180 to +180, z: -70) and Bottom Row (x: -180 to +180, z: 70)
    // Plus 5 middle kiosks (z: 0)
    for (let i = 0; i < 25; i++) {
      const roomNo = roomsStart + i;
      const store = floorStores.find(s => s.roomNumber === roomNo);

      let cx = 0;
      let cz = 0;
      let sizeX = 26;
      let sizeZ = 24;

      if (i < 10) {
        // Top row
        cx = -180 + i * 40;
        cz = -70;
      } else if (i < 20) {
        // Bottom row
        cx = -180 + (i - 10) * 40;
        cz = 70;
      } else {
        // Kiosks in the middle corridor
        cx = -150 + (i - 20) * 60;
        cz = 0;
        sizeX = 35;
        sizeZ = 18;
      }

      list.push({
        id: `room_${roomNo}`,
        name: store ? store.name : 'Vacant Space',
        roomNumber: roomNo,
        center: { x: cx, y: 15, z: cz },
        size: { x: sizeX, y: 30, z: sizeZ },
        color: store ? '#d4af37' : '#232e44',
      });
    }

    // Add Utilities at the edges
    // Left edge: Restroom (WC) and Lift
    list.push({
      id: 'util_wc',
      name: 'Restrooms',
      roomNumber: 901,
      center: { x: -220, y: 12, z: -70 },
      size: { x: 25, y: 24, z: 25 },
      color: '#10b981',
      isUtility: true,
      utilityType: 'WC'
    });

    list.push({
      id: 'util_lift',
      name: 'Elevator Lift',
      roomNumber: 902,
      center: { x: -220, y: 15, z: 70 },
      size: { x: 25, y: 30, z: 25 },
      color: '#a855f7',
      isUtility: true,
      utilityType: 'LIFT'
    });

    // Right edge: ATM and VIP Lounge
    list.push({
      id: 'util_atm',
      name: 'Express ATM',
      roomNumber: 903,
      center: { x: 220, y: 12, z: -70 },
      size: { x: 25, y: 24, z: 25 },
      color: '#0ea5e9',
      isUtility: true,
      utilityType: 'ATM'
    });

    list.push({
      id: 'util_lounge',
      name: 'VIP Lounge',
      roomNumber: 904,
      center: { x: 220, y: 15, z: 70 },
      size: { x: 25, y: 30, z: 25 },
      color: '#eab308',
      isUtility: true,
      utilityType: 'LOUNGE'
    });

    return list;
  }, [selectedFloor, floorStores]);

  // Track hover coordinate
  const [hoveredRoom, setHoveredRoom] = useState<number | null>(null);

  // 3D coordinate projection math helper
  const project = (pt: Point3D, w: number, h: number) => {
    // 1. Rotate around Y axis (Yaw)
    const radYaw = (yaw * Math.PI) / 180;
    const x1 = pt.x * Math.cos(radYaw) - pt.z * Math.sin(radYaw);
    const z1 = pt.x * Math.sin(radYaw) + pt.z * Math.cos(radYaw);

    // 2. Rotate around X axis (Pitch)
    const radPitch = (pitch * Math.PI) / 180;
    const y2 = pt.y * Math.cos(radPitch) - z1 * Math.sin(radPitch);
    const z2 = pt.y * Math.sin(radPitch) + z1 * Math.cos(radPitch);

    // 3. Scale and translate to canvas center
    const scale = zoom * 1.5;
    const px = x1 * scale + w / 2;
    const py = -y2 * scale + h / 2; // canvas Y goes down

    return { x: px, y: py, z: z2 };
  };

  // Get 8 vertices of a 3D block
  const getVertices = (block: Block3D): Point3D[] => {
    const { center: c, size: s } = block;
    const dx = s.x / 2;
    const dy = s.y; // sits on ground y=0, extends up to s.y
    const dz = s.z / 2;

    return [
      { x: c.x - dx, y: 0,  z: c.z - dz }, // 0: Bottom-Left-Back
      { x: c.x + dx, y: 0,  z: c.z - dz }, // 1: Bottom-Right-Back
      { x: c.x + dx, y: 0,  z: c.z + dz }, // 2: Bottom-Right-Front
      { x: c.x - dx, y: 0,  z: c.z + dz }, // 3: Bottom-Left-Front
      { x: c.x - dx, y: dy, z: c.z - dz }, // 4: Top-Left-Back
      { x: c.x + dx, y: dy, z: c.z - dz }, // 5: Top-Right-Back
      { x: c.x + dx, y: dy, z: c.z + dz }, // 6: Top-Right-Front
      { x: c.x - dx, y: dy, z: c.z + dz }, // 7: Top-Left-Front
    ];
  };

  // Face rendering helper list (index of vertices forming faces)
  // Ordered so we can check back-to-front sorting.
  const FACES = [
    { name: 'bottom', indices: [0, 1, 2, 3], normal: { x: 0, y: -1, z: 0 } },
    { name: 'back',   indices: [0, 1, 5, 4], normal: { x: 0, y: 0, z: -1 } },
    { name: 'left',   indices: [0, 3, 7, 4], normal: { x: -1, y: 0, z: 0 } },
    { name: 'right',  indices: [1, 2, 6, 5], normal: { x: 1, y: 0, z: 0 } },
    { name: 'front',  indices: [3, 2, 6, 7], normal: { x: 0, y: 0, z: 1 } },
    { name: 'top',    indices: [4, 5, 6, 7], normal: { x: 0, y: 1, z: 0 } },
  ];

  // Draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Clear Canvas with luxury dark bg
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);

    // Draw main grid floor guide
    ctx.strokeStyle = 'rgba(35, 46, 68, 0.4)';
    ctx.lineWidth = 1;
    const gridStep = 40;
    const gridLimit = 240;

    for (let g = -gridLimit; g <= gridLimit; g += gridStep) {
      // Lines parallel to X axis
      ctx.beginPath();
      const p1 = project({ x: -gridLimit, y: 0, z: g }, w, h);
      const p2 = project({ x: gridLimit, y: 0, z: g }, w, h);
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      // Lines parallel to Z axis
      ctx.beginPath();
      const p3 = project({ x: g, y: 0, z: -gridLimit }, w, h);
      const p4 = project({ x: g, y: 0, z: gridLimit }, w, h);
      ctx.moveTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.stroke();
    }

    // Render Corridor Walkways
    ctx.fillStyle = 'rgba(12, 17, 28, 0.9)';
    ctx.strokeStyle = 'rgba(35, 46, 68, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const wp1 = project({ x: -210, y: 0, z: -35 }, w, h);
    const wp2 = project({ x: 210, y: 0, z: -35 }, w, h);
    const wp3 = project({ x: 210, y: 0, z: 35 }, w, h);
    const wp4 = project({ x: -210, y: 0, z: 35 }, w, h);
    ctx.moveTo(wp1.x, wp1.y);
    ctx.lineTo(wp2.x, wp2.y);
    ctx.lineTo(wp3.x, wp3.y);
    ctx.lineTo(wp4.x, wp4.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Projected text in the hallway
    const wpc = project({ x: 0, y: 0, z: 0 }, w, h);
    ctx.save();
    ctx.font = 'bold 8px monospace';
    ctx.fillStyle = '#2c3c54';
    ctx.textAlign = 'center';
    ctx.fillText('MAIN LUXURY BOULEVARD', wpc.x, wpc.y + 3);
    ctx.restore();

    // 1. Project all blocks and sort them by average center depth (z) to handle Painter's algorithm
    const projectedBlocks = blocks.map(block => {
      const vertices = getVertices(block);
      const projVertices = vertices.map(v => project(v, w, h));
      
      // Calculate center depth
      const projCenter = project(block.center, w, h);

      return {
        block,
        projVertices,
        depth: projCenter.z,
        centerPx: projCenter
      };
    });

    // Sort: farther objects (smaller depth z) are drawn first, closer objects (larger depth z) are drawn last
    projectedBlocks.sort((a, b) => a.depth - b.depth);

    // 2. Render each block face-by-face
    projectedBlocks.forEach(({ block, projVertices }) => {
      const isSelected = selectedRoom === block.roomNumber;
      const isHovered = hoveredRoom === block.roomNumber;
      const isOccupied = block.color === '#d4af37';
      const crowdScore = getCrowdScore(block.roomNumber);

      // Render Admin Heatmap under-glow first
      if (isAdminView && !block.isUtility) {
        ctx.save();
        const baseCenter = project({ x: block.center.x, y: 0, z: block.center.z }, w, h);
        const radius = (block.size.x + block.size.z) * zoom * 0.4;
        const radGlow = ctx.createRadialGradient(baseCenter.x, baseCenter.y, 1, baseCenter.x, baseCenter.y, radius);

        // Heatmap color logic
        let heatColor = '16, 185, 129'; // Green (quiet)
        if (crowdScore > 75) {
          heatColor = '239, 68, 68'; // Red (hot)
        } else if (crowdScore > 40) {
          heatColor = '245, 158, 11'; // Orange (moderate)
        }

        // Animated pulse
        const pulse = 1 + Math.sin(timeTicker / 10) * 0.15;

        radGlow.addColorStop(0, `rgba(${heatColor}, 0.65)`);
        radGlow.addColorStop(0.5, `rgba(${heatColor}, 0.25)`);
        radGlow.addColorStop(1, 'rgba(9, 13, 22, 0)');
        ctx.fillStyle = radGlow;
        ctx.beginPath();
        ctx.arc(baseCenter.x, baseCenter.y, radius * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw 3D prism faces
      FACES.forEach(face => {
        // Calculate face center for depth back-face culling or coloring
        const faceVertices = face.indices.map(idx => projVertices[idx]);

        ctx.beginPath();
        ctx.moveTo(faceVertices[0].x, faceVertices[0].y);
        for (let k = 1; k < faceVertices.length; k++) {
          ctx.lineTo(faceVertices[k].x, faceVertices[k].y);
        }
        ctx.closePath();

        // Shading color configuration
        let fillStyle = 'rgba(21, 28, 44, 0.7)';
        let strokeStyle = 'rgba(35, 46, 68, 0.8)';
        let lineWidth = 1;

        if (block.isUtility) {
          fillStyle = `${block.color}1e`; // Transparent utility
          strokeStyle = block.color;
          if (isHovered) {
            fillStyle = `${block.color}40`;
            lineWidth = 1.5;
          }
        } else if (isOccupied) {
          // Luxury occupant styling
          if (isSelected) {
            fillStyle = 'rgba(212, 175, 55, 0.4)';
            strokeStyle = '#d4af37';
            lineWidth = 2;
          } else if (isHovered) {
            fillStyle = 'rgba(212, 175, 55, 0.22)';
            strokeStyle = 'rgba(212, 175, 55, 0.9)';
            lineWidth = 1.5;
          } else {
            fillStyle = 'rgba(212, 175, 55, 0.1)';
            strokeStyle = 'rgba(212, 175, 55, 0.45)';
          }
        } else {
          // Vacant space
          if (isSelected) {
            fillStyle = 'rgba(255, 255, 255, 0.15)';
            strokeStyle = '#ffffff';
            lineWidth = 1.8;
          } else if (isHovered) {
            fillStyle = 'rgba(255, 255, 255, 0.08)';
            strokeStyle = 'rgba(255, 255, 255, 0.5)';
            lineWidth = 1.3;
          }
        }

        // Apply directional lighting/shading on sides
        if (face.name === 'top') {
          // Top face gets base color illumination
          ctx.fillStyle = fillStyle;
        } else if (face.name === 'front' || face.name === 'right') {
          // Front/right face gets slightly darker shaded glow
          ctx.fillStyle = fillStyle.replace(/[^,]+(?=\))/, (match) => {
            const val = parseFloat(match);
            return (val * 0.85).toString();
          });
        } else {
          // Other sides are darker
          ctx.fillStyle = fillStyle.replace(/[^,]+(?=\))/, (match) => {
            const val = parseFloat(match);
            return (val * 0.7).toString();
          });
        }

        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = lineWidth;
        ctx.fill();
        ctx.stroke();
      });

      // Render Label / Room number on top center
      ctx.save();
      const topCenterProj = project({ x: block.center.x, y: block.size.y, z: block.center.z }, w, h);
      ctx.textAlign = 'center';

      if (block.isUtility) {
        ctx.font = 'bold 9px sans-serif';
        ctx.fillStyle = block.color;
        ctx.fillText(block.utilityType!, topCenterProj.x, topCenterProj.y - 4);
      } else {
        ctx.font = isSelected ? 'bold 8px monospace' : '7px monospace';
        ctx.fillStyle = isOccupied ? '#d4af37' : '#475569';
        ctx.fillText(`#${block.roomNumber}`, topCenterProj.x, topCenterProj.y - 12);

        ctx.font = 'bold 7.5px sans-serif';
        ctx.fillStyle = '#ffffff';
        const displayName = block.name.split(' ')[0];
        ctx.fillText(displayName, topCenterProj.x, topCenterProj.y - 4);
      }
      ctx.restore();
    });

  }, [blocks, pitch, yaw, zoom, selectedRoom, hoveredRoom, isAdminView, timeTicker]);

  // Click handler to select store/room by canvas coordinates
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const w = canvas.width;
    const h = canvas.height;

    // Find clicked block by projecting their 2D footprint boundaries
    // Sort reverse- Painter to find the closest block click first
    const candidates = blocks.map(block => {
      const projCenter = project(block.center, w, h);
      const distance = Math.hypot(projCenter.x - clickX, projCenter.y - clickY);
      return { block, distance };
    });

    // Filter within hover radius (approximate boundaries based on block size)
    const clicked = candidates.filter(c => {
      const clickTolerance = (c.block.size.x + c.block.size.z) * zoom * 0.6;
      return c.distance < clickTolerance;
    }).sort((a, b) => a.distance - b.distance);

    if (clicked.length > 0) {
      const target = clicked[0].block;
      if (!target.isUtility) {
        setSelectedRoom(target.roomNumber);
      }
    }
  };

  // Drag interaction to orbit camera orientation
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const w = canvas.width;
    const h = canvas.height;

    // Hover detection logic
    const candidates = blocks.map(block => {
      const projCenter = project(block.center, w, h);
      const distance = Math.hypot(projCenter.x - mouseX, projCenter.y - mouseY);
      return { block, distance };
    });

    const hovered = candidates.filter(c => {
      const tolerance = (c.block.size.x + c.block.size.z) * zoom * 0.55;
      return c.distance < tolerance;
    }).sort((a, b) => a.distance - b.distance);

    if (hovered.length > 0 && !hovered[0].block.isUtility) {
      setHoveredRoom(hovered[0].block.roomNumber);
    } else {
      setHoveredRoom(null);
    }

    // Drag Orbit Camera Logic
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    setYaw(prev => (prev - dx * 0.5) % 360);
    setPitch(prev => Math.max(15, Math.min(75, prev + dy * 0.4)));

    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Fetch active selected room data
  const selectedRoomData = useMemo(() => {
    if (!selectedRoom) return null;
    const roomInfo = rooms.find(r => r.roomNumber === selectedRoom);
    const storeInfo = stores.find(s => s.roomNumber === selectedRoom);
    return {
      roomNumber: selectedRoom,
      tenant: roomInfo,
      store: storeInfo,
    };
  }, [selectedRoom, rooms, stores]);

  const calculatePath = (start: number | null, end: number | null): number[] => {
    if (!start || !end || start === end) return [];
    return [start, end];
  };

  const render2DBlock = (block: Block3D) => {
    const isSelected = selectedRoom === block.roomNumber;
    const isHovered = hoveredRoom === block.roomNumber;
    const isUserLoc = userLocation === block.roomNumber;
    const isPathNode = calculatePath(userLocation, selectedRoom).includes(block.roomNumber);

    let baseBg = 'bg-luxury-darkCard border-luxury-darkBorder text-slate-400';
    
    if (block.isUtility) {
      if (block.utilityType === 'WC') baseBg = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      else if (block.utilityType === 'LIFT') baseBg = 'bg-purple-500/10 border-purple-500/30 text-purple-400';
      else if (block.utilityType === 'ATM') baseBg = 'bg-sky-500/10 border-sky-500/30 text-sky-400';
      else baseBg = 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'; // Lounge
    } else if (block.color === '#d4af37') {
      if (isSelected) {
        baseBg = 'bg-luxury-gold text-black border-luxury-gold font-bold shadow-gold-glow';
      } else if (isPathNode) {
        baseBg = 'bg-luxury-gold/30 border-luxury-gold text-luxury-gold font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)] animate-pulse';
      } else if (isHovered) {
        baseBg = 'bg-luxury-gold/20 border-luxury-gold text-luxury-gold';
      } else {
        baseBg = 'bg-luxury-gold/10 border-luxury-gold/45 text-luxury-gold';
      }
    } else {
      if (isSelected) {
        baseBg = 'bg-white text-black border-white';
      } else if (isPathNode) {
        baseBg = 'bg-white/20 border-white text-white animate-pulse';
      } else if (isHovered) {
        baseBg = 'bg-luxury-darkCard border-slate-400 text-slate-200';
      } else {
        baseBg = 'bg-luxury-darkCard/40 border-luxury-darkBorder text-slate-500';
      }
    }

    return (
      <div
        key={block.id}
        onClick={() => {
          if (!block.isUtility) {
            setSelectedRoom(block.roomNumber);
          }
        }}
        className={`relative p-2 rounded-lg border text-center cursor-pointer transition-all duration-300 flex flex-col justify-between items-center select-none ${baseBg} ${
          block.isUtility ? 'w-24 h-12 text-[9px]' : 'h-16 text-[9.5px]'
        }`}
      >
        {isUserLoc && (
          <span className="absolute -top-2 bg-rose-600 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded shadow-lg border border-white animate-bounce z-20">
            📍 YOU
          </span>
        )}

        <div className="font-mono font-bold text-[8px] opacity-75">
          {block.isUtility ? block.utilityType : `#${block.roomNumber}`}
        </div>
        
        <div className="font-extrabold truncate max-w-full text-center mt-0.5">
          {block.name.split(' ')[0]}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-white flex items-center">
            <Compass className="w-5 h-5 text-luxury-gold mr-2" />
            {isAdminView ? (language === 'en' ? 'Admin Digital Twin View' : 'एडमिन डिजिटल ट्विन व्यू') : t('map.title')}
          </h2>
          <p className="text-xs text-luxury-textMuted mt-1">
            {isAdminView 
              ? (language === 'en' ? 'Observe live Wi-Fi triangulation heatmaps, queue density index, and floor load allocations.' : 'लाइव वाई-फाई हीटमैप, भीड़ सूचकांक और लोड आवंटन देखें।')
              : t('map.sub')}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 items-center">
          {/* Map Mode Switcher */}
          <div className="bg-luxury-darkCard p-1 rounded-lg border border-luxury-darkBorder flex">
            <button
              onClick={() => setMapMode('3d')}
              className={`px-3 py-1.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 ${
                mapMode === '3d'
                  ? 'bg-luxury-gold text-black shadow-gold-glow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {language === 'en' ? '3D View' : '३डी नक़्शा'}
            </button>
            <button
              onClick={() => setMapMode('2d')}
              className={`px-3 py-1.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 ${
                mapMode === '2d'
                  ? 'bg-luxury-gold text-black shadow-gold-glow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {language === 'en' ? '2D Map' : '२डी नक़्शा'}
            </button>
          </div>

          {/* Floor Switcher tabs */}
          <div className="bg-luxury-darkCard p-1 rounded-lg border border-luxury-darkBorder flex self-start sm:self-auto">
            {floors.map(f => (
              <button
                key={f}
                onClick={() => {
                  setSelectedFloor(f);
                  // Select first room of that floor by default
                  const base = f === 'Lower Ground' ? 1 
                             : f === 'Ground' ? 26
                             : f === 'First' ? 51
                             : 76;
                  setSelectedRoom(base);
                }}
                className={`px-3 py-1.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 ${
                  selectedFloor === f
                    ? 'bg-luxury-gold text-black shadow-gold-glow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {language === 'en' ? f : f === 'Lower Ground' ? 'लोअर ग्राउंड' : f === 'Ground' ? 'ग्राउंड फ्लोर' : f === 'First' ? 'प्रथम तल' : 'द्वितीय तल'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Floor Map Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Canvas Area (3 Columns on wide screens) */}
        <div className="xl:col-span-3 border border-luxury-darkBorder rounded-2xl glass-panel p-4 flex flex-col justify-between relative min-h-[480px]">
          
          {/* Legend Banner & Map Tools */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-luxury-darkBorder/40 pb-3 z-10">
            <div className="flex flex-wrap gap-4 text-[10px] uppercase font-bold tracking-widest text-slate-400">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 bg-luxury-gold/20 border border-luxury-gold/50 rounded" />
                <span>{language === 'en' ? 'Boutique' : 'दुकान'}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 bg-luxury-darkCard border border-luxury-darkBorder rounded" />
                <span>{language === 'en' ? 'Lease Space' : 'खाली जगह'}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 bg-emerald-500/20 border border-emerald-500 rounded" />
                <span>{language === 'en' ? 'Amenities' : 'सुविधाएं'}</span>
              </div>
              {isAdminView && (
                <div className="flex items-center space-x-1.5 text-luxury-rose animate-pulse">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Wi-Fi Triangulation Heatmap (Live)' : 'वाई-फाई हीटमैप (लाइव)'}</span>
                </div>
              )}
            </div>

            {/* Orbit Utilities */}
            <div className="flex space-x-1">
              <button 
                onClick={() => { setPitch(30); setYaw(45); setZoom(1.4); }}
                className="p-1.5 border border-luxury-darkBorder bg-luxury-darkCard text-slate-400 hover:text-luxury-gold rounded transition-colors"
                title="Reset Camera"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setZoom(z => Math.min(2.5, z + 0.15))}
                className="p-1.5 border border-luxury-darkBorder bg-luxury-darkCard text-slate-400 hover:text-luxury-gold rounded transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setZoom(z => Math.max(0.7, z - 0.15))}
                className="p-1.5 border border-luxury-darkBorder bg-luxury-darkCard text-slate-400 hover:text-luxury-gold rounded transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Viewport (3D Canvas vs 2D JSX grid) */}
          <div className="flex-1 flex justify-center items-center py-4 relative overflow-hidden min-h-[380px]">
            {mapMode === '3d' ? (
              <>
                <div className="absolute top-2 left-2 z-10 bg-luxury-darkBg/80 border border-luxury-darkBorder px-2.5 py-1 rounded text-[9px] monospace text-slate-400 font-bold select-none pointer-events-none">
                  YAW: {Math.round(yaw)}° • PITCH: {Math.round(pitch)}° • SCALE: {Math.round(zoom * 100)}%
                </div>

                <canvas
                  ref={canvasRef}
                  width={820}
                  height={380}
                  onClick={handleCanvasClick}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className="w-full max-w-full h-auto block select-none cursor-grab active:cursor-grabbing"
                />
              </>
            ) : (
              <div className="w-full flex flex-col space-y-4 py-2 select-none animate-fade-in">
                {/* 2D Info Overlay */}
                {userLocation && selectedRoom && userLocation !== selectedRoom && (
                  <div className="bg-luxury-gold/15 border border-luxury-gold/30 rounded-xl p-3 flex items-center justify-between text-xs text-luxury-gold mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="animate-pulse">🚶</span>
                      <span>
                        <strong>Navigation Active:</strong> Room #{userLocation} to Room #{selectedRoom} (Central Corridor Walkway Route)
                      </span>
                    </div>
                    <button 
                      onClick={() => setUserLocation(null)}
                      className="text-[10px] underline font-extrabold uppercase hover:text-white"
                    >
                      Clear Path
                    </button>
                  </div>
                )}

                {/* Top Row: Shops 1-10 on this floor */}
                <div className="grid grid-cols-10 gap-2">
                  {blocks.slice(0, 10).map(block => render2DBlock(block))}
                </div>

                {/* Middle Walkway & Kiosks & Utilities */}
                <div className="flex items-stretch justify-between gap-3 bg-luxury-darkBg/60 border border-luxury-darkBorder/40 rounded-xl p-3.5 relative min-h-[90px]">
                  {/* Left edge utilities: Restrooms & Lift */}
                  <div className="flex flex-col justify-between gap-2">
                    {blocks.filter(b => b.isUtility && (b.utilityType === 'WC' || b.utilityType === 'LIFT')).map(block => render2DBlock(block))}
                  </div>

                  {/* Center Walkway Corridor and Kiosks */}
                  <div className="flex-1 flex flex-col justify-center items-center relative border-l border-r border-dashed border-luxury-darkBorder/60 px-4">
                    <div className="absolute top-1 text-[8.5px] uppercase font-bold tracking-widest text-slate-500 font-mono">
                      MAIN LUXURY BOULEVARD WALKWAY
                    </div>
                    
                    {/* Kiosks inline row */}
                    <div className="flex space-x-2 mt-4">
                      {blocks.slice(20, 25).map(block => render2DBlock(block))}
                    </div>
                  </div>

                  {/* Right edge utilities: ATM & VIP Lounge */}
                  <div className="flex flex-col justify-between gap-2">
                    {blocks.filter(b => b.isUtility && (b.utilityType === 'ATM' || b.utilityType === 'LOUNGE')).map(block => render2DBlock(block))}
                  </div>
                </div>

                {/* Bottom Row: Shops 11-20 on this floor */}
                <div className="grid grid-cols-10 gap-2">
                  {blocks.slice(10, 20).map(block => render2DBlock(block))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom guide instructions footer */}
          <div className="text-[10px] text-slate-400 border-t border-luxury-darkBorder/40 pt-2.5 flex items-center justify-between bg-luxury-darkCard/25 p-2 rounded-lg">
            <div className="flex items-center space-x-1">
              <span className="text-luxury-gold font-bold">Tip:</span>
              {mapMode === '3d' ? (
                <span>Drag mouse on spatial frame to pivot orientation angle. Select blocks to interact.</span>
              ) : (
                <span>Click units to select. Set your location from the details panel to draw pathfinding routes.</span>
              )}
            </div>
            {mapMode === '2d' && (
              <div className="flex space-x-3 text-[9px] uppercase font-bold text-slate-500">
                <span className="flex items-center"><span className="w-2 h-2 rounded bg-rose-600 mr-1 inline-block" /> User</span>
                <span className="flex items-center"><span className="w-2 h-2 rounded bg-luxury-gold mr-1 inline-block" /> Selected</span>
                <span className="flex items-center"><span className="w-2 h-2 rounded bg-emerald-600 mr-1 inline-block" /> Utilities</span>
              </div>
            )}
          </div>

        </div>

        {/* Selected Room Details Panel (1 Column) */}
        <div className="xl:col-span-1">
          {selectedRoomData ? (
            <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-5 h-full flex flex-col justify-between space-y-4">
              <div className="space-y-4 animate-fade-in">
                {/* Title */}
                <div className="flex items-start justify-between border-b border-luxury-darkBorder/40 pb-3">
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-widest text-luxury-gold">
                      {t('map.spatialNode')}
                    </span>
                    <h3 className="text-lg font-extrabold text-white">
                      {language === 'en' ? 'Retail Unit #' : 'इकाई #'}{selectedRoomData.roomNumber}
                    </h3>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase bg-luxury-darkBorder/60 text-slate-300 px-2 py-0.5 rounded border border-luxury-darkBorder/50">
                    {language === 'en' ? selectedFloor : selectedFloor === 'Lower Ground' ? 'लोअर ग्राउंड' : selectedFloor === 'Ground' ? 'ग्राउंड फ्लोर' : selectedFloor === 'First' ? 'प्रथम तल' : 'द्वितीय तल'}
                  </span>
                </div>

                {mapMode === '2d' && selectedRoomData.tenant?.shopName !== 'Vacant Space' && (
                  <button
                    onClick={() => {
                      setUserLocation(selectedRoomData.roomNumber);
                    }}
                    className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                      userLocation === selectedRoomData.roomNumber
                        ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300 cursor-default'
                        : 'bg-luxury-darkBg border border-luxury-darkBorder text-slate-300 hover:text-white hover:border-rose-500/50'
                    }`}
                  >
                    <span>📍</span>
                    <span>{userLocation === selectedRoomData.roomNumber ? t('map.myLocation') : t('map.setMyLocation')}</span>
                  </button>
                )}

                {/* Details logic */}
                {selectedRoomData.store ? (
                  <div className="space-y-4">
                    {/* Brand details */}
                    <div>
                      <h4 className="text-sm font-extrabold text-white">
                        {selectedRoomData.store.name}
                      </h4>
                      <p className="text-[10px] text-luxury-gold font-bold uppercase tracking-wider mt-0.5">
                        {language === 'en' ? 'Category' : 'श्रेणी'}: {translateCategory(selectedRoomData.store.category)}
                      </p>
                      
                      {/* Live density indicator */}
                      <div className="mt-2.5 p-2.5 rounded-lg bg-luxury-darkBg/60 border border-luxury-darkBorder/40">
                        <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider mb-1.5">
                          <span className="text-slate-400 flex items-center">
                            <Activity className="w-3.5 h-3.5 text-luxury-gold mr-1" />
                            {t('map.crowdDensity')}
                          </span>
                          <span className={getCrowdScore(selectedRoomData.roomNumber) > 75 ? 'text-luxury-rose' : getCrowdScore(selectedRoomData.roomNumber) > 40 ? 'text-luxury-amber' : 'text-luxury-emerald'}>
                            {getCrowdScore(selectedRoomData.roomNumber) > 75 ? t('map.heavy') : getCrowdScore(selectedRoomData.roomNumber) > 40 ? t('map.moderate') : t('map.smoothFlow')}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-luxury-darkBorder rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${
                              getCrowdScore(selectedRoomData.roomNumber) > 75 
                                ? 'bg-luxury-rose' 
                                : getCrowdScore(selectedRoomData.roomNumber) > 40 
                                ? 'bg-luxury-amber' 
                                : 'bg-luxury-emerald'
                            }`}
                            style={{ width: `${getCrowdScore(selectedRoomData.roomNumber)}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-slate-500 font-medium mt-1 block">
                          Wi-Fi Triangulation Score: {getCrowdScore(selectedRoomData.roomNumber)} index / active connections
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed font-light mt-3">
                        {selectedRoomData.store.description}
                      </p>
                    </div>

                    {/* Meta stats */}
                    <div className="grid grid-cols-2 gap-3 bg-luxury-darkBg/50 p-3 rounded-lg border border-luxury-darkBorder/30 text-[10px] text-slate-300">
                      <div>
                        <span className="block text-slate-500 font-bold uppercase mb-0.5">Hours</span>
                        <span className="font-semibold">{selectedRoomData.store.hours}</span>
                      </div>
                      <div>
                        <span className="block text-slate-500 font-bold uppercase mb-0.5">Contact</span>
                        <span className="font-semibold">{selectedRoomData.store.contact}</span>
                      </div>
                    </div>

                    {/* Offers details */}
                    {selectedRoomData.store.offers && selectedRoomData.store.offers.length > 0 && (
                      <div className="bg-luxury-gold/5 border border-luxury-gold/20 p-3 rounded-lg space-y-1">
                        <span className="text-[9px] font-extrabold uppercase text-luxury-gold tracking-widest block">
                          Active Store Offer
                        </span>
                        <p className="text-xs font-bold text-slate-200">
                          {selectedRoomData.store.offers[0].title}
                        </p>
                        <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1">
                          <span>Code: <code className="bg-luxury-darkBg px-1 py-0.2 rounded text-luxury-gold font-mono font-bold text-[9px]">{selectedRoomData.store.offers[0].code}</code></span>
                          <span>Expires: {selectedRoomData.store.offers[0].expires}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // If vacant, show leasing details
                  <div className="space-y-4 py-3">
                    <div className="text-center">
                      <span className="text-3xl block">🏢</span>
                      <h4 className="text-sm font-extrabold text-white mt-1.5">Commercial Lease Signboard</h4>
                      <p className="text-[10px] text-slate-400 font-light mt-0.5">
                        Premium retail space available for immediate corporate tenant licensing.
                      </p>
                    </div>

                    <div className="bg-luxury-darkBg/60 p-3.5 rounded-xl border border-luxury-darkBorder space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Floor Level:</span>
                        <span className="font-semibold text-slate-300">{selectedRoomData.tenant?.floor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Unit Dimensions:</span>
                        <span className="font-semibold text-slate-300">
                          {selectedRoomData.roomNumber * 25 + 300} sq.ft
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Suggested Rate:</span>
                        <span className="font-semibold text-slate-300">
                          ₹{Math.round((selectedRoomData.tenant?.monthlyRent || 100000) / (selectedRoomData.roomNumber * 25 + 300))} / sq.ft
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-luxury-darkBorder/40 pt-2 mt-1">
                        <span className="text-slate-400 font-bold">Total Monthly Rent:</span>
                        <span className="font-extrabold text-luxury-gold">
                          ₹{selectedRoomData.tenant?.monthlyRent.toLocaleString()}/mo
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setLeaseBrandName('');
                        setLeaseOwner('');
                        setLeasePhone('');
                        setLeaseError('');
                        setShowLeaseModal(true);
                      }}
                      className="w-full bg-luxury-gold hover:bg-luxury-gold-dark text-black font-extrabold text-xs py-2 rounded-lg shadow-gold-glow transition-all"
                    >
                      Apply for Commercial Lease
                    </button>
                  </div>
                )}
              </div>

              {/* Informative Helper Card */}
              <div className="p-3 bg-luxury-darkCardLighter rounded-lg border border-luxury-darkBorder/40 text-[10px] text-slate-400 flex items-start space-x-2">
                <Info className="w-3.5 h-3.5 text-luxury-gold shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Go to <strong className="text-slate-300">Admin Control Panel</strong> to onboard new brands or update details for any room (1 to 100).
                </p>
              </div>
            </div>
          ) : (
            <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-5 h-full flex flex-col justify-center items-center text-center text-slate-500 space-y-2">
              <HelpCircle className="w-8 h-8 text-luxury-darkBorder" />
              <p className="text-xs font-semibold text-slate-400">Select a retail space room on the map to view details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Lease Application Modal Overlay */}
      {showLeaseModal && selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md border border-luxury-darkBorder bg-luxury-darkCard p-6 rounded-2xl glass-panel relative shadow-2xl">
            <div className="border-b border-luxury-darkBorder/40 pb-3 mb-4">
              <h3 className="font-extrabold text-white text-base">
                Apply for Commercial Lease - Unit #{selectedRoom}
              </h3>
              <p className="text-xs text-luxury-textMuted mt-0.5 font-light">Submit tenant owner credentials to lease this unit.</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setLeaseError('');
                if (!leaseBrandName.trim()) {
                  setLeaseError('Brand/Shop Name is required.');
                  return;
                }
                if (!leaseOwner.trim()) {
                  setLeaseError('Owner Name is required.');
                  return;
                }
                if (!/^[+]?[0-9\s-]{10,15}$/.test(leasePhone.trim())) {
                  setLeaseError('Please enter a valid phone number.');
                  return;
                }

                // Onboard immediately
                onboardTenant({
                  roomNumber: selectedRoom,
                  shopName: leaseBrandName.trim(),
                  tenantName: leaseOwner.trim(),
                  phone: leasePhone.trim(),
                  address: `${selectedFloor} Wing, Amanora Plaza`,
                  monthlyRent: rooms.find(r => r.roomNumber === selectedRoom)?.monthlyRent || 100000,
                  paymentStatus: 'Paid'
                });

                setShowLeaseModal(false);
              }}
              className="space-y-4"
            >
              {leaseError && (
                <div className="p-2.5 rounded bg-luxury-rose/10 border border-luxury-rose/30 text-[11px] text-luxury-rose font-bold">
                  {leaseError}
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                  Brand / Shop Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gucci Boutique"
                  value={leaseBrandName}
                  onChange={(e) => setLeaseBrandName(e.target.value)}
                  className="w-full bg-luxury-darkBg border border-luxury-darkBorder rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-luxury-gold/50"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                  Primary Owner Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Johnathan Doe"
                  value={leaseOwner}
                  onChange={(e) => setLeaseOwner(e.target.value)}
                  className="w-full bg-luxury-darkBg border border-luxury-darkBorder rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-luxury-gold/50"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                  Owner Phone Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  value={leasePhone}
                  onChange={(e) => setLeasePhone(e.target.value)}
                  className="w-full bg-luxury-darkBg border border-luxury-darkBorder rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-luxury-gold/50"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLeaseModal(false)}
                  className="flex-1 bg-luxury-darkBg border border-luxury-darkBorder text-slate-400 text-xs font-bold py-2 rounded-lg hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-luxury-gold hover:bg-luxury-gold-dark text-black font-extrabold text-xs py-2 rounded-lg shadow-gold-glow transition-colors"
                >
                  Authorize Lease
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
