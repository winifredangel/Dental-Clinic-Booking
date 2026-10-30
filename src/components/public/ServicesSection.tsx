import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Service } from '../../types/database';
import { CLINIC_IMAGES, CLINIC_FALLBACKS } from '../../assets/clinicImages';
import { Clock, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../lib/formatters';

interface ServicesSectionProps {
  onSelectServiceToBook: (service: Service) => void;
}

// Service images mapping to appropriate medical images
const getServiceVisual = (name: string, index: number): string => {
  const lower = name.toLowerCase();
  if (lower.includes('whitening') || lower.includes('cosmetic') || lower.includes('smile')) {
    return CLINIC_IMAGES.smileAesthetic || CLINIC_FALLBACKS.smileAesthetic;
  }
  if (lower.includes('exam') || lower.includes('consultation') || lower.includes('emergency')) {
    return CLINIC_IMAGES.consultation || CLINIC_FALLBACKS.consultation;
  }
  if (lower.includes('hygiene') || lower.includes('cleaning') || lower.includes('restoration') || lower.includes('filling')) {
    return CLINIC_IMAGES.treatmentSuite || CLINIC_FALLBACKS.treatmentSuite;
  }
  const images = [
    CLINIC_IMAGES.consultation || CLINIC_FALLBACKS.consultation,
    CLINIC_IMAGES.treatmentSuite || CLINIC_FALLBACKS.treatmentSuite,
    CLINIC_IMAGES.smileAesthetic || CLINIC_FALLBACKS.smileAesthetic,
  ];
  return images[index % images.length];
};

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onSelectServiceToBook }) => {
  const { activeServices, isLoading } = useClinic();

  return (
    <section id="services" className="py-20 bg-slate-50 border-t border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="text-xs font-semibold tracking-wider text-teal-800 uppercase mb-2">
            Clinical Services & Treatments
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight" style={{ textWrap: 'balance' }}>
            Comprehensive dental care tailored to your unique oral wellness.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Every treatment begins with a thorough diagnosis, transparent discussion, and painless, evidence-backed techniques. All active treatments can be scheduled online in seconds.
          </p>
        </div>

        {/* Services Grid */}
        {isLoading && activeServices.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 rounded-2xl bg-white animate-pulse border border-slate-200 p-6 space-y-4">
                <div className="h-44 bg-slate-100 rounded-xl" />
                <div className="h-6 bg-slate-100 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-full" />
                <div className="h-10 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : activeServices.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
            <p className="text-slate-600 font-medium">No dental services currently listed. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeServices.map((service, index) => {
              const imageSrc = getServiceVisual(service.name, index);

              return (
                <div
                  key={service.id}
                  className="group flex flex-col bg-white rounded-2xl border border-slate-200/90 hover:border-teal-300 hover:shadow-xl hover:shadow-teal-900/5 transition-all duration-300 overflow-hidden"
                >
                  {/* Service Image Header with subtle scrim */}
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={imageSrc}
                      alt={service.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const fallback = CLINIC_FALLBACKS.treatmentSuite;
                        if (e.currentTarget.src !== fallback) {
                          e.currentTarget.src = fallback;
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent pointer-events-none" />

                    {/* Unboxed Price and Duration */}
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs font-medium">
                      <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-md">
                        <Clock className="w-3.5 h-3.5 text-teal-300" />
                        <span className="tabular-nums">{service.duration_minutes} min</span>
                      </div>
                      <div className="text-lg font-bold text-white bg-black/40 backdrop-blur-xs px-2.5 py-0.5 rounded-md tabular-nums">
                        {formatCurrency(service.price)}
                      </div>
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="flex flex-col flex-1 p-6 justify-between space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-900 transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                        {service.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>Instant online booking</span>
                      </div>

                      <button
                        onClick={() => onSelectServiceToBook(service)}
                        className="inline-flex items-center text-xs font-semibold text-teal-700 group-hover:text-teal-800 group-hover:translate-x-0.5 transition-all cursor-pointer py-1.5 px-3 rounded-lg hover:bg-teal-50"
                      >
                        Select & Book
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
