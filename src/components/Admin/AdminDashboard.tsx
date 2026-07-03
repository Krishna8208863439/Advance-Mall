import React, { useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { TopNav } from '../Layout/TopNav';
import { Sidebar } from '../Layout/Sidebar';
import { BottomNav } from '../Layout/BottomNav';
import { TenantManager } from './TenantManager';
import { CCTVControl } from './CCTVControl';
import { SmartParking } from './SmartParking';
import { AttendanceLogger } from './AttendanceLogger';
import { SystemHistory } from './SystemHistory';
import { FloorMap } from '../Visitor/FloorMap';

export const AdminDashboard: React.FC = () => {
  const { adminEmail, logout } = useAdminAuth();
  const [activeSection, setActiveSection] = useState('tenants');

  const handleLogout = async () => {
    await logout();
    window.location.href = '/admin/login';
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'tenants':
        return <TenantManager />;
      case 'cctv':
        return <CCTVControl />;
      case 'parking':
        return <SmartParking />;
      case 'attendance':
        return <AttendanceLogger />;
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
