import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';
import { hasPermission } from '../constants/permissions';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Users,
  User,
  MapPin,
  X,
  Save,
  Copy,
  ChevronLeft,
  ChevronRight,
  Building,
  BookMarked,
  Download,
  Filter,
} from 'lucide-react';
import { Schedule } from '../types';
import { exportSchedules } from '../lib/excelExport';
import {
  formatDateForInput,
  getWeekStart,
  getVietnameseDayName,
  getCurrentWeekVN,
  getTodayVN,
  formatDateVN,
  isTodayVN,
  isSameDateVN
} from '../utils/dateUtils';

export default function ScheduleManager() {
  const {
    schedules,
    classes,
    classrooms,
    subjects,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    copyWeekSchedule,
    addSampleSchedules
  } = useData();
  const { user, users } = useAuth();
  const toast = useToastContext();
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterTimeSlot, setFilterTimeSlot] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
  const [currentWeek, setCurrentWeek] = useState(getCurrentWeekVN());
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [showCurrentWeekOnly, setShowCurrentWeekOnly] = useState(true);
  const [selectedSchedules, setSelectedSchedules] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [copyFromWeek, setCopyFromWeek] = useState('');
  const [copyToWeek, setCopyToWeek] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [formData, setFormData] = useState({
    classId: '',
    teacherId: user?.id || '',
    subjectId: '',
    classroomId: '',
    date: '',
    timeSlot: 'morning' as 'morning' | 'afternoon' | 'evening',
    startTime: '',
    endTime: '',
    status: 'scheduled' as 'scheduled' | 'completed' | 'cancelled',
  });

  // Kiểm tra quyền dựa trên permissions
  const userPermissions = user?.permissions || [];
  const userRole = user?.role;
  const canViewSchedules = hasPermission(userPermissions, 'schedules.view', userRole);
  const canCreateSchedules = hasPermission(userPermissions, 'schedules.create', userRole);
  const canEditSchedules = hasPermission(userPermissions, 'schedules.edit', userRole);
  const canDeleteSchedules = hasPermission(userPermissions, 'schedules.delete', userRole);
  const canManageSchedules = canCreateSchedules || canEditSchedules || canDeleteSchedules;

  // Utility functions for week navigation - using imported utility

  const getWeekEnd = (date: Date) => {
    const weekStart = getWeekStart(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return weekEnd;
  };

  const formatDateForInput = (date: Date) => {
    // Format date as YYYY-MM-DD for input fields, ensuring local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseInputDate = (dateString: string) => {
    // Parse YYYY-MM-DD string to Date object in local timezone
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const formatWeekRange = (date: Date) => {
    const start = getWeekStart(date);
    const end = getWeekEnd(date);
    return `${start.toLocaleDateString('vi-VN')} - ${end.toLocaleDateString('vi-VN')}`;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(getCurrentWeekVN());
  };

  const getWeekSchedules = () => {
    const startOfWeek = getWeekStart(currentWeek);

    // Debug log
    console.log('ScheduleManager - Current week:', currentWeek);
    console.log('ScheduleManager - Week start:', startOfWeek);
    console.log('ScheduleManager - Total schedules:', schedules.length);

    const weekSchedules = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = formatDateForInput(date);

      let daySchedules = schedules.filter(s => isSameDateVN(s.date, dateStr));

      // Lọc theo vai trò người dùng
      if (user?.role === 'teacher') {
        daySchedules = daySchedules.filter(s => s.teacherId === user.id);
      }

      // Get Vietnamese day name
      const vietnameseDayName = getVietnameseDayName(date);

      // Debug log for each day
      console.log(`ScheduleManager Day ${i}: ${dateStr} (${vietnameseDayName}) - ${daySchedules.length} schedules`);

      weekSchedules.push({
        date: dateStr,
        dayName: vietnameseDayName,
        dayNumber: date.getDate(),
        fullDate: date,
        schedules: daySchedules,
        isToday: isTodayVN(dateStr),
      });
    }

    console.log('ScheduleManager - Week schedules:', weekSchedules);
    return weekSchedules;
  };

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch =
      classes.find(c => c.id === schedule.classId)?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      users.find(u => u.id === schedule.teacherId)?.name.toLowerCase().includes(searchTerm.toLowerCase());

    // Nếu có filter date cụ thể, sử dụng nó
    // Nếu không và đang bật chế độ hiển thị tuần hiện tại, chỉ hiển thị lịch dạy trong tuần hiện tại
    let matchesDate = true;
    if (filterDate) {
      matchesDate = isSameDateVN(schedule.date, filterDate);
    } else if (showCurrentWeekOnly) {
      // Chỉ hiển thị lịch dạy trong tuần hiện tại
      const weekStart = getWeekStart(currentWeek);
      const weekEnd = getWeekEnd(currentWeek);
      const scheduleDate = new Date(schedule.date + 'T00:00:00');
      matchesDate = scheduleDate >= weekStart && scheduleDate <= weekEnd;
    }

    const matchesTimeSlot = filterTimeSlot === 'all' || schedule.timeSlot === filterTimeSlot;

    // Lọc theo vai trò người dùng
    const matchesUser = user?.role !== 'teacher' || schedule.teacherId === user.id;

    return matchesSearch && matchesDate && matchesTimeSlot && matchesUser;
  });

  const resetForm = () => {
    setFormData({
      classId: '',
      teacherId: user?.id || '',
      subjectId: '',
      classroomId: '',
      date: '',
      timeSlot: 'morning',
      startTime: '',
      endTime: '',
      status: 'scheduled',
    });
    setEditingSchedule(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate date format and ensure it's properly formatted
      if (!formData.date) {
        toast.error('Vui lòng chọn ngày học!');
        return;
      }

      // Ensure the date is in the correct format (YYYY-MM-DD)
      const dateToSave = formData.date;
      
      const scheduleData = {
        ...formData,
        date: dateToSave, // Keep the date exactly as entered
      };

      if (editingSchedule) {
        await updateSchedule(editingSchedule.id, scheduleData);
        toast.success('Cập nhật lịch dạy thành công!');
      } else {
        await addSchedule(scheduleData);
        toast.success('Thêm lịch dạy thành công!');
      }
      
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error('Có lỗi xảy ra khi lưu lịch dạy!');
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    
    // Get the class info to auto-fill subject
    const classInfo = classes.find(c => c.id === schedule.classId);
    
    setFormData({
      classId: schedule.classId,
      teacherId: schedule.teacherId,
      subjectId: schedule.subjectId || classInfo?.subjectId || '',
      classroomId: schedule.classroomId || '',
      date: schedule.date, // Keep the date exactly as stored
      timeSlot: schedule.timeSlot,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      status: schedule.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lịch dạy này?')) {
      try {
        await deleteSchedule(id);
        toast.success('Xóa lịch dạy thành công!');
      } catch (error) {
        console.error('Error deleting schedule:', error);
        toast.error('Có lỗi xảy ra khi xóa lịch dạy!');
      }
    }
  };

  // Xử lý chọn/bỏ chọn lịch
  const handleSelectSchedule = (scheduleId: string, checked: boolean) => {
    const newSelected = new Set(selectedSchedules);
    if (checked) {
      newSelected.add(scheduleId);
    } else {
      newSelected.delete(scheduleId);
    }
    setSelectedSchedules(newSelected);
  };

  // Chọn/bỏ chọn tất cả lịch trong tuần
  const handleSelectAllWeek = (checked: boolean) => {
    const weekSchedules = getWeekSchedules();
    const allWeekScheduleIds = weekSchedules.flatMap(day => day.schedules.map(s => s.id));

    if (checked) {
      setSelectedSchedules(new Set([...selectedSchedules, ...allWeekScheduleIds]));
    } else {
      const newSelected = new Set(selectedSchedules);
      allWeekScheduleIds.forEach(id => newSelected.delete(id));
      setSelectedSchedules(newSelected);
    }
  };

  // Xóa các lịch được chọn
  const handleDeleteSelected = async () => {
    if (selectedSchedules.size === 0) {
      toast.error('Vui lòng chọn ít nhất một lịch để xóa!');
      return;
    }

    const confirmMessage = `Bạn có chắc chắn muốn xóa ${selectedSchedules.size} lịch dạy đã chọn?`;
    if (window.confirm(confirmMessage)) {
      try {
        setIsDeleting(true);
        const deletePromises = Array.from(selectedSchedules).map(id => deleteSchedule(id));
        await Promise.all(deletePromises);

        toast.success(`Đã xóa ${selectedSchedules.size} lịch dạy thành công!`);
        setSelectedSchedules(new Set());
      } catch (error) {
        console.error('Error deleting selected schedules:', error);
        toast.error('Có lỗi xảy ra khi xóa lịch dạy!');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Kiểm tra xem tất cả lịch trong tuần có được chọn không
  const isAllWeekSelected = () => {
    const weekSchedules = getWeekSchedules();
    const allWeekScheduleIds = weekSchedules.flatMap(day => day.schedules.map(s => s.id));
    return allWeekScheduleIds.length > 0 && allWeekScheduleIds.every(id => selectedSchedules.has(id));
  };

  // Kiểm tra xem có lịch nào trong tuần được chọn không
  const hasSelectedInWeek = () => {
    const weekSchedules = getWeekSchedules();
    const allWeekScheduleIds = weekSchedules.flatMap(day => day.schedules.map(s => s.id));
    return allWeekScheduleIds.some(id => selectedSchedules.has(id));
  };

  const handleCopyWeek = async () => {
    if (!copyFromWeek || !copyToWeek) {
      toast.error('Vui lòng chọn tuần nguồn và tuần đích!');
      return;
    }

    if (copyFromWeek === copyToWeek) {
      toast.error('Tuần nguồn và tuần đích không thể giống nhau!');
      return;
    }

    try {
      await copyWeekSchedule(copyFromWeek, copyToWeek);
      toast.success('Sao chép lịch tuần thành công!');
      setShowCopyModal(false);
      setCopyFromWeek('');
      setCopyToWeek('');
    } catch (error) {
      console.error('Error copying week schedule:', error);
      toast.error('Có lỗi xảy ra khi sao chép lịch tuần!');
    }
  };

  const handleClassChange = (classId: string) => {
    setFormData(prev => {
      const classInfo = classes.find(c => c.id === classId);
      return {
        ...prev,
        classId,
        subjectId: classInfo?.subjectId || '',
        teacherId: classInfo?.teacherId || prev.teacherId,
      };
    });
  };

  const getClassName = (classId: string) => {
    const classInfo = classes.find(c => c.id === classId);
    return classInfo?.name || 'Không xác định';
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = users.find(u => u.id === teacherId);
    return teacher?.name || 'Không xác định';
  };

  const getClassroomName = (classroomId?: string) => {
    if (!classroomId) return '';
    const classroom = classrooms.find(c => c.id === classroomId);
    return classroom?.name || '';
  };

  const getSubjectName = (classId: string, subjectId?: string) => {
    // Ưu tiên lấy môn học từ subjectId của lịch dạy nếu có
    if (subjectId) {
      const subject = subjects.find(s => s.id === subjectId);
      if (subject) return subject.name;
    }
    
    // Nếu không có subjectId, lấy từ lớp học
    const classInfo = classes.find(c => c.id === classId);
    if (!classInfo || !classInfo.subjectId) return '';
    
    const subject = subjects.find(s => s.id === classInfo.subjectId);
    return subject?.name || '';
  };

  const getSubjectColor = (classId: string, subjectId?: string) => {
    // Ưu tiên lấy màu từ subjectId của lịch dạy nếu có
    if (subjectId) {
      const subject = subjects.find(s => s.id === subjectId);
      if (subject) return subject.color;
    }
    
    // Nếu không có subjectId, lấy từ lớp học
    const classInfo = classes.find(c => c.id === classId);
    if (!classInfo || !classInfo.subjectId) return '#6B7280'; // Default gray
    
    const subject = subjects.find(s => s.id === classInfo.subjectId);
    return subject?.color || '#6B7280';
  };

  const getTimeSlotLabel = (timeSlot: string) => {
    switch (timeSlot) {
      case 'morning': return 'Sáng';
      case 'afternoon': return 'Trưa';
      case 'evening': return 'Chiều';
      default: return timeSlot;
    }
  };

  const getTimeSlotColor = (timeSlot: string) => {
    switch (timeSlot) {
      case 'morning': return 'bg-yellow-100 text-yellow-800';
      case 'afternoon': return 'bg-blue-100 text-blue-800';
      case 'evening': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };



  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Đã lên lịch';
      case 'completed': return 'Đã hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const weekSchedules = getWeekSchedules();

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      await exportSchedules(filteredSchedules, classes, classrooms, users, subjects);
      toast.success('Xuất dữ liệu thành công!');
    } catch (error) {
      console.error('Error exporting schedules:', error);
      toast.error('Có lỗi xảy ra khi xuất dữ liệu!');
    } finally {
      setIsExporting(false);
    }
  };

  // Reorganize weekSchedules for Vietnamese calendar (Monday to Sunday)
  // Split into two rows: Monday-Wednesday (first row) and Thursday-Sunday (second row)
  const firstRowDays = weekSchedules.slice(0, 3); // Monday, Tuesday, Wednesday
  const secondRowDays = weekSchedules.slice(3);   // Thursday, Friday, Saturday, Sunday

  // Kiểm tra quyền xem lịch dạy
  if (!canViewSchedules) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto mb-4 text-gray-300" style={{ fontSize: '48px' }}>🚫</div>
        <p className="text-gray-500">Bạn không có quyền truy cập chức năng này</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between animate-slide-in-down">
        <div className="animate-slide-in-left">
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent animate-scale-in">Quản lý lịch dạy</h1>
          <p className="text-gray-600 mt-1 animate-fade-in-delay">
            {user?.role === 'teacher'
              ? 'Xem và quản lý lịch dạy của bạn'
              : 'Tạo và quản lý lịch dạy cho tất cả lớp học'
            }
          </p>
        </div>
        <div className="flex items-center gap-3 animate-slide-in-right">
          {schedules.length === 0 && (
            <button
              onClick={async () => {
                try {
                  await addSampleSchedules();
                  toast.success('Đã thêm dữ liệu mẫu thành công!');
                } catch (error) {
                  toast.error('Có lỗi khi thêm dữ liệu mẫu!');
                }
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center gap-2 hover-lift hover-glow animate-fade-in-delay"
            >
              <Plus size={20} className="hover:rotate-90 transition-transform duration-300" />
              Thêm dữ liệu mẫu
            </button>
          )}
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-300 flex items-center gap-2 hover-lift hover-glow animate-fade-in-delay"
          >
            <Download size={20} className={isExporting ? 'animate-spin' : 'hover:animate-bounce'} />
            {isExporting ? <span className="loading-dots">Đang xuất</span> : 'Xuất Excel'}
          </button>
          {canCreateSchedules && (
            <>
              <button
                onClick={() => setShowCopyModal(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all duration-300 flex items-center gap-2 hover-lift hover-glow animate-fade-in-delay-2"
              >
                <Copy size={20} className="hover:animate-bounce" />
                Sao chép tuần
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center gap-2 hover-lift hover-glow animate-fade-in-delay-3"
              >
                <Plus size={20} className="hover:rotate-90 transition-transform duration-300" />
                Thêm lịch dạy
              </button>
            </>
          )}
        </div>
      </div>

      {/* Week Navigation */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 animate-slide-from-bottom hover-lift">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4 animate-scale-in">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300 hover-scale animate-slide-in-left"
            >
              <ChevronLeft size={20} className="hover:-translate-x-1 transition-transform duration-300" />
            </button>
            <div className="text-center animate-fade-in-delay">
              <h2 className="text-xl font-semibold text-gray-900 animate-zoom-in">
                Tuần {formatWeekRange(currentWeek)}
              </h2>
              <p className="text-sm text-gray-600 animate-fade-in-delay-2">
                {getWeekStart(currentWeek).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' })}
              </p>
            </div>
            <button
              onClick={() => navigateWeek('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300 hover-scale animate-slide-in-right"
            >
              <ChevronRight size={20} className="hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>

          {/* Selection Controls */}
          {canManageSchedules && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="selectAllWeek"
                  checked={isAllWeekSelected()}
                  onChange={(e) => handleSelectAllWeek(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="selectAllWeek" className="text-sm text-gray-700">
                  Chọn tất cả tuần này
                </label>
              </div>

              {selectedSchedules.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Đã chọn: {selectedSchedules.size}
                  </span>
                  <button
                    onClick={handleDeleteSelected}
                    disabled={isDeleting}
                    className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Trash2 size={14} />
                    )}
                    Xóa đã chọn
                  </button>
                </div>
              )}
            </div>
          )}
          
          <button
            onClick={goToCurrentWeek}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <Calendar size={16} />
            Tuần này
          </button>
        </div>

        {/* First row: Monday-Wednesday */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2 lg:gap-4 mb-2 sm:mb-4">
          {firstRowDays.map((day) => (
            <div
              key={day.date}
              className={`border rounded-lg p-1 sm:p-2 lg:p-4 min-h-[120px] sm:min-h-[150px] lg:min-h-[200px] ${
                day.isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="text-center mb-3">
                <h3 className={`font-semibold ${day.isToday ? 'text-blue-900' : 'text-gray-900'}`}>
                  {day.dayName}
                </h3>
                <p className={`text-sm ${day.isToday ? 'text-blue-700' : 'text-gray-600'}`}>
                  {day.dayNumber}
                </p>
                {day.isToday && (
                  <span className="inline-block mt-1 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                    Hôm nay
                  </span>
                )}
              </div>
              
              <div className="space-y-2">
                {day.schedules.map((schedule) => {
                  const classInfo = classes.find(c => c.id === schedule.classId);
                  const subjectName = getSubjectName(schedule.classId, schedule.subjectId);
                  const subjectColor = getSubjectColor(schedule.classId, schedule.subjectId);
                  const classroomName = getClassroomName(schedule.classroomId);
                  const teacherName = getTeacherName(schedule.teacherId);
                  
                  return (
                    <div
                      key={schedule.id}
                      className="p-1 sm:p-2 lg:p-3 rounded text-left transition-all hover:shadow-md border border-opacity-20 hover:border-opacity-40"
                      style={{
                        backgroundColor: `${subjectColor}15`,
                        borderColor: subjectColor
                      }}
                    >
                      {/* Selection checkbox */}
                      {canManageSchedules && (
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="checkbox"
                            checked={selectedSchedules.has(schedule.id)}
                            onChange={(e) => handleSelectSchedule(schedule.id, e.target.checked)}
                            className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-500">Chọn</span>
                        </div>
                      )}
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className={`px-1 py-0.5 rounded text-xs font-medium ${getTimeSlotColor(schedule.timeSlot)}`}>
                            {getTimeSlotLabel(schedule.timeSlot)}
                          </span>
                        </div>

                        <div className="text-xs font-medium leading-tight truncate" title={classInfo?.name}>
                          {schedule.startTime} - {schedule.endTime}
                        </div>

                        <div className="text-xs font-medium leading-tight truncate" title={classInfo?.name}>
                          {classInfo?.name}
                        </div>

                        {subjectName && (
                          <div className="text-xs text-gray-600 truncate">
                            ({subjectName})
                          </div>
                        )}

                        <div className="text-xs text-gray-600 truncate">
                          {teacherName.toUpperCase()}
                        </div>

                        {classroomName && (
                          <div className="text-xs text-gray-500 truncate">
                            tại {classroomName}
                          </div>
                        )}
                      </div>
                      
                      {(canEditSchedules || canDeleteSchedules) && (
                        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-200">
                          {canEditSchedules && (
                            <button
                              onClick={() => handleEdit(schedule)}
                              className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-100"
                              title="Chỉnh sửa"
                            >
                              <Edit size={12} />
                            </button>
                          )}
                          {canDeleteSchedules && (
                            <button
                              onClick={() => handleDelete(schedule.id)}
                              className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-100"
                              title="Xóa"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {day.schedules.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">
                    Không có lịch
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Second row: Thursday-Sunday */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1 sm:gap-2 lg:gap-4">
          {secondRowDays.map((day) => (
            <div
              key={day.date}
              className={`border rounded-lg p-1 sm:p-2 lg:p-4 min-h-[120px] sm:min-h-[150px] lg:min-h-[200px] ${
                day.isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="text-center mb-3">
                <h3 className={`font-semibold ${day.isToday ? 'text-blue-900' : 'text-gray-900'}`}>
                  {day.dayName}
                </h3>
                <p className={`text-sm ${day.isToday ? 'text-blue-700' : 'text-gray-600'}`}>
                  {day.dayNumber}
                </p>
                {day.isToday && (
                  <span className="inline-block mt-1 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                    Hôm nay
                  </span>
                )}
              </div>
              
              <div className="space-y-2">
                {day.schedules.map((schedule) => {
                  const classInfo = classes.find(c => c.id === schedule.classId);
                  const subjectName = getSubjectName(schedule.classId, schedule.subjectId);
                  const subjectColor = getSubjectColor(schedule.classId, schedule.subjectId);
                  const classroomName = getClassroomName(schedule.classroomId);
                  const teacherName = getTeacherName(schedule.teacherId);
                  
                  return (
                    <div
                      key={schedule.id}
                      className="p-1 sm:p-2 lg:p-3 rounded text-left transition-all hover:shadow-md border border-opacity-20 hover:border-opacity-40"
                      style={{
                        backgroundColor: `${subjectColor}15`,
                        borderColor: subjectColor
                      }}
                    >
                      {/* Selection checkbox */}
                      {canManageSchedules && (
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="checkbox"
                            checked={selectedSchedules.has(schedule.id)}
                            onChange={(e) => handleSelectSchedule(schedule.id, e.target.checked)}
                            className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-500">Chọn</span>
                        </div>
                      )}
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className={`px-1 py-0.5 rounded text-xs font-medium ${getTimeSlotColor(schedule.timeSlot)}`}>
                            {getTimeSlotLabel(schedule.timeSlot)}
                          </span>
                        </div>

                        <div className="text-xs font-medium leading-tight truncate" title={classInfo?.name}>
                          {schedule.startTime} - {schedule.endTime}
                        </div>

                        <div className="text-xs font-medium leading-tight truncate" title={classInfo?.name}>
                          {classInfo?.name}
                        </div>

                        {subjectName && (
                          <div className="text-xs text-gray-600 truncate">
                            ({subjectName})
                          </div>
                        )}

                        <div className="text-xs text-gray-600 truncate">
                          {teacherName.toUpperCase()}
                        </div>

                        {classroomName && (
                          <div className="text-xs text-gray-500 truncate">
                            tại {classroomName}
                          </div>
                        )}
                      </div>
                      
                      {(canEditSchedules || canDeleteSchedules) && (
                        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-200">
                          {canEditSchedules && (
                            <button
                              onClick={() => handleEdit(schedule)}
                              className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-100"
                              title="Chỉnh sửa"
                            >
                              <Edit size={12} />
                            </button>
                          )}
                          {canDeleteSchedules && (
                            <button
                              onClick={() => handleDelete(schedule.id)}
                              className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-100"
                              title="Xóa"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {day.schedules.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">
                    Không có lịch
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule List */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm lịch dạy..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <select
            value={filterTimeSlot}
            onChange={(e) => setFilterTimeSlot(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả ca</option>
            <option value="morning">Ca sáng</option>
            <option value="afternoon">Ca trưa</option>
            <option value="evening">Ca chiều</option>
          </select>

          <button
            onClick={() => setShowCurrentWeekOnly(!showCurrentWeekOnly)}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
              showCurrentWeekOnly
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={showCurrentWeekOnly ? 'Hiển thị tất cả lịch dạy' : 'Chỉ hiển thị tuần hiện tại'}
          >
            <Calendar size={16} />
            {showCurrentWeekOnly ? 'Tuần hiện tại' : 'Tất cả'}
          </button>

          {/* Bulk delete button for table */}
          {canManageSchedules && selectedSchedules.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isDeleting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Trash2 size={16} />
              )}
              Xóa đã chọn ({selectedSchedules.size})
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                {canManageSchedules && (
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 w-12">
                    <input
                      type="checkbox"
                      checked={filteredSchedules.length > 0 && filteredSchedules.every(s => selectedSchedules.has(s.id))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const newSelected = new Set([...selectedSchedules, ...filteredSchedules.map(s => s.id)]);
                          setSelectedSchedules(newSelected);
                        } else {
                          const newSelected = new Set(selectedSchedules);
                          filteredSchedules.forEach(s => newSelected.delete(s.id));
                          setSelectedSchedules(newSelected);
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                )}
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Ngày</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Ca</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Thời gian</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Lớp</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Môn học</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Giáo viên</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Phòng</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Trạng thái</th>
                {canManageSchedules && (
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Thao tác</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.map((schedule) => {
                const subjectName = getSubjectName(schedule.classId, schedule.subjectId);
                const classroomName = getClassroomName(schedule.classroomId);
                
                return (
                  <tr key={schedule.id} className="border-b border-gray-100 hover:bg-gray-50">
                    {canManageSchedules && (
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedSchedules.has(schedule.id)}
                          onChange={(e) => handleSelectSchedule(schedule.id, e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                    )}
                    <td className="py-3 px-4">
                      {formatDateVN(schedule.date)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTimeSlotColor(schedule.timeSlot)}`}>
                        {getTimeSlotLabel(schedule.timeSlot)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Clock size={14} className="text-gray-400" />
                        <span>{schedule.startTime} - {schedule.endTime}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">{getClassName(schedule.classId)}</td>
                    <td className="py-3 px-4">
                      {subjectName && (
                        <div 
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: getSubjectColor(schedule.classId, schedule.subjectId) }}
                        >
                          <BookMarked size={10} />
                          {subjectName}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">{getTeacherName(schedule.teacherId)}</td>
                    <td className="py-3 px-4">
                      {classroomName && (
                        <div className="flex items-center gap-1">
                          <Building size={14} className="text-gray-400" />
                          <span>{classroomName}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                        {getStatusLabel(schedule.status)}
                      </span>
                    </td>
                    {(canEditSchedules || canDeleteSchedules) && (
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {canEditSchedules && (
                            <button
                              onClick={() => handleEdit(schedule)}
                              className="text-blue-600 hover:text-blue-700"
                              title="Chỉnh sửa"
                            >
                              <Edit size={16} />
                            </button>
                          )}
                          {canDeleteSchedules && (
                            <button
                              onClick={() => handleDelete(schedule.id)}
                              className="text-red-600 hover:text-red-700"
                              title="Xóa"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredSchedules.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="mx-auto mb-4 text-gray-300" size={48} />
            <p className="text-gray-500">
              {searchTerm || filterDate || filterTimeSlot !== 'all' 
                ? 'Không tìm thấy lịch dạy nào' 
                : 'Chưa có lịch dạy nào'}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingSchedule ? 'Chỉnh sửa lịch dạy' : 'Thêm lịch dạy mới'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lớp học *
                  </label>
                  <select
                    value={formData.classId}
                    onChange={(e) => handleClassChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Chọn lớp học</option>
                    {classes
                      .filter(cls => user?.role !== 'teacher' || cls.teacherId === user.id)
                      .map((cls) => (
                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Môn học
                  </label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Chọn môn học</option>
                    {subjects.filter(s => s.isActive).map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giáo viên *
                  </label>
                  <select
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={user?.role === 'teacher'}
                  >
                    <option value="">Chọn giáo viên</option>
                    {users.filter(u => u.role === 'teacher').map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phòng học
                  </label>
                  <select
                    value={formData.classroomId}
                    onChange={(e) => setFormData({ ...formData, classroomId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Chọn phòng học</option>
                    {classrooms.filter(c => c.status === 'available').map((classroom) => (
                      <option key={classroom.id} value={classroom.id}>{classroom.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày học *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ca học *
                  </label>
                  <select
                    value={formData.timeSlot}
                    onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="morning">Ca sáng</option>
                    <option value="afternoon">Ca trưa</option>
                    <option value="evening">Ca chiều</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giờ bắt đầu *
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giờ kết thúc *
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="scheduled">Đã lên lịch</option>
                  <option value="completed">Đã hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  {editingSchedule ? 'Cập nhật' : 'Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Copy Week Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Sao chép lịch tuần</h2>
              <button
                onClick={() => {
                  setShowCopyModal(false);
                  setCopyFromWeek('');
                  setCopyToWeek('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tuần nguồn (ngày đầu tuần) *
                </label>
                <input
                  type="date"
                  value={copyFromWeek}
                  onChange={(e) => setCopyFromWeek(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tuần đích (ngày đầu tuần) *
                </label>
                <input
                  type="date"
                  value={copyToWeek}
                  onChange={(e) => setCopyToWeek(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowCopyModal(false);
                    setCopyFromWeek('');
                    setCopyToWeek('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCopyWeek}
                  className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                >
                  <Copy size={16} />
                  Sao chép
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}