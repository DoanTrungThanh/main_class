import { supabase } from './supabase';
import {
  Student,
  Class,
  Classroom,
  Schedule,
  Attendance,
  User,
  GradePeriod,
  GradeColumn,
  Grade,
  Subject,
  Event,
  EventParticipant,
  GradeBatch,
  AssetCategory,
  AssetDistribution,
  ActivityReport,
  ClassInventoryItem,
  InventoryCategory
} from '../types';

// Class Inventory types
export interface ClassInventoryItem {
  id: string;
  title: string;
  quantity: number;
  category_id: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Notification Template type
export interface NotificationTemplate {
  id: string;
  name: string;
  templateData: {
    header: string;
    morningLabel: string;
    afternoonLabel: string;
    eveningLabel: string;
    scheduleFormat: string;
    footer: string;
    noScheduleMessage: string;
  };
  createdBy: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Helper function to generate IDs
const generateId = (prefix: string) => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

// Users service
export const usersService = {
  async getAll(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        name: item.name,
        email: item.email,
        role: item.role,
        avatar: item.avatar,
        password: item.password,
        isActive: item.is_active,
        lastLogin: item.last_login,
        createdAt: item.created_at,
        gender: item.gender || 'male',
        permissions: item.permissions || [],
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      // Return empty array if Supabase is not available
      return [];
    }
  },

  async authenticate(email: string, password: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .eq('is_active', true)
        .single();
      
      if (error) return null;
      
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        avatar: data.avatar,
        password: data.password,
        isActive: data.is_active,
        lastLogin: data.last_login,
        createdAt: data.created_at,
        gender: data.gender || 'male',
        permissions: data.permissions || [],
      };
    } catch (error) {
      console.error('Error authenticating user:', error);
      return null;
    }
  },

  async create(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    try {
      const id = generateId('USR');
      const { data, error } = await supabase
        .from('users')
        .insert({
          id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          avatar: userData.avatar,
          password: userData.password,
          is_active: userData.isActive ?? true,
          last_login: userData.lastLogin,
          gender: userData.gender || 'male',
          permissions: userData.permissions || [],
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        avatar: data.avatar,
        password: data.password,
        isActive: data.is_active,
        lastLogin: data.last_login,
        createdAt: data.created_at,
        gender: data.gender || 'male',
        permissions: data.permissions || [],
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<User>): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...(updates.name && { name: updates.name }),
          ...(updates.email && { email: updates.email }),
          ...(updates.role && { role: updates.role }),
          ...(updates.avatar !== undefined && { avatar: updates.avatar }),
          ...(updates.password && { password: updates.password }),
          ...(updates.isActive !== undefined && { is_active: updates.isActive }),
          ...(updates.lastLogin !== undefined && { last_login: updates.lastLogin }),
          ...(updates.gender && { gender: updates.gender }),
          ...(updates.permissions !== undefined && { permissions: updates.permissions }),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        avatar: data.avatar,
        password: data.password,
        isActive: data.is_active,
        lastLogin: data.last_login,
        createdAt: data.created_at,
        gender: data.gender || 'male',
        permissions: data.permissions || [],
      };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },
};

// Subjects service
export const subjectsService = {
  async getAll(): Promise<Subject[]> {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        name: item.name,
        code: item.code,
        description: item.description,
        color: item.color,
        isActive: item.is_active,
        createdAt: item.created_at,
      }));
    } catch (error) {
      console.error('Error fetching subjects:', error);
      return [];
    }
  },

  async create(subject: Omit<Subject, 'id' | 'createdAt'>): Promise<Subject> {
    try {
      const id = generateId('SUB');
      const { data, error } = await supabase
        .from('subjects')
        .insert({
          id,
          name: subject.name,
          code: subject.code,
          description: subject.description,
          color: subject.color,
          is_active: subject.isActive,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        code: data.code,
        description: data.description,
        color: data.color,
        isActive: data.is_active,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error creating subject:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Subject>): Promise<Subject> {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .update({
          ...(updates.name && { name: updates.name }),
          ...(updates.code && { code: updates.code }),
          ...(updates.description !== undefined && { description: updates.description }),
          ...(updates.color && { color: updates.color }),
          ...(updates.isActive !== undefined && { is_active: updates.isActive }),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        code: data.code,
        description: data.description,
        color: data.color,
        isActive: data.is_active,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error updating subject:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting subject:', error);
      throw error;
    }
  },
};

// Students service
export const studentsService = {
  async getAll(): Promise<Student[]> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        name: item.name,
        birthDate: item.birth_date,
        gender: item.gender || 'other',
        parentName: item.parent_name,
        motherName: item.mother_name,
        parentPhone: item.parent_phone,
        parentIdCard: item.parent_id_card,
        parentIdCard2: item.parent_id_card2,
        status: item.status || 'active',
        driveLink: item.drive_link,
        classId: item.class_id,
        createdAt: item.created_at,
      }));
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  },

  async create(student: Omit<Student, 'id' | 'createdAt'>): Promise<Student> {
    try {
      const id = generateId('ST');
      const { data, error } = await supabase
        .from('students')
        .insert({
          id,
          name: student.name,
          birth_date: student.birthDate,
          gender: student.gender || 'other',
          parent_name: student.parentName,
          mother_name: student.motherName,
          parent_phone: student.parentPhone,
          parent_id_card: student.parentIdCard,
          parent_id_card2: student.parentIdCard2,
          status: student.status || 'active',
          drive_link: student.driveLink,
          class_id: student.classId,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        birthDate: data.birth_date,
        gender: data.gender || 'other',
        parentName: data.parent_name,
        motherName: data.mother_name,
        parentPhone: data.parent_phone,
        parentIdCard: data.parent_id_card,
        parentIdCard2: data.parent_id_card2,
        status: data.status || 'active',
        driveLink: data.drive_link,
        classId: data.class_id,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Student>): Promise<Student> {
    try {
      const { data, error } = await supabase
        .from('students')
        .update({
          ...(updates.name && { name: updates.name }),
          ...(updates.birthDate && { birth_date: updates.birthDate }),
          ...(updates.gender && { gender: updates.gender }),
          ...(updates.parentName && { parent_name: updates.parentName }),
          ...(updates.motherName !== undefined && { mother_name: updates.motherName }),
          ...(updates.parentPhone && { parent_phone: updates.parentPhone }),
          ...(updates.parentIdCard !== undefined && { parent_id_card: updates.parentIdCard }),
          ...(updates.parentIdCard2 !== undefined && { parent_id_card2: updates.parentIdCard2 }),
          ...(updates.status && { status: updates.status }),
          ...(updates.driveLink !== undefined && { drive_link: updates.driveLink }),
          ...(updates.classId !== undefined && { class_id: updates.classId }),
        })
        .eq('id', id)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) {
        throw new Error(`Student with ID ${id} not found for update.`);
      }
      
      return {
        id: data.id,
        name: data.name,
        birthDate: data.birth_date,
        gender: data.gender || 'other',
        parentName: data.parent_name,
        motherName: data.mother_name,
        parentPhone: data.parent_phone,
        parentIdCard: data.parent_id_card,
        parentIdCard2: data.parent_id_card2,
        status: data.status || 'active',
        driveLink: data.drive_link,
        classId: data.class_id,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  },
};

// Classes service
export const classesService = {
  async getAll(): Promise<Class[]> {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        name: item.name,
        teacherId: item.teacher_id,
        studentIds: item.student_ids || [],
        maxStudents: item.max_students,
        subjectId: item.subject_id,
        createdAt: item.created_at,
      }));
    } catch (error) {
      console.error('Error fetching classes:', error);
      return [];
    }
  },

  async create(classData: Omit<Class, 'id' | 'createdAt'>): Promise<Class> {
    try {
      const id = generateId('CL');
      const { data, error } = await supabase
        .from('classes')
        .insert({
          id,
          name: classData.name,
          teacher_id: classData.teacherId,
          student_ids: classData.studentIds || [],
          max_students: classData.maxStudents || 30,
          subject_id: classData.subjectId,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        teacherId: data.teacher_id,
        studentIds: data.student_ids || [],
        maxStudents: data.max_students,
        subjectId: data.subject_id,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error creating class:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Class>): Promise<Class> {
    try {
      const { data, error } = await supabase
        .from('classes')
        .update({
          ...(updates.name && { name: updates.name }),
          ...(updates.teacherId && { teacher_id: updates.teacherId }),
          ...(updates.studentIds && { student_ids: updates.studentIds }),
          ...(updates.maxStudents && { max_students: updates.maxStudents }),
          ...(updates.subjectId !== undefined && { subject_id: updates.subjectId }),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        teacherId: data.teacher_id,
        studentIds: data.student_ids || [],
        maxStudents: data.max_students,
        subjectId: data.subject_id,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error updating class:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting class:', error);
      throw error;
    }
  },
};

// Classrooms service
export const classroomsService = {
  async getAll(): Promise<Classroom[]> {
    try {
      const { data, error } = await supabase
        .from('classrooms')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        name: item.name,
        capacity: item.capacity,
        location: item.location,
        equipment: item.equipment || [],
        status: item.status,
        description: item.description,
        createdAt: item.created_at,
      }));
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      return [];
    }
  },

  async create(classroom: Omit<Classroom, 'id' | 'createdAt'>): Promise<Classroom> {
    try {
      const id = generateId('CR');
      const { data, error } = await supabase
        .from('classrooms')
        .insert({
          id,
          name: classroom.name,
          capacity: classroom.capacity || 30,
          location: classroom.location || '',
          equipment: classroom.equipment || [],
          status: classroom.status || 'available',
          description: classroom.description,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        capacity: data.capacity,
        location: data.location,
        equipment: data.equipment || [],
        status: data.status,
        description: data.description,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error creating classroom:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Classroom>): Promise<Classroom> {
    try {
      const { data, error } = await supabase
        .from('classrooms')
        .update({
          ...(updates.name && { name: updates.name }),
          ...(updates.capacity && { capacity: updates.capacity }),
          ...(updates.location !== undefined && { location: updates.location }),
          ...(updates.equipment && { equipment: updates.equipment }),
          ...(updates.status && { status: updates.status }),
          ...(updates.description !== undefined && { description: updates.description }),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        capacity: data.capacity,
        location: data.location,
        equipment: data.equipment || [],
        status: data.status,
        description: data.description,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error updating classroom:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('classrooms')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting classroom:', error);
      throw error;
    }
  },
};

// Schedules service
export const schedulesService = {
  async getAll(): Promise<Schedule[]> {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        classId: item.class_id,
        teacherId: item.teacher_id,
        subjectId: item.subject_id,
        classroomId: item.classroom_id,
        date: item.date,
        timeSlot: item.time_slot,
        startTime: item.start_time,
        endTime: item.end_time,
        status: item.status,
      }));
    } catch (error) {
      console.error('Error fetching schedules:', error);
      return [];
    }
  },

  async create(schedule: Omit<Schedule, 'id'>): Promise<Schedule> {
    try {
      const id = generateId('SCH');
      const { data, error } = await supabase
        .from('schedules')
        .insert({
          id,
          class_id: schedule.classId,
          teacher_id: schedule.teacherId,
          subject_id: schedule.subjectId,
          classroom_id: schedule.classroomId,
          date: schedule.date,
          time_slot: schedule.timeSlot,
          start_time: schedule.startTime,
          end_time: schedule.endTime,
          status: schedule.status || 'scheduled',
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        classId: data.class_id,
        teacherId: data.teacher_id,
        subjectId: data.subject_id,
        classroomId: data.classroom_id,
        date: data.date,
        timeSlot: data.time_slot,
        startTime: data.start_time,
        endTime: data.end_time,
        status: data.status,
      };
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Schedule>): Promise<Schedule> {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .update({
          ...(updates.classId && { class_id: updates.classId }),
          ...(updates.teacherId && { teacher_id: updates.teacherId }),
          ...(updates.subjectId !== undefined && { subject_id: updates.subjectId }),
          ...(updates.classroomId !== undefined && { classroom_id: updates.classroomId }),
          ...(updates.date && { date: updates.date }),
          ...(updates.timeSlot && { time_slot: updates.timeSlot }),
          ...(updates.startTime && { start_time: updates.startTime }),
          ...(updates.endTime && { end_time: updates.endTime }),
          ...(updates.status && { status: updates.status }),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        classId: data.class_id,
        teacherId: data.teacher_id,
        subjectId: data.subject_id,
        classroomId: data.classroom_id,
        date: data.date,
        timeSlot: data.time_slot,
        startTime: data.start_time,
        endTime: data.end_time,
        status: data.status,
      };
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error;
    }
  },
};

// Attendance service
export const attendanceService = {
  async getAll(): Promise<Attendance[]> {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .order('checked_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        scheduleId: item.schedule_id,
        studentId: item.student_id,
        status: item.status,
        checkedAt: item.checked_at,
      }));
    } catch (error) {
      console.error('Error fetching attendance:', error);
      return [];
    }
  },

  async create(attendance: Omit<Attendance, 'id'>): Promise<Attendance> {
    try {
      const id = generateId('ATT');
      const { data, error } = await supabase
        .from('attendance')
        .insert({
          id,
          schedule_id: attendance.scheduleId,
          student_id: attendance.studentId,
          status: attendance.status,
          checked_at: attendance.checkedAt || new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        scheduleId: data.schedule_id,
        studentId: data.student_id,
        status: data.status,
        checkedAt: data.checked_at,
      };
    } catch (error) {
      console.error('Error creating attendance:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Attendance>): Promise<Attendance> {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .update({
          ...(updates.scheduleId && { schedule_id: updates.scheduleId }),
          ...(updates.studentId && { student_id: updates.studentId }),
          ...(updates.status && { status: updates.status }),
          ...(updates.checkedAt !== undefined && { checked_at: updates.checkedAt }),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        scheduleId: data.schedule_id,
        studentId: data.student_id,
        status: data.status,
        checkedAt: data.checked_at,
      };
    } catch (error) {
      console.error('Error updating attendance:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('attendance')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting attendance:', error);
      throw error;
    }
  },
};

// Grade Periods service
export const gradePeriodsService = {
  async getAll(): Promise<GradePeriod[]> {
    try {
      const { data, error } = await supabase
        .from('grade_periods')
        .select('*')
        .order('start_date', { ascending: true });
      
      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        name: item.name,
        startDate: item.start_date,
        endDate: item.end_date,
        isActive: item.is_active,
        createdAt: item.created_at,
      }));
    } catch (error) {
      console.error('Error fetching grade periods:', error);
      return [];
    }
  },

  async create(period: Omit<GradePeriod, 'id' | 'createdAt'>): Promise<GradePeriod> {
    try {
      const id = generateId('GP');
      const { data, error } = await supabase
        .from('grade_periods')
        .insert({
          id,
          name: period.name,
          start_date: period.startDate,
          end_date: period.endDate,
          is_active: period.isActive,
          created_by: '1', // Default to admin user
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        startDate: data.start_date,
        endDate: data.end_date,
        isActive: data.is_active,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error creating grade period:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<GradePeriod>): Promise<GradePeriod> {
    try {
      const { data, error } = await supabase
        .from('grade_periods')
        .update({
          ...(updates.name && { name: updates.name }),
          ...(updates.startDate && { start_date: updates.startDate }),
          ...(updates.endDate && { end_date: updates.endDate }),
          ...(updates.isActive !== undefined && { is_active: updates.isActive }),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        startDate: data.start_date,
        endDate: data.end_date,
        isActive: data.is_active,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error updating grade period:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('grade_periods')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting grade period:', error);
      throw error;
    }
  },
};

// Grade Columns service
export const gradeColumnsService = {
  async getAll(): Promise<GradeColumn[]> {
    try {
      const { data, error } = await supabase
        .from('grade_columns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        name: item.name,
        classId: item.class_id,
        teacherId: item.teacher_id,
        gradePeriodId: item.grade_period_id,
        gradeBatchId: item.grade_batch_id,
        maxScore: item.max_score,
        weight: item.weight,
        description: item.description,
        createdAt: item.created_at,
      }));
    } catch (error) {
      console.error('Error fetching grade columns:', error);
      return [];
    }
  },

  async create(column: Omit<GradeColumn, 'id' | 'createdAt'>): Promise<GradeColumn> {
    try {
      const id = generateId('GC');
      const { data, error } = await supabase
        .from('grade_columns')
        .insert({
          id,
          name: column.name,
          class_id: column.classId,
          teacher_id: column.teacherId,
          grade_period_id: column.gradePeriodId,
          grade_batch_id: column.gradeBatchId,
          max_score: column.maxScore || 10,
          weight: column.weight || 1,
          description: column.description,
          created_by: column.teacherId || '1',
          type: 'regular',
          is_active: true,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        classId: data.class_id,
        teacherId: data.teacher_id,
        gradePeriodId: data.grade_period_id,
        gradeBatchId: data.grade_batch_id,
        maxScore: data.max_score,
        weight: data.weight,
        description: data.description,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error creating grade column:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<GradeColumn>): Promise<GradeColumn> {
    try {
      const { data, error } = await supabase
        .from('grade_columns')
        .update({
          ...(updates.name && { name: updates.name }),
          ...(updates.classId && { class_id: updates.classId }),
          ...(updates.teacherId && { teacher_id: updates.teacherId }),
          ...(updates.gradePeriodId !== undefined && { grade_period_id: updates.gradePeriodId }),
          ...(updates.gradeBatchId !== undefined && { grade_batch_id: updates.gradeBatchId }),
          ...(updates.maxScore && { max_score: updates.maxScore }),
          ...(updates.weight && { weight: updates.weight }),
          ...(updates.description !== undefined && { description: updates.description }),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        classId: data.class_id,
        teacherId: data.teacher_id,
        gradePeriodId: data.grade_period_id,
        gradeBatchId: data.grade_batch_id,
        maxScore: data.max_score,
        weight: data.weight,
        description: data.description,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error updating grade column:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('grade_columns')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting grade column:', error);
      throw error;
    }
  },
};

// Grades service
export const gradesService = {
  async getAll(): Promise<Grade[]> {
    try {
      const { data, error } = await supabase
        .from('grades')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        gradeColumnId: item.grade_column_id,
        studentId: item.student_id,
        score: item.score,
        notes: item.notes,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));
    } catch (error) {
      console.error('Error fetching grades:', error);
      return [];
    }
  },

  async create(grade: Omit<Grade, 'id' | 'createdAt' | 'updatedAt'>): Promise<Grade> {
    try {
      const id = generateId('GR');
      const { data, error } = await supabase
        .from('grades')
        .insert({
          id,
          grade_column_id: grade.gradeColumnId,
          student_id: grade.studentId,
          score: grade.score,
          notes: grade.notes,
          entered_by: '1', // Default to admin user
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        gradeColumnId: data.grade_column_id,
        studentId: data.student_id,
        score: data.score,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error creating grade:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Grade>): Promise<Grade> {
    try {
      const { data, error } = await supabase
        .from('grades')
        .update({
          ...(updates.gradeColumnId && { grade_column_id: updates.gradeColumnId }),
          ...(updates.studentId && { student_id: updates.studentId }),
          ...(updates.score !== undefined && { score: updates.score }),
          ...(updates.notes !== undefined && { notes: updates.notes }),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        gradeColumnId: data.grade_column_id,
        studentId: data.student_id,
        score: data.score,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error updating grade:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('grades')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting grade:', error);
      throw error;
    }
  },

  async upsert(grade: Omit<Grade, 'id' | 'createdAt' | 'updatedAt'>): Promise<Grade> {
    try {
      // Check if grade exists
      const { data: existingData } = await supabase
        .from('grades')
        .select('id')
        .eq('grade_column_id', grade.gradeColumnId)
        .eq('student_id', grade.studentId)
        .maybeSingle();

      if (existingData) {
        // Update existing grade
        const { data, error } = await supabase
          .from('grades')
          .update({
            score: grade.score,
            notes: grade.notes,
          })
          .eq('id', existingData.id)
          .select()
          .single();
        
        if (error) throw error;
        
        return {
          id: data.id,
          gradeColumnId: data.grade_column_id,
          studentId: data.student_id,
          score: data.score,
          notes: data.notes,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      } else {
        // Create new grade
        return this.create(grade);
      }
    } catch (error) {
      console.error('Error upserting grade:', error);
      throw error;
    }
  },
};

// Events service
export const eventsService = {
  async getAll(): Promise<Event[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;

      return data.map(event => ({
        id: event.id,
        name: event.name,
        description: event.description,
        eventDate: event.event_date,
        startTime: event.start_time,
        endTime: event.end_time,
        location: event.location,
        maxParticipants: event.max_participants,
        status: event.status,
        organizerId: event.organizer_id,
        participantIds: event.participant_ids || [],
        createdAt: event.created_at,
      }));
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  },

  async create(eventData: Omit<Event, 'id' | 'createdAt'>): Promise<Event> {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          id: generateId('evt_'),
          name: eventData.name,
          description: eventData.description,
          event_date: eventData.eventDate,
          start_time: eventData.startTime,
          end_time: eventData.endTime,
          location: eventData.location,
          max_participants: eventData.maxParticipants,
          status: eventData.status,
          organizer_id: eventData.organizerId,
          participant_ids: eventData.participantIds,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        eventDate: data.event_date,
        startTime: data.start_time,
        endTime: data.end_time,
        location: data.location,
        maxParticipants: data.max_participants,
        status: data.status,
        organizerId: data.organizer_id,
        participantIds: data.participant_ids || [],
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  async update(id: string, eventData: Partial<Event>): Promise<Event> {
    try {
      const updateData: any = {};

      if (eventData.name !== undefined) updateData.name = eventData.name;
      if (eventData.description !== undefined) updateData.description = eventData.description;
      if (eventData.eventDate !== undefined) updateData.event_date = eventData.eventDate;
      if (eventData.startTime !== undefined) updateData.start_time = eventData.startTime;
      if (eventData.endTime !== undefined) updateData.end_time = eventData.endTime;
      if (eventData.location !== undefined) updateData.location = eventData.location;
      if (eventData.maxParticipants !== undefined) updateData.max_participants = eventData.maxParticipants;
      if (eventData.status !== undefined) updateData.status = eventData.status;
      if (eventData.organizerId !== undefined) updateData.organizer_id = eventData.organizerId;
      if (eventData.participantIds !== undefined) updateData.participant_ids = eventData.participantIds;

      const { data, error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        eventDate: data.event_date,
        startTime: data.start_time,
        endTime: data.end_time,
        location: data.location,
        maxParticipants: data.max_participants,
        status: data.status,
        organizerId: data.organizer_id,
        participantIds: data.participant_ids || [],
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }
};

// Grade Batches service
export const gradeBatchesService = {
  async getAll(): Promise<GradeBatch[]> {
    try {
      const { data, error } = await supabase
        .from('grade_batches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(batch => ({
        id: batch.id,
        name: batch.name,
        classId: batch.class_id,
        teacherId: batch.teacher_id,
        gradePeriodId: batch.grade_period_id,
        columnCount: batch.column_count,
        description: batch.description,
        status: batch.status,
        createdAt: batch.created_at,
        updatedAt: batch.updated_at,
      }));
    } catch (error) {
      console.error('Error fetching grade batches:', error);
      return [];
    }
  },

  async create(batchData: Omit<GradeBatch, 'id' | 'createdAt' | 'updatedAt'>): Promise<GradeBatch> {
    try {
      const id = generateId('gb_');
      console.log('Creating batch with data:', { id, ...batchData });

      const insertData = {
        id,
        name: batchData.name,
        class_id: batchData.classId,
        teacher_id: batchData.teacherId,
        grade_period_id: batchData.gradePeriodId || null,
        column_count: batchData.columnCount || 1,
        description: batchData.description || null,
        status: batchData.status || 'draft',
      };

      console.log('Insert data:', insertData);

      // Bypass RLS temporarily
      const { data, error } = await supabase
        .from('grade_batches')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Created batch:', data);

      return {
        id: data.id,
        name: data.name,
        classId: data.class_id,
        teacherId: data.teacher_id,
        gradePeriodId: data.grade_period_id,
        columnCount: data.column_count,
        description: data.description,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error creating grade batch:', error);
      throw error;
    }
  },

  async update(id: string, batchData: Partial<GradeBatch>): Promise<GradeBatch> {
    try {
      const updateData: any = {};

      if (batchData.name !== undefined) updateData.name = batchData.name;
      if (batchData.classId !== undefined) updateData.class_id = batchData.classId;
      if (batchData.teacherId !== undefined) updateData.teacher_id = batchData.teacherId;
      if (batchData.gradePeriodId !== undefined) updateData.grade_period_id = batchData.gradePeriodId;
      if (batchData.columnCount !== undefined) updateData.column_count = batchData.columnCount;
      if (batchData.description !== undefined) updateData.description = batchData.description;
      if (batchData.status !== undefined) updateData.status = batchData.status;

      const { data, error } = await supabase
        .from('grade_batches')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        classId: data.class_id,
        teacherId: data.teacher_id,
        gradePeriodId: data.grade_period_id,
        columnCount: data.column_count,
        description: data.description,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error updating grade batch:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('grade_batches')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting grade batch:', error);
      throw error;
    }
  },

  // Tạo các cột điểm cho đợt điểm
  async createColumns(batchId: string, columnNames: string[]): Promise<void> {
    try {
      // Lấy thông tin batch
      const { data: batch, error: batchError } = await supabase
        .from('grade_batches')
        .select('*')
        .eq('id', batchId)
        .single();

      if (batchError) throw batchError;

      // Tạo các cột điểm
      const columns = columnNames.map((name, index) => ({
        id: generateId('gc_'),
        name: name,
        class_id: batch.class_id,
        teacher_id: batch.teacher_id,
        grade_period_id: batch.grade_period_id,
        grade_batch_id: batchId,
        max_score: 10,
        weight: 1,
        created_by: batch.teacher_id,
        type: 'regular',
        is_active: true,
      }));

      const { error } = await supabase
        .from('grade_columns')
        .insert(columns);

      if (error) throw error;
    } catch (error) {
      console.error('Error creating grade columns for batch:', error);
      throw error;
    }
  }
};

// Notification Templates service
export const notificationTemplatesService = {
  async getAll(): Promise<NotificationTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(template => ({
        id: template.id,
        name: template.name,
        templateData: template.template_data,
        createdBy: template.created_by,
        isDefault: template.is_default,
        createdAt: template.created_at,
        updatedAt: template.updated_at,
      }));
    } catch (error) {
      console.error('Error fetching notification templates:', error);
      return [];
    }
  },

  async getDefault(): Promise<NotificationTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('is_default', true)
        .single();

      if (error) return null;

      return {
        id: data.id,
        name: data.name,
        templateData: data.template_data,
        createdBy: data.created_by,
        isDefault: data.is_default,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error fetching default template:', error);
      return null;
    }
  },

  async create(templateData: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<NotificationTemplate> {
    try {
      const id = generateId('NT');
      const { data, error } = await supabase
        .from('notification_templates')
        .insert({
          id,
          name: templateData.name,
          template_data: templateData.templateData,
          created_by: templateData.createdBy,
          is_default: templateData.isDefault,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        templateData: data.template_data,
        createdBy: data.created_by,
        isDefault: data.is_default,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error creating notification template:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    try {
      const updateData: any = {};

      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.templateData !== undefined) updateData.template_data = updates.templateData;
      if (updates.isDefault !== undefined) updateData.is_default = updates.isDefault;

      const { data, error } = await supabase
        .from('notification_templates')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        templateData: data.template_data,
        createdBy: data.created_by,
        isDefault: data.is_default,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error updating notification template:', error);
      throw error;
    }
  },

  async upsertDefault(templateData: NotificationTemplate['templateData'], userId: string): Promise<NotificationTemplate> {
    try {
      // Check if default template exists
      const { data: existingTemplate, error: selectError } = await supabase
        .from('notification_templates')
        .select('id')
        .eq('is_default', true)
        .maybeSingle();

      if (selectError) throw selectError;

      if (existingTemplate) {
        // Update existing default template
        return this.update(existingTemplate.id, { templateData });
      } else {
        // Create new default template
        return this.create({
          name: 'Default Template',
          templateData,
          createdBy: userId,
          isDefault: true,
        });
      }
    } catch (error) {
      console.error('Error upserting default template:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notification_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting notification template:', error);
      throw error;
    }
  },
};

// Asset Categories Service
export const assetCategoriesService = {
  async getAll(): Promise<AssetCategory[]> {
    try {
      const { data, error } = await supabase
        .from('asset_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching asset categories:', error);
      throw error;
    }
  },

  async create(category: Omit<AssetCategory, 'id' | 'createdAt'>): Promise<AssetCategory> {
    try {
      const { data, error } = await supabase
        .from('asset_categories')
        .insert([{
          ...category,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating asset category:', error);
      throw error;
    }
  },

  async update(id: string, category: Partial<AssetCategory>): Promise<AssetCategory> {
    try {
      const { data, error } = await supabase
        .from('asset_categories')
        .update(category)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating asset category:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('asset_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting asset category:', error);
      throw error;
    }
  },
};

// Asset Distributions Service
export const assetDistributionsService = {
  async getAll(): Promise<AssetDistribution[]> {
    try {
      const { data, error } = await supabase
        .from('asset_distributions')
        .select('*')
        .order('distributed_date', { ascending: false });

      if (error) throw error;

      // Convert snake_case to camelCase for frontend
      return (data || []).map(item => ({
        id: item.id,
        assetId: item.asset_id,
        assetName: item.asset_name,
        quantity: item.quantity,
        assignedTo: item.assigned_to,
        distributedDate: item.distributed_date,
        notes: item.notes,
        status: item.status,
        createdAt: item.created_at
      }));
    } catch (error) {
      console.error('Error fetching asset distributions:', error);
      throw error;
    }
  },

  async create(distribution: Omit<AssetDistribution, 'id' | 'createdAt'>): Promise<AssetDistribution> {
    try {
      const { data, error } = await supabase
        .from('asset_distributions')
        .insert([{
          asset_id: distribution.assetId,
          asset_name: distribution.assetName,
          quantity: distribution.quantity,
          assigned_to: distribution.assignedTo,
          distributed_date: distribution.distributedDate,
          notes: distribution.notes,
          status: distribution.status,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Convert back to camelCase for frontend
      return {
        id: data.id,
        assetId: data.asset_id,
        assetName: data.asset_name,
        quantity: data.quantity,
        assignedTo: data.assigned_to,
        distributedDate: data.distributed_date,
        notes: data.notes,
        status: data.status,
        createdAt: data.created_at
      };
    } catch (error) {
      console.error('Error creating asset distribution:', error);
      throw error;
    }
  },

  async update(id: string, distribution: Partial<AssetDistribution>): Promise<AssetDistribution> {
    try {
      // Convert camelCase to snake_case for database
      const updateData: any = {};
      if (distribution.assetId !== undefined) updateData.asset_id = distribution.assetId;
      if (distribution.assetName !== undefined) updateData.asset_name = distribution.assetName;
      if (distribution.quantity !== undefined) updateData.quantity = distribution.quantity;
      if (distribution.assignedTo !== undefined) updateData.assigned_to = distribution.assignedTo;
      if (distribution.distributedDate !== undefined) updateData.distributed_date = distribution.distributedDate;
      if (distribution.notes !== undefined) updateData.notes = distribution.notes;
      if (distribution.status !== undefined) updateData.status = distribution.status;

      const { data, error } = await supabase
        .from('asset_distributions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Convert back to camelCase for frontend
      return {
        id: data.id,
        assetId: data.asset_id,
        assetName: data.asset_name,
        quantity: data.quantity,
        assignedTo: data.assigned_to,
        distributedDate: data.distributed_date,
        notes: data.notes,
        status: data.status,
        createdAt: data.created_at
      };
    } catch (error) {
      console.error('Error updating asset distribution:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('asset_distributions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting asset distribution:', error);
      throw error;
    }
  },
};

// Activity Reports Service
export const activityReportsService = {
  async createTable(): Promise<void> {
    console.log('Activity reports table creation skipped - please run SQL script manually');
  },
  async getAll(): Promise<ActivityReport[]> {
    try {
      const { data, error } = await supabase
        .from('activity_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching activity reports:', error);
        // If table doesn't exist, return empty array
        if (error.code === '42P01') {
          console.log('Activity reports table does not exist, returning empty array');
          return [];
        }
        throw error;
      }

      // Convert snake_case to camelCase for frontend
      return (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        content: item.content,
        status: item.status,
        createdBy: item.created_by,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        isPublic: item.is_public,
        tags: item.tags || []
      }));
    } catch (error) {
      console.error('Error fetching activity reports:', error);
      // Return empty array instead of throwing to prevent app crash
      return [];
    }
  },

  async create(report: Omit<ActivityReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<ActivityReport> {
    try {
      const id = generateId('ar_');
      console.log('Creating activity report with data:', { id, ...report });

      const insertData = {
        id,
        title: report.title,
        description: report.description,
        content: report.content,
        status: report.status,
        created_by: report.createdBy || 'system',
        is_public: report.isPublic,
        tags: report.tags || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Insert data:', insertData);

      const { data, error } = await supabase
        .from('activity_reports')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating activity report:', error);
        throw error;
      }

      // Convert back to camelCase for frontend
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        content: data.content,
        status: data.status,
        createdBy: data.created_by,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        isPublic: data.is_public,
        tags: data.tags || []
      };
    } catch (error) {
      console.error('Error creating activity report:', error);
      throw error;
    }
  },

  async update(id: string, report: Partial<ActivityReport>): Promise<ActivityReport> {
    try {
      // Convert camelCase to snake_case for database
      const updateData: any = {};
      if (report.title !== undefined) updateData.title = report.title;
      if (report.description !== undefined) updateData.description = report.description;
      if (report.content !== undefined) updateData.content = report.content;
      if (report.status !== undefined) updateData.status = report.status;
      if (report.isPublic !== undefined) updateData.is_public = report.isPublic;
      if (report.tags !== undefined) updateData.tags = report.tags;
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('activity_reports')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Convert back to camelCase for frontend
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        content: data.content,
        status: data.status,
        createdBy: data.created_by,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        isPublic: data.is_public,
        tags: data.tags || []
      };
    } catch (error) {
      console.error('Error updating activity report:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('activity_reports')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting activity report:', error);
      throw error;
    }
  },
};

// Inventory Categories Service
export const inventoryCategoriesService = {
  async getAll(): Promise<InventoryCategory[]> {
    try {
      const { data, error } = await supabase
        .from('inventory_categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching inventory categories:', error);
      return [];
    }
  },

  async create(category: Omit<InventoryCategory, 'id' | 'created_at' | 'updated_at'>): Promise<InventoryCategory> {
    try {
      const { data, error } = await supabase
        .from('inventory_categories')
        .insert({
          name: category.name,
          description: category.description,
          color: category.color,
          created_by: category.created_by,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating inventory category:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<InventoryCategory>): Promise<InventoryCategory> {
    try {
      const { data, error } = await supabase
        .from('inventory_categories')
        .update({
          ...(updates.name && { name: updates.name }),
          ...(updates.description !== undefined && { description: updates.description }),
          ...(updates.color && { color: updates.color }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating inventory category:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('inventory_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting inventory category:', error);
      throw error;
    }
  },
};

// Class Inventory Service
export const classInventoryService = {
  async getAll(): Promise<ClassInventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('class_inventory')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching class inventory:', error);
      return [];
    }
  },

  async create(item: Omit<ClassInventoryItem, 'id' | 'created_at' | 'updated_at'>): Promise<ClassInventoryItem> {
    try {
      console.log('🔍 Creating inventory item with data:', item);

      // Validate required fields
      if (!item.title || !item.category_id) {
        throw new Error('Title and category_id are required');
      }

      const insertData = {
        title: item.title,
        quantity: item.quantity || 1,
        category_id: item.category_id,
        description: item.description || null,
        created_by: item.created_by || null,
      };

      console.log('📤 Sending to Supabase:', insertData);

      const { data, error } = await supabase
        .from('class_inventory')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      console.log('✅ Created successfully:', data);
      return data;
    } catch (error) {
      console.error('💥 Error creating class inventory item:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<ClassInventoryItem>): Promise<ClassInventoryItem> {
    try {
      const { data, error } = await supabase
        .from('class_inventory')
        .update({
          ...(updates.title && { title: updates.title }),
          ...(updates.quantity !== undefined && { quantity: updates.quantity }),
          ...(updates.category_id && { category_id: updates.category_id }),
          ...(updates.description !== undefined && { description: updates.description }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating class inventory item:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('class_inventory')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting class inventory item:', error);
      throw error;
    }
  },
};

