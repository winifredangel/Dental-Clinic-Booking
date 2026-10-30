import { Appointment, BlockedDate, BusinessHours, ClinicSettings, Service, TimeSlot } from '../types/database';
import {
  addMinutesToDate,
  combineDateAndTime,
  formatDateToISO,
  formatTimeDisplay,
  formatTimeToISO,
  parseTimeString,
} from './dateUtils';

export interface AvailabilityResult {
  slots: TimeSlot[];
  isClosed: boolean;
  isBlocked: boolean;
  blockedReason?: string;
  message?: string;
}

/**
 * Calculates available appointment slots according to the clinic's exact availability rules.
 */
export function calculateAvailableSlots({
  selectedDate,
  service,
  businessHours,
  blockedDates,
  existingAppointments,
  settings,
}: {
  selectedDate: Date;
  service: Service;
  businessHours: BusinessHours[];
  blockedDates: BlockedDate[];
  existingAppointments: Appointment[];
  settings: ClinicSettings;
}): AvailabilityResult {
  const dateStr = formatDateToISO(selectedDate);
  const weekday = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, ...

  // 1. Check if date is blocked
  const blockedEntry = blockedDates.find(b => b.blocked_date === dateStr);
  if (blockedEntry) {
    return {
      slots: [],
      isClosed: false,
      isBlocked: true,
      blockedReason: blockedEntry.reason,
      message: `Clinic is closed on this date: ${blockedEntry.reason}`,
    };
  }

  // 2. Check business hours for this weekday
  const hoursForDay = businessHours.find(h => Number(h.weekday) === weekday);
  if (!hoursForDay || !hoursForDay.is_open) {
    return {
      slots: [],
      isClosed: true,
      isBlocked: false,
      message: 'The clinic is closed on this day of the week.',
    };
  }

  // 3. Determine business open and close Date objects
  const dayStart = combineDateAndTime(selectedDate, hoursForDay.start_time);
  const dayEnd = combineDateAndTime(selectedDate, hoursForDay.end_time);

  // 4. Booking notice constraint
  const noticeHours = settings.booking_notice_hours || 2;
  const minimumBookingTime = new Date(Date.now() + noticeHours * 60 * 60 * 1000);

  // 5. Existing appointments for this date (excluding cancelled)
  const activeAppointmentsOnDate = existingAppointments.filter(appt => {
    return appt.appointment_date === dateStr && appt.status !== 'cancelled';
  });

  // Map active appointments to concrete Date ranges
  const existingRanges = activeAppointmentsOnDate.map(appt => {
    const start = combineDateAndTime(dateStr, appt.start_time);
    const end = combineDateAndTime(dateStr, appt.end_time);
    return { start, end };
  });

  // 6. Generate candidate slots using slot_interval_minutes
  const intervalMinutes = settings.slot_interval_minutes || 30;
  const durationMinutes = service.duration_minutes || 45;

  const validSlots: TimeSlot[] = [];
  let currentCandidateStart = new Date(dayStart.getTime());

  // Loop while candidate slot start + duration fits within business hours
  while (currentCandidateStart.getTime() < dayEnd.getTime()) {
    const currentCandidateEnd = addMinutesToDate(currentCandidateStart, durationMinutes);

    // If the appointment duration extends past closing time, stop or skip
    if (currentCandidateEnd.getTime() > dayEnd.getTime()) {
      break;
    }

    // Check notice period rule (must be in the future beyond notice hours)
    const satisfiesNotice = currentCandidateStart.getTime() >= minimumBookingTime.getTime();

    if (satisfiesNotice) {
      // Overlap rule: new_start < existing_end AND new_end > existing_start
      const hasOverlap = existingRanges.some(({ start: existingStart, end: existingEnd }) => {
        return (
          currentCandidateStart.getTime() < existingEnd.getTime() &&
          currentCandidateEnd.getTime() > existingStart.getTime()
        );
      });

      if (!hasOverlap) {
        validSlots.push({
          start: currentCandidateStart,
          end: currentCandidateEnd,
          label: `${formatTimeDisplay(currentCandidateStart)} - ${formatTimeDisplay(currentCandidateEnd)}`,
          startTimeStr: formatTimeToISO(currentCandidateStart),
          endTimeStr: formatTimeToISO(currentCandidateEnd),
        });
      }
    }

    // Step forward by slot_interval_minutes
    currentCandidateStart = addMinutesToDate(currentCandidateStart, intervalMinutes);
  }

  return {
    slots: validSlots,
    isClosed: false,
    isBlocked: false,
    message: validSlots.length === 0 ? 'No appointments currently available for this day.' : undefined,
  };
}
