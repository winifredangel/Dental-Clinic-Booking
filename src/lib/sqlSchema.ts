export const SUPABASE_SETUP_SQL = `-- Lumina Dental Studio - Complete Supabase Database Setup
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Services Table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 45,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Clinic Settings Table
CREATE TABLE IF NOT EXISTS public.clinic_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_name TEXT NOT NULL,
    clinic_email TEXT NOT NULL,
    clinic_phone TEXT NOT NULL,
    clinic_address TEXT NOT NULL,
    slot_interval_minutes INTEGER NOT NULL DEFAULT 30,
    booking_notice_hours INTEGER NOT NULL DEFAULT 2,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Business Hours Table
CREATE TABLE IF NOT EXISTS public.business_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    weekday INTEGER NOT NULL UNIQUE, -- 0=Sunday, 1=Monday, ..., 6=Saturday
    is_open BOOLEAN NOT NULL DEFAULT true,
    start_time TIME NOT NULL DEFAULT '08:30:00',
    end_time TIME NOT NULL DEFAULT '18:00:00'
);

-- 4. Blocked Dates Table
CREATE TABLE IF NOT EXISTS public.blocked_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocked_date DATE NOT NULL UNIQUE,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Appointments Table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    service_id UUID REFERENCES public.services(id) ON DELETE RESTRICT,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Admin Users Table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public read policies (allow anon and authenticated)
DROP POLICY IF EXISTS "Public can view active services" ON public.services;
CREATE POLICY "Public can view active services" ON public.services
    FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public can view clinic settings" ON public.clinic_settings;
CREATE POLICY "Public can view clinic settings" ON public.clinic_settings
    FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public can view business hours" ON public.business_hours;
CREATE POLICY "Public can view business hours" ON public.business_hours
    FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public can view blocked dates" ON public.blocked_dates;
CREATE POLICY "Public can view blocked dates" ON public.blocked_dates
    FOR SELECT TO public USING (true);

-- Public can book appointments (INSERT policy with CHECK true)
DROP POLICY IF EXISTS "Allow public booking insert" ON public.appointments;
DROP POLICY IF EXISTS "Public can book appointments" ON public.appointments;
CREATE POLICY "Allow public booking insert" ON public.appointments
    FOR INSERT TO public WITH CHECK (true);

-- Public can view booked appointment slots (to calculate availability and return insert confirmation)
DROP POLICY IF EXISTS "Allow public booking read" ON public.appointments;
DROP POLICY IF EXISTS "Public can view appointment schedules" ON public.appointments;
CREATE POLICY "Allow public booking read" ON public.appointments
    FOR SELECT TO public USING (true);

-- Admin update and delete policies
DROP POLICY IF EXISTS "Admins full access to services" ON public.services;
CREATE POLICY "Admins full access to services" ON public.services
    FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access to clinic settings" ON public.clinic_settings;
CREATE POLICY "Admins full access to clinic settings" ON public.clinic_settings
    FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access to business hours" ON public.business_hours;
CREATE POLICY "Admins full access to business hours" ON public.business_hours
    FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access to blocked dates" ON public.blocked_dates;
CREATE POLICY "Admins full access to blocked dates" ON public.blocked_dates
    FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update appointments" ON public.appointments;
CREATE POLICY "Admins can update appointments" ON public.appointments
    FOR UPDATE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete appointments" ON public.appointments;
CREATE POLICY "Admins can delete appointments" ON public.appointments
    FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view admin_users" ON public.admin_users;
CREATE POLICY "Admins can view admin_users" ON public.admin_users
    FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());

-- Initial Clinic Settings Seed
INSERT INTO public.clinic_settings (clinic_name, clinic_email, clinic_phone, clinic_address, slot_interval_minutes, booking_notice_hours)
VALUES (
    'PearlDent Oral Care',
    'winifredmaduabuchi368@gmail.com',
    '09160336411',
    'No.17 Rufus Nduba Creasent, Dawaki, Abuja.',
    30,
    2
) ON CONFLICT DO NOTHING;

-- Initial Business Hours Seed (Mon-Fri 8:30am - 6:00pm, Sat 9:00am - 3:00pm, Sun Closed)
INSERT INTO public.business_hours (weekday, is_open, start_time, end_time) VALUES
(0, false, '09:00:00', '14:00:00'), -- Sunday
(1, true,  '08:30:00', '18:00:00'), -- Monday
(2, true,  '08:30:00', '18:00:00'), -- Tuesday
(3, true,  '08:30:00', '18:00:00'), -- Wednesday
(4, true,  '08:30:00', '18:00:00'), -- Thursday
(5, true,  '08:30:00', '17:00:00'), -- Friday
(6, true,  '09:00:00', '15:00:00')  -- Saturday
ON CONFLICT (weekday) DO NOTHING;

-- Initial Services Seed
INSERT INTO public.services (name, description, duration_minutes, price, is_active) VALUES
('Comprehensive Exam & Hygiene', 'Full mouth digital examination, high-definition ultrasonic cleaning, periodontal assessment, and fluoride therapy.', 60, 35000.00, true),
('Advanced Ultrasonic Cleaning', 'Gentle stain removal, calculus scaling, polish, and microbiome gum care for clean, revitalized teeth.', 45, 25000.00, true),
('Laser Smile Whitening', 'In-office professional dental enamel whitening delivering up to 6 shades brighter in a single comfortable visit.', 60, 85000.00, true),
('Composite Tooth Restoration', 'Seamless aesthetic tooth-colored resin filling for cavities or chip repair with natural tooth translucency.', 45, 45000.00, true),
('Cosmetic Smile Consultation', 'Digital smile simulation, veneer evaluation, orthodontic alignment preview, and custom aesthetic roadmap.', 30, 20000.00, true),
('Emergency Dental Consultation', 'Same-day urgent relief, diagnostic digital X-rays, trauma assessment, and immediate pain intervention.', 45, 30000.00, true)
ON CONFLICT DO NOTHING;
`;

export const RLS_FIX_SQL = `-- Fix Row Level Security (RLS) for the appointments table
-- Safe & Idempotent: Drops any existing policies first so it never fails with "policy already exists"

-- 1. Ensure RLS is active on appointments table
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 2. Drop all previous appointment policies to avoid conflict
DROP POLICY IF EXISTS "Public can book appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow public booking insert" ON public.appointments;
DROP POLICY IF EXISTS "Allow public booking read" ON public.appointments;
DROP POLICY IF EXISTS "Public can view appointment schedules" ON public.appointments;
DROP POLICY IF EXISTS "Admins full access to appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins can update appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins can delete appointments" ON public.appointments;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.appointments;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.appointments;

-- 3. Allow ANY visitor (unauthenticated patients & authenticated users) to book appointments
CREATE POLICY "Allow public booking insert" ON public.appointments
    FOR INSERT
    TO public
    WITH CHECK (true);

-- 4. Allow reading appointments (needed for slot availability and booking confirmation)
CREATE POLICY "Allow public booking read" ON public.appointments
    FOR SELECT
    TO public
    USING (true);

-- 5. Allow authorized clinic admins to update appointment status
CREATE POLICY "Admins can update appointments" ON public.appointments
    FOR UPDATE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE admin_users.user_id = auth.uid()
      )
    );

-- 6. Allow authorized clinic admins to delete appointments
CREATE POLICY "Admins can delete appointments" ON public.appointments
    FOR DELETE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE admin_users.user_id = auth.uid()
      )
    );
`;

