/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';

// Interfaces
export interface Offer {
  id: string;
  title: string;
  code: string;
  expires: string;
  discount: string;
}

export interface Store {
  id: string;
  name: string;
  category: string;
  roomNumber: number;
  floor: 'Lower Ground' | 'Ground' | 'First' | 'Second';
  logoText: string;
  description: string;
  contact: string;
  hours: string;
  offers: Offer[];
}

export interface Tenant {
  roomNumber: number; // 1 to 100
  shopName: string;
  tenantName: string;
  address: string;
  phone: string;
  monthlyRent: number;
  paymentStatus: 'Paid' | 'Pending' | 'Overdue';
  floor: 'Lower Ground' | 'Ground' | 'First' | 'Second';
}

export interface VehicleLog {
  licensePlate: string;
  vehicleType: '2W' | '4W';
  slotAllocation: string;
  timeIn: string; // ISO string or format
}

export interface Employee {
  id: string;
  name: string;
  role: 'Security' | 'Maintenance' | 'Administration' | 'Customer Desk';
  status: 'Present' | 'Absent' | 'Late';
  clockInTime: string; // HH:MM AM/PM or "--"
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  tag: 'Event' | 'Alert' | 'Offer';
}

interface MallContextType {
  stores: Store[];
  rooms: Tenant[]; // Array of 100, index represents room (1 to 100)
  parkingLogs: VehicleLog[];
  attendance: Employee[];
  savedCoupons: string[]; // Coupon IDs
  announcements: Announcement[];
  onboardTenant: (tenantData: Omit<Tenant, 'floor'>) => void;
  togglePaymentStatus: (roomNumber: number) => void;
  registerVehicle: (vehicle: Omit<VehicleLog, 'timeIn'>) => boolean;
  checkoutVehicle: (licensePlate: string) => void;
  updateAttendance: (employeeId: string, status: 'Present' | 'Absent' | 'Late') => void;
  toggleSaveCoupon: (couponId: string) => void;
  exportRevenueSummary: () => string;
}

const MallContext = createContext<MallContextType | undefined>(undefined);

// Helper to assign floor based on room number
const getFloorByRoom = (roomNo: number): 'Lower Ground' | 'Ground' | 'First' | 'Second' => {
  if (roomNo >= 1 && roomNo <= 25) return 'Lower Ground';
  if (roomNo >= 26 && roomNo <= 50) return 'Ground';
  if (roomNo >= 51 && roomNo <= 75) return 'First';
  return 'Second';
};

// Seed Data
const initialStores: Store[] = [
  {
    id: 's1',
    name: 'Spar Luxury Hypermarket',
    category: 'Hypermarket',
    roomNumber: 5,
    floor: 'Lower Ground',
    logoText: 'SPAR',
    description: 'International gourmet selections, organic produce, and premium household essentials in a spacious layout.',
    contact: '+91 20 6725 1105',
    hours: '09:00 AM - 10:00 PM',
    offers: [
      { id: 'off_spar_1', title: '15% Off Organic Produce & Groceries', code: 'SPARORG15', expires: '2026-06-30', discount: '15%' }
    ]
  },
  {
    id: 's2',
    name: 'Ray-Ban & Sunglass Hut',
    category: 'Eyewear',
    roomNumber: 10,
    floor: 'Lower Ground',
    logoText: 'RAYBAN',
    description: 'Premier optical boutique featuring luxury eyewear, designer sunglasses, and computerized eye testing.',
    contact: '+91 20 6725 1110',
    hours: '10:00 AM - 09:30 PM',
    offers: [
      { id: 'off_ray_1', title: 'Flat ₹2000 Off on Wayfarer Series', code: 'WAYFARER2K', expires: '2026-07-05', discount: '₹2000' }
    ]
  },
  {
    id: 's3',
    name: 'Manyavar & Mohey',
    category: 'Ethnicwear',
    roomNumber: 15,
    floor: 'Lower Ground',
    logoText: 'MANYAVAR',
    description: 'Celebration wear featuring premium sherwanis, lehengas, kurtas, and designer bridal collections.',
    contact: '+91 20 6725 1115',
    hours: '10:00 AM - 10:00 PM',
    offers: [
      { id: 'off_man_1', title: 'Complimentary Styling Session & 5% Off', code: 'ETHELEGANCE', expires: '2026-06-25', discount: '5%' }
    ]
  },
  {
    id: 's4',
    name: 'Chanel Beauté',
    category: 'Beauty & Skincare',
    roomNumber: 28,
    floor: 'Ground',
    logoText: 'CHANEL',
    description: 'Exclusive fragrance bar, luxury cosmetic consultations, and elite skincare treatments by Chanel specialists.',
    contact: '+91 20 6725 1128',
    hours: '11:00 AM - 09:30 PM',
    offers: [
      { id: 'off_chanel_1', title: 'Free Signature Makeover on orders above ₹15k', code: 'COCOBEAUTY', expires: '2026-06-28', discount: 'Gift' }
    ]
  },
  {
    id: 's5',
    name: 'Tanishq Elite',
    category: 'Jewellery',
    roomNumber: 30,
    floor: 'Ground',
    logoText: 'TANISHQ',
    description: 'Pure 22-karat and 18-karat gold, diamond jewelry, and custom-crafted heirloom bridal collection suites.',
    contact: '+91 20 6725 1130',
    hours: '10:30 AM - 09:00 PM',
    offers: [
      { id: 'off_tan_1', title: 'Zero Making Charges on Diamond Jewellery', code: 'TANISHDIA', expires: '2026-07-15', discount: 'Zero MC' }
    ]
  },
  {
    id: 's6',
    name: 'Mercedes-Benz Pavilion',
    category: 'Automobile',
    roomNumber: 35,
    floor: 'Ground',
    logoText: 'MERCEDES',
    description: 'State-of-the-art experiential showroom displaying the latest luxury AMG, EQ, and luxury sedan models.',
    contact: '+91 20 6725 1135',
    hours: '10:00 AM - 09:00 PM',
    offers: [
      { id: 'off_benz_1', title: 'Book Test Drive & Get Mercedes Merchandise', code: 'AMGDRIVE', expires: '2026-08-31', discount: 'Merch' }
    ]
  },
  {
    id: 's7',
    name: 'Rolex Boutique',
    category: 'Watches',
    roomNumber: 40,
    floor: 'Ground',
    logoText: 'ROLEX',
    description: 'Authorized luxury Swiss watch retailer presenting timeless design precision and certified chronometers.',
    contact: '+91 20 6725 1140',
    hours: '10:30 AM - 09:30 PM',
    offers: []
  },
  {
    id: 's8',
    name: 'Apple Store (Imagine)',
    category: 'Electronics',
    roomNumber: 52,
    floor: 'First',
    logoText: 'APPLE',
    description: 'Premium Apple authorized retailer showcasing iPhone, Mac, iPad, Watch, and specialized technical support.',
    contact: '+91 20 6725 1152',
    hours: '10:00 AM - 10:00 PM',
    offers: [
      { id: 'off_apple_1', title: 'Instant ₹5000 Cash Back on HDFC cards', code: 'APPLEHDFC', expires: '2026-07-01', discount: '₹5000' }
    ]
  },
  {
    id: 's9',
    name: 'Louis Vuitton Paris',
    category: 'Bags & Accessories',
    roomNumber: 55,
    floor: 'First',
    logoText: 'LV',
    description: 'Exclusive leather handbags, travel trunks, monogrammed apparel, and bespoke personal engraving services.',
    contact: '+91 20 6725 1155',
    hours: '11:00 AM - 10:00 PM',
    offers: []
  },
  {
    id: 's10',
    name: "Levi's Indigo",
    category: 'Denims & Casuals',
    roomNumber: 62,
    floor: 'First',
    logoText: 'LEVIS',
    description: 'Original classic denim fits, customized denim alterations, and stylish youth-focused streetwear.',
    contact: '+91 20 6725 1162',
    hours: '10:00 AM - 09:30 PM',
    offers: [
      { id: 'off_levis_1', title: 'Buy 2 Get 1 Free on Redloop Collection', code: 'DENIMB2G1', expires: '2026-06-25', discount: 'B2G1' }
    ]
  },
  {
    id: 's11',
    name: 'Zara Home & Life',
    category: 'Home & Lifestyle',
    roomNumber: 72,
    floor: 'First',
    logoText: 'ZARAHOME',
    description: 'Contemporary home textiles, luxury designer dinnerware, cozy loungewear, and minimalist bedroom accessories.',
    contact: '+91 20 6725 1172',
    hours: '10:00 AM - 10:00 PM',
    offers: [
      { id: 'off_zara_1', title: 'Flat 20% Off on Premium Diffuser Oils', code: 'ZARAHOME20', expires: '2026-06-30', discount: '20%' }
    ]
  },
  {
    id: 's12',
    name: 'Indigo Delicatessen',
    category: 'Food & Dine',
    roomNumber: 85,
    floor: 'Second',
    logoText: 'INDIGO',
    description: 'Gourmet dine-in experience hosting handcrafted pastas, wood-fired pizzas, cocktails, and artisanal desserts.',
    contact: '+91 20 6725 1185',
    hours: '11:30 AM - 11:30 PM',
    offers: [
      { id: 'off_indigo_1', title: 'Happy Hour: Complimentary Sangria/Moktail with Mains', code: 'INDIGOHOUR', expires: '2026-07-10', discount: 'Drink' }
    ]
  },
  {
    id: 's13',
    name: 'PVR IMAX Director\'s Cut',
    category: 'Entertainment',
    roomNumber: 95,
    floor: 'Second',
    logoText: 'PVR',
    description: 'State-of-the-art IMAX auditorium featuring recliner seating, call-button waiter services, and fine-dining menus.',
    contact: '+91 20 6725 1195',
    hours: '09:00 AM - 01:00 AM',
    offers: [
      { id: 'off_pvr_1', title: '20% Off on Couples Recliner Tickets', code: 'PVRCOUPLE', expires: '2026-06-29', discount: '20%' }
    ]
  }
];

const initialTenantsSeed: Omit<Tenant, 'floor'>[] = [
  { roomNumber: 5, shopName: 'Spar Luxury Hypermarket', tenantName: 'John Doe', address: 'Plot 42, Viman Nagar, Pune', phone: '+91 98765 43210', monthlyRent: 450000, paymentStatus: 'Paid' },
  { roomNumber: 10, shopName: 'Ray-Ban & Sunglass Hut', tenantName: 'David Miller', address: 'Flat B5, Koregaon Park, Pune', phone: '+91 98765 43211', monthlyRent: 150000, paymentStatus: 'Paid' },
  { roomNumber: 15, shopName: 'Manyavar & Mohey', tenantName: 'Rajesh Kumar', address: 'Lane 7, Kalyani Nagar, Pune', phone: '+91 98765 43212', monthlyRent: 180000, paymentStatus: 'Pending' },
  { roomNumber: 28, shopName: 'Chanel Beauté', tenantName: 'Sophia Loren', address: 'Tower 3, Trump Towers, Pune', phone: '+91 98765 43213', monthlyRent: 220000, paymentStatus: 'Paid' },
  { roomNumber: 30, shopName: 'Tanishq Elite', tenantName: 'Amit Sen', address: 'Bungalow 12, Baner Road, Pune', phone: '+91 98765 43214', monthlyRent: 380000, paymentStatus: 'Paid' },
  { roomNumber: 35, shopName: 'Mercedes-Benz Pavilion', tenantName: 'Vikram Bajaj', address: 'Bajaj Vihar, Akurdi, Pune', phone: '+91 98765 43215', monthlyRent: 600000, paymentStatus: 'Overdue' },
  { roomNumber: 40, shopName: 'Rolex Boutique', tenantName: 'Michael Schumacher', address: 'Giga Space Villa, Chandan Nagar, Pune', phone: '+91 98765 43216', monthlyRent: 500000, paymentStatus: 'Paid' },
  { roomNumber: 52, shopName: 'Apple Store (Imagine)', tenantName: 'Tim Cook', address: 'Eon IT Park Road, Kharadi, Pune', phone: '+91 98765 43217', monthlyRent: 550000, paymentStatus: 'Paid' },
  { roomNumber: 55, shopName: 'Louis Vuitton Paris', tenantName: 'Bernard Arnault', address: 'Marvel Residences, Hadapsar, Pune', phone: '+91 98765 43218', monthlyRent: 700000, paymentStatus: 'Pending' },
  { roomNumber: 85, shopName: 'Indigo Delicatessen', tenantName: 'Sanjeev Kapoor', address: 'Row House 4, NIBM Road, Pune', phone: '+91 98765 43219', monthlyRent: 250000, paymentStatus: 'Paid' },
  { roomNumber: 95, shopName: 'PVR IMAX Director\'s Cut', tenantName: 'Ajay Bijli', address: 'Koregaon Park Annex, Pune', phone: '+91 98765 43220', monthlyRent: 800000, paymentStatus: 'Overdue' }
];

const initialParkingLogs: VehicleLog[] = [
  { licensePlate: 'MH-12-RS-9988', vehicleType: '4W', slotAllocation: 'A-12', timeIn: new Date(Date.now() - 3600000 * 2.5).toISOString() }, // 2.5 hours ago
  { licensePlate: 'MH-12-XY-4567', vehicleType: '2W', slotAllocation: 'M-05', timeIn: new Date(Date.now() - 3600000 * 4.2).toISOString() }, // 4.2 hours ago
  { licensePlate: 'MH-14-AB-1234', vehicleType: '4W', slotAllocation: 'B-04', timeIn: new Date(Date.now() - 3600000 * 0.8).toISOString() }, // 48 mins ago
  { licensePlate: 'MH-12-PQ-8888', vehicleType: '4W', slotAllocation: 'A-23', timeIn: new Date(Date.now() - 3600000 * 6.5).toISOString() }, // 6.5 hours ago
  { licensePlate: 'MH-12-ST-1122', vehicleType: '2W', slotAllocation: 'M-18', timeIn: new Date(Date.now() - 3600000 * 1.5).toISOString() }  // 1.5 hours ago
];

const initialAttendance: Employee[] = [
  { id: 'emp_1', name: 'Shankar Patil', role: 'Security', status: 'Present', clockInTime: '08:00 AM' },
  { id: 'emp_2', name: 'Amol Shinde', role: 'Security', status: 'Present', clockInTime: '08:15 AM' },
  { id: 'emp_3', name: 'Sunita Gavade', role: 'Customer Desk', status: 'Present', clockInTime: '09:00 AM' },
  { id: 'emp_4', name: 'Ramesh Sawant', role: 'Maintenance', status: 'Present', clockInTime: '08:30 AM' },
  { id: 'emp_5', name: 'Pradip Joshi', role: 'Administration', status: 'Absent', clockInTime: '--' },
  { id: 'emp_6', name: 'Vikram Phalke', role: 'Security', status: 'Late', clockInTime: '09:45 AM' }
];

const initialAnnouncements: Announcement[] = [
  { id: 'ann_1', title: 'Luxury Gold Souk Fest', content: 'Enjoy zero making charges and specialized bridal showcases in the Ground Floor atrium.', tag: 'Event' },
  { id: 'ann_2', title: 'Valet Parking Upgraded', content: 'Free EV fast chargers are now live at Parking Basement A for all premium shopping cardholders.', tag: 'Alert' },
  { id: 'ann_3', title: 'Viman Nagar Luxury Runway', content: 'Catch the haute couture exhibition this weekend, starting 5:00 PM at Central Plaza.', tag: 'Event' }
];

export const MallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stores, setStores] = useState<Store[]>(() => {
    const cached = localStorage.getItem('amanora_stores');
    return cached ? JSON.parse(cached) : initialStores;
  });

  const [rooms, setRooms] = useState<Tenant[]>(() => {
    const cached = localStorage.getItem('amanora_rooms');
    if (cached) return JSON.parse(cached);

    // Initialize 100 rooms
    const baseRooms: Tenant[] = Array.from({ length: 100 }, (_, i) => {
      const roomNo = i + 1;
      const seed = initialTenantsSeed.find(t => t.roomNumber === roomNo);
      if (seed) {
        return { ...seed, floor: getFloorByRoom(roomNo) };
      }
      return {
        roomNumber: roomNo,
        shopName: 'Vacant Space',
        tenantName: 'Unoccupied',
        address: '--',
        phone: '--',
        monthlyRent: roomNo <= 25 ? 100000 : roomNo <= 50 ? 150000 : roomNo <= 75 ? 200000 : 250000,
        paymentStatus: 'Pending' as const,
        floor: getFloorByRoom(roomNo),
      };
    });
    return baseRooms;
  });

  const [parkingLogs, setParkingLogs] = useState<VehicleLog[]>(() => {
    const cached = localStorage.getItem('amanora_parking');
    return cached ? JSON.parse(cached) : initialParkingLogs;
  });

  const [attendance, setAttendance] = useState<Employee[]>(() => {
    const cached = localStorage.getItem('amanora_attendance');
    return cached ? JSON.parse(cached) : initialAttendance;
  });

  const [savedCoupons, setSavedCoupons] = useState<string[]>(() => {
    const cached = localStorage.getItem('amanora_coupons');
    return cached ? JSON.parse(cached) : [];
  });

  const [announcements] = useState<Announcement[]>(initialAnnouncements);

  // Sync to Local Storage
  useEffect(() => {
    localStorage.setItem('amanora_stores', JSON.stringify(stores));
  }, [stores]);

  useEffect(() => {
    localStorage.setItem('amanora_rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('amanora_parking', JSON.stringify(parkingLogs));
  }, [parkingLogs]);

  useEffect(() => {
    localStorage.setItem('amanora_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('amanora_coupons', JSON.stringify(savedCoupons));
  }, [savedCoupons]);

  // Operations
  const onboardTenant = (tenantData: Omit<Tenant, 'floor'>) => {
    const floor = getFloorByRoom(tenantData.roomNumber);
    const updatedTenant: Tenant = { ...tenantData, floor };

    setRooms(prev => prev.map(r => r.roomNumber === tenantData.roomNumber ? updatedTenant : r));

    // Synchronize to stores: if a brand name is specified and is not "Vacant Space", check if store exists or add it.
    if (tenantData.shopName && tenantData.shopName.toLowerCase() !== 'vacant space' && tenantData.tenantName.toLowerCase() !== 'unoccupied') {
      setStores(prev => {
        const existingIdx = prev.findIndex(s => s.roomNumber === tenantData.roomNumber);
        const newStoreInfo: Store = {
          id: existingIdx !== -1 ? prev[existingIdx].id : `s_dynamic_${tenantData.roomNumber}`,
          name: tenantData.shopName,
          category: prev[existingIdx]?.category || 'Home & Lifestyle', // default category
          roomNumber: tenantData.roomNumber,
          floor,
          logoText: tenantData.shopName.substring(0, 8).toUpperCase().replace(/\s/g, ''),
          description: prev[existingIdx]?.description || `Premium showroom for ${tenantData.shopName} offering curated collections.`,
          contact: tenantData.phone,
          hours: prev[existingIdx]?.hours || '10:00 AM - 10:00 PM',
          offers: prev[existingIdx]?.offers || []
        };

        if (existingIdx !== -1) {
          return prev.map(s => s.roomNumber === tenantData.roomNumber ? newStoreInfo : s);
        } else {
          return [...prev, newStoreInfo];
        }
      });
    } else {
      // If setting to vacant, remove corresponding store in the directory
      setStores(prev => prev.filter(s => s.roomNumber !== tenantData.roomNumber));
    }
  };

  const togglePaymentStatus = (roomNumber: number) => {
    setRooms(prev => prev.map(r => {
      if (r.roomNumber === roomNumber) {
        let nextStatus: 'Paid' | 'Pending' | 'Overdue';
        if (r.paymentStatus === 'Paid') nextStatus = 'Pending';
        else if (r.paymentStatus === 'Pending') nextStatus = 'Overdue';
        else nextStatus = 'Paid';
        return { ...r, paymentStatus: nextStatus };
      }
      return r;
    }));
  };

  const registerVehicle = (vehicle: Omit<VehicleLog, 'timeIn'>): boolean => {
    // Check if slot or plate is empty or if slot is already occupied
    if (!vehicle.licensePlate.trim() || !vehicle.slotAllocation.trim()) return false;
    const isOccupied = parkingLogs.some(log => log.slotAllocation.toLowerCase() === vehicle.slotAllocation.toLowerCase());
    const isPlateRegistered = parkingLogs.some(log => log.licensePlate.toLowerCase() === vehicle.licensePlate.toLowerCase());
    
    if (isOccupied || isPlateRegistered) return false;

    const newLog: VehicleLog = {
      ...vehicle,
      timeIn: new Date().toISOString()
    };
    setParkingLogs(prev => [newLog, ...prev]);
    return true;
  };

  const checkoutVehicle = (licensePlate: string) => {
    setParkingLogs(prev => prev.filter(log => log.licensePlate.toLowerCase() !== licensePlate.toLowerCase()));
  };

  const updateAttendance = (employeeId: string, status: 'Present' | 'Absent' | 'Late') => {
    setAttendance(prev => prev.map(emp => {
      if (emp.id === employeeId) {
        let clockIn = '--';
        if (status === 'Present' || status === 'Late') {
          const now = new Date();
          let hours = now.getHours();
          const ampm = hours >= 12 ? 'PM' : 'AM';
          hours = hours % 12;
          hours = hours ? hours : 12; // the hour '0' should be '12'
          const minutes = now.getMinutes().toString().padStart(2, '0');
          clockIn = `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
        }
        return { ...emp, status, clockInTime: clockIn };
      }
      return emp;
    }));
  };

  const toggleSaveCoupon = (couponId: string) => {
    setSavedCoupons(prev => 
      prev.includes(couponId) ? prev.filter(id => id !== couponId) : [...prev, couponId]
    );
  };

  const exportRevenueSummary = (): string => {
    const activeTenants = rooms.filter(r => r.tenantName !== 'Unoccupied');
    const totalRevenue = activeTenants.reduce((sum, r) => sum + (r.paymentStatus === 'Paid' ? r.monthlyRent : 0), 0);
    const pendingRevenue = activeTenants.reduce((sum, r) => sum + (r.paymentStatus === 'Pending' ? r.monthlyRent : 0), 0);
    const overdueRevenue = activeTenants.reduce((sum, r) => sum + (r.paymentStatus === 'Overdue' ? r.monthlyRent : 0), 0);

    let report = `========================================================\n`;
    report += `       AMANORA LUXURY MALL - REVENUE SUMMARY REPORT      \n`;
    report += `       Generated: ${new Date().toLocaleString()}        \n`;
    report += `========================================================\n\n`;
    report += `Occupied Units: ${activeTenants.length} / 100\n`;
    report += `Total Collected (Paid): ₹${totalRevenue.toLocaleString()}\n`;
    report += `Total Pending:          ₹${pendingRevenue.toLocaleString()}\n`;
    report += `Total Overdue:          ₹${overdueRevenue.toLocaleString()}\n\n`;
    report += `--------------------------------------------------------\n`;
    report += `Unit # | Brand Name               | Tenant Name       | Rent (₹)  | Status   \n`;
    report += `--------------------------------------------------------\n`;
    
    activeTenants.forEach(t => {
      const u = t.roomNumber.toString().padEnd(6);
      const b = t.shopName.substring(0, 24).padEnd(24);
      const o = t.tenantName.substring(0, 17).padEnd(17);
      const r = t.monthlyRent.toLocaleString().padStart(9);
      const s = t.paymentStatus.padEnd(8);
      report += `${u} | ${b} | ${o} | ${r} | ${s}\n`;
    });
    report += `--------------------------------------------------------\n`;
    report += `Report End.\n`;
    return report;
  };

  return (
    <MallContext.Provider value={{
      stores,
      rooms,
      parkingLogs,
      attendance,
      savedCoupons,
      announcements,
      onboardTenant,
      togglePaymentStatus,
      registerVehicle,
      checkoutVehicle,
      updateAttendance,
      toggleSaveCoupon,
      exportRevenueSummary
    }}>
      {children}
    </MallContext.Provider>
  );
};

export const useMall = () => {
  const context = useContext(MallContext);
  if (context === undefined) {
    throw new Error('useMall must be used within a MallProvider');
  }
  return context;
};
