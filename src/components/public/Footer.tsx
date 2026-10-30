import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { WEEKDAYS } from '../../lib/dateUtils';
import { MapPin, Phone, Mail, Clock, Shield, Sparkles } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
  onOpenSqlModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onOpenSqlModal }) => {
  const { settings, businessHours } = useClinic();

  return (
    <footer id="contact" className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white">
              <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-white shadow-sm shadow-teal-500/30">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C8.5 2 6 4.5 6 7.5c0 2 .8 4.2 1.5 6.5.7 2.3 1.5 5 2.5 7 1 2 2 3 2 3s1-1 2-3c1-2 1.8-4.7 2.5-7 .7-2.3 1.5-4.5 1.5-6.5C18 4.5 15.5 2 12 2z"/>
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                {settings.clinic_name || 'Lumina Dental Studio'}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Gentle, high-precision dental care for families and individuals. Committed to preventative wellness, comfort, and restorative dentistry.
            </p>
            <div className="text-[11px] text-teal-400">
              American Dental Association (ADA) Clinical Standards
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Contact & Location
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span className="text-slate-300">{settings.clinic_address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <a href={`tel:${settings.clinic_phone}`} className="text-slate-300 hover:text-white transition-colors">
                  {settings.clinic_phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <a href={`mailto:${settings.clinic_email}`} className="text-slate-300 hover:text-white transition-colors">
                  {settings.clinic_email}
                </a>
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              Office Hours
            </h4>
            <div className="space-y-1.5 text-xs">
              {businessHours.map(bh => (
                <div key={bh.weekday} className="flex items-center justify-between py-0.5">
                  <span className="text-slate-400">{WEEKDAYS[bh.weekday]}:</span>
                  <span className="text-slate-200 tabular-nums">
                    {bh.is_open
                      ? `${bh.start_time.slice(0, 5)} - ${bh.end_time.slice(0, 5)}`
                      : 'Closed'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links & Staff Access */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Patient & Portal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#services" className="hover:text-white transition-colors">Dental Services & Rates</a>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition-colors">Sterilization Standards</a>
              </li>
              <li>
                <a href="#booking" className="hover:text-white transition-colors">Book Online Visit</a>
              </li>
              <li className="pt-2">
                <button
                  onClick={onOpenAdmin}
                  className="inline-flex items-center gap-2 text-xs text-teal-400 hover:text-teal-300 font-semibold cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Staff & Admin Portal
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenSqlModal}
                  className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  Supabase Schema SQL
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} {settings.clinic_name || 'Lumina Dental Studio'}. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>HIPAA Compliant</span>
            <span aria-hidden="true">·</span>
            <span>OSHA Certified Facility</span>
            <span aria-hidden="true">·</span>
            <span>Digital Patient Records</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
