import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useClinic } from '../../context/ClinicContext';
import { Service, Appointment } from '../../types/database';
import { OverviewView } from './OverviewView';
import { AppointmentsView } from './AppointmentsView';
import { ServicesView } from './ServicesView';
import { BusinessHoursView } from './BusinessHoursView';
import { BlockedDatesView } from './BlockedDatesView';
import { ClinicSettingsView } from './ClinicSettingsView';
import { AppointmentModal } from './AppointmentModal';
import { ServiceModal } from './ServiceModal';
import {
  LayoutDashboard,
  CalendarDays,
  Sparkles,
  Clock,
  CalendarOff,
  Settings,
  LogOut,
  ExternalLink,
  Shield,
  Database,
  Menu,
  X,
} from 'lucide-react';

interface AdminLayoutProps {
  onBackToWebsite: () => void;
  onOpenSqlModal: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onBackToWebsite, onOpenSqlModal }) => {
  const { user, signOut } = useAuth();
  const { settings, appointments } = useClinic();

  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Modals state
  const [activeAppointmentModal, setActiveAppointmentModal] = useState<{
    isOpen: boolean;
    appointment?: Appointment | null;
  }>({ isOpen: false, appointment: null });

  const [activeServiceModal, setActiveServiceModal] = useState<{
    isOpen: boolean;
    service?: Service | null;
  }>({ isOpen: false, service: null });

  const pendingCount = appointments.filter(a => a.status === 'pending').length;

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'appointments', label: 'Appointments', icon: CalendarDays, badge: pendingCount > 0 ? pendingCount : undefined },
    { id: 'services', label: 'Services', icon: Sparkles },
    { id: 'business-hours', label: 'Business Hours', icon: Clock },
    { id: 'blocked-dates', label: 'Blocked Dates', icon: CalendarOff },
    { id: 'clinic-settings', label: 'Clinic Settings', icon: Settings },
  ];

  const handleOpenAppointmentModal = (appt?: Appointment) => {
    setActiveAppointmentModal({ isOpen: true, appointment: appt || null });
  };

  const handleOpenServiceModal = (service?: Service) => {
    setActiveServiceModal({ isOpen: true, service: service || null });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 font-sans">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-slate-900 truncate">
            {settings.clinic_name || 'Clinic Admin'}
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-600 hover:text-slate-900"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 z-30 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 transition-transform duration-200 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Brand header */}
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-500/20">
                <Shield className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-sm text-white truncate">
                  {settings.clinic_name || 'Lumina Dental'}
                </div>
                <div className="text-[11px] text-teal-400 font-medium">Dental Office Portal</div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="bg-amber-500 text-slate-950 font-extrabold text-[10px] px-1.5 py-0.2 rounded-full tabular-nums">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom links */}
          <div className="p-4 border-t border-slate-800 space-y-2">
            <button
              onClick={onOpenSqlModal}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-400 hover:text-teal-400 transition-colors cursor-pointer"
            >
              <Database className="w-4 h-4 text-slate-400" />
              <span>Supabase Schema SQL</span>
            </button>

            <button
              onClick={onBackToWebsite}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-slate-400" />
              <span>View Public Website</span>
            </button>

            <button
              onClick={signOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Admin</span>
            <span aria-hidden="true">/</span>
            <span className="text-slate-900 font-bold capitalize">
              {currentTab.replace('-', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-900">{user?.email || 'Office Manager'}</div>
              <div className="text-[11px] text-teal-700">Authorized Administrator</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center uppercase">
              {user?.email?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        {/* View Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          {currentTab === 'overview' && (
            <OverviewView
              onNavigateTab={setCurrentTab}
              onOpenAppointmentModal={handleOpenAppointmentModal}
              onOpenServiceModal={() => handleOpenServiceModal()}
            />
          )}

          {currentTab === 'appointments' && (
            <AppointmentsView
              onOpenAppointmentModal={handleOpenAppointmentModal}
            />
          )}

          {currentTab === 'services' && (
            <ServicesView
              onOpenServiceModal={handleOpenServiceModal}
            />
          )}

          {currentTab === 'business-hours' && <BusinessHoursView />}

          {currentTab === 'blocked-dates' && <BlockedDatesView />}

          {currentTab === 'clinic-settings' && <ClinicSettingsView />}
        </main>
      </div>

      {/* Appointment Detail / Walk-In Modal */}
      {activeAppointmentModal.isOpen && (
        <AppointmentModal
          appointment={activeAppointmentModal.appointment}
          onClose={() => setActiveAppointmentModal({ isOpen: false, appointment: null })}
        />
      )}

      {/* Service Add/Edit Modal */}
      {activeServiceModal.isOpen && (
        <ServiceModal
          serviceToEdit={activeServiceModal.service}
          onClose={() => setActiveServiceModal({ isOpen: false, service: null })}
        />
      )}
    </div>
  );
};
