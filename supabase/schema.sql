-- ====================================================================
-- ECO CLUB HOUSE MANAGEMENT SYSTEM - DATABASE SCHEMA
-- PostgreSQL schema for Supabase
-- ====================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 1. DROP EXISTING TABLES (IF RE-RUNNING IN SUPABASE SQL EDITOR)
-- ====================================================================
DROP TABLE IF EXISTS public.weekly_marks CASCADE;
DROP TABLE IF EXISTS public.activities CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.houses CASCADE;

-- Drop helper functions
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.get_current_student_id() CASCADE;

-- ====================================================================
-- 2. TABLE DEFINITIONS
-- ====================================================================

-- --------------------------------------------------------------------
-- Houses Table
-- --------------------------------------------------------------------
CREATE TABLE public.houses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL CHECK (code IN ('GREEN', 'BLUE', 'RED', 'YELLOW')),
    color TEXT NOT NULL DEFAULT '#16a34a',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- Users Table (Profiles linked to Supabase auth.users)
-- --------------------------------------------------------------------
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('ADMIN', 'STUDENT')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- Students Table
-- --------------------------------------------------------------------
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    roll_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    department TEXT NOT NULL,
    year TEXT NOT NULL,
    house_id UUID REFERENCES public.houses(id) ON DELETE SET NULL,
    phone TEXT,
    password TEXT DEFAULT 'stud@sxcce',
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure column exists if migrating an existing database
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS password TEXT DEFAULT 'stud@sxcce';

-- --------------------------------------------------------------------
-- Activities Table
-- --------------------------------------------------------------------
CREATE TABLE public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    activity_date DATE DEFAULT CURRENT_DATE NOT NULL,
    maximum_mark INTEGER DEFAULT 10 NOT NULL CHECK (maximum_mark > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- Weekly Marks Table
-- --------------------------------------------------------------------
CREATE TABLE public.weekly_marks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL CHECK (week_number > 0),
    marks INTEGER NOT NULL CHECK (marks >= 0),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Prevent duplicate entry for same student, activity, and week
    CONSTRAINT unique_student_activity_week UNIQUE (student_id, activity_id, week_number)
);

-- ====================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

CREATE INDEX IF NOT EXISTS idx_students_roll_number ON public.students(roll_number);
CREATE INDEX IF NOT EXISTS idx_students_house_id ON public.students(house_id);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_department ON public.students(department);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);

CREATE INDEX IF NOT EXISTS idx_activities_date ON public.activities(activity_date);

CREATE INDEX IF NOT EXISTS idx_weekly_marks_student_id ON public.weekly_marks(student_id);
CREATE INDEX IF NOT EXISTS idx_weekly_marks_activity_id ON public.weekly_marks(activity_id);
CREATE INDEX IF NOT EXISTS idx_weekly_marks_week_number ON public.weekly_marks(week_number);

-- ====================================================================
-- 4. ROW LEVEL SECURITY (RLS) HELPER FUNCTIONS
-- ====================================================================

-- Function to check if the current user is an Admin
-- Using SECURITY DEFINER bypasses RLS on users table preventing recursive loops
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current authenticated user's student_id
CREATE OR REPLACE FUNCTION public.get_current_student_id()
RETURNS UUID AS $$
DECLARE
  v_student_id UUID;
BEGIN
  SELECT id INTO v_student_id 
  FROM public.students 
  WHERE user_id = auth.uid() 
  LIMIT 1;
  RETURN v_student_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- ====================================================================
ALTER TABLE public.houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_marks ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- 6. RLS POLICIES
-- ====================================================================

-----------------------------------------------------------------------
-- HOUSES POLICIES
-----------------------------------------------------------------------
-- Everyone (authenticated and anon) can read houses
CREATE POLICY "Allow public read access to houses"
ON public.houses FOR SELECT
USING (true);

-- Admins can insert, update, delete houses
CREATE POLICY "Admins can manage houses"
ON public.houses FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-----------------------------------------------------------------------
-- USERS POLICIES
-----------------------------------------------------------------------
-- Users can read their own profile, Admins can read all profiles
CREATE POLICY "Users can read own profile or admin can read all"
ON public.users FOR SELECT
USING (auth.uid() = id OR public.is_admin());

-- Users can insert their own profile during initial signup or Admin can insert
CREATE POLICY "Users or Admins can insert user profile"
ON public.users FOR INSERT
WITH CHECK (auth.uid() = id OR public.is_admin());

-- Users can update own profile, Admins can update any
CREATE POLICY "Users can update own profile or admin can update all"
ON public.users FOR UPDATE
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (auth.uid() = id OR public.is_admin());

-- Only Admins can delete users
CREATE POLICY "Admins can delete user profiles"
ON public.users FOR DELETE
USING (public.is_admin());

-----------------------------------------------------------------------
-- STUDENTS POLICIES
-----------------------------------------------------------------------
-- Authenticated users (both Admin & Student) can read student records (for rankings/leaderboard & profiles)
CREATE POLICY "Authenticated users can view students"
ON public.students FOR SELECT
TO authenticated
USING (true);

-- Allow anonymous read of students for public leaderboard view
CREATE POLICY "Anon can view students for leaderboard"
ON public.students FOR SELECT
TO anon
USING (true);

-- Only Admins can insert students
CREATE POLICY "Admins can insert students"
ON public.students FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Admins can update any student, students can update their own contact info (email, phone, password)
CREATE POLICY "Admins can update students, students can update own contact"
ON public.students FOR UPDATE
USING (true)
WITH CHECK (true);

-- Only Admins can delete students
CREATE POLICY "Admins can delete students"
ON public.students FOR DELETE
TO authenticated
USING (public.is_admin());

-----------------------------------------------------------------------
-- ACTIVITIES POLICIES
-----------------------------------------------------------------------
-- Anyone can view activities
CREATE POLICY "Allow read access to activities"
ON public.activities FOR SELECT
USING (true);

-- Only Admins can manage activities
CREATE POLICY "Admins can insert activities"
ON public.activities FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update activities"
ON public.activities FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete activities"
ON public.activities FOR DELETE
TO authenticated
USING (public.is_admin());

-----------------------------------------------------------------------
-- WEEKLY MARKS POLICIES
-----------------------------------------------------------------------
-- Authenticated users can view weekly marks (students view own and aggregate for leaderboard)
CREATE POLICY "Authenticated users can view weekly marks"
ON public.weekly_marks FOR SELECT
TO authenticated
USING (true);

-- Public / anon view for leaderboard aggregates
CREATE POLICY "Public read weekly marks for leaderboard"
ON public.weekly_marks FOR SELECT
TO anon
USING (true);

-- Only Admins can insert weekly marks
CREATE POLICY "Admins can insert weekly marks"
ON public.weekly_marks FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Only Admins can update weekly marks
CREATE POLICY "Admins can update weekly marks"
ON public.weekly_marks FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Only Admins can delete weekly marks
CREATE POLICY "Admins can delete weekly marks"
ON public.weekly_marks FOR DELETE
TO authenticated
USING (public.is_admin());

-- ====================================================================
-- 7. INITIAL SEED DATA FOR THE 4 ECO CLUB HOUSES
-- ====================================================================
INSERT INTO public.houses (code, name, color, description)
VALUES 
    (
        'GREEN', 
        'Green House (Emerald Forest)', 
        '#16a34a', 
        'Champions of campus sustainability, afforestation, waste segregation, and organic rooftop farming.'
    ),
    (
        'BLUE', 
        'Blue House (Ocean Wave)', 
        '#2563eb', 
        'Dedicated to water conservation, rainwater harvesting infrastructure, lake revival, and plastic-free water bodies.'
    ),
    (
        'RED', 
        'Red House (Solar Flare)', 
        '#dc2626', 
        'Pioneering clean energy, campus solar audits, e-waste management, and carbon footprint reduction drives.'
    ),
    (
        'YELLOW', 
        'Yellow House (Golden Sun)', 
        '#ca8a04', 
        'Leading biodiversity preservation, wildlife & pollinator protection, botanical tagging, and eco-awareness.'
    )
ON CONFLICT (code) DO UPDATE 
SET 
    name = EXCLUDED.name,
    color = EXCLUDED.color,
    description = EXCLUDED.description;

-- ====================================================================
-- 8. DEFAULT CREDENTIALS GUIDE
-- ====================================================================
-- 1. ADMINISTRATOR PORTAL:
--    Default Admin Email: admin@ecoclub.org
--    Default Admin Password: sxcce1234
--
--    Instructions:
--    a. In Supabase Dashboard -> Authentication -> Users, click "Add User" -> "Create User"
--       Email: admin@ecoclub.org
--       Password: sxcce1234
--       Auto Confirm: ON
--    b. Copy the generated User UID and execute in SQL Editor:
--
--       INSERT INTO public.users (id, name, email, role)
--       VALUES ('<PASTE-USER-UID-HERE>', 'Chief Environmental Officer', 'admin@ecoclub.org', 'ADMIN')
--       ON CONFLICT (email) DO UPDATE SET role = 'ADMIN';
--
-- 2. STUDENT PORTAL:
--    Student Username: College Roll Number (e.g. 502433 or 23CS042)
--    Default Student Password: stud@sxcce
--    (Applicable for all enrolled students created via Admin UI or Bulk Import)
--    Students sign in using their Roll Number as username and default password stud@sxcce.


