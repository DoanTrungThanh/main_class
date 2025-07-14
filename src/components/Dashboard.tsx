import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToastContext } from '../context/ToastContext';

import { getTodayVN, formatDateTimeVN, isSameDateVN } from '../utils/dateUtils';
import {
  Users,
  BookOpen,
  Calendar,
  UserCheck,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Copy,
  MessageSquare,
  Send,
  BookMarked,
  Building,
  User,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { students, classes, schedules, attendance, subjects, classrooms } = useData();
  const toast = useToastContext();

  const today = getTodayVN();
  const todaySchedules = schedules.filter(s => isSameDateVN(s.date, today));
  const activeClasses = classes.length;
  const totalStudents = students.length;

  // Lấy điểm danh hôm nay dựa trên lịch dạy hôm nay
  const todayAttendance = attendance.filter(a => {
    const schedule = schedules.find(s => s.id === a.scheduleId);
    return schedule && isSameDateVN(schedule.date, today);
  });

  const StatCard = ({ icon: Icon, title, value, subtitle, color, trend }: any) => (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover-lift hover-glow transform hover:scale-105">
      <div className="flex items-center justify-between">
        <div className="animate-fade-in">
          <p className="text-xs sm:text-sm text-gray-600 mb-1 animate-slide-in-left">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 animate-number-count">{value}</p>
          {subtitle && <p className="text-xs sm:text-sm text-gray-500 mt-1 animate-fade-in-delay">{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1 mt-2 animate-slide-in-up">
              <TrendingUp size={12} className="text-green-500 animate-bounce-slow" />
              <span className="text-xs text-green-600 font-medium">{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-2 sm:p-3 rounded-lg ${color} animate-rotate-in hover:animate-heartbeat`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  );

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

  const getClassroomName = (classroomId: string) => {
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

  const getTeacherName = (teacherId: string) => {
    const teacher = user?.id === teacherId ? user : null;
    if (teacher) return teacher.name;
    
    // Fallback to searching in users array if available
    return 'Giáo viên';
  };

  // Tạo thông báo lịch học trong ngày
  const generateDayNotification = () => {
    const dayName = new Date().toLocaleDateString('vi-VN', { weekday: 'long', timeZone: 'Asia/Ho_Chi_Minh' });
    const dateStr = new Date().toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    
    if (todaySchedules.length === 0) {
      return `📅 THÔNG BÁO LỊCH HỌC ${dayName.toUpperCase()}, ${dateStr}\n\n❌ Hôm nay không có lịch dạy nào được lên lịch.\n\n✨ Chúc mọi người có một ngày nghỉ ngơi thoải mái!`;
    }

    let notification = `📅 THÔNG BÁO LỊCH HỌC ${dayName.toUpperCase()}, ${dateStr}\n\n`;
    
    // Nhóm lịch theo ca
    const schedulesByTimeSlot = {
      morning: todaySchedules.filter(s => s.timeSlot === 'morning'),
      afternoon: todaySchedules.filter(s => s.timeSlot === 'afternoon'),
      evening: todaySchedules.filter(s => s.timeSlot === 'evening'),
    };

    const timeSlotEmojis = {
      morning: '🌅',
      afternoon: '☀️',
      evening: '🌆',
    };

    Object.entries(schedulesByTimeSlot).forEach(([timeSlot, scheduleList]) => {
      if (scheduleList.length > 0) {
        const emoji = timeSlotEmojis[timeSlot as keyof typeof timeSlotEmojis];
        const label = getTimeSlotLabel(timeSlot);
        
        notification += `${emoji} CA ${label.toUpperCase()}:\n`;
        
        scheduleList.forEach((schedule, index) => {
          const classInfo = classes.find(c => c.id === schedule.classId);
          const className = classInfo?.name || 'Lớp không xác định';
          const subjectName = getSubjectName(schedule.classId, schedule.subjectId);
          const teacherName = getTeacherName(schedule.teacherId);
          const classroomName = getClassroomName(schedule.classroomId);

          notification += `${index + 1}. ${schedule.startTime} - ${schedule.endTime}: ${className}`;
          if (subjectName) {
            notification += ` (${subjectName})`;
          }
          notification += ` - CÔ ${teacherName}`;
          if (classroomName) {
            notification += `  tại ${classroomName}`;
          }
          notification += '\n';
        });
        
        notification += '\n';
      }
    });

    notification += `✨ Chúc các thầy cô và các em có một ngày học tập hiệu quả!`;

    return notification;
  };

  const copyScheduleNotification = async () => {
    const notification = generateDayNotification();
    
    try {
      await navigator.clipboard.writeText(notification);
      toast.success('Đã sao chép thông báo lịch học!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.info('Thông báo đã được tạo');
    }
  };

  const shareScheduleNotification = () => {
    const notification = generateDayNotification();
    
    if (navigator.share) {
      navigator.share({
        title: 'Lịch dạy hôm nay',
        text: notification,
      }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      copyScheduleNotification();
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 animate-fade-in">
        <div className="animate-slide-in-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-scale-in">
            Chào mừng, {user?.name}! 👋
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 animate-fade-in-delay">
            Tổng quan hoạt động của hệ thống
          </p>
        </div>
        <div className="text-right animate-slide-in-right">
          <p className="text-xs sm:text-sm text-gray-600 animate-fade-in-delay">Hôm nay</p>
          <p className="text-sm sm:text-lg font-semibold text-gray-900 animate-fade-in-delay-2">
            {new Date().toLocaleDateString('vi-VN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              timeZone: 'Asia/Ho_Chi_Minh'
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 animate-slide-from-bottom">
        <div className="animate-slide-in-up animate-stagger-1">
          <StatCard
            icon={Users}
            title="Tổng học sinh"
            value={totalStudents}
            subtitle="Đang hoạt động"
            color="bg-blue-500"
            trend="+12% so với tháng trước"
          />
        </div>
        <div className="animate-slide-in-up animate-stagger-2">
          <StatCard
            icon={BookOpen}
            title="Lớp học"
            value={activeClasses}
            subtitle="Đang hoạt động"
            color="bg-green-500"
            trend="+2 lớp mới"
          />
        </div>
        <div className="animate-slide-in-up animate-stagger-3">
          <StatCard
            icon={Calendar}
            title="Lịch dạy hôm nay"
            value={todaySchedules.length}
            subtitle="Buổi học"
            color="bg-orange-500"
          />
        </div>
        <div className="animate-slide-in-up animate-stagger-4">
          <StatCard
            icon={UserCheck}
            title="Điểm danh hôm nay"
            value={todayAttendance.length}
            subtitle="Lượt điểm danh"
            color="bg-purple-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Lịch dạy hôm nay */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar size={18} />
              <span className="truncate">Lịch dạy hôm nay</span>
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-gray-500">
                {todaySchedules.length} buổi học
              </span>
              {todaySchedules.length > 0 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={copyScheduleNotification}
                    className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
                    title="Sao chép thông báo lịch học"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={shareScheduleNotification}
                    className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all"
                    title="Chia sẻ thông báo lịch học"
                  >
                    <Send size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {todaySchedules.length > 0 ? (
            <div className="space-y-3">
              {todaySchedules.map((schedule) => {
                const classInfo = classes.find(c => c.id === schedule.classId);
                const scheduleAttendance = attendance.filter(a => a.scheduleId === schedule.id);
                const activeStudents = classInfo ? students.filter(s =>
                  classInfo.studentIds.includes(s.id) && s.status === 'active'
                ) : [];
                const totalStudents = activeStudents.length;
                const subjectName = getSubjectName(schedule.classId, schedule.subjectId);
                const teacherName = getTeacherName(schedule.teacherId);
                
                return (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Clock size={14} className="sm:text-base text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 text-sm sm:text-base truncate max-w-[120px] sm:max-w-full">
                            {classInfo?.name || 'Lớp không xác định'}
                          </p>
                          {subjectName && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                              <BookMarked size={10} />
                              {subjectName}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                          <span>{schedule.startTime} - {schedule.endTime}</span>
                          <span className="text-gray-400">•</span>
                          <span className="flex items-center gap-1">
                            <User size={10} />
                            {teacherName}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium ${getTimeSlotColor(schedule.timeSlot)}`}>
                        {getTimeSlotLabel(schedule.timeSlot)}
                      </span>
                      
                      <div className="text-right">
                        <p className="text-xs sm:text-sm font-medium text-gray-900">
                          {scheduleAttendance.length}/{totalStudents}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-500">Điểm danh</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Nút tạo thông báo */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Thông báo lịch học</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyScheduleNotification}
                      className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 text-sm"
                    >
                      <Copy size={14} />
                      Sao chép
                    </button>
                    <button
                      onClick={shareScheduleNotification}
                      className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center gap-2 text-sm"
                    >
                      <Send size={14} />
                      Chia sẻ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <Calendar className="mx-auto mb-3 sm:mb-4 text-gray-300" size={36} />
              <p className="text-sm text-gray-500 mb-3 sm:mb-4">Không có lịch dạy hôm nay</p>
              <button
                onClick={copyScheduleNotification}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-all flex items-center gap-2 mx-auto"
              >
                <Copy size={16} />
                Tạo thông báo
              </button>
            </div>
          )}
        </div>

        {/* Thống kê điểm danh */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
              <UserCheck size={18} />
              <span className="truncate">Thống kê điểm danh hôm nay</span>
            </h3>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 sm:gap-3">
                <CheckCircle size={14} className="sm:text-base text-green-600" />
                <span className="text-sm text-gray-700">Học sinh có mặt</span>
              </div>
              <span className="font-semibold text-green-600 text-sm sm:text-base">
                {todayAttendance.filter(a => a.status === 'present').length}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 sm:gap-3">
                <Clock size={14} className="sm:text-base text-yellow-600" />
                <span className="text-sm text-gray-700">Học sinh đi muộn</span>
              </div>
              <span className="font-semibold text-yellow-600 text-sm sm:text-base">
                {todayAttendance.filter(a => a.status === 'late').length}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 sm:gap-3">
                <AlertCircle size={14} className="sm:text-base text-red-600" />
                <span className="text-sm text-gray-700">Học sinh vắng mặt</span>
              </div>
              <span className="font-semibold text-red-600 text-sm sm:text-base">
                {todayAttendance.filter(a => a.status === 'absent').length}
              </span>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <span className="text-sm text-gray-700 font-medium">Tỉ lệ có mặt</span>
              <span className="font-semibold text-blue-600 text-sm sm:text-base">
                {todayAttendance.length > 0 
                  ? Math.round(((todayAttendance.filter(a => a.status === 'present').length + todayAttendance.filter(a => a.status === 'late').length) / todayAttendance.length) * 100)
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Thống kê lớp học */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen size={18} />
          Tình hình các lớp học
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {classes.map((cls) => {
            const classSchedulesToday = todaySchedules.filter(s => s.classId === cls.id);
            const classAttendanceToday = attendance.filter(a => {
              const schedule = schedules.find(s => s.id === a.scheduleId);
              return schedule?.classId === cls.id && schedule && isSameDateVN(schedule.date, today);
            });
            const subjectName = cls.subjectId ? subjects.find(s => s.id === cls.subjectId)?.name : '';
            
            return (
              <div key={cls.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate max-w-[150px] sm:max-w-full">{cls.name}</h4>
                  <span className="text-[10px] sm:text-xs text-gray-500">
                    {students.filter(s => cls.studentIds.includes(s.id) && s.status === 'active').length} HS
                  </span>
                </div>
                
                {subjectName && (
                  <div className="mb-2">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                      <BookMarked size={10} />
                      {subjectName}
                    </span>
                  </div>
                )}
                
                <div className="space-y-1 sm:space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Buổi học hôm nay:</span>
                    <span className="font-medium">{classSchedulesToday.length}</span>
                  </div>
                  
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Lượt điểm danh:</span>
                    <span className="font-medium">{classAttendanceToday.length}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>


    </div>
  );
}