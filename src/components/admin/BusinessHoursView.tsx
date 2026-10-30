import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { BusinessHours } from '../../types/database';
import { WEEKDAYS } from '../../lib/dateUtils';
import { Clock, Save, CheckCircle2, AlertCircle } from 'lucide-react';

export const BusinessHoursView: React.FC = () => {
  const { businessHours, updateBusinessHours } = useClinic();

  // Local state for editing
  const [hoursState, setHoursState] = useState<BusinessHours[]>(businessHours);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sync if context updates
  React.useEffect(() => {
    setHoursState(businessHours);
  }, [businessHours]);

  const handleToggleOpen = (weekday: number) => {
    setHoursState(prev =>
      prev.map(item => (Number(item.weekday) === weekday ? { ...item, is_open: !item.is_open } : item))
    );
    setSaveSuccess(false);
  };

  const handleTimeChange = (weekday: number, field: 'start_time' | 'end_time', value: string) => {
    // Standardize to HH:MM:00
    const formatted = value.length === 5 ? `${value}:00` : value;
    setHoursState(prev =>
      prev.map(item => (Number(item.weekday) === weekday ? { ...item, [field]: formatted } : item))
    );
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    const res = await updateBusinessHours(hoursState);
    setIsSaving(false);

    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setSaveError(res.error || 'Failed to update business hours');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Business & Operatory Hours
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operating schedule for patient visits. Directly governs available booking time slots.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center px-5 py-2.5 text-xs font-semibold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors shadow-sm cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          <Save className="w-4 h-4 mr-1.5" />
          {isSaving ? 'Saving Hours...' : 'Save Hours to Supabase'}
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Business hours successfully saved! Patient booking availability updated.</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Weekday List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {WEEKDAYS.map((weekdayName, idx) => {
          const item = hoursState.find(h => Number(h.weekday) === idx) || {
            id: idx,
            weekday: idx,
            is_open: idx !== 0, // Sunday closed by default
            start_time: '08:30:00',
            end_time: '18:00:00',
          };

          return (
            <div
              key={idx}
              className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                !item.is_open ? 'bg-slate-50/60' : 'hover:bg-teal-50/20'
              }`}
            >
              {/* Day & Open Toggle */}
              <div className="flex items-center gap-4 sm:w-1/3">
                <button
                  type="button"
                  onClick={() => handleToggleOpen(idx)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    item.is_open ? 'bg-teal-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                  aria-label={`Toggle open state for ${weekdayName}`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">{weekdayName}</h3>
                  <span className={`text-[11px] font-semibold ${item.is_open ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {item.is_open ? 'Open for appointments' : 'Closed'}
                  </span>
                </div>
              </div>

              {/* Start & End Time Pickers */}
              <div className="flex items-center gap-4 sm:w-2/3 justify-start sm:justify-end">
                {item.is_open ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-500">Opens:</span>
                      <input
                        type="time"
                        value={item.start_time.slice(0, 5)}
                        onChange={e => handleTimeChange(idx, 'start_time', e.target.value)}
                        className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:outline-teal-600"
                      />
                    </div>

                    <span className="text-slate-400 text-xs">to</span>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-500">Closes:</span>
                      <input
                        type="time"
                        value={item.end_time.slice(0, 5)}
                        onChange={e => handleTimeChange(idx, 'end_time', e.target.value)}
                        className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:outline-teal-600"
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">No slots generated on closed days</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
