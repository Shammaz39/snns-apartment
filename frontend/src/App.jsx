import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import api from './api/client';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import PopupNoticeModal from './components/PopupNoticeModal';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FloorsPage from './pages/FloorsPage';
import RoomsPage from './pages/RoomsPage';
import TenantsPage from './pages/TenantsPage';
import StaffPage from './pages/StaffPage';
import GatekeeperPage from './pages/GatekeeperPage';
import BillsPage from './pages/BillsPage';
import ResidentPortal from './pages/ResidentPortal';
import EventsPage from './pages/EventsPage';
import ComplaintsPage from './pages/ComplaintsPage';
import SettingsPage from './pages/SettingsPage';
import EmergencyContactsPage from './pages/EmergencyContactsPage';

function ProtectedLayout() {
  const { user, isAdmin, isSecurity, loading } = useAuth();
  const [apartmentName, setApartmentName] = useState('SNNS Apartment');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    api.get('/settings/public')
      .then((res) => {
        if (res.data?.apartmentName) setApartmentName(res.data.apartmentName);
      })
      .catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app text-content-secondary text-sm font-semibold animate-pulse">
        Loading SNNS Apartment Platform...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-app flex flex-col transition-colors duration-200">
      <Navbar
        apartmentName={apartmentName}
        onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        isMobileMenuOpen={mobileMenuOpen}
      />
      <PopupNoticeModal />

      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-colors duration-200">
          <Routes>
            {isAdmin ? (
              <>
                <Route path="/" element={<Dashboard />} />
                <Route path="/floors" element={<FloorsPage />} />
                <Route path="/rooms" element={<RoomsPage />} />
                <Route path="/tenants" element={<TenantsPage />} />
                <Route path="/staff" element={<StaffPage />} />
                <Route path="/gate" element={<GatekeeperPage />} />
                <Route path="/bills" element={<BillsPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/complaints" element={<ComplaintsPage />} />
                <Route path="/emergency-contacts" element={<EmergencyContactsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            ) : isSecurity ? (
              <>
                <Route path="/" element={<Navigate to="/gate" replace />} />
                <Route path="/gate" element={<GatekeeperPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="*" element={<Navigate to="/gate" replace />} />
              </>
            ) : (
              <>
                <Route path="/" element={<ResidentPortal />} />
                <Route path="/gate" element={<GatekeeperPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/complaints" element={<ComplaintsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
