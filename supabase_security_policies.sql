-- 🔒 Supabase Row Level Security (RLS) Policies
-- Run this script in your Supabase SQL Editor AFTER setting up the database

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_page_settings ENABLE ROW LEVEL SECURITY;

-- 👥 USERS TABLE POLICIES
-- Admin can see all users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.role = 'admin' AND u.is_active = true
    )
  );

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Admin can insert/update/delete users
CREATE POLICY "Admins can manage users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.role = 'admin' AND u.is_active = true
    )
  );

-- 🎓 STUDENTS TABLE POLICIES
-- Teachers and above can view students
CREATE POLICY "Teachers+ can view students" ON students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role IN ('admin', 'manager', 'teacher') 
      AND u.is_active = true
    )
  );

-- Managers and above can manage students
CREATE POLICY "Managers+ can manage students" ON students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role IN ('admin', 'manager') 
      AND u.is_active = true
    )
  );

-- 🏫 CLASSES TABLE POLICIES
-- Teachers can view classes they teach
CREATE POLICY "Teachers can view own classes" ON classes
  FOR SELECT USING (
    teacher_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role IN ('admin', 'manager') 
      AND u.is_active = true
    )
  );

-- Managers+ can manage classes
CREATE POLICY "Managers+ can manage classes" ON classes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role IN ('admin', 'manager') 
      AND u.is_active = true
    )
  );

-- 📅 SCHEDULES TABLE POLICIES
-- Teachers can view their schedules
CREATE POLICY "Teachers can view own schedules" ON schedules
  FOR SELECT USING (
    teacher_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role IN ('admin', 'manager') 
      AND u.is_active = true
    )
  );

-- 💰 FINANCES TABLE POLICIES (Restricted)
-- Only admin and users with finance permissions can access
CREATE POLICY "Finance access restricted" ON finances
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.is_active = true
      AND (
        u.role = 'admin' OR
        (u.role = 'manager' AND u.permissions @> '["finances.view"]'::jsonb)
      )
    )
  );

-- 📦 ASSETS TABLE POLICIES (Restricted)
-- Only admin and users with asset permissions can access
CREATE POLICY "Asset access restricted" ON assets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.is_active = true
      AND (
        u.role = 'admin' OR
        (u.role = 'manager' AND u.permissions @> '["assets.view"]'::jsonb)
      )
    )
  );

-- 🌐 PUBLIC PAGES - Read-only for everyone
CREATE POLICY "Public page settings readable by all" ON public_page_settings
  FOR SELECT USING (true);

-- Only admin can modify public page settings
CREATE POLICY "Only admin can modify public settings" ON public_page_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.role = 'admin' AND u.is_active = true
    )
  );

-- 📊 GRADES TABLE POLICIES
-- Teachers can manage grades for their classes
CREATE POLICY "Teachers can manage own class grades" ON grades
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM grade_columns gc
      JOIN classes c ON gc.class_id = c.id
      WHERE gc.id = grade_column_id 
      AND (c.teacher_id = auth.uid() OR gc.teacher_id = auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role IN ('admin', 'manager') 
      AND u.is_active = true
    )
  );

-- 📝 ATTENDANCE TABLE POLICIES
-- Teachers can manage attendance for their classes
CREATE POLICY "Teachers can manage own class attendance" ON attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM schedules s
      WHERE s.id = schedule_id AND s.teacher_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role IN ('admin', 'manager') 
      AND u.is_active = true
    )
  );

-- 🎒 CLASS INVENTORY POLICIES
-- All authenticated users can view inventory
CREATE POLICY "Authenticated users can view inventory" ON class_inventory
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Teachers+ can manage inventory
CREATE POLICY "Teachers+ can manage inventory" ON class_inventory
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role IN ('admin', 'manager', 'teacher', 'volunteer') 
      AND u.is_active = true
    )
  );

-- Create function to check user permissions
CREATE OR REPLACE FUNCTION check_user_permission(required_permission text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users u 
    WHERE u.id = auth.uid() 
    AND u.is_active = true
    AND (
      u.role = 'admin' OR
      u.permissions @> jsonb_build_array(required_permission)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_user_permission(text) TO authenticated;
