import React, { useState } from 'react';
import { Service } from '../../types/database';
import { useClinic } from '../../context/ClinicContext';
import { X, Save, Clock, DollarSign, FileText, CheckCircle2 } from 'lucide-react';

interface ServiceModalProps {
  serviceToEdit?: Service | null;
  onClose: () => void;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({ serviceToEdit, onClose }) => {
  const { createService, updateService } = useClinic();

  const [name, setName] = useState<string>(serviceToEdit?.name || '');
  const [description, setDescription] = useState<string>(serviceToEdit?.description || '');
  const [durationMinutes, setDurationMinutes] = useState<number>(serviceToEdit?.duration_minutes || 45);
  const [price, setPrice] = useState<number>(serviceToEdit?.price || 35000);
  const [isActive, setIsActive] = useState<boolean>(serviceToEdit ? serviceToEdit.is_active : true);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !description.trim()) {
      setError('Please provide both a service name and description.');
      return;
    }

    if (durationMinutes <= 0 || price < 0) {
      setError('Duration must be positive and price cannot be negative.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (serviceToEdit) {
        const res = await updateService(serviceToEdit.id, {
          name: name.trim(),
          description: description.trim(),
          duration_minutes: Number(durationMinutes),
          price: Number(price),
          is_active: isActive,
        });

        if (!res.success) throw new Error(res.error);
      } else {
        const res = await createService({
          name: name.trim(),
          description: description.trim(),
          duration_minutes: Number(durationMinutes),
          price: Number(price),
          is_active: isActive,
        });

        if (!res.success) throw new Error(res.error);
      }

      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save service.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div>
          <h3 className="text-xl font-bold text-slate-950">
            {serviceToEdit ? 'Edit Dental Service' : 'Add New Dental Service'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Services configured here automatically update the patient booking flow.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="serviceName" className="block text-xs font-bold text-slate-700 mb-1">
              Service Name *
            </label>
            <input
              id="serviceName"
              type="text"
              required
              placeholder="e.g. Laser Smile Whitening"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-teal-600"
            />
          </div>

          <div>
            <label htmlFor="serviceDescription" className="block text-xs font-bold text-slate-700 mb-1">
              Clinical Description *
            </label>
            <textarea
              id="serviceDescription"
              required
              rows={3}
              placeholder="Clear summary of what the appointment entails, tools used, and patient expectations."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-teal-600 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="durationMinutes" className="block text-xs font-bold text-slate-700 mb-1">
                Duration (Minutes) *
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="durationMinutes"
                  type="number"
                  required
                  min={10}
                  step={5}
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 focus:bg-white focus:outline-teal-600 tabular-nums"
                />
              </div>
            </div>

            <div>
              <label htmlFor="price" className="block text-xs font-bold text-slate-700 mb-1">
                Price (₦ / Naira) *
              </label>
              <div className="relative">
                <span className="w-4 h-4 text-slate-500 font-bold text-sm absolute left-3 top-2.5 flex items-center justify-center">
                  ₦
                </span>
                <input
                  id="price"
                  type="number"
                  required
                  min={0}
                  step={100}
                  placeholder="35000"
                  value={price}
                  onChange={e => setPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 focus:bg-white focus:outline-teal-600 tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* Active Status Toggle */}
          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
              />
              <span className="text-xs font-semibold text-slate-800">
                Active service (visible to patients on public booking website)
              </span>
            </label>
            <p className="text-[11px] text-slate-500 pl-7 mt-0.5">
              Inactive services remain stored in the database and visible to admins, but are hidden from the booking form.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              {isSubmitting ? 'Saving to Database...' : serviceToEdit ? 'Save Changes' : 'Create Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
