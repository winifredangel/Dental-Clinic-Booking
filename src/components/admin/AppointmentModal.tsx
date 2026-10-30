import React, { useState } from 'react';
import { Appointment, AppointmentStatus, Service } from '../../types/database';
import { useClinic } from '../../context/ClinicContext';
import {
  formatISOStringDisplay,
  formatTimeDisplay,
  combineDateAndTime,
  formatDateToISO,
} from '../../lib/dateUtils';
import { X, Calendar, Clock, User, Phone, Mail, FileText, CheckCircle2 } from 'lucide-react';

interface AppointmentModalProps {
  appointment?: Appointment | null;
  onClose: () => void;
  onStatusChange?: (id: string, status: AppointmentStatus) => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  appointment,
  onClose,
  onStatusChange,
}) => {
  const { services, createAppointment, updateAppointmentStatus } = useClinic();

  // If appointment is null, this is a "Create New Walk-In" modal
  const isCreate = !appointment;

  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [serviceId, setServiceId] = useState<string>(services[0]?.id || '');
  const [dateStr, setDateStr] = useState<string>(formatDateToISO(new Date()));
  const [startTime, setStartTime] = useState<string>('09:00');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !phone.trim() || !serviceId) {
      setError('Please provide all patient and service fields.');
      return;
    }

    const selectedSvc = services.find(s => s.id === serviceId);
    const duration = selectedSvc?.duration_minutes || 45;

    // Calculate end time
    const [h, m] = startTime.split(':').map(Number);
    const startDate = new Date(2000, 0, 1, h, m);
    const endDate = new Date(startDate.getTime() + duration * 60 * 1000);
    const endHours = String(endDate.getHours()).padStart(2, '0');
    const endMinutes = String(endDate.getMinutes()).padStart(2, '0');
    const endTimeStr = `${endHours}:${endMinutes}:00`;

    setIsSubmitting(true);

    try {
      const res = await createAppointment({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        service_id: serviceId,
        appointment_date: dateStr,
        start_time: `${startTime}:00`,
        end_time: endTimeStr,
        status: 'confirmed',
        notes: notes.trim() || null,
      });

      if (!res.success) throw new Error(res.error);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create appointment.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isCreate ? (
          <div>
            <h3 className="text-xl font-bold text-slate-950">Add Walk-In / Phone Booking</h3>
            <p className="text-xs text-slate-500 mt-1">Manual front desk appointment intake.</p>
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-bold text-slate-950">Appointment Record</h3>
            <p className="text-xs text-slate-500 mt-1 font-mono">ID: {appointment?.id}</p>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        {isCreate ? (
          <form onSubmit={handleCreateWalkIn} className="space-y-4">
            <div>
              <label htmlFor="patientName" className="block text-xs font-bold text-slate-700 mb-1">
                Patient Name *
              </label>
              <input
                id="patientName"
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Full Name"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 focus:bg-white focus:outline-teal-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="patientEmail" className="block text-xs font-bold text-slate-700 mb-1">
                  Email *
                </label>
                <input
                  id="patientEmail"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="patient@example.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 focus:bg-white focus:outline-teal-600"
                />
              </div>

              <div>
                <label htmlFor="patientPhone" className="block text-xs font-bold text-slate-700 mb-1">
                  Phone *
                </label>
                <input
                  id="patientPhone"
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 focus:bg-white focus:outline-teal-600"
                />
              </div>
            </div>

            <div>
              <label htmlFor="selectService" className="block text-xs font-bold text-slate-700 mb-1">
                Dental Service *
              </label>
              <select
                id="selectService"
                value={serviceId}
                onChange={e => setServiceId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 focus:bg-white focus:outline-teal-600"
              >
                {services.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.duration_minutes} min - ${Number(s.price).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="apptDate" className="block text-xs font-bold text-slate-700 mb-1">
                  Date *
                </label>
                <input
                  id="apptDate"
                  type="date"
                  required
                  value={dateStr}
                  onChange={e => setDateStr(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 focus:bg-white focus:outline-teal-600"
                />
              </div>

              <div>
                <label htmlFor="apptStartTime" className="block text-xs font-bold text-slate-700 mb-1">
                  Start Time *
                </label>
                <input
                  id="apptStartTime"
                  type="time"
                  required
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 focus:bg-white focus:outline-teal-600"
                />
              </div>
            </div>

            <div>
              <label htmlFor="apptNotes" className="block text-xs font-bold text-slate-700 mb-1">
                Clinical / Front Desk Notes
              </label>
              <textarea
                id="apptNotes"
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Walk-in notes or patient requests"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 focus:bg-white focus:outline-teal-600 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl border border-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Scheduling...' : 'Confirm Walk-In Booking'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-5">
            {/* View Existing Appointment */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Service:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {appointment?.services?.name || 'Selected Service'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Patient:</span>
                <span className="font-semibold text-slate-900">{appointment?.full_name}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <a href={`tel:${appointment?.phone}`} className="font-semibold text-teal-700 hover:underline">
                  {appointment?.phone}
                </a>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <a href={`mailto:${appointment?.email}`} className="font-semibold text-teal-700 hover:underline">
                  {appointment?.email}
                </a>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span className="font-semibold text-slate-900">
                  {appointment && formatISOStringDisplay(appointment.appointment_date)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Time Range:</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {appointment?.start_time.slice(0, 5)} - {appointment?.end_time.slice(0, 5)}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 block mb-1">Patient Notes:</span>
                <p className="text-slate-700 italic bg-white p-2 rounded-lg border border-slate-200">
                  {appointment?.notes || 'No specific notes provided.'}
                </p>
              </div>
            </div>

            {/* Quick Status Update Buttons */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Update Appointment Status:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['pending', 'confirmed', 'completed', 'cancelled'] as AppointmentStatus[]).map(st => {
                  const isActive = appointment?.status === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        if (appointment) {
                          updateAppointmentStatus(appointment.id, st);
                          if (onStatusChange) onStatusChange(appointment.id, st);
                        }
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                        isActive
                          ? st === 'confirmed'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : st === 'completed'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : st === 'cancelled'
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'bg-amber-500 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
