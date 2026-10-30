import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  Appointment,
  AppointmentStatus,
  BlockedDate,
  BusinessHours,
  ClinicSettings,
  Service,
} from '../types/database';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Fallback initial state ensuring UI works smoothly during setup
export const DEFAULT_CLINIC_SETTINGS: ClinicSettings = {
  clinic_name: 'PearlDent Oral Care',
  clinic_email: 'winifredmaduabuchi368@gmail.com',
  clinic_phone: '09160336411',
  clinic_address: 'No.17 Rufus Nduba Creasent, Dawaki, Abuja.',
  slot_interval_minutes: 30,
  booking_notice_hours: 2,
};

export const DEFAULT_BUSINESS_HOURS: BusinessHours[] = [
  { id: 'sun', weekday: 0, is_open: false, start_time: '09:00:00', end_time: '14:00:00' },
  { id: 'mon', weekday: 1, is_open: true,  start_time: '08:30:00', end_time: '18:00:00' },
  { id: 'tue', weekday: 2, is_open: true,  start_time: '08:30:00', end_time: '18:00:00' },
  { id: 'wed', weekday: 3, is_open: true,  start_time: '08:30:00', end_time: '18:00:00' },
  { id: 'thu', weekday: 4, is_open: true,  start_time: '08:30:00', end_time: '18:00:00' },
  { id: 'fri', weekday: 5, is_open: true,  start_time: '08:30:00', end_time: '17:00:00' },
  { id: 'sat', weekday: 6, is_open: true,  start_time: '09:00:00', end_time: '15:00:00' },
];

export const DEFAULT_SERVICES: Service[] = [
  {
    id: 's-1',
    name: 'Comprehensive Exam & Hygiene',
    description: 'Full mouth digital examination, high-definition ultrasonic cleaning, periodontal assessment, and fluoride therapy.',
    duration_minutes: 60,
    price: 35000,
    is_active: true,
  },
  {
    id: 's-2',
    name: 'Advanced Ultrasonic Cleaning',
    description: 'Gentle stain removal, calculus scaling, polish, and microbiome gum care for clean, revitalized teeth.',
    duration_minutes: 45,
    price: 25000,
    is_active: true,
  },
  {
    id: 's-3',
    name: 'Laser Smile Whitening',
    description: 'In-office professional dental enamel whitening delivering up to 6 shades brighter in a single comfortable visit.',
    duration_minutes: 60,
    price: 85000,
    is_active: true,
  },
  {
    id: 's-4',
    name: 'Composite Tooth Restoration',
    description: 'Seamless aesthetic tooth-colored resin filling for cavities or chip repair with natural tooth translucency.',
    duration_minutes: 45,
    price: 45000,
    is_active: true,
  },
  {
    id: 's-5',
    name: 'Cosmetic Smile Consultation',
    description: 'Digital smile simulation, veneer evaluation, orthodontic alignment preview, and custom aesthetic roadmap.',
    duration_minutes: 30,
    price: 20000,
    is_active: true,
  },
  {
    id: 's-6',
    name: 'Emergency Dental Consultation',
    description: 'Same-day urgent relief, diagnostic digital X-rays, trauma assessment, and immediate pain intervention.',
    duration_minutes: 45,
    price: 30000,
    is_active: true,
  },
];

interface ClinicContextType {
  services: Service[];
  activeServices: Service[];
  appointments: Appointment[];
  businessHours: BusinessHours[];
  blockedDates: BlockedDate[];
  settings: ClinicSettings;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  createAppointment: (data: Omit<Appointment, 'id' | 'created_at' | 'status'> & { status?: AppointmentStatus }) => Promise<{ success: boolean; data?: Appointment; error?: string }>;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => Promise<{ success: boolean; error?: string }>;
  createService: (service: Omit<Service, 'id' | 'created_at'>) => Promise<{ success: boolean; data?: Service; error?: string }>;
  updateService: (id: string, updates: Partial<Omit<Service, 'id' | 'created_at'>>) => Promise<{ success: boolean; error?: string }>;
  toggleServiceActive: (id: string, isActive: boolean) => Promise<{ success: boolean; error?: string }>;
  updateBusinessHours: (hoursList: BusinessHours[]) => Promise<{ success: boolean; error?: string }>;
  addBlockedDate: (date: string, reason: string) => Promise<{ success: boolean; error?: string }>;
  deleteBlockedDate: (id: string | number) => Promise<{ success: boolean; error?: string }>;
  updateClinicSettings: (settingsUpdates: Partial<ClinicSettings>) => Promise<{ success: boolean; error?: string }>;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>(DEFAULT_BUSINESS_HOURS);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [settings, setSettings] = useState<ClinicSettings>(DEFAULT_CLINIC_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    try {
      // 1. Fetch Services
      const { data: servicesData, error: sErr } = await supabase
        .from('services')
        .select('*')
        .order('name', { ascending: true });

      if (sErr) throw sErr;
      if (servicesData && servicesData.length > 0) {
        setServices(servicesData);
      }

      // 2. Fetch Clinic Settings
      const { data: settingsData, error: setErr } = await supabase
        .from('clinic_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (setErr) throw setErr;
      if (settingsData) {
        const isLegacyName = !settingsData.clinic_name ||
          settingsData.clinic_name === 'Lumina Dental Studio' ||
          settingsData.clinic_name.toLowerCase().includes('bright smile');
        const isLegacyPhone = !settingsData.clinic_phone || settingsData.clinic_phone.includes('555');
        const isLegacyAddress = !settingsData.clinic_address || settingsData.clinic_address.includes('Seattle');
        const isLegacyEmail = !settingsData.clinic_email ||
          settingsData.clinic_email.includes('luminadental') ||
          settingsData.clinic_email.includes('brightsmile') ||
          settingsData.clinic_email.includes('bright-smile');

        const resolvedSettings: ClinicSettings = {
          ...settingsData,
          clinic_name: isLegacyName ? 'PearlDent Oral Care' : settingsData.clinic_name,
          clinic_phone: isLegacyPhone ? '09160336411' : settingsData.clinic_phone,
          clinic_address: isLegacyAddress ? 'No.17 Rufus Nduba Creasent, Dawaki, Abuja.' : settingsData.clinic_address,
          clinic_email: isLegacyEmail ? 'winifredmaduabuchi368@gmail.com' : settingsData.clinic_email,
        };
        setSettings(resolvedSettings);
      }

      // 3. Fetch Business Hours
      const { data: hoursData, error: hErr } = await supabase
        .from('business_hours')
        .select('*')
        .order('weekday', { ascending: true });

      if (hErr) throw hErr;
      if (hoursData && hoursData.length > 0) {
        setBusinessHours(hoursData);
      }

      // 4. Fetch Blocked Dates
      const { data: blockedData, error: bErr } = await supabase
        .from('blocked_dates')
        .select('*')
        .order('blocked_date', { ascending: true });

      if (bErr) throw bErr;
      if (blockedData) {
        setBlockedDates(blockedData);
      }

      // 5. Fetch Appointments with Service relationship
      const { data: apptsData, error: aErr } = await supabase
        .from('appointments')
        .select('*, services(*)')
        .order('appointment_date', { ascending: false })
        .order('start_time', { ascending: true });

      if (aErr) throw aErr;
      if (apptsData) {
        setAppointments(apptsData);
      }
    } catch (err: any) {
      console.warn('Supabase fetch notice:', err.message || err);
      setError(err.message || 'Could not fetch data from Supabase');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Public website only shows active services
  const activeServices = services.filter(s => s.is_active);

  // 1. Create Appointment
  const createAppointment = async (
    apptData: Omit<Appointment, 'id' | 'created_at' | 'status'> & { status?: AppointmentStatus }
  ) => {
    const payload = {
      full_name: apptData.full_name,
      email: apptData.email,
      phone: apptData.phone,
      service_id: apptData.service_id,
      appointment_date: apptData.appointment_date,
      start_time: apptData.start_time,
      end_time: apptData.end_time,
      status: apptData.status || 'pending',
      notes: apptData.notes || null,
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error: insertErr } = await supabase
          .from('appointments')
          .insert([payload])
          .select('*, services(*)')
          .maybeSingle();

        if (insertErr) {
          // If select returning fails due to SELECT policy, try plain insert
          if (insertErr.message?.toLowerCase().includes('row-level security') || insertErr.code === '42501') {
            const { error: plainErr } = await supabase
              .from('appointments')
              .insert([payload]);

            if (!plainErr) {
              const simulated: Appointment = {
                id: `appt-${Date.now()}`,
                ...payload,
                created_at: new Date().toISOString(),
                services: services.find(s => s.id === apptData.service_id),
              };
              setAppointments(prev => [simulated, ...prev]);
              return { success: true, data: simulated };
            }
          }
          throw insertErr;
        }

        const resolvedData = data || {
          id: `appt-${Date.now()}`,
          ...payload,
          created_at: new Date().toISOString(),
          services: services.find(s => s.id === apptData.service_id),
        };

        setAppointments(prev => [resolvedData, ...prev]);
        return { success: true, data: resolvedData };
      } catch (err: any) {
        return { success: false, error: err.message || 'Failed to submit appointment' };
      }
    } else {
      // Local demo fallback for preview before user enters Supabase creds
      const simulated: Appointment = {
        id: `demo-${Date.now()}`,
        ...payload,
        created_at: new Date().toISOString(),
        services: services.find(s => s.id === apptData.service_id),
      };
      setAppointments(prev => [simulated, ...prev]);
      return { success: true, data: simulated };
    }
  };

  // 2. Update Appointment Status
  const updateAppointmentStatus = async (id: string, status: AppointmentStatus) => {
    if (isSupabaseConfigured) {
      try {
        const { error: updErr } = await supabase
          .from('appointments')
          .update({ status })
          .eq('id', id);

        if (updErr) throw updErr;

        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Status update failed' };
      }
    } else {
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      return { success: true };
    }
  };

  // 3. Create Service
  const createService = async (serviceData: Omit<Service, 'id' | 'created_at'>) => {
    if (isSupabaseConfigured) {
      try {
        const { data, error: insertErr } = await supabase
          .from('services')
          .insert([serviceData])
          .select()
          .single();

        if (insertErr) throw insertErr;

        setServices(prev => [...prev, data]);
        return { success: true, data };
      } catch (err: any) {
        return { success: false, error: err.message || 'Failed to create service' };
      }
    } else {
      const simulated: Service = {
        id: `svc-${Date.now()}`,
        ...serviceData,
        created_at: new Date().toISOString(),
      };
      setServices(prev => [...prev, simulated]);
      return { success: true, data: simulated };
    }
  };

  // 4. Update Service
  const updateService = async (id: string, updates: Partial<Omit<Service, 'id' | 'created_at'>>) => {
    if (isSupabaseConfigured) {
      try {
        const { error: updErr } = await supabase
          .from('services')
          .update(updates)
          .eq('id', id);

        if (updErr) throw updErr;

        setServices(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Failed to update service' };
      }
    } else {
      setServices(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
      return { success: true };
    }
  };

  // 5. Toggle Service Active
  const toggleServiceActive = async (id: string, isActive: boolean) => {
    return updateService(id, { is_active: isActive });
  };

  // 6. Update Business Hours
  const updateBusinessHours = async (hoursList: BusinessHours[]) => {
    if (isSupabaseConfigured) {
      try {
        for (const item of hoursList) {
          const { error: hErr } = await supabase
            .from('business_hours')
            .upsert({
              weekday: Number(item.weekday),
              is_open: item.is_open,
              start_time: item.start_time,
              end_time: item.end_time,
            }, { onConflict: 'weekday' });

          if (hErr) throw hErr;
        }

        setBusinessHours(hoursList);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Failed to update business hours' };
      }
    } else {
      setBusinessHours(hoursList);
      return { success: true };
    }
  };

  // 7. Add Blocked Date
  const addBlockedDate = async (date: string, reason: string) => {
    if (isSupabaseConfigured) {
      try {
        const { data, error: bErr } = await supabase
          .from('blocked_dates')
          .insert([{ blocked_date: date, reason }])
          .select()
          .single();

        if (bErr) throw bErr;

        setBlockedDates(prev => [...prev, data]);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Failed to block date' };
      }
    } else {
      const simulated: BlockedDate = {
        id: `blk-${Date.now()}`,
        blocked_date: date,
        reason,
        created_at: new Date().toISOString(),
      };
      setBlockedDates(prev => [...prev, simulated]);
      return { success: true };
    }
  };

  // 8. Delete Blocked Date
  const deleteBlockedDate = async (id: string | number) => {
    if (isSupabaseConfigured) {
      try {
        const { error: dErr } = await supabase
          .from('blocked_dates')
          .delete()
          .eq('id', id);

        if (dErr) throw dErr;

        setBlockedDates(prev => prev.filter(b => b.id !== id));
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Failed to delete blocked date' };
      }
    } else {
      setBlockedDates(prev => prev.filter(b => b.id !== id));
      return { success: true };
    }
  };

  // 9. Update Clinic Settings
  const updateClinicSettings = async (settingsUpdates: Partial<ClinicSettings>) => {
    const updated = { ...settings, ...settingsUpdates };
    if (isSupabaseConfigured) {
      try {
        const { error: setErr } = await supabase
          .from('clinic_settings')
          .upsert({
            id: settings.id,
            clinic_name: updated.clinic_name,
            clinic_email: updated.clinic_email,
            clinic_phone: updated.clinic_phone,
            clinic_address: updated.clinic_address,
            slot_interval_minutes: Number(updated.slot_interval_minutes),
            booking_notice_hours: Number(updated.booking_notice_hours),
          });

        if (setErr) throw setErr;

        setSettings(updated);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Failed to update settings' };
      }
    } else {
      setSettings(updated);
      return { success: true };
    }
  };

  return (
    <ClinicContext.Provider
      value={{
        services,
        activeServices,
        appointments,
        businessHours,
        blockedDates,
        settings,
        isLoading,
        error,
        refreshData: fetchAllData,
        createAppointment,
        updateAppointmentStatus,
        createService,
        updateService,
        toggleServiceActive,
        updateBusinessHours,
        addBlockedDate,
        deleteBlockedDate,
        updateClinicSettings,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};
