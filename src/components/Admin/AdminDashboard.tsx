import React, { useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { TopNav } from '../Layout/TopNav';
import { Sidebar } from '../Layout/Sidebar';
import { BottomNav } from '../Layout/BottomNav';
import { TenantManager } from './TenantManager';
import { FinanceBilling } from './FinanceBilling';
import { CCTVControl } from './CCTVControl';
import { SmartParking } from './SmartParking';
import { AttendanceLogger } from './AttendanceLogger';
import { FaceRecognitionAttendance } from './FaceRecognitionAttendance';
import { LiveStaffGPS } from './LiveStaffGPS';
import { SmartEnergy } from './SmartEnergy';
import { DynamicLeasing } from './DynamicLeasing';
import { EmergencyModule } from './EmergencyModule';
import { AiAnalyticsPredictions } from './AiAnalyticsPredictions';
import { SystemHistory } from './SystemHistory';
import { FloorMap } from '../Visitor/FloorMap';
import { Shield } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { adminEmail, logout } = useAdminAuth();
  const [activeSection, setActiveSection] = useState('tenants');
  const [currentRole, setCurrentRole] = useState<'SUPER_ADMIN' | 'TENANT' | 'SECURITY' | 'STAFF'>('SUPER_ADMIN');

  const handleLogout = async () => {
    await logout();
    window.location.href = '/admin/login';
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'tenants':
        return <TenantManager />;
      case 'finance-billing':
        return <FinanceBilling />;
      case 'cctv':
        return <CCTVControl />;
      case 'parking':
        return <SmartParking />;
      case 'attendance':
        return <AttendanceLogger />;
      case 'face-attendance':
        return <FaceRecognitionAttendance />;
      case 'gps-radar':
        return <LiveStaffGPS />;
      case 'smart-energy':
        return <SmartEnergy />;
      case 'dynamic-leasing':
        return <DynamicLeasing />;
      case 'emergency-module':
        return <EmergencyModule />;
      case 'ai-analytics':
        return <AiAnalyticsPredictions />;
      case 'heatmap':
        return <FloorMap isAdminView={true} />;
      case 'history':
        return <SystemHistory />;
      default:
        return <TenantManager />;
    }
  };

  return (
    <div className="min-h-screen bg-luxury-darkBg text-slate-100 flex flex-col font-sans">
      <TopNav
        isAdmin={true}
        adminEmail={adminEmail}
        onLogout={handleLogout}
        setActiveSection={setActiveSection}
      />

      {/* Role Based Access Control Bar */}
      <div className="bg-luxury-darkCard border-b border-luxury-darkBorder px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-luxury-gold" />
          <span className="font-extrabold text-white">Active RBAC Persona:</span>
          <span className="font-mono text-luxury-gold uppercase font-bold bg-luxury-gold/10 px-2 py-0.5 rounded border border-luxury-gold/20">
            {currentRole}
          </span>
        </div>

        <div className="flex bg-luxury-darkBg p-1 rounded-lg border border-luxury-darkBorder space-x-1">
          <button
            onClick={() => { setCurrentRole('SUPER_ADMIN'); setActiveSection('tenants'); }}
            className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition ${
              currentRole === 'SUPER_ADMIN' ? 'bg-luxury-gold text-black shadow-gold-glow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Super Admin
          </button>
          <button
            onClick={() => { setCurrentRole('TENANT'); setActiveSection('finance-billing'); }}
            className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition ${
              currentRole === 'TENANT' ? 'bg-luxury-gold text-black shadow-gold-glow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tenant Portal
          </button>
          <button
            onClick={() => { setCurrentRole('SECURITY'); setActiveSection('cctv'); }}
            className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition ${
              currentRole === 'SECURITY' ? 'bg-luxury-gold text-black shadow-gold-glow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Security Staff
          </button>
          <button
            onClick={() => { setCurrentRole('STAFF'); setActiveSection('gps-radar'); }}
            className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition ${
              currentRole === 'STAFF' ? 'bg-luxury-gold text-black shadow-gold-glow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Mall Staff
          </button>
        </div>
      </div>

      <div className="flex flex-1 relative">
        <Sidebar
          isAdmin={true}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+70px)] lg:pb-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      <BottomNav
        isAdmin={true}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
    </div>
  );
};
