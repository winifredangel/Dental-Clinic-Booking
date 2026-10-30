import React from 'react';
import { CLINIC_IMAGES, handleImageFallback } from '../../assets/clinicImages';
import { useClinic } from '../../context/ClinicContext';
import { Check, ShieldCheck, Microscope, HeartHandshake, Sparkles } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const { settings } = useClinic();

  const clinicalPillars = [
    {
      title: 'Comfort-First Treatment Protocol',
      description: 'We believe dental visits should be relaxing. Noise-cancelling headphones, gentle numbing techniques, and unhurried appointments ensure stress-free visits.',
    },
    {
      title: '3D Guided Digital Precision',
      description: 'Low-dose digital panoramic imaging and high-resolution intraoral cameras let you see exactly what the dentist sees, with zero guesswork.',
    },
    {
      title: 'Microbial Hygiene & Air Filtration',
      description: 'Hospital-grade autoclaves with biological spore testing and medical HEPA air filtration exceeding standard CDC clinical benchmarks.',
    },
    {
      title: 'Long-Term Oral Longevity',
      description: 'We focus on preventative health and conservative restorations that preserve your natural enamel structure for decades to come.',
    },
  ];

  return (
    <section id="about" className="py-24 bg-white border-t border-slate-200/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid layout with layered imagery */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Visual Side */}
          <div className="lg:col-span-6 relative">
            <div className="relative">
              {/* Primary Image: Doctor consultation */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-100">
                <img
                  src={CLINIC_IMAGES.consultation}
                  alt="Dr. Jenains consulting with a dental patient reviewing digital scan results"
                  className="w-full h-[380px] sm:h-[420px] object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => handleImageFallback(e, 'consultation')}
                />
              </div>

              {/* Secondary Overlapping Image: Treatment Room */}
              <div className="hidden sm:block absolute -bottom-10 -right-6 w-3/5 rounded-xl overflow-hidden border-4 border-white shadow-2xl bg-slate-100">
                <img
                  src={CLINIC_IMAGES.treatmentSuite}
                  alt="State of the art hygienic dental operatory chair and ergonomic equipment"
                  className="w-full h-48 object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => handleImageFallback(e, 'treatmentSuite')}
                />
              </div>

              {/* Subtle Trust Badge */}
              <div className="absolute top-4 left-4 p-3 rounded-lg bg-white/95 backdrop-blur-md border border-slate-200 shadow-md">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-600" />
                  <span className="text-xs font-bold text-slate-800">ADA Accredited Standards</span>
                </div>
              </div>
            </div>
          </div>

          {/* Text & Pillars Side */}
          <div className="lg:col-span-6 space-y-6">
            <div className="text-xs font-semibold tracking-wider text-teal-800 uppercase">
              The {settings.clinic_name || 'PearlDent Oral Care'} Difference
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight" style={{ textWrap: 'balance' }}>
              Redefining dental wellness with genuine warmth and clinical excellence.
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Founded on the principle that dental care should be compassionate, transparent, and entirely comfortable. Whether you are coming in for routine maintenance or comprehensive smile rejuvenation, you are supported every step of the way.
            </p>

            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {clinicalPillars.map((pillar, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span>{pillar.title}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-normal pl-7">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-500">
              <span>Dr. Sarah Jenains, DDS · Lead Clinician</span>
              <span aria-hidden="true">·</span>
              <span>Member of the American Dental Association</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
