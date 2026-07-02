import React, { useState } from 'react';
import { MallProvider } from './context/MallContext';
import { TopNav } from './components/Layout/TopNav';
import { Sidebar } from './components/Layout/Sidebar';
import { BottomNav } from './components/Layout/BottomNav';

// Visitor Sections
import { HeroSection } from './components/Visitor/HeroSection';
import { Directory } from './components/Visitor/Directory';
import { FloorMap } from './components/Visitor/FloorMap';
import { OffersHub } from './components/Visitor/OffersHub';

// Admin Sections
import { TenantManager } from './components/Admin/TenantManager';
import { CCTVControl } from './components/Admin/CCTVControl';
import { SmartParking } from './components/Admin/SmartParking';
import { AttendanceLogger } from './components/Admin/AttendanceLogger';

const MainLayout: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Main Page Router Logic
  const renderContent = () => {
    if (isAdmin) {
      switch (activeSection) {
        case 'tenants':
          return <TenantManager />;
        case 'cctv':
          return <CCTVControl />;
        case 'parking':
          return <SmartParking />;
        case 'attendance':
          return <AttendanceLogger />;
        default:
          return <TenantManager />;
      }
    } else {
      switch (activeSection) {
        case 'home':
          return <HeroSection />;
        case 'directory':
          return <Directory />;
        case 'map':
          return <FloorMap />;
        case 'offers':
          return <OffersHub />;
        default:
          return <HeroSection />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-luxury-darkBg text-slate-100 flex flex-col font-sans">
      {/* Global Header */}
      <TopNav 
        isAdmin={isAdmin} 
        setIsAdmin={setIsAdmin} 
        setActiveSection={setActiveSection} 
      />

      {/* Main Workspace layout */}
      <div className="flex flex-1 relative">
        {/* Desktop Left Sidebar */}
        <Sidebar 
          isAdmin={isAdmin} 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
        />

        {/* Content Viewer viewport */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+70px)] lg:pb-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Mobile Sticky Bottom Nav Bar */}
      <BottomNav 
        isAdmin={isAdmin} 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
      />
    </div>
  );
};

function App() {
  return (
    <MallProvider>
      <MainLayout />
    </MallProvider>
  );
}

export default App;
