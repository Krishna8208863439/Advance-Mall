import React, { useMemo } from 'react';
import { MallProvider } from './context/MallContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { TopNav } from './components/Layout/TopNav';
import { Sidebar } from './components/Layout/Sidebar';
import { BottomNav } from './components/Layout/BottomNav';
import { HeroSection } from './components/Visitor/HeroSection';
import { Directory } from './components/Visitor/Directory';
import { FloorMap } from './components/Visitor/FloorMap';
import { OffersHub } from './components/Visitor/OffersHub';
import { VipConcierge } from './components/Visitor/VipConcierge';
import { MallAtoms } from './components/Visitor/MallAtoms';
import { AdminLogin } from './components/Admin/AdminLogin';
import { ForgotPassword } from './components/Admin/ForgotPassword';
import { ResetPassword } from './components/Admin/ResetPassword';
import { AdminDashboard } from './components/Admin/AdminDashboard';

const VisitorLayout: React.FC = () => {
  const [activeSection, setActiveSection] = React.useState('home');

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <HeroSection />;
      case 'directory':
        return <Directory />;
      case 'map':
        return <FloorMap />;
      case 'offers':
        return <OffersHub />;
      case 'concierge':
        return <VipConcierge />;
      case 'mallatoms':
        return <MallAtoms />;
      default:
        return <HeroSection />;
    }
  };

  return (
    <div className="min-h-screen bg-luxury-darkBg text-slate-100 flex flex-col font-sans">
      <TopNav setActiveSection={setActiveSection} />

      <div className="flex flex-1 relative">
        <Sidebar
          isAdmin={false}
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
        isAdmin={false}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
    </div>
  );
};

const AdminRouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-luxury-darkBg flex items-center justify-center text-luxury-gold">
        Verifying admin session...
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = '/admin/login';
    return null;
  }

  return <>{children}</>;
};

const AppRouter: React.FC = () => {
  const route = useMemo(() => {
    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    if (path.startsWith('/admin/login')) return 'admin-login';
    if (path.startsWith('/admin/forgot-password')) return 'admin-forgot';
    if (path.startsWith('/admin/reset-password')) return 'admin-reset';
    if (path.startsWith('/admin')) return 'admin-dashboard';
    return 'visitor';
  }, []);

  if (route === 'admin-login') {
    return <AdminLogin />;
  }

  if (route === 'admin-forgot') {
    return <ForgotPassword />;
  }

  if (route === 'admin-reset') {
    return <ResetPassword />;
  }

  if (route === 'admin-dashboard') {
    return (
      <AdminRouteGuard>
        <AdminDashboard />
      </AdminRouteGuard>
    );
  }

  return <VisitorLayout />;
};

function App() {
  return (
    <AdminAuthProvider>
      <MallProvider>
        <AppRouter />
      </MallProvider>
    </AdminAuthProvider>
  );
}

export default App;
