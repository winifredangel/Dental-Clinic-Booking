import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Service } from '../../types/database';
import {
  Plus,
  Edit2,
  Clock,
  DollarSign,
  Power,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react';

interface ServicesViewProps {
  onOpenServiceModal: (service?: Service) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({ onOpenServiceModal }) => {
  const { services, toggleServiceActive, isLoading } = useClinic();

  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggle = async (service: Service) => {
    setTogglingId(service.id);
    await toggleServiceActive(service.id, !service.is_active);
    setTogglingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Services Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Add and customize clinical treatments, duration times, and pricing.
          </p>
        </div>

        <button
          onClick={() => onOpenServiceModal()}
          className="inline-flex items-center px-4 py-2.5 text-xs font-semibold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors shadow-sm cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Dental Service
        </button>
      </div>

      {/* Services List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {isLoading && services.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            Loading dental services from Supabase...
          </div>
        ) : services.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-700">No Services Configured</h4>
            <p className="text-xs text-slate-500">
              Click &quot;Add Dental Service&quot; above to create your first clinical offering.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 sm:px-6">Service Name & Description</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Standard Fee</th>
                  <th className="py-3.5 px-4">Public Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map(service => {
                  return (
                    <tr
                      key={service.id}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        !service.is_active ? 'opacity-70 bg-slate-50/30' : ''
                      }`}
                    >
                      {/* Name & Description */}
                      <td className="py-4 px-4 sm:px-6 max-w-sm">
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <span>{service.name}</span>
                          {!service.is_active && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 uppercase tracking-wider">
                              Deactivated
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed mt-1 line-clamp-2">
                          {service.description}
                        </p>
                      </td>

                      {/* Duration */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-800 font-medium tabular-nums">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{service.duration_minutes} min</span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 tabular-nums">
                          ${Number(service.price).toFixed(2)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {service.is_active ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Active (Bookable)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-600 font-bold text-xs bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                            <XCircle className="w-3.5 h-3.5" />
                            Hidden from Booking
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onOpenServiceModal(service)}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3 mr-1.5 text-slate-500" />
                            Edit
                          </button>

                          <button
                            onClick={() => handleToggle(service)}
                            disabled={togglingId === service.id}
                            className={`inline-flex items-center px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                              service.is_active
                                ? 'border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800'
                                : 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                            }`}
                            title={service.is_active ? 'Deactivate service' : 'Activate service'}
                          >
                            <Power className="w-3 h-3 mr-1" />
                            {service.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="p-4 rounded-xl bg-slate-100/80 border border-slate-200 text-xs text-slate-600 space-y-1">
        <span className="font-bold text-slate-800">Database Integrity Rule:</span>
        <p>
          Deactivating a service safely removes it from the public booking schedule while preserving historic patient records and past appointment references intact.
        </p>
      </div>
    </div>
  );
};
