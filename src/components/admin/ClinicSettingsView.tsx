import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Save, CheckCircle2, AlertCircle, Building, Mail, Phone, MapPin, Clock, Calendar } from 'lucide-react';

export const ClinicSettingsView: React.FC = () => {
  const { settings, updateClinicSettings } = useClinic();

  const [clinicName, setClinicName] = useState<string>(settings.clinic_name);
  const [clinicEmail, setClinicEmail] = useState<string>(settings.clinic_email);
  const [clinicPhone, setClinicPhone] = useState<string>(settings.clinic_phone);
  const [clinicAddress, setClinicAddress] = useState<string>(settings.clinic_address);
  const [slotInterval, setSlotInterval] = useState<number>(settings.slot_interval_minutes || 30);
  const [noticeHours, setNoticeHours] = useState<number>(settings.booking_notice_hours || 2);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync if settings in context update
  React.useEffect(() => {
    setClinicName(settings.clinic_name);
    setClinicEmail(settings.clinic_email);
    setClinicPhone(settings.clinic_phone);
    setClinicAddress(settings.clinic_address);
    setSlotInterval(settings.slot_interval_minutes || 30);
    setNoticeHours(settings.booking_notice_hours || 2);
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess(false);
    setError(null);

    const res = await updateClinicSettings({
      clinic_name: clinicName.trim(),
      clinic_email: clinicEmail.trim(),
      clinic_phone: clinicPhone.trim(),
      clinic_address: clinicAddress.trim(),
      slot_interval_minutes: Number(slotInterval),
      booking_notice_hours: Number(noticeHours),
    });

    setIsSaving(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(res.error || 'Failed to update clinic settings.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Clinic Settings & Booking Parameters
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure clinic contact info, address, appointment interval step, and lead booking notice.
          </p>
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Clinic settings successfully updated! New details are live on the website.</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Settings Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            1. Clinic Identity & Contact Information
          </h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="clinicName" className="block text-xs font-bold text-slate-700 mb-1">
                Clinic Name *
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="clinicName"
                  type="text"
                  required
                  value={clinicName}
                  onChange={e => setClinicName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-teal-600"
                />
              </div>
            </div>

            <div>
              <label htmlFor="clinicPhone" className="block text-xs font-bold text-slate-700 mb-1">
                Clinic Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="clinicPhone"
                  type="text"
                  required
                  value={clinicPhone}
                  onChange={e => setClinicPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-teal-600"
                />
              </div>
            </div>

            <div>
              <label htmlFor="clinicEmail" className="block text-xs font-bold text-slate-700 mb-1">
                Clinic Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="clinicEmail"
                  type="email"
                  required
                  value={clinicEmail}
                  onChange={e => setClinicEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-teal-600"
                />
              </div>
            </div>

            <div>
              <label htmlFor="clinicAddress" className="block text-xs font-bold text-slate-700 mb-1">
                Physical Office Address *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="clinicAddress"
                  type="text"
                  required
                  value={clinicAddress}
                  onChange={e => setClinicAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-teal-600"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            2. Appointment Schedule Parameters
          </h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="slotInterval" className="block text-xs font-bold text-slate-700 mb-1">
                Slot Interval Step (Minutes) *
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <select
                  id="slotInterval"
                  value={slotInterval}
                  onChange={e => setSlotInterval(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-teal-600"
                >
                  <option value={15}>15 minutes (dense)</option>
                  <option value={20}>20 minutes</option>
                  <option value={30}>30 minutes (recommended)</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                How often a new slot can begin across operatory schedules.
              </p>
            </div>

            <div>
              <label htmlFor="noticeHours" className="block text-xs font-bold text-slate-700 mb-1">
                Minimum Advance Booking Notice (Hours) *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="noticeHours"
                  type="number"
                  min={0}
                  max={72}
                  required
                  value={noticeHours}
                  onChange={e => setNoticeHours(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-teal-600 tabular-nums"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Prevents patients from booking slots that start sooner than this number of hours from now.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center px-6 py-2.5 text-xs font-semibold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {isSaving ? 'Updating Settings...' : 'Save Clinic Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
