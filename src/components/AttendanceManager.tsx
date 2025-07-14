import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';
import { hasPermission, getEffectivePermissions } from '../constants/permissions';
import {
  Search,
  Calendar,
  Check,
  X,
  Clock,
  Users,
  ChevronDown,
  UserCheck,
  AlertCircle,
  CheckCircle,
  Filter,
  Download,
  RefreshCw,
  RotateCcw,
  Save,
  Edit,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { exportAttendance } from '../lib/excelExport';
import {
  formatDateForInput,
  getWeekStart,
  getVietnameseDayName,
  getCurrentWeekVN,
  getTodayVN,
  isTodayVN,
  isSameDateVN
} from '../utils/dateUtils';

export default function AttendanceManager() {
  console.log('AttendanceManager component rendering...');
  
  try {
    const {
      schedules,
      classes,
      students,
      attendance,
      addAttendance,
      updateAttendance,
      resetScheduleAttendance,
      refreshData
    } = useData();
    const { user, users } = useAuth();
    const toast = useToastContext();

    console.log('Data loaded:', {
      schedules: schedules?.length,
      classes: classes?.length,
      students: students?.length,
      attendance: attendance?.length,
      users: users?.length,
      user: user?.role
    });

    // State declarations
    const [selectedDate, setSelectedDate] = useState<string>(() => {
      try {
        const today = getTodayVN();
        console.log('Initial getTodayVN() result:', today);
        console.log('Current date for comparison:', new Date().toISOString().split('T')[0]);
        return today;
      } catch (error) {
        console.error('Error getting today VN:', error);
        return new Date().toISOString().split('T')[0]; // fallback to current date
      }
    });
    const [selectedSchedule, setSelectedSchedule] = useState('');
    const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
    const [showAttendanceSheet, setShowAttendanceSheet] = useState(false);
    const [editingAttendance, setEditingAttendance] = useState<{[key: string]: 'present' | 'absent' | 'late'}>({});
    const [hasChanges, setHasChanges] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'present' | 'absent' | 'late'>('all');
    const [currentWeek, setCurrentWeek] = useState(() => {
      try {
        return getCurrentWeekVN();
      } catch (error) {
        console.error('Error getting current week:', error);
        return new Date();
      }
    });

    // Kiểm tra quyền dựa trên permissions
    const userPermissions = user?.permissions || [];
    const userRole = user?.role;
    const effectivePermissions = getEffectivePermissions(userPermissions, userRole);

    const canViewAttendance = hasPermission(effectivePermissions, 'attendance.view', userRole);
    const canCreateAttendance = hasPermission(effectivePermissions, 'attendance.create', userRole);
    const canEditAttendance = hasPermission(effectivePermissions, 'attendance.edit', userRole);
    const canManageAttendance = canCreateAttendance || canEditAttendance;

    console.log('Permissions check:', {
      userRole,
      userPermissions,
      effectivePermissions,
      canViewAttendance,
      canManageAttendance,
      userId: user?.id,
      userName: user?.name
    });

    // Debug permissions cho teacher
    if (user?.role === 'teacher') {
      console.log('Teacher permissions debug:', {
        originalPermissions: userPermissions,
        effectivePermissions,
        hasAttendanceView: hasPermission(effectivePermissions, 'attendance.view', userRole),
        hasAttendanceCreate: hasPermission(effectivePermissions, 'attendance.create', userRole),
        hasAttendanceEdit: hasPermission(effectivePermissions, 'attendance.edit', userRole),
      });
    }

    // Set ngày hiện tại sau khi component mount
    useEffect(() => {
      const setTodayDate = () => {
        try {
          const today = getTodayVN();
          console.log('Setting today date:', today);

          if (today) {
            setSelectedDate(today);
          }
        } catch (error) {
          console.error('Error setting today date:', error);
          // Fallback to current date
          setSelectedDate(new Date().toISOString().split('T')[0]);
        }
      };

      // Delay một chút để đảm bảo component đã mount hoàn toàn
      const timer = setTimeout(setTodayDate, 100);
      return () => clearTimeout(timer);
    }, []);

    // Lọc lịch dạy theo vai trò người dùng
    const getSchedulesByDate = (date: string) => {
      console.log('getSchedulesByDate called with:', date);
      if (!date) {
        console.log('No date provided, returning empty array');
        return [];
      }
      let filteredSchedules = schedules.filter(s => isSameDateVN(s.date, date));
      console.log(`Found ${filteredSchedules.length} schedules for date ${date}`);

      // Nếu là giáo viên, chỉ hiển thị lịch dạy của mình
      if (user?.role === 'teacher') {
        const beforeFilter = filteredSchedules.length;
        filteredSchedules = filteredSchedules.filter(s => s.teacherId === user.id);
        console.log(`Teacher filter: ${beforeFilter} -> ${filteredSchedules.length} schedules for teacher ${user.id}`);

        if (process.env.NODE_ENV === 'development') {
          console.log('Teacher schedules:', filteredSchedules.map(s => ({
            id: s.id,
            classId: s.classId,
            teacherId: s.teacherId,
            time: `${s.startTime}-${s.endTime}`
          })));
        }
      }

      return filteredSchedules;
    };

    const selectedDateSchedules = React.useMemo(() => {
      try {
        console.log('selectedDateSchedules - selectedDate:', selectedDate);
        console.log('selectedDateSchedules - schedules length:', schedules?.length || 0);

        // Đảm bảo selectedDate luôn có giá trị
        const dateToUse = selectedDate || getTodayVN();
        console.log('Using date:', dateToUse);

        // Kiểm tra schedules có tồn tại không
        if (!schedules || schedules.length === 0) {
          console.log('No schedules available');
          return [];
        }

        const result = getSchedulesByDate(dateToUse);
        console.log(`Found ${result.length} schedules for date ${dateToUse}`);
        return result;
      } catch (error) {
        console.error('Error in selectedDateSchedules:', error);
        return [];
      }
    }, [selectedDate, schedules, user?.role, user?.id]);

    const getScheduleInfo = (scheduleId: string) => {
      const schedule = schedules.find(s => s.id === scheduleId);
      if (!schedule) return null;

      const classInfo = classes.find(c => c.id === schedule.classId);
      return { schedule, classInfo };
    };

    const getClassStudents = (classId: string) => {
      try {
        const classInfo = classes.find(c => c.id === classId);
        if (!classInfo) return [];

        // Chỉ lấy học sinh đang hoạt động (status: 'active')
        return students.filter(s =>
          classInfo.studentIds && classInfo.studentIds.includes(s.id) && s.status === 'active'
        );
      } catch (error) {
        console.error('Error in getClassStudents:', error);
        return [];
      }
    };

    const getStudentAttendance = (scheduleId: string, studentId: string) => {
      return attendance.find(a => a.scheduleId === scheduleId && a.studentId === studentId);
    };

    const getTeacherName = (teacherId: string) => {
      if (!teacherId) return 'Chưa phân công';
      if (!users || users.length === 0) return `GV-${teacherId}`;

      console.log('getTeacherName debug:', {
        teacherId,
        usersCount: users.length,
        allUsers: users.map(u => ({ id: u.id, name: u.name, role: u.role }))
      });

      const teacher = users.find(u => u.id === teacherId);
      console.log('Found teacher:', teacher);
      return teacher?.name || `GV-${teacherId}`;
    };

    const handleAttendanceChange = (scheduleId: string, studentId: string, status: 'present' | 'absent' | 'late') => {
      const existingAttendance = getStudentAttendance(scheduleId, studentId);

      if (existingAttendance) {
        // Cập nhật điểm danh hiện có
        updateAttendance(existingAttendance.id, {
          status,
          checkedAt: new Date().toISOString(),
        });
      } else {
        // Tạo điểm danh mới
        addAttendance({
          scheduleId,
          studentId,
          status,
          checkedAt: new Date().toISOString(),
        });
      }
    };

    // Xử lý thay đổi điểm danh trong chế độ chỉnh sửa
    const handleEditAttendanceChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
      setEditingAttendance(prev => ({
        ...prev,
        [studentId]: status
      }));
      setHasChanges(true);
    };

    // Lưu tất cả thay đổi điểm danh
    const saveAllAttendance = () => {
      if (!selectedSchedule) return;

      Object.entries(editingAttendance).forEach(([studentId, status]) => {
        handleAttendanceChange(selectedSchedule, studentId, status);
      });

      setEditingAttendance({});
      setHasChanges(false);
      setShowAttendanceSheet(false);
      toast.success('Đã lưu điểm danh thành công!');
    };

    // Hủy thay đổi
    const cancelEdit = () => {
      setEditingAttendance({});
      setHasChanges(false);
      setShowAttendanceSheet(false);
    };

    // Mở bảng điểm danh
    const openAttendanceSheet = (scheduleId: string) => {
      // Kiểm tra quyền điểm danh
      if (!canManageAttendance) {
        toast.error('Bạn không có quyền điểm danh!');
        return;
      }

      // Kiểm tra lịch dạy có tồn tại không
      const scheduleInfo = getScheduleInfo(scheduleId);
      if (!scheduleInfo) {
        toast.error('Không tìm thấy thông tin lịch dạy!');
        return;
      }

      // Nếu là giáo viên, kiểm tra xem có phải lịch dạy của mình không
      if (user?.role === 'teacher' && scheduleInfo.schedule.teacherId !== user.id) {
        toast.error('Bạn chỉ có thể điểm danh cho lớp được phân công dạy!');
        console.warn('Teacher attempted to access unauthorized schedule:', {
          teacherId: user.id,
          scheduleTeacherId: scheduleInfo.schedule.teacherId,
          scheduleId,
          className: scheduleInfo.classInfo?.name
        });
        return;
      }

      console.log('Opening attendance sheet for:', {
        scheduleId,
        className: scheduleInfo.classInfo?.name,
        teacherId: scheduleInfo.schedule.teacherId,
        currentUserId: user?.id,
        userRole: user?.role
      });

      setSelectedSchedule(scheduleId);
      setShowAttendanceSheet(true);

      // Khởi tạo trạng thái điểm danh hiện tại
      const classStudents = getClassStudents(scheduleInfo.schedule.classId);
      const currentAttendance: {[key: string]: 'present' | 'absent' | 'late'} = {};

      classStudents.forEach(student => {
        const existingAttendance = getStudentAttendance(scheduleId, student.id);
        currentAttendance[student.id] = existingAttendance?.status || 'absent';
      });

      setEditingAttendance(currentAttendance);
    };

    const markAllPresent = () => {
      if (!selectedSchedule) return;

      const scheduleInfo = getScheduleInfo(selectedSchedule);
      if (!scheduleInfo) return;

      const classStudents = getClassStudents(scheduleInfo.schedule.classId);
      const newAttendance: {[key: string]: 'present' | 'absent' | 'late'} = {};
      classStudents.forEach(student => {
        newAttendance[student.id] = 'present';
      });

      setEditingAttendance(newAttendance);
      setHasChanges(true);
    };

    const resetAttendance = () => {
      if (!selectedSchedule) return;

      const scheduleInfo = getScheduleInfo(selectedSchedule);
      if (!scheduleInfo) return;

      const classStudents = getClassStudents(scheduleInfo.schedule.classId);
      const newAttendance: {[key: string]: 'present' | 'absent' | 'late'} = {};
      classStudents.forEach(student => {
        newAttendance[student.id] = 'absent';
      });

      setEditingAttendance(newAttendance);
      setHasChanges(true);
    };

    const getAttendanceStats = () => {
      if (!selectedSchedule) return { present: 0, absent: 0, late: 0, total: 0 };

      const scheduleInfo = getScheduleInfo(selectedSchedule);
      if (!scheduleInfo) return { present: 0, absent: 0, late: 0, total: 0 };

      const classStudents = getClassStudents(scheduleInfo.schedule.classId);
      const total = classStudents.length;
      const present = Object.values(editingAttendance).filter(status => status === 'present').length;
      const late = Object.values(editingAttendance).filter(status => status === 'late').length;
      const absent = total - present - late;

      return { present, absent, late, total };
    };

    // Kiểm tra quyền xem điểm danh
    if (!canViewAttendance) {
      return (
        <div className="text-center py-8">
          <div className="mx-auto mb-4 text-gray-300" style={{ fontSize: '48px' }}>🚫</div>
          <p className="text-gray-500">Bạn không có quyền truy cập chức năng này</p>
        </div>
      );
    }

    // Đảm bảo selectedDate có giá trị trước khi render
    if (!selectedDate) {
      console.log('selectedDate is null/undefined, showing loading...');
      return (
        <div className="text-center py-8">
          <div className="mx-auto mb-4 text-gray-300" style={{ fontSize: '48px' }}>⏳</div>
          <p className="text-gray-500">Đang khởi tạo...</p>
        </div>
      );
    }

    // Nếu đang hiển thị bảng điểm danh
    if (showAttendanceSheet && selectedSchedule) {
      const selectedScheduleInfo = getScheduleInfo(selectedSchedule);
      const classStudents = selectedScheduleInfo ? getClassStudents(selectedScheduleInfo.schedule.classId) : [];

      const filteredStudents = classStudents.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());

        if (filterStatus === 'all') return matchesSearch;

        const currentStatus = editingAttendance[student.id] || 'absent';
        const matchesStatus = currentStatus === filterStatus;

        return matchesSearch && matchesStatus;
      });

      return (
        <div className="space-y-4 animate-fade-in">
          {/* Mobile-friendly header */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-center gap-3">
              <button
                onClick={cancelEdit}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-all p-2 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft size={18} />
                <span className="text-sm font-medium">Quay lại</span>
              </button>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h1 className="text-lg md:text-2xl font-bold text-gray-900">
                Điểm danh lớp {selectedScheduleInfo?.classInfo?.name}
              </h1>
              <p className="text-gray-600 mt-1 text-sm">
                {selectedScheduleInfo?.schedule.startTime} - {selectedScheduleInfo?.schedule.endTime} •
                {new Date(selectedScheduleInfo?.schedule.date || selectedDate).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>

          {/* Mobile-friendly action buttons */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            {hasChanges && (
              <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                <span className="text-orange-600 text-sm font-medium">
                  ⚠️ Có thay đổi chưa lưu
                </span>
              </div>
            )}
            <div className="grid grid-cols-2 md:flex gap-2">
              <button
                onClick={markAllPresent}
                className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <CheckCircle size={14} />
                <span className="hidden sm:inline">Tất cả có mặt</span>
                <span className="sm:hidden">Tất cả</span>
              </button>
              <button
                onClick={resetAttendance}
                className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <RotateCcw size={14} />
                <span className="hidden sm:inline">Reset</span>
                <span className="sm:hidden">Xóa</span>
              </button>
              <button
                onClick={saveAllAttendance}
                disabled={!hasChanges}
                className="col-span-2 md:col-span-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={14} />
                Lưu điểm danh
              </button>
            </div>
          </div>

          {/* Thống kê nhanh */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold mb-3">Thống kê điểm danh</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(() => {
                const stats = getAttendanceStats();
                return (
                  <>
                    <div className="bg-blue-50 p-3 rounded text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Users size={16} className="text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Tổng số</span>
                      </div>
                      <p className="text-xl font-bold text-blue-600">{stats.total}</p>
                    </div>

                    <div className="bg-green-50 p-3 rounded text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <CheckCircle size={16} className="text-green-600" />
                        <span className="text-sm font-medium text-green-900">Có mặt</span>
                      </div>
                      <p className="text-xl font-bold text-green-600">{stats.present}</p>
                    </div>

                    <div className="bg-yellow-50 p-3 rounded text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Clock size={16} className="text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-900">Đi muộn</span>
                      </div>
                      <p className="text-xl font-bold text-yellow-600">{stats.late}</p>
                    </div>

                    <div className="bg-red-50 p-3 rounded text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <AlertCircle size={16} className="text-red-600" />
                        <span className="text-sm font-medium text-red-900">Vắng mặt</span>
                      </div>
                      <p className="text-xl font-bold text-red-600">{stats.absent}</p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Mobile-friendly search and filter */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Tìm kiếm học sinh..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="present">Có mặt</option>
                <option value="late">Đi muộn</option>
                <option value="absent">Vắng mặt</option>
              </select>
            </div>
          </div>

          {/* Mobile-friendly attendance table */}
          <div className="bg-white rounded-lg border border-gray-200">
            {/* Desktop table view */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">STT</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Tên học sinh</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-700">
                      <CheckCircle size={16} className="text-green-600 mx-auto" />
                    </th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-700">
                      <Clock size={16} className="text-yellow-600 mx-auto" />
                    </th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-700">
                      <X size={16} className="text-red-600 mx-auto" />
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, index) => {
                    const currentStatus = editingAttendance[student.id] || 'absent';

                    return (
                      <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{index + 1}</td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{student.name}</div>
                        </td>

                        {/* Radio buttons cho điểm danh */}
                        <td className="py-3 px-2 text-center">
                          <input
                            type="radio"
                            name={`attendance-${student.id}`}
                            checked={currentStatus === 'present'}
                            onChange={() => handleEditAttendanceChange(student.id, 'present')}
                            className="w-4 h-4 text-green-600 focus:ring-green-500"
                          />
                        </td>
                        <td className="py-3 px-2 text-center">
                          <input
                            type="radio"
                            name={`attendance-${student.id}`}
                            checked={currentStatus === 'late'}
                            onChange={() => handleEditAttendanceChange(student.id, 'late')}
                            className="w-4 h-4 text-yellow-600 focus:ring-yellow-500"
                          />
                        </td>
                        <td className="py-3 px-2 text-center">
                          <input
                            type="radio"
                            name={`attendance-${student.id}`}
                            checked={currentStatus === 'absent'}
                            onChange={() => handleEditAttendanceChange(student.id, 'absent')}
                            className="w-4 h-4 text-red-600 focus:ring-red-500"
                          />
                        </td>

                        {/* Status column */}
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
                            currentStatus === 'present' ? 'bg-green-100 text-green-800' :
                            currentStatus === 'late' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {currentStatus === 'present' ? <CheckCircle size={12} /> :
                             currentStatus === 'late' ? <Clock size={12} /> :
                             <X size={12} />}
                            {currentStatus === 'present' ? 'Có mặt' :
                             currentStatus === 'late' ? 'Đi muộn' : 'Vắng mặt'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile card view */}
            <div className="md:hidden space-y-3 p-4">
              {filteredStudents.map((student, index) => {
                const currentStatus = editingAttendance[student.id] || 'absent';

                return (
                  <div key={student.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded">
                          {index + 1}
                        </span>
                        <span className="font-medium text-gray-900">{student.name}</span>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        currentStatus === 'present' ? 'bg-green-100 text-green-800' :
                        currentStatus === 'late' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {currentStatus === 'present' ? <CheckCircle size={10} /> :
                         currentStatus === 'late' ? <Clock size={10} /> :
                         <X size={10} />}
                        {currentStatus === 'present' ? 'Có mặt' :
                         currentStatus === 'late' ? 'Đi muộn' : 'Vắng mặt'}
                      </span>
                    </div>

                    {/* Mobile attendance buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleEditAttendanceChange(student.id, 'present')}
                        className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg border-2 transition-all ${
                          currentStatus === 'present'
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-green-300'
                        }`}
                      >
                        <CheckCircle size={16} />
                        <span className="text-sm font-medium">Có mặt</span>
                      </button>
                      <button
                        onClick={() => handleEditAttendanceChange(student.id, 'late')}
                        className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg border-2 transition-all ${
                          currentStatus === 'late'
                            ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-yellow-300'
                        }`}
                      >
                        <Clock size={16} />
                        <span className="text-sm font-medium">Đi muộn</span>
                      </button>
                      <button
                        onClick={() => handleEditAttendanceChange(student.id, 'absent')}
                        className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg border-2 transition-all ${
                          currentStatus === 'absent'
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-red-300'
                        }`}
                      >
                        <X size={16} />
                        <span className="text-sm font-medium">Vắng mặt</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredStudents.length === 0 && (
              <div className="text-center py-8">
                <UserCheck className="mx-auto mb-4 text-gray-300" size={48} />
                <p className="text-gray-500">
                  {searchTerm ? 'Không tìm thấy học sinh nào' : 'Lớp học này chưa có học sinh'}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="animate-slide-in-down">
          <div className="animate-slide-in-left">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent animate-scale-in">
              Điểm danh học sinh
            </h1>
            <p className="text-gray-600 mt-1 animate-fade-in-delay text-sm md:text-base">
              {user?.role === 'teacher'
                ? 'Điểm danh cho các lớp bạn dạy'
                : 'Quản lý điểm danh học sinh theo buổi học'
              }
            </p>
            {/* Thông báo cho giáo viên */}
            {user?.role === 'teacher' && (
              <div className="text-sm text-blue-600 mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                💡 Bạn chỉ thấy các lớp được phân công dạy. Chỉ có thể điểm danh cho lớp của mình.
              </div>
            )}

            {/* Debug info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-100 rounded">
                Debug: {students.length} students total, {students.filter(s => s.status === 'active').length} active
                {user?.role === 'teacher' && ` | Teacher ID: ${user.id}`}
              </div>
            )}
          </div>
        </div>



        {/* Mobile-friendly date selector */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="space-y-3">
            <label className="font-medium text-gray-700">Chọn ngày:</label>
            <div className="flex gap-3">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSchedule(''); // Reset selected schedule when date changes
                }}
                className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
              <button
                onClick={() => {
                  const realToday = new Date().toISOString().split('T')[0];
                  console.log('Force setting to real today:', realToday);
                  setSelectedDate(realToday);
                  setSelectedSchedule('');
                }}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium whitespace-nowrap"
              >
                Hôm nay
              </button>
            </div>
          </div>
        </div>

        {/* Schedules list */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">
            Lịch dạy ngày {selectedDate ? new Date(selectedDate).toLocaleDateString('vi-VN') : 'hôm nay'}
          </h2>

          {selectedDateSchedules.length > 0 ? (
            <div className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0">
              {selectedDateSchedules.map((schedule) => {
                const classInfo = classes.find(c => c.id === schedule.classId);
                const scheduleAttendance = attendance.filter(a => a.scheduleId === schedule.id);
                const activeStudents = getClassStudents(schedule.classId);
                const totalStudents = activeStudents.length;
                const attendanceCount = scheduleAttendance.length;

                // Lấy thông tin giáo viên
                const teacherName = getTeacherName(schedule.teacherId);

                return (
                  <div
                    key={schedule.id}
                    className="bg-white p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">{classInfo?.name || 'Lớp không xác định'}</h3>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock size={14} />
                            <span>{schedule.startTime} - {schedule.endTime}</span>
                          </div>
                          <p className="text-sm text-gray-500">
                            Phòng: {schedule.room || 'Chưa xác định'}
                          </p>
                          <p className="text-sm text-blue-600">
                            GV: {teacherName}
                          </p>
                        </div>
                      </div>
                      {user?.role === 'teacher' && schedule.teacherId === user.id && (
                        <div className="inline-flex items-center gap-1 mt-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-600 font-medium">Lớp của bạn</span>
                        </div>
                      )}

                      {/* Mobile-friendly stats */}
                      <div className="flex items-center gap-4 mt-3 sm:mt-0">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">{totalStudents}</div>
                          <div className="text-xs text-gray-500">Học sinh</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-bold flex items-center gap-1 ${
                            attendanceCount === totalStudents ? 'text-green-600' :
                            attendanceCount > 0 ? 'text-yellow-600' : 'text-gray-400'
                          }`}>
                            {attendanceCount === totalStudents ? (
                              <CheckCircle size={16} />
                            ) : attendanceCount > 0 ? (
                              <Clock size={16} />
                            ) : (
                              <AlertCircle size={16} />
                            )}
                            <span>{attendanceCount}/{totalStudents}</span>
                          </div>
                          <div className="text-xs text-gray-500">Điểm danh</div>
                        </div>
                      </div>
                    </div>

                    {canManageAttendance && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => openAttendanceSheet(schedule.id)}
                          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 font-medium"
                        >
                          <Edit size={16} />
                          Điểm danh
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="mx-auto mb-4 text-gray-300" size={48} />
              <p className="text-gray-500 mb-2">
                {user?.role === 'teacher'
                  ? 'Bạn không có lịch dạy trong ngày này'
                  : 'Không có lịch dạy trong ngày này'
                }
              </p>
              {user?.role === 'teacher' && (
                <p className="text-sm text-blue-600">
                  Hãy chọn ngày khác hoặc liên hệ quản lý để kiểm tra lịch phân công.
                </p>
              )}
            </div>
          )}
        </div>

      </div>
    );

  } catch (error) {
    console.error('Error rendering AttendanceManager:', error);
    return (
      <div className="text-center py-8">
        <div className="mx-auto mb-4 text-red-300" style={{ fontSize: '48px' }}>❌</div>
        <p className="text-red-500">Có lỗi xảy ra khi tải trang điểm danh</p>
        <p className="text-gray-500 text-sm mt-2">Vui lòng thử tải lại trang</p>
        <p className="text-gray-400 text-xs mt-1">{error?.toString()}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Tải lại trang
        </button>
      </div>
    );
  }
}
