import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Appointment, AppointmentStatus } from '../../types/database';
import {
  formatDateToISO,
  formatISOStringDisplay,
  formatTimeDisplay,
  combineDateAndTime,
} from '../../lib/dateUtils';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Sparkles,
  ArrowRight,
  Plus,
  ShieldCheck,
} from 'lucide-react';

interface OverviewViewProps {
  onNavigateTab: (tab: string) => void;
  onOpenAppointmentModal: (appt?: Appointment) => void;
  onOpenServiceModal: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onNavigateTab,
  onOpenAppointmentModal,
  onOpenServiceModal,
}) => {
  const { appointments, services, settings, updateAppointmentStatus } = useClinic();

  const todayStr = formatDateToISO(new Date());

  const totalAppts = appointments.length;
  const pendingAppts = appointments.filter(a => a.status === 'pending');
  const confirmedAppts = appointments.filter(a => a.status === 'confirmed');
  const completedAppts = appointments.filter(a => a.status === 'completed');
  const activeServicesCount = services.filter(s => s.is_active).length;

  // Today's appointments
  const todayAppointments = appointments.filter(a => a.appointment_date === todayStr);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Clinic Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational summary and live booking activity for {settings.clinic_name}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenAppointmentModal()}
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Walk-In Booking
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Bookings</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {totalAppts}
          </div>
          <div className="text-[11px] text-slate-500">Across all records</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 tabular-nums">
            {pendingAppts.length}
          </div>
          <div className="text-[11px] text-slate-500">Requires front desk confirmation</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Confirmed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 tabular-nums">
            {confirmedAppts.length}
          </div>
          <div className="text-[11px] text-slate-500">Ready on operatory schedule</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">Active Services</span>
            <Sparkles className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {activeServicesCount}
          </div>
          <div className="text-[11px] text-slate-500">Out of {services.length} total treatments</div>
        </div>
      </div>

      {/* Grid: Pending Action Queue & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Pending Requests Queue */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Action Required ({pendingAppts.length} Pending)
              </h2>
              <p className="text-xs text-slate-500">Patients waiting for appointment confirmation.</p>
            </div>
            <button
              onClick={() => onNavigateTab('appointments')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 inline-flex items-center cursor-pointer"
            >
              View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          {pendingAppts.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="font-semibold text-slate-700">All pending requests reviewed!</p>
              <p>No new requests awaiting front desk confirmation.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingAppts.slice(0, 5).map(appt => (
                <div
                  key={appt.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{appt.full_name}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                        Pending
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      {appt.services?.name || 'Dental Service'} · {formatISOStringDisplay(appt.appointment_date)} at {appt.start_time.slice(0, 5)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {appt.phone} · {appt.email}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => updateAppointmentStatus(appt.id, 'confirmed')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => onOpenAppointmentModal(appt)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Today's Schedule & Quick Actions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Today's Schedule Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Today's Schedule</h2>
              <span className="text-xs text-slate-500 font-mono">
                {todayAppointments.length} bookings
              </span>
            </div>

            {todayAppointments.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                No patient appointments booked for today yet.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {todayAppointments.map(a => (
                  <div
                    key={a.id}
                    onClick={() => onOpenAppointmentModal(a)}
                    className="p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 transition-all cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{a.full_name}</div>
                      <div className="text-slate-500">{a.services?.name || 'Consultation'}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-800 tabular-nums">
                        {a.start_time.slice(0, 5)}
                      </div>
                      <span className={`text-[10px] font-semibold capitalize ${
                        a.status === 'confirmed' ? 'text-emerald-700' :
                        a.status === 'completed' ? 'text-blue-700' :
                        a.status === 'cancelled' ? 'text-rose-700' : 'text-amber-700'
                      }`}>
                        {a.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Management Shortcuts */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Management Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={onOpenServiceModal}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-left transition-colors cursor-pointer"
              >
                + Add Service
              </button>
              <button
                onClick={() => onNavigateTab('business-hours')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-left transition-colors cursor-pointer"
              >
                Edit Hours
              </button>
              <button
                onClick={() => onNavigateTab('blocked-dates')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-left transition-colors cursor-pointer"
              >
                Block Dates
              </button>
              <button
                onClick={() => onNavigateTab('clinic-settings')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-left transition-colors cursor-pointer"
              >
                Clinic Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
