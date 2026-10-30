import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ClinicProvider, useClinic } from './context/ClinicContext';
import { Service } from './types/database';
import { isSupabaseConfigured, supabaseUrl } from './lib/supabase';
import { Navbar } from './components/public/Navbar';
import { Hero } from './components/public/Hero';
import { ServicesSection } from './components/public/ServicesSection';
import { AboutSection } from './components/public/AboutSection';
import { BookingSection } from './components/public/BookingSection';
import { Footer } from './components/public/Footer';
import { SqlSetupModal } from './components/public/SqlSetupModal';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import { FloatingWhatsApp } from './components/public/FloatingWhatsApp';
import { Database, AlertTriangle, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { user, isAdmin, loading, adminCheckCompleted } = useAuth();
  const { settings } = useClinic();

  // Navigation mode: 'public' or 'admin'
  const [viewMode, setViewMode] = useState<'public' | 'admin'>('public');

  // Service selected from ServicesSection to prefill in BookingSection
  const [selectedServiceToBook, setSelectedServiceToBook] = useState<Service | null>(null);

  // SQL schema setup modal state
  const [isSqlModalOpen, setIsSqlModalOpen] = useState<boolean>(false);

  // Sandbox bypass for testing dashboard when testing locally before Supabase is connected
  const [previewAdminUnlocked, setPreviewAdminUnlocked] = useState<boolean>(false);

  const handleSelectServiceToBook = (service: Service) => {
    setSelectedServiceToBook(service);
    const bookingEl = document.getElementById('booking');
    if (bookingEl) {
      bookingEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookNowClick = () => {
    const bookingEl = document.getElementById('booking');
    if (bookingEl) {
      bookingEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExploreServicesClick = () => {
    const servicesEl = document.getElementById('services');
    if (servicesEl) {
      servicesEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // If view is Admin
  if (viewMode === 'admin') {
    // If still verifying session and admin_users authorization
    if (loading || (!adminCheckCompleted && !previewAdminUnlocked)) {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white">
          <Loader2 className="w-8 h-8 text-teal-400 animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-300">Verifying clinic credentials & authorization...</p>
        </div>
      );
    }

    // If verified admin in admin_users, or preview unlocked
    if (isAdmin || previewAdminUnlocked) {
      return (
        <>
          <AdminLayout
            onBackToWebsite={() => {
              setPreviewAdminUnlocked(false);
              setViewMode('public');
            }}
            onSignOut={() => {
              setPreviewAdminUnlocked(false);
              setViewMode('public');
            }}
            onOpenSqlModal={() => setIsSqlModalOpen(true)}
          />
          {isSqlModalOpen && (
            <SqlSetupModal onClose={() => setIsSqlModalOpen(false)} />
          )}
        </>
      );
    }

    // Otherwise show AdminLogin
    return (
      <>
        <div className="relative">
          {/* Quick tester helper if testing dashboard before Supabase account setup */}
          {!isSupabaseConfigured && (
            <div className="bg-amber-500/20 text-amber-200 border-b border-amber-500/30 px-4 py-2 text-xs flex items-center justify-between">
              <span>Supabase credentials not yet set in .env. Want to inspect the admin dashboard in preview mode?</span>
              <button
                type="button"
                onClick={() => setPreviewAdminUnlocked(true)}
                className="ml-3 px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded font-bold text-xs cursor-pointer"
              >
                Inspect Dashboard
              </button>
            </div>
          )}

          <AdminLogin
            onBackToWebsite={() => {
              setPreviewAdminUnlocked(false);
              setViewMode('public');
            }}
            onOpenSqlModal={() => setIsSqlModalOpen(true)}
          />
        </div>
        {isSqlModalOpen && (
          <SqlSetupModal onClose={() => setIsSqlModalOpen(false)} />
        )}
      </>
    );
  }

  // Public Clinic Website View
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      {/* Public Navbar */}
      <Navbar
        onOpenAdmin={() => setViewMode('admin')}
        onBookNow={handleBookNowClick}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        <Hero
          onBookNow={handleBookNowClick}
          onExploreServices={handleExploreServicesClick}
        />

        <ServicesSection
          onSelectServiceToBook={handleSelectServiceToBook}
        />

        <AboutSection />

        <BookingSection
          selectedServiceFromParent={selectedServiceToBook}
          onClearParentService={() => setSelectedServiceToBook(null)}
          onOpenSqlModal={() => setIsSqlModalOpen(true)}
        />
      </main>

      {/* Footer */}
      <Footer
        onOpenAdmin={() => setViewMode('admin')}
        onOpenSqlModal={() => setIsSqlModalOpen(true)}
      />

      {/* Floating WhatsApp Widget */}
      <FloatingWhatsApp
        phoneNumber="2349160336411"
        customMessage="welcome to dental clinic , please make your request,thank you."
      />

      {/* SQL Setup Modal */}
      {isSqlModalOpen && (
        <SqlSetupModal onClose={() => setIsSqlModalOpen(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ClinicProvider>
        <MainAppContent />
      </ClinicProvider>
    </AuthProvider>
  );
}
