import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';
import { Shield, Sparkles, PhoneCall } from 'lucide-react';

interface NavbarProps {
  onOpenAdmin: () => void;
  onBookNow: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAdmin, onBookNow }) => {
  const { settings } = useClinic();
  const { isAdmin, user } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-20">
          {/* Zone 1: Single text element wordmark */}
          <a href="#" className="flex items-center gap-3 text-slate-900 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-500/20 group-hover:bg-teal-700 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8.5 2 6 4.5 6 7.5c0 2 .8 4.2 1.5 6.5.7 2.3 1.5 5 2.5 7 1 2 2 3 2 3s1-1 2-3c1-2 1.8-4.7 2.5-7 .7-2.3 1.5-4.5 1.5-6.5C18 4.5 15.5 2 12 2z"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-950 font-sans">
                {settings.clinic_name || 'PearlDent Oral Care'}
              </span>
              <span className="text-xs text-slate-500 hidden sm:inline">Modern Dentistry & Oral Wellness</span>
            </div>
          </a>

          {/* Zone 2: 4 clean single-line nav links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#services" className="hover:text-teal-700 transition-colors whitespace-nowrap shrink-0">
              Services
            </a>
            <a href="#about" className="hover:text-teal-700 transition-colors whitespace-nowrap shrink-0">
              About Practice
            </a>
            <a href="#experience" className="hover:text-teal-700 transition-colors whitespace-nowrap shrink-0">
              Patient Care
            </a>
            <a href="#contact" className="hover:text-teal-700 transition-colors whitespace-nowrap shrink-0">
              Hours & Location
            </a>
          </nav>

          {/* Zone 3: 1 primary action + prominent phone + subtle staff login affordance */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`tel:${settings.clinic_phone || '09160336411'}`}
              className="hidden sm:flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 hover:text-teal-800 bg-teal-50/90 hover:bg-teal-100/90 px-3 py-2 rounded-xl border border-teal-200/80 transition-all shadow-xs"
              title="Call PearlDent Oral Care"
            >
              <PhoneCall className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="tabular-nums">{settings.clinic_phone || '09160336411'}</span>
            </a>

            <button
              onClick={onBookNow}
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 active:scale-[0.98] transition-all shadow-sm shadow-teal-700/15 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Book Appointment
            </button>

            <button
              onClick={onOpenAdmin}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer relative"
              title={isAdmin ? "Go to Admin Dashboard" : "Staff / Admin Portal"}
              aria-label="Staff Login"
            >
              <Shield className={`w-5 h-5 ${isAdmin ? 'text-teal-600' : ''}`} />
              {isAdmin && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full"></span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
