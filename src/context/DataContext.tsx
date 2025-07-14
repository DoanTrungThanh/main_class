import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getTodayVN, formatDateForInput } from '../utils/dateUtils';
import { Student, Class, Schedule, Attendance, FinanceRecord, Asset, Notification, Classroom, GradePeriod, GradeColumn, Grade, Subject, Event, GradeBatch, AssetCategory, AssetDistribution, ActivityReport } from '../types';
import {
  studentsService,
  classesService,
  classroomsService,
  schedulesService,
  attendanceService,
  gradePeriodsService,
  gradeColumnsService,
  gradesService,
  subjectsService,
  eventsService,
  gradeBatchesService,
  assetCategoriesService,
  assetDistributionsService,
  activityReportsService
} from '../lib/supabaseService';
import { supabase } from '../lib/supabase';

// Check if Supabase credentials are valid
const hasValidCredentials = import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  import.meta.env.VITE_SUPABASE_URL !== 'your_supabase_project_url' &&
  import.meta.env.VITE_SUPABASE_ANON_KEY !== 'your_supabase_anon_key';

interface DataContextType {
  students: Student[];
  classes: Class[];
  classrooms: Classroom[];
  schedules: Schedule[];
  attendance: Attendance[];
  finances: FinanceRecord[];
  assets: Asset[];
  assetCategories: AssetCategory[];
  assetDistributions: AssetDistribution[];
  notifications: Notification[];
  gradePeriods: GradePeriod[];
  gradeColumns: GradeColumn[];
  grades: Grade[];
  subjects: Subject[];
  events: Event[];
  gradeBatches: GradeBatch[];
  activityReports: ActivityReport[];
  loading: boolean;
  error: string | null;
  
  // Student operations
  addStudent: (student: Omit<Student, 'id' | 'createdAt'>) => Promise<void>;
  updateStudent: (id: string, student: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  updateStudentClass: (studentId: string, newClassId: string, oldClassId?: string) => Promise<void>;
  
  // Class operations
  addClass: (classData: Omit<Class, 'id' | 'createdAt'>) => Promise<void>;
  updateClass: (id: string, classData: Partial<Class>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  
  // Classroom operations
  addClassroom: (classroom: Omit<Classroom, 'id' | 'createdAt'>) => Promise<void>;
  updateClassroom: (id: string, classroom: Partial<Classroom>) => Promise<void>;
  deleteClassroom: (id: string) => Promise<void>;
  
  // Subject operations
  addSubject: (subject: Omit<Subject, 'id' | 'createdAt'>) => Promise<void>;
  updateSubject: (id: string, subject: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  
  // Schedule operations
  addSchedule: (schedule: Omit<Schedule, 'id'>) => Promise<void>;
  updateSchedule: (id: string, schedule: Partial<Schedule>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  copyWeekSchedule: (fromWeekStart: string, toWeekStart: string) => Promise<void>;
  addSampleData: () => Promise<any>;
  addSampleSchedules: () => Promise<Schedule[]>;
  
  // Attendance operations
  addAttendance: (attendance: Omit<Attendance, 'id'>) => Promise<void>;
  updateAttendance: (id: string, attendance: Partial<Attendance>) => Promise<void>;
  deleteAttendance: (id: string) => Promise<void>;
  resetScheduleAttendance: (scheduleId: string) => Promise<void>;
  
  // Grade Period operations
  addGradePeriod: (period: Omit<GradePeriod, 'id' | 'createdAt'>) => Promise<void>;
  updateGradePeriod: (id: string, period: Partial<GradePeriod>) => Promise<void>;
  deleteGradePeriod: (id: string) => Promise<void>;
  
  // Grade Column operations
  addGradeColumn: (column: Omit<GradeColumn, 'id' | 'createdAt'>) => Promise<void>;
  updateGradeColumn: (id: string, column: Partial<GradeColumn>) => Promise<void>;
  deleteGradeColumn: (id: string) => Promise<void>;
  
  // Grade operations
  addGrade: (grade: Omit<Grade, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateGrade: (id: string, grade: Partial<Grade>) => Promise<void>;
  deleteGrade: (id: string) => Promise<void>;
  upsertGrade: (grade: Omit<Grade, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;

  // Event operations
  addEvent: (event: Omit<Event, 'id' | 'createdAt'>) => Promise<Event>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;

  // Activity Report operations
  addActivityReport: (reportData: Omit<ActivityReport, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateActivityReport: (id: string, reportData: Partial<ActivityReport>) => Promise<void>;
  deleteActivityReport: (id: string) => Promise<void>;

  // Grade Batch operations
  addGradeBatch: (batch: Omit<GradeBatch, 'id' | 'createdAt' | 'updatedAt'>) => Promise<GradeBatch>;
  updateGradeBatch: (id: string, batch: Partial<GradeBatch>) => Promise<void>;
  deleteGradeBatch: (id: string) => Promise<void>;
  createBatchColumns: (batchId: string, columnNames: string[]) => Promise<void>;

  // Legacy operations (for compatibility)
  addFinance: (finance: Omit<FinanceRecord, 'id'>) => Promise<void>;
  updateFinance: (id: string, finance: Partial<FinanceRecord>) => Promise<void>;
  deleteFinance: (id: string) => Promise<void>;
  addAsset: (asset: Omit<Asset, 'id'>) => Promise<void>;
  updateAsset: (id: string, asset: Partial<Asset>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  updateNotification: (id: string, notification: Partial<Notification>) => void;
  deleteNotification: (id: string) => void;
  exportDatabase: () => void;
  importDatabase: (file: File) => Promise<boolean>;
  resetDatabase: () => void;
  getDatabaseInfo: () => any;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [finances, setFinances] = useState<FinanceRecord[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetCategories, setAssetCategories] = useState<AssetCategory[]>([]);
  const [assetDistributions, setAssetDistributions] = useState<AssetDistribution[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [gradePeriods, setGradePeriods] = useState<GradePeriod[]>([]);
  const [gradeColumns, setGradeColumns] = useState<GradeColumn[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [gradeBatches, setGradeBatches] = useState<GradeBatch[]>([]);
  const [activityReports, setActivityReports] = useState<ActivityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadActivityReports = async () => {
    try {
      return await activityReportsService.getAll();
    } catch (error) {
      console.error('Error loading activity reports:', error);
      // Try to create table if it doesn't exist
      try {
        await activityReportsService.createTable();
        return await activityReportsService.getAll();
      } catch (createError) {
        console.error('Error creating activity reports table:', createError);
        return [];
      }
    }
  };



  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        studentsData,
        classesData,
        classroomsData,
        schedulesData,
        attendanceData,
        gradePeriodsData,
        gradeColumnsData,
        gradesData,
        subjectsData,
        eventsData,
        gradeBatchesData,
        assetsData,
        assetCategoriesData,
        assetDistributionsData,
        financesData,
        activityReportsData,
      ] = await Promise.all([
        studentsService.getAll(),
        classesService.getAll(),
        classroomsService.getAll(),
        schedulesService.getAll(),
        attendanceService.getAll(),
        gradePeriodsService.getAll(),
        gradeColumnsService.getAll(),
        gradesService.getAll(),
        subjectsService.getAll(),
        eventsService.getAll(),
        gradeBatchesService.getAll(),
        loadAssets(),
        assetCategoriesService.getAll(),
        assetDistributionsService.getAll(),
        loadFinances(),
        loadActivityReports(),
      ]);

      setStudents(studentsData);
      setClasses(classesData);
      setClassrooms(classroomsData);
      setSchedules(schedulesData);
      setAttendance(attendanceData);
      setGradePeriods(gradePeriodsData);
      setGradeColumns(gradeColumnsData);
      setGrades(gradesData);
      setSubjects(subjectsData);
      setEvents(eventsData);
      setGradeBatches(gradeBatchesData);
      setAssets(assetsData);
      setAssetCategories(assetCategoriesData);
      setAssetDistributions(assetDistributionsData);
      setFinances(financesData);
      setActivityReports(activityReportsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data from database');
    } finally {
      setLoading(false);
    }
  };

  const loadAssets = async (): Promise<Asset[]> => {
    try {
      if (hasValidCredentials) {
        const { data, error } = await supabase
          .from('assets')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          status: item.status,
          assignedTo: item.assigned_to,
          receivedDate: item.received_date,
          description: item.description,
        }));
      }
      return [];
    } catch (error) {
      console.error('Error loading assets:', error);
      return [];
    }
  };

  const loadFinances = async (): Promise<FinanceRecord[]> => {
    try {
      if (hasValidCredentials) {
        const { data, error } = await supabase
          .from('finances')
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;

        return data.map(item => ({
          id: item.id,
          type: item.type,
          amount: Number(item.amount),
          description: item.description,
          category: item.category,
          date: item.date,
          createdBy: item.created_by || '',
        }));
      }
      return [];
    } catch (error) {
      console.error('Error loading finances:', error);
      return [];
    }
  };

  const refreshData = async () => {
    await loadAllData();
  };

  // Student operations
  const addStudent = async (studentData: Omit<Student, 'id' | 'createdAt'>) => {
    try {
      const newStudent = await studentsService.create(studentData);
      setStudents(prev => [newStudent, ...prev]);
    } catch (err) {
      console.error('Error adding student:', err);
      throw err;
    }
  };

  const updateStudent = async (id: string, studentData: Partial<Student>) => {
    try {
      const updatedStudent = await studentsService.update(id, studentData);
      setStudents(prev => prev.map(s => s.id === id ? updatedStudent : s));
    } catch (err) {
      console.error('Error updating student:', err);
      throw err;
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      await studentsService.delete(id);
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Error deleting student:', err);
      throw err;
    }
  };

  // Hàm đồng bộ việc thay đổi lớp của học sinh
  const updateStudentClass = async (studentId: string, newClassId: string, oldClassId?: string) => {
    try {
      // Cập nhật classId của học sinh
      await updateStudent(studentId, { classId: newClassId });

      // Nếu có lớp cũ, xóa học sinh khỏi danh sách studentIds của lớp cũ
      if (oldClassId && oldClassId !== '') {
        const oldClass = classes.find(c => c.id === oldClassId);
        if (oldClass) {
          const updatedStudentIds = oldClass.studentIds.filter(id => id !== studentId);
          await updateClass(oldClassId, { studentIds: updatedStudentIds });
        }
      }

      // Nếu có lớp mới, thêm học sinh vào danh sách studentIds của lớp mới
      if (newClassId && newClassId !== '') {
        const newClass = classes.find(c => c.id === newClassId);
        if (newClass && !newClass.studentIds.includes(studentId)) {
          const updatedStudentIds = [...newClass.studentIds, studentId];
          await updateClass(newClassId, { studentIds: updatedStudentIds });
        }
      }
    } catch (err) {
      console.error('Error updating student class:', err);
      throw err;
    }
  };

  // Class operations
  const addClass = async (classData: Omit<Class, 'id' | 'createdAt'>) => {
    try {
      const newClass = await classesService.create(classData);
      setClasses(prev => [newClass, ...prev]);
    } catch (err) {
      console.error('Error adding class:', err);
      throw err;
    }
  };

  const updateClass = async (id: string, classData: Partial<Class>) => {
    try {
      const updatedClass = await classesService.update(id, classData);
      setClasses(prev => prev.map(c => c.id === id ? updatedClass : c));
    } catch (err) {
      console.error('Error updating class:', err);
      throw err;
    }
  };

  const deleteClass = async (id: string) => {
    try {
      await classesService.delete(id);
      setClasses(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error deleting class:', err);
      throw err;
    }
  };

  // Classroom operations
  const addClassroom = async (classroomData: Omit<Classroom, 'id' | 'createdAt'>) => {
    try {
      const newClassroom = await classroomsService.create(classroomData);
      setClassrooms(prev => [newClassroom, ...prev]);
    } catch (err) {
      console.error('Error adding classroom:', err);
      throw err;
    }
  };

  const updateClassroom = async (id: string, classroomData: Partial<Classroom>) => {
    try {
      const updatedClassroom = await classroomsService.update(id, classroomData);
      setClassrooms(prev => prev.map(c => c.id === id ? updatedClassroom : c));
    } catch (err) {
      console.error('Error updating classroom:', err);
      throw err;
    }
  };

  const deleteClassroom = async (id: string) => {
    try {
      await classroomsService.delete(id);
      setClassrooms(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error deleting classroom:', err);
      throw err;
    }
  };

  // Subject operations
  const addSubject = async (subjectData: Omit<Subject, 'id' | 'createdAt'>) => {
    try {
      const newSubject = await subjectsService.create(subjectData);
      setSubjects(prev => [newSubject, ...prev]);
    } catch (err) {
      console.error('Error adding subject:', err);
      throw err;
    }
  };

  const updateSubject = async (id: string, subjectData: Partial<Subject>) => {
    try {
      const updatedSubject = await subjectsService.update(id, subjectData);
      setSubjects(prev => prev.map(s => s.id === id ? updatedSubject : s));
    } catch (err) {
      console.error('Error updating subject:', err);
      throw err;
    }
  };

  const deleteSubject = async (id: string) => {
    try {
      await subjectsService.delete(id);
      setSubjects(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Error deleting subject:', err);
      throw err;
    }
  };

  // Schedule operations
  const addSchedule = async (scheduleData: Omit<Schedule, 'id'>) => {
    try {
      const newSchedule = await schedulesService.create(scheduleData);
      setSchedules(prev => [newSchedule, ...prev]);
    } catch (err) {
      console.error('Error adding schedule:', err);
      throw err;
    }
  };

  const updateSchedule = async (id: string, scheduleData: Partial<Schedule>) => {
    try {
      const updatedSchedule = await schedulesService.update(id, scheduleData);
      setSchedules(prev => prev.map(s => s.id === id ? updatedSchedule : s));
    } catch (err) {
      console.error('Error updating schedule:', err);
      throw err;
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      await schedulesService.delete(id);
      setSchedules(prev => prev.filter(s => s.id !== id));
      // Also delete related attendance
      setAttendance(prev => prev.filter(a => a.scheduleId !== id));
    } catch (err) {
      console.error('Error deleting schedule:', err);
      throw err;
    }
  };

  const copyWeekSchedule = async (fromWeekStart: string, toWeekStart: string) => {
    try {
      const fromDate = new Date(fromWeekStart);
      const toDate = new Date(toWeekStart);
      const daysDiff = Math.floor((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 1000));

      const sourceWeekSchedules = schedules.filter(schedule => {
        const scheduleDate = new Date(schedule.date);
        const daysDiffFromStart = Math.floor((scheduleDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 1000));
        return daysDiffFromStart >= 0 && daysDiffFromStart < 7;
      });

      const newSchedules = await Promise.all(
        sourceWeekSchedules.map(async (schedule) => {
          const originalDate = new Date(schedule.date);
          const newDate = new Date(originalDate.getTime() + (daysDiff * 24 * 60 * 60 * 1000));

          const newScheduleData = {
            ...schedule,
            date: newDate.toISOString().split('T')[0],
            status: 'scheduled' as const,
          };

          delete (newScheduleData as any).id;
          return await schedulesService.create(newScheduleData);
        })
      );

      setSchedules(prev => [...newSchedules, ...prev]);
    } catch (err) {
      console.error('Error copying week schedule:', err);
      throw err;
    }
  };

  const addSampleData = async () => {
    try {
      // First add sample classes
      const sampleClasses = [
        { name: 'LỚP 3', description: 'TIẾNG VIỆT', status: 'active' as const },
        { name: 'LỚP 2', description: 'TOÁN', status: 'active' as const },
        { name: 'LỚP 6', description: 'VỞ', status: 'active' as const },
        { name: 'LỚP 6', description: 'TIẾNG VIỆT', status: 'active' as const },
        { name: 'LỚP 1B', description: 'TIẾNG VIỆT', status: 'active' as const }
      ];

      const newClasses = await Promise.all(
        sampleClasses.map(cls => classesService.create(cls))
      );
      setClasses(prev => [...newClasses, ...prev]);

      // Add sample subjects
      const sampleSubjects = [
        { name: 'TIẾNG VIỆT', description: 'Môn Tiếng Việt', status: 'active' as const },
        { name: 'TOÁN', description: 'Môn Toán', status: 'active' as const },
        { name: 'VỞ', description: 'Môn Vở', status: 'active' as const },
        { name: 'TIẾNG ANH', description: 'Môn Tiếng Anh', status: 'active' as const }
      ];

      const newSubjects = await Promise.all(
        sampleSubjects.map(subj => subjectsService.create(subj))
      );
      setSubjects(prev => [...newSubjects, ...prev]);

      // Add sample classrooms
      const sampleClassrooms = [
        { name: 'Phòng Duối', capacity: 30, location: 'Tầng 1', equipment: [], status: 'available' as const, description: '' },
        { name: 'Phòng Trần', capacity: 25, location: 'Tầng 2', equipment: [], status: 'available' as const, description: '' }
      ];

      const newClassrooms = await Promise.all(
        sampleClassrooms.map(room => classroomsService.create(room))
      );
      setClassrooms(prev => [...newClassrooms, ...prev]);

      return { classes: newClasses, subjects: newSubjects, classrooms: newClassrooms };
    } catch (err) {
      console.error('Error adding sample data:', err);
      throw err;
    }
  };

  const addSampleSchedules = async () => {
    try {
      // Make sure we have basic data first
      if (classes.length === 0 || subjects.length === 0 || classrooms.length === 0) {
        await addSampleData();
      }

      // Use the first available IDs from our data
      const classIds = classes.slice(0, 5).map(c => c.id);
      const subjectIds = subjects.slice(0, 4).map(s => s.id);
      const classroomIds = classrooms.slice(0, 2).map(r => r.id);

      // Get current date and generate schedules for current week
      const realToday = new Date().toISOString().split('T')[0];
      const currentDate = new Date(realToday);

      console.log('addSampleSchedules - using real today:', realToday);

      // Generate dates for current week
      const getDateString = (daysFromToday: number) => {
        const date = new Date(currentDate);
        date.setDate(currentDate.getDate() + daysFromToday);
        return formatDateForInput(date);
      };

      const sampleSchedules = [
        // Today
        { classId: classIds[0] || 'CLS001', teacherId: '3', subjectId: subjectIds[0] || 'SUB001', classroomId: classroomIds[0] || 'ROOM001', date: realToday, timeSlot: 'afternoon' as const, startTime: '17:30', endTime: '19:00', status: 'scheduled' as const },
        { classId: classIds[2] || 'CLS003', teacherId: '3', subjectId: subjectIds[1] || 'SUB002', classroomId: classroomIds[0] || 'ROOM001', date: realToday, timeSlot: 'afternoon' as const, startTime: '17:30', endTime: '19:00', status: 'scheduled' as const },

        // Tomorrow
        { classId: classIds[0] || 'CLS001', teacherId: '3', subjectId: subjectIds[0] || 'SUB001', classroomId: classroomIds[0] || 'ROOM001', date: getDateString(1), timeSlot: 'afternoon' as const, startTime: '17:30', endTime: '19:00', status: 'scheduled' as const },
        { classId: classIds[2] || 'CLS003', teacherId: '3', subjectId: subjectIds[2] || 'SUB003', classroomId: classroomIds[0] || 'ROOM001', date: getDateString(1), timeSlot: 'afternoon' as const, startTime: '17:30', endTime: '19:00', status: 'scheduled' as const },

        // Day after tomorrow
        { classId: classIds[1] || 'CLS002', teacherId: '3', subjectId: subjectIds[1] || 'SUB002', classroomId: classroomIds[0] || 'ROOM001', date: getDateString(2), timeSlot: 'afternoon' as const, startTime: '14:00', endTime: '16:00', status: 'scheduled' as const },
        { classId: classIds[2] || 'CLS003', teacherId: '3', subjectId: subjectIds[1] || 'SUB002', classroomId: classroomIds[0] || 'ROOM001', date: getDateString(2), timeSlot: 'morning' as const, startTime: '09:30', endTime: '11:00', status: 'scheduled' as const },
        { classId: classIds[3] || 'CLS004', teacherId: '1', subjectId: subjectIds[3] || 'SUB004', classroomId: classroomIds[1] || 'ROOM002', date: '2025-07-16', timeSlot: 'afternoon' as const, startTime: '17:30', endTime: '19:00', status: 'scheduled' as const },
        { classId: classIds[4] || 'CLS005', teacherId: '1', subjectId: subjectIds[0] || 'SUB001', classroomId: classroomIds[0] || 'ROOM001', date: '2025-07-16', timeSlot: 'afternoon' as const, startTime: '17:30', endTime: '19:00', status: 'scheduled' as const },

        // +3 days
        { classId: classIds[0] || 'CLS001', teacherId: '3', subjectId: subjectIds[0] || 'SUB001', classroomId: classroomIds[0] || 'ROOM001', date: getDateString(3), timeSlot: 'evening' as const, startTime: '17:30', endTime: '19:00', status: 'scheduled' as const },
        { classId: classIds[2] || 'CLS003', teacherId: '3', subjectId: subjectIds[1] || 'SUB002', classroomId: classroomIds[0] || 'ROOM001', date: getDateString(3), timeSlot: 'morning' as const, startTime: '09:30', endTime: '11:00', status: 'scheduled' as const },

        // +4 days
        { classId: classIds[1] || 'CLS002', teacherId: '3', subjectId: subjectIds[1] || 'SUB002', classroomId: classroomIds[0] || 'ROOM001', date: getDateString(4), timeSlot: 'morning' as const, startTime: '07:00', endTime: '09:00', status: 'scheduled' as const },

        // +5 days
        { classId: classIds[3] || 'CLS004', teacherId: '3', subjectId: subjectIds[0] || 'SUB001', classroomId: classroomIds[0] || 'ROOM001', date: getDateString(5), timeSlot: 'evening' as const, startTime: '17:30', endTime: '19:00', status: 'scheduled' as const },

        // +6 days
        { classId: classIds[0] || 'CLS001', teacherId: '3', subjectId: subjectIds[0] || 'SUB001', classroomId: classroomIds[0] || 'ROOM001', date: getDateString(6), timeSlot: 'morning' as const, startTime: '09:00', endTime: '10:30', status: 'scheduled' as const }
      ];

      const newSchedules = await Promise.all(
        sampleSchedules.map(schedule => schedulesService.create(schedule))
      );

      setSchedules(prev => [...newSchedules, ...prev]);
      return newSchedules;
    } catch (err) {
      console.error('Error adding sample schedules:', err);
      throw err;
    }
  };

  // Attendance operations
  const addAttendance = async (attendanceData: Omit<Attendance, 'id'>) => {
    try {
      const newAttendance = await attendanceService.create(attendanceData);
      setAttendance(prev => [newAttendance, ...prev]);
    } catch (err) {
      console.error('Error adding attendance:', err);
      throw err;
    }
  };

  const updateAttendance = async (id: string, attendanceData: Partial<Attendance>) => {
    try {
      const updatedAttendance = await attendanceService.update(id, attendanceData);
      setAttendance(prev => prev.map(a => a.id === id ? updatedAttendance : a));
    } catch (err) {
      console.error('Error updating attendance:', err);
      throw err;
    }
  };

  const deleteAttendance = async (id: string) => {
    try {
      await attendanceService.delete(id);
      setAttendance(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error deleting attendance:', err);
      throw err;
    }
  };

  const resetScheduleAttendance = async (scheduleId: string) => {
    try {
      const attendanceToDelete = attendance.filter(a => a.scheduleId === scheduleId);
      await Promise.all(attendanceToDelete.map(a => attendanceService.delete(a.id)));
      setAttendance(prev => prev.filter(a => a.scheduleId !== scheduleId));
    } catch (err) {
      console.error('Error resetting schedule attendance:', err);
      throw err;
    }
  };

  // Grade Period operations
  const addGradePeriod = async (periodData: Omit<GradePeriod, 'id' | 'createdAt'>) => {
    try {
      const newPeriod = await gradePeriodsService.create(periodData);
      setGradePeriods(prev => [newPeriod, ...prev]);
    } catch (err) {
      console.error('Error adding grade period:', err);
      throw err;
    }
  };

  const updateGradePeriod = async (id: string, periodData: Partial<GradePeriod>) => {
    try {
      const updatedPeriod = await gradePeriodsService.update(id, periodData);
      setGradePeriods(prev => prev.map(p => p.id === id ? updatedPeriod : p));
    } catch (err) {
      console.error('Error updating grade period:', err);
      throw err;
    }
  };

  const deleteGradePeriod = async (id: string) => {
    try {
      await gradePeriodsService.delete(id);
      setGradePeriods(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting grade period:', err);
      throw err;
    }
  };

  // Grade Column operations
  const addGradeColumn = async (columnData: Omit<GradeColumn, 'id' | 'createdAt'>) => {
    try {
      const newColumn = await gradeColumnsService.create(columnData);
      setGradeColumns(prev => [newColumn, ...prev]);
    } catch (err) {
      console.error('Error adding grade column:', err);
      throw err;
    }
  };

  const updateGradeColumn = async (id: string, columnData: Partial<GradeColumn>) => {
    try {
      const updatedColumn = await gradeColumnsService.update(id, columnData);
      setGradeColumns(prev => prev.map(c => c.id === id ? updatedColumn : c));
    } catch (err) {
      console.error('Error updating grade column:', err);
      throw err;
    }
  };

  const deleteGradeColumn = async (id: string) => {
    try {
      await gradeColumnsService.delete(id);
      setGradeColumns(prev => prev.filter(c => c.id !== id));
      // Also delete related grades
      setGrades(prev => prev.filter(g => g.gradeColumnId !== id));
    } catch (err) {
      console.error('Error deleting grade column:', err);
      throw err;
    }
  };

  // Grade operations
  const addGrade = async (gradeData: Omit<Grade, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newGrade = await gradesService.create(gradeData);
      setGrades(prev => [newGrade, ...prev]);
    } catch (err) {
      console.error('Error adding grade:', err);
      throw err;
    }
  };

  const updateGrade = async (id: string, gradeData: Partial<Grade>) => {
    try {
      const updatedGrade = await gradesService.update(id, gradeData);
      setGrades(prev => prev.map(g => g.id === id ? updatedGrade : g));
    } catch (err) {
      console.error('Error updating grade:', err);
      throw err;
    }
  };

  const deleteGrade = async (id: string) => {
    try {
      await gradesService.delete(id);
      setGrades(prev => prev.filter(g => g.id !== id));
    } catch (err) {
      console.error('Error deleting grade:', err);
      throw err;
    }
  };

  const upsertGrade = async (gradeData: Omit<Grade, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const upsertedGrade = await gradesService.upsert(gradeData);
      setGrades(prev => {
        const existingIndex = prev.findIndex(g => 
          g.gradeColumnId === gradeData.gradeColumnId && g.studentId === gradeData.studentId
        );
        if (existingIndex >= 0) {
          return prev.map((g, index) => index === existingIndex ? upsertedGrade : g);
        } else {
          return [upsertedGrade, ...prev];
        }
      });
    } catch (err) {
      console.error('Error upserting grade:', err);
      throw err;
    }
  };

  // Event operations
  const addEvent = async (eventData: Omit<Event, 'id' | 'createdAt'>) => {
    try {
      const newEvent = await eventsService.create(eventData);
      setEvents(prev => [newEvent, ...prev]);
      return newEvent;
    } catch (err) {
      console.error('Error adding event:', err);
      throw err;
    }
  };

  const updateEvent = async (id: string, eventData: Partial<Event>) => {
    try {
      const updatedEvent = await eventsService.update(id, eventData);
      setEvents(prev => prev.map(e => e.id === id ? updatedEvent : e));
    } catch (err) {
      console.error('Error updating event:', err);
      throw err;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await eventsService.delete(id);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('Error deleting event:', err);
      throw err;
    }
  };

  // Activity Report operations
  const addActivityReport = async (reportData: Omit<ActivityReport, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newReport = await activityReportsService.create(reportData);
      setActivityReports(prev => [newReport, ...prev]);
    } catch (err) {
      console.error('Error adding activity report:', err);
      throw err;
    }
  };

  const updateActivityReport = async (id: string, reportData: Partial<ActivityReport>) => {
    try {
      const updatedReport = await activityReportsService.update(id, reportData);
      setActivityReports(prev => prev.map(r => r.id === id ? updatedReport : r));
    } catch (err) {
      console.error('Error updating activity report:', err);
      throw err;
    }
  };

  const deleteActivityReport = async (id: string) => {
    try {
      await activityReportsService.delete(id);
      setActivityReports(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Error deleting activity report:', err);
      throw err;
    }
  };

  // Grade Batch operations
  const addGradeBatch = async (batchData: Omit<GradeBatch, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newBatch = await gradeBatchesService.create(batchData);
      setGradeBatches(prev => [newBatch, ...prev]);
      return newBatch;
    } catch (err) {
      console.error('Error adding grade batch:', err);
      throw err;
    }
  };

  const updateGradeBatch = async (id: string, batchData: Partial<GradeBatch>) => {
    try {
      const updatedBatch = await gradeBatchesService.update(id, batchData);
      setGradeBatches(prev => prev.map(b => b.id === id ? updatedBatch : b));
    } catch (err) {
      console.error('Error updating grade batch:', err);
      throw err;
    }
  };

  const deleteGradeBatch = async (id: string) => {
    try {
      await gradeBatchesService.delete(id);
      setGradeBatches(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error('Error deleting grade batch:', err);
      throw err;
    }
  };

  const createBatchColumns = async (batchId: string, columnNames: string[]) => {
    try {
      await gradeBatchesService.createColumns(batchId, columnNames);
      // Refresh grade columns data
      const updatedColumns = await gradeColumnsService.getAll();
      setGradeColumns(updatedColumns);
    } catch (err) {
      console.error('Error creating batch columns:', err);
      throw err;
    }
  };

  // Legacy operations (for compatibility with existing code)
  const generateId = (prefix: string) => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  };

  const addFinance = async (financeData: Omit<FinanceRecord, 'id'>) => {
    try {
      const newFinance: FinanceRecord = {
        ...financeData,
        id: generateId('FIN'),
      };

      if (hasValidCredentials) {
        const { error } = await supabase
          .from('finances')
          .insert({
            id: newFinance.id,
            type: newFinance.type,
            amount: newFinance.amount,
            description: newFinance.description,
            category: newFinance.category,
            date: newFinance.date,
            created_by: newFinance.createdBy,
          });

        if (error) throw error;
      }

      setFinances(prev => [...prev, newFinance]);
    } catch (error) {
      console.error('Error adding finance:', error);
      throw error;
    }
  };

  const updateFinance = async (id: string, financeData: Partial<FinanceRecord>) => {
    try {
      if (hasValidCredentials) {
        const updateData: any = {};
        if (financeData.type) updateData.type = financeData.type;
        if (financeData.amount !== undefined) updateData.amount = financeData.amount;
        if (financeData.description) updateData.description = financeData.description;
        if (financeData.category) updateData.category = financeData.category;
        if (financeData.date) updateData.date = financeData.date;
        if (financeData.createdBy) updateData.created_by = financeData.createdBy;

        const { error } = await supabase
          .from('finances')
          .update(updateData)
          .eq('id', id);

        if (error) throw error;
      }

      setFinances(prev => prev.map(f => f.id === id ? { ...f, ...financeData } : f));
    } catch (error) {
      console.error('Error updating finance:', error);
      throw error;
    }
  };

  const deleteFinance = async (id: string) => {
    try {
      if (hasValidCredentials) {
        const { error } = await supabase
          .from('finances')
          .delete()
          .eq('id', id);

        if (error) throw error;
      }

      setFinances(prev => prev.filter(f => f.id !== id));
    } catch (error) {
      console.error('Error deleting finance:', error);
      throw error;
    }
  };

  const addAsset = async (assetData: Omit<Asset, 'id'>) => {
    try {
      const newAsset: Asset = {
        ...assetData,
        id: generateId('AST'),
      };

      if (hasValidCredentials) {
        const insertData = {
          id: newAsset.id,
          name: newAsset.name,
          category: newAsset.category,
          quantity: newAsset.quantity,
          status: newAsset.status,
          assigned_to: newAsset.assignedTo || null,
          received_date: newAsset.receivedDate || new Date().toISOString().split('T')[0],
          description: newAsset.description || null,
        };

        const { data, error } = await supabase
          .from('assets')
          .insert(insertData)
          .select()
          .single();

        if (error) {
          console.error('Supabase insert error:', error);
          throw new Error(`Database error: ${error.message}`);
        }

        // Reload assets from database to ensure sync
        const updatedAssets = await loadAssets();
        setAssets(updatedAssets);
      } else {
        throw new Error('Supabase credentials not configured properly');
      }

    } catch (error) {
      console.error('Error adding asset:', error);
      throw error;
    }
  };

  const updateAsset = async (id: string, assetData: Partial<Asset>) => {
    try {
      if (hasValidCredentials) {
        const updateData: any = {};
        if (assetData.name) updateData.name = assetData.name;
        if (assetData.category) updateData.category = assetData.category;
        if (assetData.quantity !== undefined) updateData.quantity = assetData.quantity;
        if (assetData.status) updateData.status = assetData.status;
        if (assetData.assignedTo !== undefined) updateData.assigned_to = assetData.assignedTo;
        if (assetData.receivedDate !== undefined) updateData.received_date = assetData.receivedDate;
        if (assetData.description !== undefined) updateData.description = assetData.description;

        const { data, error } = await supabase
          .from('assets')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Supabase update error:', error);
          throw new Error(`Database error: ${error.message}`);
        }

        // Reload assets from database to ensure sync
        const updatedAssets = await loadAssets();
        setAssets(updatedAssets);
      } else {
        throw new Error('Supabase credentials not configured properly');
      }
    } catch (error) {
      console.error('Error updating asset:', error);
      throw error;
    }
  };

  const deleteAsset = async (id: string) => {
    try {
      if (hasValidCredentials) {
        const { error } = await supabase
          .from('assets')
          .delete()
          .eq('id', id);

        if (error) throw error;
      }

      setAssets(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting asset:', error);
      throw error;
    }
  };

  const addNotification = (notificationData: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: generateId('NOT'),
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  const updateNotification = (id: string, notificationData: Partial<Notification>) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, ...notificationData } : n));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Database operations (legacy)
  const exportDatabase = () => {
    const data = {
      students,
      classes,
      classrooms,
      schedules,
      attendance,
      finances,
      assets,
      notifications,
      gradePeriods,
      gradeColumns,
      grades,
      subjects,
      lastUpdated: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `classroom_database_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  const importDatabase = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const imported = JSON.parse(content);
          
          if (imported.students) setStudents(imported.students);
          if (imported.classes) setClasses(imported.classes);
          if (imported.classrooms) setClassrooms(imported.classrooms);
          if (imported.schedules) setSchedules(imported.schedules);
          if (imported.attendance) setAttendance(imported.attendance);
          if (imported.finances) setFinances(imported.finances);
          if (imported.assets) setAssets(imported.assets);
          if (imported.notifications) setNotifications(imported.notifications);
          if (imported.gradePeriods) setGradePeriods(imported.gradePeriods);
          if (imported.gradeColumns) setGradeColumns(imported.gradeColumns);
          if (imported.grades) setGrades(imported.grades);
          if (imported.subjects) setSubjects(imported.subjects);
          
          resolve(true);
        } catch (error) {
          console.error('Error importing database:', error);
          resolve(false);
        }
      };
      reader.readAsText(file);
    });
  };

  const resetDatabase = () => {
    setStudents([]);
    setClasses([]);
    setClassrooms([]);
    setSchedules([]);
    setAttendance([]);
    setFinances([]);
    setAssets([]);
    setNotifications([]);
    setGradePeriods([]);
    setGradeColumns([]);
    setGrades([]);
    setSubjects([]);
  };

  const getDatabaseInfo = () => {
    // Tính toán dung lượng database (ước tính dựa trên kích thước JSON)
    const calculateDatabaseSize = () => {
      try {
        const allData = {
          students,
          classes,
          classrooms,
          schedules,
          attendance,
          finances,
          assets,
          assetCategories,
          assetDistributions,
          notifications,
          gradePeriods,
          gradeColumns,
          grades,
          subjects,
          events,
          activityReports,
        };

        const jsonString = JSON.stringify(allData);
        const sizeInBytes = new Blob([jsonString]).size;
        const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
        return parseFloat(sizeInMB);
      } catch (error) {
        console.error('Error calculating database size:', error);
        return 0;
      }
    };

    return {
      lastUpdated: new Date().toISOString(),
      totalStudents: students.length,
      totalClasses: classes.length,
      totalClassrooms: classrooms.length,
      totalSchedules: schedules.length,
      totalAttendance: attendance.length,
      totalFinances: finances.length,
      totalAssets: assets.length,
      totalNotifications: notifications.length,
      totalGradePeriods: gradePeriods.length,
      totalGradeColumns: gradeColumns.length,
      totalGrades: grades.length,
      totalSubjects: subjects.length,
      totalEvents: events.length,
      totalActivityReports: activityReports.length,
      databaseSize: calculateDatabaseSize(),
    };
  };

  return (
    <DataContext.Provider value={{
      students,
      classes,
      classrooms,
      schedules,
      attendance,
      finances,
      assets,
      assetCategories,
      assetDistributions,
      notifications,
      gradePeriods,
      gradeColumns,
      grades,
      subjects,
      events,
      gradeBatches,
      activityReports,
      loading,
      error,
      addStudent,
      updateStudent,
      deleteStudent,
      updateStudentClass,
      addClass,
      updateClass,
      deleteClass,
      addClassroom,
      updateClassroom,
      deleteClassroom,
      addSubject,
      updateSubject,
      deleteSubject,
      addSchedule,
      updateSchedule,
      deleteSchedule,
      copyWeekSchedule,
      addSampleData,
      addSampleSchedules,
      addAttendance,
      updateAttendance,
      deleteAttendance,
      resetScheduleAttendance,
      addGradePeriod,
      updateGradePeriod,
      deleteGradePeriod,
      addGradeColumn,
      updateGradeColumn,
      deleteGradeColumn,
      addGrade,
      updateGrade,
      deleteGrade,
      upsertGrade,
      addEvent,
      updateEvent,
      deleteEvent,
      addActivityReport,
      updateActivityReport,
      deleteActivityReport,
      addGradeBatch,
      updateGradeBatch,
      deleteGradeBatch,
      createBatchColumns,
      addFinance,
      updateFinance,
      deleteFinance,
      addAsset,
      updateAsset,
      deleteAsset,
      addNotification,
      updateNotification,
      deleteNotification,
      exportDatabase,
      importDatabase,
      resetDatabase,
      getDatabaseInfo,
      refreshData,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}