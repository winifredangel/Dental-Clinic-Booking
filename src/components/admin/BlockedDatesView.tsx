import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { formatISOStringDisplay, formatDateToISO } from '../../lib/dateUtils';
import { Calendar, Trash2, Plus, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const BlockedDatesView: React.FC = () => {
  const { blockedDates, addBlockedDate, deleteBlockedDate, isLoading } = useClinic();

  const [dateStr, setDateStr] = useState<string>(formatDateToISO(new Date()));
  const [reason, setReason] = useState<string>('');
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!dateStr || !reason.trim()) {
      setError('Please provide both the date and the closure reason.');
      return;
    }

    // Check if already blocked
    if (blockedDates.some(b => b.blocked_date === dateStr)) {
      setError('This date is already blocked.');
      return;
    }

    setIsAdding(true);
    const res = await addBlockedDate(dateStr, reason.trim());
    setIsAdding(false);

    if (res.success) {
      setSuccess('Date successfully blocked from patient bookings.');
      setReason('');
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(res.error || 'Failed to block date');
    }
  };

  const handleDelete = async (id: string | number) => {
    await deleteBlockedDate(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Blocked Dates & Clinic Holidays
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Mark facility maintenance, dental conferences, or national holidays where bookings are halted.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Add Blocked Date Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6">
        <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-teal-600" />
          Block a New Date
        </h2>

        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-4">
            <label htmlFor="blockedDate" className="block text-xs font-bold text-slate-700 mb-1">
              Select Date *
            </label>
            <input
              id="blockedDate"
              type="date"
              required
              min={formatDateToISO(new Date())}
              value={dateStr}
              onChange={e => setDateStr(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:outline-teal-600"
            />
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="blockReason" className="block text-xs font-bold text-slate-700 mb-1">
              Closure Reason / Holiday Name *
            </label>
            <input
              id="blockReason"
              type="text"
              required
              placeholder="e.g. Annual Dental Continuing Education Seminar, Thanksgiving"
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:outline-teal-600"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isAdding}
              className="w-full inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isAdding ? 'Saving...' : 'Block Date'}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Blocked Dates Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Scheduled Clinic Closures ({blockedDates.length})
          </h2>
        </div>

        {blockedDates.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-700">No dates currently blocked</h4>
            <p className="text-xs text-slate-500">
              The clinic operates on standard business hours on all upcoming calendar dates.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {blockedDates.map(item => (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {formatISOStringDisplay(item.blocked_date)}
                    </h3>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Reason: <span className="text-slate-700 font-medium">{item.reason}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Unblock date"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
