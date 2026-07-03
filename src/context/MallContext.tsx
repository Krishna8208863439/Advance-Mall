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
  department: string;
  salary: number;
  bankAccount: string;
}

export interface PayrollPayout {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  amount: number;
  status: 'Pending' | 'Paid';
  transactionRef?: string;
  timestamp?: string;
  payoutMethod?: 'Razorpay Payouts' | 'Manual Bank';
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  userType: 'Admin' | 'Visitor';
}

export interface MallProduct {
  id: string;
  storeId: string;
  storeName: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
}

export interface ProductBooking {
  id: string;
  productId: string;
  productName: string;
  storeId: string;
  storeName: string;
  customerName: string;
  quantity: number;
  total: number;
  discount: number;
  status: 'Reserved' | 'Picked Up' | 'Cancelled';
  isGeoDiscount: boolean;
  timestamp: string;
  paymentId?: string;
  paymentMethod?: 'Razorpay' | 'In-Store';
}


export interface Announcement {
  id: string;
  title: string;
  content: string;
  tag: 'Event' | 'Alert' | 'Offer';
}

export interface EvReservation {
  id: string;
  bayId: string;
  licensePlate: string;
  timeSlot: string;
  status: 'Active' | 'Completed';
}

export interface HandsFreeDelivery {
  id: string;
  storeId: string;
  valetId: string;
  status: 'Ready' | 'Collected' | 'En Route' | 'Delivered';
  location: string;
  timestamp: string;
}

export interface VipReservation {
  id: string;
  eventId: string;
  userName: string;
  ticketCount: number;
  seatType: string;
  timestamp: string;
  paymentId?: string;
}

export interface FoodCartItem {
  name: string;
  price: number;
  restaurant: string;
  qty: number;
}

export interface FoodCourtOrder {
  id: string;
  items: FoodCartItem[];
  total: number;
  status: 'Cooking' | 'Ready' | 'Picked Up';
  timestamp: string;
  paymentId?: string;
}

export interface TableReservation {
  id: string;
  restaurantId: string;
  guests: number;
  timeSlot: string;
  preorders: FoodCartItem[];
  timestamp: string;
}

interface MallContextType {
  stores: Store[];
  rooms: Tenant[]; // Array of 100, index represents room (1 to 100)
  parkingLogs: VehicleLog[];
  attendance: Employee[];
  savedCoupons: string[]; // Coupon IDs
  announcements: Announcement[];
  evReservations: EvReservation[];
  handsFreeDeliveries: HandsFreeDelivery[];
  vipReservations: VipReservation[];
  foodCourtCart: FoodCartItem[];
  foodCourtOrders: FoodCourtOrder[];
  tableReservations: TableReservation[];
  payroll: PayrollPayout[];
  activityLogs: ActivityLog[];
  products: MallProduct[];
  productBookings: ProductBooking[];
  onboardTenant: (tenantData: Omit<Tenant, 'floor'>) => void;
  togglePaymentStatus: (roomNumber: number) => void;
  registerVehicle: (vehicle: Omit<VehicleLog, 'timeIn'>) => boolean;
  checkoutVehicle: (licensePlate: string) => void;
  updateAttendance: (employeeId: string, status: 'Present' | 'Absent' | 'Late') => void;
  toggleSaveCoupon: (couponId: string) => void;
  exportRevenueSummary: () => string;
  bookEvSlot: (bayId: string, licensePlate: string, timeSlot: string) => boolean;
  requestValetDelivery: (storeId: string, valetId: string, location: string) => void;
  bookVipEvent: (eventId: string, userName: string, ticketCount: number, seatType: string, paymentId?: string) => void;
  addToFoodCart: (item: Omit<FoodCartItem, 'qty'>) => void;
  removeFromFoodCart: (name: string, restaurant: string) => void;
  clearFoodCart: () => void;
  checkoutFoodCart: (paymentId?: string) => void;
  bookTableWithPreorder: (restaurantId: string, guests: number, timeSlot: string, preorders: FoodCartItem[]) => void;
  updateHandsFreeStatus: (id: string, status: HandsFreeDelivery['status']) => void;
  updateFoodOrderStatus: (id: string, status: FoodCourtOrder['status']) => void;
  addStaffMember: (staff: Omit<Employee, 'status' | 'clockInTime'>) => void;
  releaseSalary: (employeeId: string, month: string, payoutMethod?: 'Razorpay Payouts' | 'Manual Bank') => string;
  addActivityLog: (action: string, details: string, userType: 'Admin' | 'Visitor') => void;
  reserveProduct: (productId: string, qty: number, customerName: string, licensePlate?: string, paymentId?: string, paymentMethod?: 'Razorpay' | 'In-Store') => { success: boolean; error?: string; booking?: ProductBooking };
  pickupBooking: (bookingId: string) => void;
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
  { id: 'emp_1', name: 'Shankar Patil', role: 'Security', status: 'Present', clockInTime: '08:00 AM', department: 'Security Services', salary: 25000, bankAccount: 'SBI-99887766' },
  { id: 'emp_2', name: 'Amol Shinde', role: 'Security', status: 'Present', clockInTime: '08:15 AM', department: 'Security Services', salary: 25000, bankAccount: 'HDFC-11223344' },
  { id: 'emp_3', name: 'Sunita Gavade', role: 'Customer Desk', status: 'Present', clockInTime: '09:00 AM', department: 'Administration', salary: 35000, bankAccount: 'ICICI-44556677' },
  { id: 'emp_4', name: 'Ramesh Sawant', role: 'Maintenance', status: 'Present', clockInTime: '08:30 AM', department: 'Facilities', salary: 22000, bankAccount: 'AXIS-55667788' },
  { id: 'emp_5', name: 'Pradip Joshi', role: 'Administration', status: 'Absent', clockInTime: '--', department: 'Operations & HR', salary: 50000, bankAccount: 'KOTAK-66778899' },
  { id: 'emp_6', name: 'Vikram Phalke', role: 'Security', status: 'Late', clockInTime: '09:45 AM', department: 'Security Services', salary: 25000, bankAccount: 'SBI-88776655' }
];

const initialAnnouncements: Announcement[] = [
  { id: 'ann_1', title: 'Luxury Gold Souk Fest', content: 'Enjoy zero making charges and specialized bridal showcases in the Ground Floor atrium.', tag: 'Event' },
  { id: 'ann_2', title: 'Valet Parking Upgraded', content: 'Free EV fast chargers are now live at Parking Basement A for all premium shopping cardholders.', tag: 'Alert' },
  { id: 'ann_3', title: 'Viman Nagar Luxury Runway', content: 'Catch the haute couture exhibition this weekend, starting 5:00 PM at Central Plaza.', tag: 'Event' }
];

const initialProducts: MallProduct[] = [
  { id: 'p1', storeId: 's1', storeName: 'Spar Luxury Hypermarket', name: 'Organic Quinoa 1kg', price: 450, stock: 15, category: 'Groceries' },
  { id: 'p2', storeId: 's1', storeName: 'Spar Luxury Hypermarket', name: 'Avocado Pack of 2', price: 300, stock: 8, category: 'Groceries' },
  { id: 'p3', storeId: 's1', storeName: 'Spar Luxury Hypermarket', name: 'Premium Aged Basmati Rice 5kg', price: 950, stock: 20, category: 'Groceries' },
  { id: 'p4', storeId: 's2', storeName: 'Ray-Ban & Sunglass Hut', name: 'Ray-Ban Classic Wayfarer', price: 8900, stock: 5, category: 'Eyewear' },
  { id: 'p5', storeId: 's2', storeName: 'Ray-Ban & Sunglass Hut', name: 'Oakley Radar EV Path', price: 12500, stock: 3, category: 'Eyewear' },
  { id: 'p6', storeId: 's3', storeName: 'Manyavar & Mohey', name: 'Royal Sherwani Set Gold', price: 18500, stock: 4, category: 'Ethnicwear' },
  { id: 'p7', storeId: 's3', storeName: 'Manyavar & Mohey', name: 'Mohey Silk Lehenga Red', price: 24000, stock: 2, category: 'Ethnicwear' },
  { id: 'p8', storeId: 's4', storeName: 'Chanel Beauté', name: 'Bleu de Chanel Parfum 100ml', price: 14500, stock: 6, category: 'Beauty & Skincare' },
  { id: 'p9', storeId: 's4', storeName: 'Chanel Beauté', name: 'Chanel Rouge Allure Lipstick', price: 3800, stock: 12, category: 'Beauty & Skincare' },
  { id: 'p10', storeId: 's5', storeName: 'Tanishq Elite', name: 'Diamond Studded Gold Pendant', price: 45000, stock: 2, category: 'Jewellery' },
  { id: 'p11', storeId: 's7', storeName: 'Rolex Boutique', name: 'Rolex Submariner Date Steel', price: 850000, stock: 1, category: 'Watches' },
  { id: 'p12', storeId: 's7', storeName: 'Rolex Boutique', name: 'Role Oyster Perpetual 36', price: 540000, stock: 1, category: 'Watches' },
  { id: 'p13', storeId: 's8', storeName: 'Apple Store (Imagine)', name: 'iPhone 15 Pro Max 256GB', price: 159900, stock: 10, category: 'Electronics' },
  { id: 'p14', storeId: 's8', storeName: 'Apple Store (Imagine)', name: 'MacBook Air M3 13-inch', price: 114900, stock: 7, category: 'Electronics' },
  { id: 'p15', storeId: 's8', storeName: 'Apple Store (Imagine)', name: 'AirPods Pro Gen 2', price: 24900, stock: 15, category: 'Electronics' },
  { id: 'p16', storeId: 's9', storeName: 'Louis Vuitton Paris', name: 'LV Neverfull MM Damier', price: 175000, stock: 3, category: 'Bags & Accessories' },
  { id: 'p17', storeId: 's9', storeName: 'Louis Vuitton Paris', name: 'LV Speedy 30 Monogram', price: 140000, stock: 2, category: 'Bags & Accessories' }
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

  const [evReservations, setEvReservations] = useState<EvReservation[]>(() => {
    const cached = localStorage.getItem('amanora_ev_reservations');
    return cached ? JSON.parse(cached) : [
      { id: 'ev_1', bayId: 'EV-01', licensePlate: 'MH-12-RS-9988', timeSlot: '10:00 AM - 12:00 PM', status: 'Active' },
      { id: 'ev_2', bayId: 'EV-02', licensePlate: 'MH-12-PQ-8888', timeSlot: '02:00 PM - 04:00 PM', status: 'Active' }
    ];
  });

  const [handsFreeDeliveries, setHandsFreeDeliveries] = useState<HandsFreeDelivery[]>(() => {
    const cached = localStorage.getItem('amanora_handsfree');
    return cached ? JSON.parse(cached) : [
      { id: 'hfd_1', storeId: 's4', valetId: 'MH-12-RS-9988', status: 'En Route', location: 'Valet Car - Slot A-12', timestamp: new Date(Date.now() - 1800000).toISOString() }
    ];
  });

  const [vipReservations, setVipReservations] = useState<VipReservation[]>(() => {
    const cached = localStorage.getItem('amanora_vip');
    return cached ? JSON.parse(cached) : [];
  });

  const [foodCourtCart, setFoodCourtCart] = useState<FoodCartItem[]>(() => {
    const cached = localStorage.getItem('amanora_food_cart');
    return cached ? JSON.parse(cached) : [];
  });

  const [foodCourtOrders, setFoodCourtOrders] = useState<FoodCourtOrder[]>(() => {
    const cached = localStorage.getItem('amanora_food_orders');
    return cached ? JSON.parse(cached) : [];
  });

  const [tableReservations, setTableReservations] = useState<TableReservation[]>(() => {
    const cached = localStorage.getItem('amanora_table_res');
    return cached ? JSON.parse(cached) : [];
  });

  const [payroll, setPayroll] = useState<PayrollPayout[]>(() => {
    const cached = localStorage.getItem('amanora_payroll');
    return cached ? JSON.parse(cached) : [
      { id: 'pay_1', employeeId: 'emp_1', employeeName: 'Shankar Patil', month: 'June 2026', amount: 25000, status: 'Paid', transactionRef: 'TXN-998877665544', timestamp: new Date(Date.now() - 86400000 * 5).toISOString() },
      { id: 'pay_2', employeeId: 'emp_2', employeeName: 'Amol Shinde', month: 'June 2026', amount: 25000, status: 'Paid', transactionRef: 'TXN-112233445566', timestamp: new Date(Date.now() - 86400000 * 5).toISOString() },
      { id: 'pay_3', employeeId: 'emp_3', employeeName: 'Sunita Gavade', month: 'June 2026', amount: 35000, status: 'Paid', transactionRef: 'TXN-445566778899', timestamp: new Date(Date.now() - 86400000 * 5).toISOString() },
      { id: 'pay_4', employeeId: 'emp_4', employeeName: 'Ramesh Sawant', month: 'June 2026', amount: 22000, status: 'Paid', transactionRef: 'TXN-556677889900', timestamp: new Date(Date.now() - 86400000 * 5).toISOString() },
      { id: 'pay_5', employeeId: 'emp_6', employeeName: 'Vikram Phalke', month: 'June 2026', amount: 25000, status: 'Paid', transactionRef: 'TXN-887766554433', timestamp: new Date(Date.now() - 86400000 * 5).toISOString() }
    ];
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const cached = localStorage.getItem('amanora_logs');
    return cached ? JSON.parse(cached) : [
      { id: 'log_1', action: 'System Setup', details: 'Smart Mall system loaded with standard seed databases.', timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), userType: 'Admin' },
      { id: 'log_2', action: 'Lease Paid', details: 'Tenant in Unit #5 (Spar Luxury Hypermarket) processed monthly rent payment.', timestamp: new Date(Date.now() - 3600000 * 6).toISOString(), userType: 'Admin' },
      { id: 'log_3', action: 'EV Booking', details: 'EV Bay reservation created for plate MH-12-RS-9988.', timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(), userType: 'Visitor' }
    ];
  });

  const [products, setProducts] = useState<MallProduct[]>(() => {
    const cached = localStorage.getItem('amanora_products');
    return cached ? JSON.parse(cached) : initialProducts;
  });

  const [productBookings, setProductBookings] = useState<ProductBooking[]>(() => {
    const cached = localStorage.getItem('amanora_product_bookings');
    return cached ? JSON.parse(cached) : [];
  });

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

  useEffect(() => {
    localStorage.setItem('amanora_ev_reservations', JSON.stringify(evReservations));
  }, [evReservations]);

  useEffect(() => {
    localStorage.setItem('amanora_handsfree', JSON.stringify(handsFreeDeliveries));
  }, [handsFreeDeliveries]);

  useEffect(() => {
    localStorage.setItem('amanora_vip', JSON.stringify(vipReservations));
  }, [vipReservations]);

  useEffect(() => {
    localStorage.setItem('amanora_food_cart', JSON.stringify(foodCourtCart));
  }, [foodCourtCart]);

  useEffect(() => {
    localStorage.setItem('amanora_food_orders', JSON.stringify(foodCourtOrders));
  }, [foodCourtOrders]);

  useEffect(() => {
    localStorage.setItem('amanora_payroll', JSON.stringify(payroll));
  }, [payroll]);

  useEffect(() => {
    localStorage.setItem('amanora_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem('amanora_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('amanora_product_bookings', JSON.stringify(productBookings));
  }, [productBookings]);

  useEffect(() => {
    localStorage.setItem('amanora_table_res', JSON.stringify(tableReservations));
  }, [tableReservations]);

  // Operations
  const addActivityLog = (action: string, details: string, userType: 'Admin' | 'Visitor') => {
    const newLog: ActivityLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      action,
      details,
      timestamp: new Date().toISOString(),
      userType
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

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
      addActivityLog('Tenant Onboarded', `Tenant ${tenantData.tenantName} onboarded to Room #${tenantData.roomNumber} (${tenantData.shopName})`, 'Admin');
    } else {
      // If setting to vacant, remove corresponding store in the directory
      setStores(prev => prev.filter(s => s.roomNumber !== tenantData.roomNumber));
      addActivityLog('Tenant Evicted', `Tenant removed from Room #${tenantData.roomNumber}, space set to Vacant.`, 'Admin');
    }
  };

  const togglePaymentStatus = (roomNumber: number) => {
    setRooms(prev => prev.map(r => {
      if (r.roomNumber === roomNumber) {
        let nextStatus: 'Paid' | 'Pending' | 'Overdue';
        if (r.paymentStatus === 'Paid') nextStatus = 'Pending';
        else if (r.paymentStatus === 'Pending') nextStatus = 'Overdue';
        else nextStatus = 'Paid';
        addActivityLog('Rent Payment Status', `Rent status for room #${roomNumber} (${r.shopName}) updated to ${nextStatus}`, 'Admin');
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
    addActivityLog('Vehicle Registered', `Vehicle ${vehicle.licensePlate} registered in parking slot ${vehicle.slotAllocation}.`, 'Admin');
    return true;
  };

  const checkoutVehicle = (licensePlate: string) => {
    setParkingLogs(prev => prev.filter(log => log.licensePlate.toLowerCase() !== licensePlate.toLowerCase()));
    addActivityLog('Vehicle Checkout', `Vehicle with plate ${licensePlate} checked out from parking.`, 'Admin');
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
        addActivityLog('Attendance Update', `Staff member ${emp.name} marked ${status} (Clock-in: ${clockIn}).`, 'Admin');
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

  const bookEvSlot = (bayId: string, licensePlate: string, timeSlot: string): boolean => {
    if (!licensePlate.trim() || !bayId.trim() || !timeSlot.trim()) return false;
    const isOccupied = evReservations.some(
      r => r.bayId.toLowerCase() === bayId.toLowerCase() && r.status === 'Active'
    );
    if (isOccupied) return false;
    const newReservation: EvReservation = {
      id: `ev_res_${Date.now()}`,
      bayId,
      licensePlate: licensePlate.toUpperCase(),
      timeSlot,
      status: 'Active'
    };
    setEvReservations(prev => [newReservation, ...prev]);
    addActivityLog('EV Bay Reserved', `EV Charging Bay ${bayId} reserved for vehicle ${licensePlate.toUpperCase()} (${timeSlot}).`, 'Visitor');
    return true;
  };

  const requestValetDelivery = (storeId: string, valetId: string, location: string) => {
    const newDelivery: HandsFreeDelivery = {
      id: `hfd_${Date.now()}`,
      storeId,
      valetId,
      status: 'Ready',
      location,
      timestamp: new Date().toISOString()
    };
    setHandsFreeDeliveries(prev => [newDelivery, ...prev]);
    addActivityLog('Valet Pick Up', `Hands-Free valet delivery requested for valet ID ${valetId} at location ${location}.`, 'Visitor');
  };

  const bookVipEvent = (eventId: string, userName: string, ticketCount: number, seatType: string, paymentId?: string) => {
    const newReservation: VipReservation = {
      id: `vip_res_${Date.now()}`,
      eventId,
      userName,
      ticketCount,
      seatType,
      timestamp: new Date().toISOString(),
      paymentId
    };
    setVipReservations(prev => [newReservation, ...prev]);
    const logDetails = paymentId 
      ? `${userName} reserved ${ticketCount} ${seatType} seats for event ID ${eventId}. Paid via Razorpay (ID: ${paymentId}).`
      : `${userName} reserved ${ticketCount} ${seatType} seats for event ID ${eventId}.`;
    addActivityLog('VIP Event Reserved', logDetails, 'Visitor');
  };

  const addToFoodCart = (item: Omit<FoodCartItem, 'qty'>) => {
    setFoodCourtCart(prev => {
      const existing = prev.find(
        i => i.name.toLowerCase() === item.name.toLowerCase() && i.restaurant.toLowerCase() === item.restaurant.toLowerCase()
      );
      if (existing) {
        return prev.map(
          i => i.name.toLowerCase() === item.name.toLowerCase() && i.restaurant.toLowerCase() === item.restaurant.toLowerCase()
            ? { ...i, qty: i.qty + 1 }
            : i
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromFoodCart = (name: string, restaurant: string) => {
    setFoodCourtCart(prev => {
      const existing = prev.find(
        i => i.name.toLowerCase() === name.toLowerCase() && i.restaurant.toLowerCase() === restaurant.toLowerCase()
      );
      if (!existing) return prev;
      if (existing.qty > 1) {
        return prev.map(
          i => i.name.toLowerCase() === name.toLowerCase() && i.restaurant.toLowerCase() === restaurant.toLowerCase()
            ? { ...i, qty: i.qty - 1 }
            : i
        );
      }
      return prev.filter(
        i => !(i.name.toLowerCase() === name.toLowerCase() && i.restaurant.toLowerCase() === restaurant.toLowerCase())
      );
    });
  };

  const clearFoodCart = () => {
    setFoodCourtCart([]);
  };

  const checkoutFoodCart = (paymentId?: string) => {
    if (foodCourtCart.length === 0) return;
    const total = foodCourtCart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const newOrder: FoodCourtOrder = {
      id: `fc_ord_${Date.now()}`,
      items: [...foodCourtCart],
      total,
      status: 'Cooking',
      timestamp: new Date().toISOString(),
      paymentId
    };
    setFoodCourtOrders(prev => [newOrder, ...prev]);
    setFoodCourtCart([]);
    const logDetails = paymentId
      ? `Visitor checked out Food Court cart. Order ID ${newOrder.id} generated for ₹${total.toLocaleString()}. Paid via Razorpay (ID: ${paymentId}).`
      : `Visitor checked out Food Court cart. Order ID ${newOrder.id} generated for ₹${total.toLocaleString()}.`;
    addActivityLog('Food Order Placed', logDetails, 'Visitor');
  };

  const bookTableWithPreorder = (restaurantId: string, guests: number, timeSlot: string, preorders: FoodCartItem[]) => {
    const newRes: TableReservation = {
      id: `tab_res_${Date.now()}`,
      restaurantId,
      guests,
      timeSlot,
      preorders,
      timestamp: new Date().toISOString()
    };
    setTableReservations(prev => [newRes, ...prev]);
    addActivityLog('Table Reservation', `Restaurant table reservation created for ${guests} guests at time ${timeSlot}.`, 'Visitor');
  };

  const updateHandsFreeStatus = (id: string, status: HandsFreeDelivery['status']) => {
    setHandsFreeDeliveries(prev => prev.map(d => d.id === id ? { ...d, status } : d));
    addActivityLog('Hands-Free Delivery Status', `Valet Delivery #${id} updated to ${status}.`, 'Admin');
  };

  const updateFoodOrderStatus = (id: string, status: FoodCourtOrder['status']) => {
    setFoodCourtOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    addActivityLog('Food Order Status', `Food Court Order #${id} updated to ${status}.`, 'Admin');
  };

  const addStaffMember = (staff: Omit<Employee, 'status' | 'clockInTime'>) => {
    const newEmp: Employee = {
      ...staff,
      status: 'Absent',
      clockInTime: '--'
    };
    setAttendance(prev => [...prev, newEmp]);
    addActivityLog('Add Staff Member', `Added new staff member ${staff.name} (Role: ${staff.role}, Department: ${staff.department}, Base Salary: ₹${staff.salary.toLocaleString()})`, 'Admin');
  };

  const releaseSalary = (employeeId: string, month: string, payoutMethod: 'Razorpay Payouts' | 'Manual Bank' = 'Manual Bank'): string => {
    const emp = attendance.find(e => e.id === employeeId);
    if (!emp) return '';
    const txnRef = payoutMethod === 'Razorpay Payouts' 
      ? `RPAY-OUT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
      : `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const payout: PayrollPayout = {
      id: `pay_${Date.now()}`,
      employeeId,
      employeeName: emp.name,
      month,
      amount: emp.salary,
      status: 'Paid',
      transactionRef: txnRef,
      timestamp: new Date().toISOString(),
      payoutMethod
    };
    setPayroll(prev => [payout, ...prev]);
    const details = `Released salary of ₹${emp.salary.toLocaleString()} for ${emp.name} (${month}) via ${payoutMethod}. Ref: ${txnRef}`;
    addActivityLog('Payroll Released', details, 'Admin');
    return txnRef;
  };

  const reserveProduct = (
    productId: string, 
    qty: number, 
    customerName: string, 
    licensePlate?: string, 
    paymentId?: string, 
    paymentMethod: 'Razorpay' | 'In-Store' = 'In-Store'
  ) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return { success: false, error: 'Product not found' };
    if (prod.stock < qty) return { success: false, error: 'Insufficient stock available' };

    // Check Geolocation Discount condition (is their vehicle registered in the parking lot)
    let isGeoDiscount = false;
    if (licensePlate) {
      const formattedPlate = licensePlate.trim().toLowerCase();
      isGeoDiscount = parkingLogs.some(log => log.licensePlate.toLowerCase() === formattedPlate);
    }

    // Prepay online grants an extra 10% discount on top of geolocation discount!
    let discountMultiplier = 1.0;
    if (isGeoDiscount) discountMultiplier -= 0.15;
    if (paymentMethod === 'Razorpay') discountMultiplier -= 0.10;

    const pricePerUnit = prod.price * discountMultiplier;
    const totalAmount = pricePerUnit * qty;
    const discountApplied = (prod.price - pricePerUnit) * qty;

    const booking: ProductBooking = {
      id: `res_${Date.now()}`,
      productId,
      productName: prod.name,
      storeId: prod.storeId,
      storeName: prod.storeName,
      customerName,
      quantity: qty,
      total: totalAmount,
      discount: discountApplied,
      status: 'Reserved',
      isGeoDiscount,
      timestamp: new Date().toISOString(),
      paymentId,
      paymentMethod
    };

    // Decrement stock
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: p.stock - qty } : p));
    setProductBookings(prev => [booking, ...prev]);
    
    const details = paymentMethod === 'Razorpay'
      ? `Visitor ${customerName} pre-paid and reserved ${qty}x ${prod.name} from ${prod.storeName} via Razorpay (ID: ${paymentId}). Discount: ₹${discountApplied.toLocaleString()}.`
      : `Visitor ${customerName} reserved ${qty}x ${prod.name} from ${prod.storeName} (Hold in-store). Discount: ₹${discountApplied.toLocaleString()}.`;
    addActivityLog('Product Reserved', details, 'Visitor');

    return { success: true, booking };
  };

  const pickupBooking = (bookingId: string) => {
    setProductBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        addActivityLog('Product Picked Up', `Reservation #${bookingId} for ${b.customerName} marked as Picked Up.`, 'Admin');
        return { ...b, status: 'Picked Up' as const };
      }
      return b;
    }));
  };

  return (
    <MallContext.Provider value={{
      stores,
      rooms,
      parkingLogs,
      attendance,
      savedCoupons,
      announcements,
      evReservations,
      handsFreeDeliveries,
      vipReservations,
      foodCourtCart,
      foodCourtOrders,
      tableReservations,
      payroll,
      activityLogs,
      products,
      productBookings,
      onboardTenant,
      togglePaymentStatus,
      registerVehicle,
      checkoutVehicle,
      updateAttendance,
      toggleSaveCoupon,
      exportRevenueSummary,
      bookEvSlot,
      requestValetDelivery,
      bookVipEvent,
      addToFoodCart,
      removeFromFoodCart,
      clearFoodCart,
      checkoutFoodCart,
      bookTableWithPreorder,
      updateHandsFreeStatus,
      updateFoodOrderStatus,
      addStaffMember,
      releaseSalary,
      addActivityLog,
      reserveProduct,
      pickupBooking
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
