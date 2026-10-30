export interface Service {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  created_at?: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Appointment {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  service_id: string;
  appointment_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS or HH:MM
  end_time: string; // HH:MM:SS or HH:MM
  status: AppointmentStatus;
  notes: string | null;
  created_at?: string;
  services?: Service; // Joined service record
}

export interface BusinessHours {
  id: string | number;
  weekday: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  is_open: boolean;
  start_time: string; // HH:MM:SS or HH:MM
  end_time: string; // HH:MM:SS or HH:MM
}

export interface BlockedDate {
  id: string | number;
  blocked_date: string; // YYYY-MM-DD
  reason: string;
  created_at?: string;
}

export interface ClinicSettings {
  id?: string | number;
  clinic_name: string;
  clinic_email: string;
  clinic_phone: string;
  clinic_address: string;
  slot_interval_minutes: number;
  booking_notice_hours: number;
  created_at?: string;
}

export interface AdminUser {
  id: string | number;
  user_id: string;
  created_at?: string;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  label: string; // e.g. "09:00 AM - 09:45 AM"
  startTimeStr: string; // "09:00:00"
  endTimeStr: string; // "09:45:00"
}
