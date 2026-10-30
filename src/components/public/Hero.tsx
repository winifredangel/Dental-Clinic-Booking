import React from 'react';
import { CLINIC_IMAGES } from '../../assets/clinicImages';
import { CalendarCheck, ShieldCheck, HeartHandshake, Award, Clock } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';

interface HeroProps {
  onBookNow: () => void;
  onExploreServices: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onBookNow, onExploreServices }) => {
  const { settings } = useClinic();

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 bg-gradient-to-b from-slate-50 via-teal-50/20 to-white">
      {/* Subtle organic light reflections */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-cyan-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Core Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            {/* Unboxed editorial category indicator (Zero-Pill discipline) */}
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-teal-800 uppercase">
              <span>Comprehensive Dental Care</span>
              <span aria-hidden="true">·</span>
              <span>Preventative & Aesthetic Dentistry</span>
              <span aria-hidden="true">·</span>
              <span>Advanced 3D Diagnostics</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.12]" style={{ textWrap: 'balance' }}>
              Where gentle dentistry meets modern precision care.
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl">
              Experience serene, unhurried dental appointments designed around your comfort. From comprehensive oral hygiene to restorative smile care, our experienced clinical team delivers exceptional outcomes in a calming environment.
            </p>

            {/* CTAs and quick trust cues */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={onBookNow}
                className="inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold text-white bg-teal-600 rounded-xl hover:bg-teal-700 active:scale-[0.98] transition-all shadow-md shadow-teal-700/20 whitespace-nowrap cursor-pointer"
              >
                <CalendarCheck className="w-5 h-5 mr-2.5" />
                Schedule Your Visit
              </button>

              <button
                onClick={onExploreServices}
                className="inline-flex items-center justify-center px-6 py-3.5 text-base font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-teal-800 transition-colors shadow-xs whitespace-nowrap cursor-pointer"
              >
                Explore Services & Pricing
              </button>
            </div>

            {/* Unboxed metadata trust points */}
            <div className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
              <div className="flex items-center gap-1.5 text-slate-700">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Hospital-Grade Sterilization</span>
              </div>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <div className="flex items-center gap-1.5 text-slate-700">
                <HeartHandshake className="w-4 h-4 text-teal-600" />
                <span>Anxiety-Free Compassionate Care</span>
              </div>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <div className="flex items-center gap-1.5 text-slate-700">
                <Clock className="w-4 h-4 text-teal-600" />
                <span>Same-Day Emergency Consults</span>
              </div>
            </div>
          </div>

          {/* Right Column: High-Impact Dental Imagery */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-xl shadow-slate-900/5 bg-slate-100 group">
              <img
                src={CLINIC_IMAGES.hero}
                alt="Modern, bright Lumina Dental Studio reception and clinical care suites"
                className="w-full h-[400px] sm:h-[480px] lg:h-[500px] object-cover object-center group-hover:scale-[1.02] transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              
              {/* Subtle architectural lighting scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent pointer-events-none" />

              {/* Informational overlay card with verified details */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-white/95 backdrop-blur-md border border-white/60 shadow-lg text-slate-900">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {settings.clinic_name || 'Lumina Dental Studio'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Private Patient Operatory · Seattle, WA
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-teal-700">Accepting Patients</div>
                    <div className="text-[11px] text-slate-500">Digital Scans & Booking</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Column Proof & Mechanism Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 p-6 sm:p-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">15,000+</div>
            <div className="text-xs font-semibold text-teal-700 uppercase tracking-wider">Smiles Restored</div>
            <p className="text-xs text-slate-500">Patients cared for with gentle preventative protocols.</p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">100%</div>
            <div className="text-xs font-semibold text-teal-700 uppercase tracking-wider">Digital Imaging</div>
            <p className="text-xs text-slate-500">Ultra-low radiation 3D diagnostics and intraoral scanners.</p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">4.9 / 5.0</div>
            <div className="text-xs font-semibold text-teal-700 uppercase tracking-wider">Patient Trust Rating</div>
            <p className="text-xs text-slate-500">Verified reviews on clinical warmth and comfort.</p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">0%</div>
            <div className="text-xs font-semibold text-teal-700 uppercase tracking-wider">Hidden Fees</div>
            <p className="text-xs text-slate-500">Transparent pricing disclosed before any procedure begins.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
