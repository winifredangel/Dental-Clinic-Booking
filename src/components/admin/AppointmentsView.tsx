import React, { useState, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Appointment, AppointmentStatus } from '../../types/database';
import { formatISOStringDisplay } from '../../lib/dateUtils';
import {
  Search,
  Filter,
  Plus,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
} from 'lucide-react';

interface AppointmentsViewProps {
  onOpenAppointmentModal: (appt?: Appointment) => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  onOpenAppointmentModal,
}) => {
  const { appointments, updateAppointmentStatus, isLoading } = useClinic();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appt => {
      // Status filter
      if (statusFilter !== 'all' && appt.status !== statusFilter) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = appt.full_name.toLowerCase().includes(query);
        const matchesEmail = appt.email.toLowerCase().includes(query);
        const matchesPhone = appt.phone.toLowerCase().includes(query);
        const matchesService = appt.services?.name.toLowerCase().includes(query);
        return matchesName || matchesEmail || matchesPhone || matchesService;
      }

      return true;
    });
  }, [appointments, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Appointments Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full clinic patient schedule, intake records, and operatory assignments.
          </p>
        </div>

        <button
          onClick={() => onOpenAppointmentModal()}
          className="inline-flex items-center px-4 py-2.5 text-xs font-semibold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors shadow-sm cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          New Walk-In Appointment
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by patient name, phone, email, or service..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:bg-white focus:outline-teal-600"
          />
        </div>

        {/* Status Filter Tabs (Interactive Segmented Control) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto shrink-0">
          {[
            { id: 'all', label: 'All Bookings', count: appointments.length },
            { id: 'pending', label: 'Pending', count: appointments.filter(a => a.status === 'pending').length },
            { id: 'confirmed', label: 'Confirmed', count: appointments.filter(a => a.status === 'confirmed').length },
            { id: 'completed', label: 'Completed', count: appointments.filter(a => a.status === 'completed').length },
            { id: 'cancelled', label: 'Cancelled', count: appointments.filter(a => a.status === 'cancelled').length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] text-slate-400 tabular-nums">({tab.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {isLoading && appointments.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            Loading appointments from Supabase...
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-700">No appointments found</h4>
            <p className="text-xs text-slate-500">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search query or status filter.'
                : 'No patient bookings currently recorded in the database.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 sm:px-6">Patient</th>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map(appt => {
                  return (
                    <tr
                      key={appt.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Patient Name & Notes */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="font-bold text-slate-900 text-sm">{appt.full_name}</div>
                        {appt.notes ? (
                          <div className="text-[11px] text-slate-500 italic truncate max-w-xs mt-0.5" title={appt.notes}>
                            Note: {appt.notes}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">No notes</span>
                        )}
                      </td>

                      {/* Service */}
                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-800">
                          {appt.services?.name || 'Dental Consultation'}
                        </div>
                        <div className="text-[11px] text-slate-500 tabular-nums">
                          {appt.services ? `${appt.services.duration_minutes} min` : ''}
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900">
                          {formatISOStringDisplay(appt.appointment_date)}
                        </div>
                        <div className="text-[11px] text-slate-500 tabular-nums">
                          {appt.start_time.slice(0, 5)} - {appt.end_time.slice(0, 5)}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-4 px-4">
                        <div className="text-slate-800">{appt.phone}</div>
                        <div className="text-[11px] text-slate-500">{appt.email}</div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-4 px-4">
                        <select
                          value={appt.status}
                          onChange={e => updateAppointmentStatus(appt.id, e.target.value as AppointmentStatus)}
                          className={`text-xs font-bold rounded-lg px-2.5 py-1 border transition-colors cursor-pointer ${
                            appt.status === 'confirmed'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : appt.status === 'completed'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : appt.status === 'cancelled'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => onOpenAppointmentModal(appt)}
                          className="inline-flex items-center px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
