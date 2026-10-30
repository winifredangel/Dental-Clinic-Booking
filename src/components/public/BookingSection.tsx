import React, { useState, useEffect, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Service, TimeSlot, Appointment } from '../../types/database';
import { calculateAvailableSlots } from '../../lib/availability';
import {
  formatDateToISO,
  formatDateDisplay,
  formatTimeDisplay,
  addMinutesToDate,
} from '../../lib/dateUtils';
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  FileText,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ShieldAlert,
  Copy,
  Check,
} from 'lucide-react';
import { BookingSuccessModal } from './BookingSuccessModal';
import { RLS_FIX_SQL } from '../../lib/sqlSchema';
import { formatCurrency } from '../../lib/formatters';


interface BookingSectionProps {
  selectedServiceFromParent?: Service | null;
  onClearParentService?: () => void;
  onOpenSqlModal?: () => void;
}

export const BookingSection: React.FC<BookingSectionProps> = ({
  selectedServiceFromParent,
  onClearParentService,
  onOpenSqlModal,
}) => {
  const {
    activeServices,
    businessHours,
    blockedDates,
    appointments,
    settings,
    createAppointment,
  } = useClinic();

  // Booking Flow Steps: 1 = Service, 2 = Date & Time, 3 = Patient Details
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Default to tomorrow or next open day
  const defaultInitialDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [selectedDate, setSelectedDate] = useState<Date>(defaultInitialDate);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [copiedRlsSql, setCopiedRlsSql] = useState<boolean>(false);

  const handleCopyRlsFix = () => {
    navigator.clipboard.writeText(RLS_FIX_SQL);
    setCopiedRlsSql(true);
    setTimeout(() => setCopiedRlsSql(false), 3000);
  };

  // Sync service when parent selects one
  useEffect(() => {
    if (selectedServiceFromParent) {
      setSelectedService(selectedServiceFromParent);
      setCurrentStep(2);
    }
  }, [selectedServiceFromParent]);

  // Compute available slots whenever selectedDate or selectedService changes
  const availability = useMemo(() => {
    if (!selectedService) {
      return { slots: [], isClosed: false, isBlocked: false };
    }

    return calculateAvailableSlots({
      selectedDate,
      service: selectedService,
      businessHours,
      blockedDates,
      existingAppointments: appointments,
      settings,
    });
  }, [selectedDate, selectedService, businessHours, blockedDates, appointments, settings]);

  // Handle slot selection
  const handleSelectSlot = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  // Next Step validation
  const canProceedToStep2 = Boolean(selectedService);
  const canProceedToStep3 = Boolean(selectedService && selectedSlot);

  // Handle final submission
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!selectedService || !selectedSlot) {
      setSubmitError('Please complete service and time slot selection.');
      return;
    }

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setSubmitError('Please fill in your name, email, and phone number.');
      return;
    }

    // Basic email validation
    if (!email.includes('@') || !email.includes('.')) {
      setSubmitError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await createAppointment({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        service_id: selectedService.id,
        appointment_date: formatDateToISO(selectedDate),
        start_time: selectedSlot.startTimeStr,
        end_time: selectedSlot.endTimeStr,
        notes: notes.trim() || null,
        status: 'pending',
      });

      if (!res.success || !res.data) {
        setSubmitError(res.error || 'Unable to schedule appointment. Please try again.');
        setIsSubmitting(false);
        return;
      }

      setConfirmedAppointment(res.data);
      setIsSubmitting(false);
    } catch (err: any) {
      setSubmitError(err?.message || 'An unexpected error occurred during booking.');
      setIsSubmitting(false);
    }
  };

  const handleResetBooking = () => {
    setConfirmedAppointment(null);
    setSelectedSlot(null);
    setCurrentStep(1);
    setNotes('');
    if (onClearParentService) onClearParentService();
  };

  // Date navigation helpers
  const handleDateChange = (daysOffset: number) => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + daysOffset);
    
    // Prevent navigating to past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (nextDate < today) return;

    setSelectedDate(nextDate);
    setSelectedSlot(null);
  };

  // Format date input min and max
  const minDateStr = useMemo(() => formatDateToISO(new Date()), []);
  const maxDateStr = useMemo(() => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 90);
    return formatDateToISO(maxDate);
  }, []);

  return (
    <section id="booking" className="py-24 bg-gradient-to-b from-white via-slate-50/50 to-slate-100/60 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-semibold tracking-wider text-teal-800 uppercase mb-2">
            Online Appointment Scheduling
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight" style={{ textWrap: 'balance' }}>
            Schedule your visit in minutes.
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Real-time availability directly synchronized with clinic operatories. Instant confirmation.
          </p>
        </div>

        {/* Step Progress Indicators */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 p-1.5 bg-slate-200/70 rounded-xl">
            <button
              onClick={() => setCurrentStep(1)}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                currentStep === 1
                  ? 'bg-white text-teal-900 shadow-sm'
                  : selectedService
                  ? 'text-slate-700 hover:text-slate-900'
                  : 'text-slate-400 cursor-not-allowed'
              }`}
            >
              <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center ${currentStep === 1 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                1
              </span>
              <span className="truncate">Select Service</span>
            </button>

            <button
              onClick={() => canProceedToStep2 && setCurrentStep(2)}
              disabled={!canProceedToStep2}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                currentStep === 2
                  ? 'bg-white text-teal-900 shadow-sm'
                  : canProceedToStep2
                  ? 'text-slate-700 hover:text-slate-900'
                  : 'text-slate-400 cursor-not-allowed'
              }`}
            >
              <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center ${currentStep === 2 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                2
              </span>
              <span className="truncate">Date & Time</span>
            </button>

            <button
              onClick={() => canProceedToStep3 && setCurrentStep(3)}
              disabled={!canProceedToStep3}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                currentStep === 3
                  ? 'bg-white text-teal-900 shadow-sm'
                  : canProceedToStep3
                  ? 'text-slate-700 hover:text-slate-900'
                  : 'text-slate-400 cursor-not-allowed'
              }`}
            >
              <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center ${currentStep === 3 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                3
              </span>
              <span className="truncate">Your Details</span>
            </button>
          </div>
        </div>

        {/* Step Container Card */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/5 p-6 sm:p-10 transition-all">
          
          {/* STEP 1: Select Dental Service */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-900">Step 1: Choose Your Treatment</h3>
                <p className="text-xs text-slate-500 mt-1">Select the dental procedure you require. Duration and pricing are fixed.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeServices.map(service => {
                  const isSelected = selectedService?.id === service.id;
                  return (
                    <div
                      key={service.id}
                      onClick={() => setSelectedService(service)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/40 ring-2 ring-teal-600/20 shadow-sm'
                          : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-base font-bold text-slate-900 leading-snug">
                            {service.name}
                          </h4>
                          <span className="text-sm font-bold text-teal-800 tabular-nums shrink-0">
                            {formatCurrency(service.price)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {service.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1.5 tabular-nums">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {service.duration_minutes} minutes
                        </span>
                        <span className={`font-semibold ${isSelected ? 'text-teal-700' : 'text-slate-400'}`}>
                          {isSelected ? 'Selected' : 'Click to select'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  disabled={!selectedService}
                  onClick={() => setCurrentStep(2)}
                  className={`inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all ${
                    selectedService
                      ? 'bg-teal-600 hover:bg-teal-700 cursor-pointer shadow-sm shadow-teal-700/20'
                      : 'bg-slate-300 cursor-not-allowed'
                  }`}
                >
                  Continue to Date & Time
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Select Date & Available Time */}
          {currentStep === 2 && selectedService && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Step 2: Choose Date & Available Slot</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span className="font-medium text-teal-700">{selectedService.name}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{selectedService.duration_minutes} mins</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{formatCurrency(selectedService.price)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-800 underline cursor-pointer"
                >
                  Change Service
                </button>
              </div>

              {/* Date Navigation & Calendar Picker */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDateChange(-1)}
                      className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                      title="Previous Day"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <div className="text-center sm:text-left px-2">
                      <div className="text-sm font-bold text-slate-900">
                        {formatDateDisplay(selectedDate)}
                      </div>
                      <div className="text-xs text-slate-500">
                        Minimum {settings.booking_notice_hours || 2}h notice required
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDateChange(1)}
                      className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                      title="Next Day"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <label htmlFor="datePicker" className="text-xs font-medium text-slate-600 whitespace-nowrap">
                      Jump to date:
                    </label>
                    <input
                      id="datePicker"
                      type="date"
                      min={minDateStr}
                      max={maxDateStr}
                      value={formatDateToISO(selectedDate)}
                      onChange={e => {
                        if (e.target.value) {
                          const [y, m, d] = e.target.value.split('-').map(Number);
                          setSelectedDate(new Date(y, m - 1, d, 0, 0, 0, 0));
                          setSelectedSlot(null);
                        }
                      }}
                      className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-teal-600"
                    />
                  </div>
                </div>
              </div>

              {/* Time Slots Area */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-900">
                    Available Time Slots for {formatDateDisplay(selectedDate)}:
                  </h4>
                  {selectedSlot && (
                    <span className="text-xs font-medium text-teal-700">
                      Selected: {selectedSlot.label}
                    </span>
                  )}
                </div>

                {availability.isBlocked ? (
                  <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 text-center space-y-2">
                    <ShieldAlert className="w-8 h-8 text-amber-600 mx-auto" />
                    <h5 className="text-sm font-bold text-amber-900">Date Blocked</h5>
                    <p className="text-xs text-amber-800">{availability.blockedReason || 'Clinic is unavailable on this date.'}</p>
                    <p className="text-xs text-amber-700">Please choose another date above.</p>
                  </div>
                ) : availability.isClosed ? (
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
                    <Clock className="w-8 h-8 text-slate-400 mx-auto" />
                    <h5 className="text-sm font-bold text-slate-800">Clinic Closed on this Day</h5>
                    <p className="text-xs text-slate-600">Our operatories are closed on this weekday. Use the calendar controls to pick an open day.</p>
                  </div>
                ) : availability.slots.length === 0 ? (
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
                    <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                    <h5 className="text-sm font-bold text-slate-800">No Remaining Slots Today</h5>
                    <p className="text-xs text-slate-600">
                      All available appointment slots for this service duration are currently booked or exceed notice requirements.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleDateChange(1)}
                      className="inline-flex items-center text-xs font-semibold text-teal-700 hover:text-teal-800 underline mt-2 cursor-pointer"
                    >
                      Check next available day <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1">
                    {availability.slots.map((slot, idx) => {
                      const isSelected = selectedSlot?.startTimeStr === slot.startTimeStr;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectSlot(slot)}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-teal-600 border-teal-600 text-white font-bold shadow-md shadow-teal-700/20 ring-2 ring-teal-500/20'
                              : 'bg-white border-slate-200 text-slate-800 hover:border-teal-500 hover:bg-teal-50/50'
                          }`}
                        >
                          <div className="text-xs font-semibold tabular-nums">
                            {formatTimeDisplay(slot.start)}
                          </div>
                          <div className={`text-[10px] tabular-nums mt-0.5 ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                            until {formatTimeDisplay(slot.end)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Step Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back to Services
                </button>

                <button
                  type="button"
                  disabled={!selectedSlot}
                  onClick={() => setCurrentStep(3)}
                  className={`inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all ${
                    selectedSlot
                      ? 'bg-teal-600 hover:bg-teal-700 cursor-pointer shadow-sm shadow-teal-700/20'
                      : 'bg-slate-300 cursor-not-allowed'
                  }`}
                >
                  Continue to Patient Details
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Patient Information Form */}
          {currentStep === 3 && selectedService && selectedSlot && (
            <form onSubmit={handleSubmitBooking} className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-900">Step 3: Patient Details & Confirmation</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your contact details so our reception can prepare your operatory suite and send confirmation.
                </p>
              </div>

              {/* Appointment Summary Box */}
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-900 uppercase tracking-wide">Appointment Summary</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-xs font-semibold text-teal-800 hover:underline cursor-pointer"
                  >
                    Modify Time
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700 pt-1">
                  <div>
                    <span className="text-slate-500 block">Service:</span>
                    <span className="font-bold text-slate-900">{selectedService.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Date & Time:</span>
                    <span className="font-bold text-slate-900">
                      {formatDateDisplay(selectedDate)} at {formatTimeDisplay(selectedSlot.start)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Duration & Fee:</span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      {selectedService.duration_minutes} min · {formatCurrency(selectedService.price)}
                    </span>
                  </div>
                </div>
              </div>

              {submitError && (
                <div className={`p-4 rounded-2xl border text-xs space-y-3 ${
                  submitError.toLowerCase().includes('row-level security') || submitError.toLowerCase().includes('rls')
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">
                        {submitError.toLowerCase().includes('row-level security')
                          ? 'Supabase Row-Level Security (RLS) Policy Error'
                          : 'Appointment Submission Error'}
                      </span>
                      <span className="text-[11px] opacity-90">{submitError}</span>
                    </div>
                  </div>

                  {(submitError.toLowerCase().includes('row-level security') || submitError.toLowerCase().includes('rls')) && (
                    <div className="p-3 bg-white/90 rounded-xl border border-amber-200 space-y-2">
                      <p className="font-semibold text-slate-800 text-[11px]">
                        How to fix: Supabase requires an RLS policy granting visitors permission to insert appointments.
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleCopyRlsFix}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs shadow-xs cursor-pointer"
                        >
                          {copiedRlsSql ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedRlsSql ? 'Copied SQL Fix!' : 'Copy 1-Click RLS Fix SQL'}
                        </button>
                        {onOpenSqlModal && (
                          <button
                            type="button"
                            onClick={onOpenSqlModal}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs cursor-pointer"
                          >
                            View Step-by-Step Instructions
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Form Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label htmlFor="fullName" className="block text-xs font-bold text-slate-800">
                    Full Legal Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="fullName"
                      type="text"
                      required
                      placeholder="e.g. Eleanor Vance"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-teal-600 focus:ring-1 focus:ring-teal-600"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="email" className="block text-xs font-bold text-slate-800">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="eleanor@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-teal-600 focus:ring-1 focus:ring-teal-600"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="phone" className="block text-xs font-bold text-slate-800">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="phone"
                      type="tel"
                      required
                      placeholder="(206) 555-0192"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-teal-600 focus:ring-1 focus:ring-teal-600"
                    />
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label htmlFor="notes" className="block text-xs font-bold text-slate-800">
                    Health Concerns / Appointment Notes (Optional)
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <textarea
                      id="notes"
                      rows={3}
                      placeholder="e.g. Mild sensitivity on upper molar, preference for warm water rinse, anxiety support."
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-teal-600 focus:ring-1 focus:ring-teal-600 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="text-[11px] text-slate-500 leading-normal">
                By clicking Confirm Appointment, you acknowledge that your request will be recorded directly in the clinic schedule. Cancellations are free up to 24 hours prior.
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back to Time Selection
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center px-7 py-3 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 active:scale-[0.98] transition-all shadow-md shadow-teal-700/20 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Confirming Appointment...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Confirm & Schedule Appointment
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Booking Success Confirmation Modal */}
      {confirmedAppointment && (
        <BookingSuccessModal
          appointment={confirmedAppointment}
          service={selectedService!}
          onClose={handleResetBooking}
        />
      )}
    </section>
  );
};
