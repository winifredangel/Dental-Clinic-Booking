import React from 'react';
import { Appointment, Service } from '../../types/database';
import { useClinic } from '../../context/ClinicContext';
import {
  formatISOStringDisplay,
  formatTimeDisplay,
  combineDateAndTime,
} from '../../lib/dateUtils';
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  Download,
  X,
} from 'lucide-react';

interface BookingSuccessModalProps {
  appointment: Appointment;
  service: Service;
  onClose: () => void;
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  appointment,
  service,
  onClose,
}) => {
  const { settings } = useClinic();

  const startDate = combineDateAndTime(appointment.appointment_date, appointment.start_time);
  const endDate = combineDateAndTime(appointment.appointment_date, appointment.end_time);

  // Generate downloadable iCalendar (.ics) format
  const handleDownloadIcs = () => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const toIcsDate = (d: Date) =>
      `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

    const startIcs = toIcsDate(startDate);
    const endIcs = toIcsDate(endDate);

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Lumina Dental Studio//Appointment//EN',
      'BEGIN:VEVENT',
      `UID:${appointment.id}@luminadentalstudio.com`,
      `DTSTAMP:${toIcsDate(new Date())}Z`,
      `DTSTART:${startIcs}`,
      `DTEND:${endIcs}`,
      `SUMMARY:Dental Appointment - ${service.name}`,
      `DESCRIPTION:Appointment for ${appointment.full_name} at ${settings.clinic_name}. Service: ${service.name}. Notes: ${appointment.notes || 'None'}.`,
      `LOCATION:${settings.clinic_address}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `dental-appointment-${appointment.appointment_date}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-950">
            Appointment Requested!
          </h3>
          <p className="text-xs text-slate-500">
            Your appointment has been logged in our clinic management schedule.
          </p>
        </div>

        {/* Details Card */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3.5 text-xs text-slate-700">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <span className="text-slate-500">Service:</span>
            <span className="font-bold text-slate-900 text-sm">{service.name}</span>
          </div>

          <div className="flex items-start justify-between">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
              Date:
            </span>
            <span className="font-semibold text-slate-900">
              {formatISOStringDisplay(appointment.appointment_date)}
            </span>
          </div>

          <div className="flex items-start justify-between">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-600 shrink-0" />
              Time:
            </span>
            <span className="font-semibold text-slate-900 tabular-nums">
              {formatTimeDisplay(startDate)} - {formatTimeDisplay(endDate)} ({service.duration_minutes} min)
            </span>
          </div>

          <div className="flex items-start justify-between">
            <span className="text-slate-500 flex items-center gap-1.5">
              <User className="w-4 h-4 text-teal-600 shrink-0" />
              Patient:
            </span>
            <span className="font-semibold text-slate-900">{appointment.full_name}</span>
          </div>

          <div className="flex items-start justify-between">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-teal-600 shrink-0" />
              Email & Phone:
            </span>
            <span className="font-semibold text-slate-900 text-right">
              {appointment.email} <br /> {appointment.phone}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-start justify-between text-slate-600">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
              Location:
            </span>
            <span className="font-medium text-slate-900 text-right max-w-xs">
              {settings.clinic_address}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={handleDownloadIcs}
            className="w-full sm:w-1/2 inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 mr-2 text-teal-600" />
            Add to Calendar (.ics)
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-1/2 inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-sm shadow-teal-700/20 cursor-pointer"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    </div>
  );
};
