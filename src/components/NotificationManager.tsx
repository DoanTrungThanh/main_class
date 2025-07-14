import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';
import { hasPermission } from '../constants/permissions';

import {
  Calendar,
  Clock,
  Users,
  User,
  Copy,
  Send,
  MessageSquare,
  Building,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Megaphone,
  Bell,
  CheckCircle,
  AlertCircle,
  BookMarked,
} from 'lucide-react';
import { getTodayVN, getCurrentDateVN, formatDateForInput, isSameDateVN } from '../utils/dateUtils';

export default function NotificationManager() {
  const { schedules, classes, classrooms, subjects, students } = useData();
  const { user, users } = useAuth();
  const toast = useToastContext();
  const [selectedDate, setSelectedDate] = useState(getTodayVN());
  const [generatedNotification, setGeneratedNotification] = useState('');
  const [notificationFormat, setNotificationFormat] = useState<'formal' | 'simple'>('formal');
  const [showTemplateExample, setShowTemplateExample] = useState(false);

  // Kiểm tra quyền dựa trên permissions
  const userPermissions = user?.permissions || [];
  const userRole = user?.role;
  const canViewNotifications = hasPermission(userPermissions, 'notifications.view', userRole);
  const canCreateNotifications = hasPermission(userPermissions, 'notifications.create', userRole);









  // Lấy lịch dạy theo ngày được chọn
  const getSchedulesByDate = (date: string) => {
    let filteredSchedules = schedules.filter(s => isSameDateVN(s.date, date));
    
    // Nếu là giáo viên, chỉ hiển thị lịch dạy của mình
    if (user?.role === 'teacher') {
      filteredSchedules = filteredSchedules.filter(s => s.teacherId === user.id);
    }
    
    return filteredSchedules;
  };

  const selectedDateSchedules = getSchedulesByDate(selectedDate);

  const getTimeSlotLabel = (timeSlot: string) => {
    switch (timeSlot) {
      case 'morning': return 'Sáng';
      case 'afternoon': return 'Trưa';
      case 'evening': return 'Chiều';
      default: return timeSlot;
    }
  };

  const getTimeSlotEmoji = (timeSlot: string) => {
    switch (timeSlot) {
      case 'morning': return '🌅';
      case 'afternoon': return '☀️';
      case 'evening': return '🌆';
      default: return '⏰';
    }
  };

  const getClassName = (classId: string) => {
    const classInfo = classes.find(c => c.id === classId);
    return classInfo?.name || 'Lớp không xác định';
  };

  const getClassroomName = (classroomId: string) => {
    if (!classroomId) return '';
    const classroom = classrooms.find(c => c.id === classroomId);
    return classroom?.name || '';
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = users.find(u => u.id === teacherId);
    return teacher?.name || 'Chưa phân công';
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

  const generateDayNotification = () => {
    const selectedDateObj = new Date(selectedDate);
    const dayName = selectedDateObj.toLocaleDateString('vi-VN', { weekday: 'long' });
    const dateStr = selectedDateObj.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' });

    // Default template
    const template = {
      header: '📅 THÔNG BÁO LỊCH HỌC {dayName} ({date})',
      morningLabel: '🌅 CA SÁNG:',
      afternoonLabel: '☀️ CA TRƯA:',
      eveningLabel: '🌆 CA CHIỀU:',
      scheduleFormat: '{index}. {startTime} - {endTime}: {className} ({subjectName}) - {teacherName} tại {classroomName}',
      footer: '✨ Chúc các thầy cô và các em có một ngày học tập hiệu quả!',
      noScheduleMessage: '❌ Hôm nay không có lịch dạy nào được lên lịch.\n\n✨ Chúc mọi người có một ngày nghỉ ngơi thoải mái!'
    };

    if (selectedDateSchedules.length === 0) {
      if (notificationFormat === 'formal') {
        return template.header
          .replace('{dayName}', dayName.toUpperCase())
          .replace('{date}', dateStr) + '\n\n' + template.noScheduleMessage;
      } else {
        return `Dạ thưa quý Phụ Huynh ạ.\nCon xin thông báo lịch cho ${dayName} (${dateStr})\n\nHôm nay không có lịch học ạ.`;
      }
    }

    let notification = '';

    if (notificationFormat === 'formal') {
      notification = template.header
        .replace('{dayName}', dayName.toUpperCase())
        .replace('{date}', dateStr) + '\n\n';
    } else {
      notification = `Dạ thưa quý Phụ Huynh ạ.\nCon xin thông báo lịch cho ${dayName} (${dateStr})\n\n`;
    }
    
    // Nhóm lịch theo ca
    const schedulesByTimeSlot = {
      morning: selectedDateSchedules.filter(s => s.timeSlot === 'morning'),
      afternoon: selectedDateSchedules.filter(s => s.timeSlot === 'afternoon'),
      evening: selectedDateSchedules.filter(s => s.timeSlot === 'evening'),
    };

    Object.entries(schedulesByTimeSlot).forEach(([timeSlot, scheduleList]) => {
      if (scheduleList.length > 0) {
        const label = getTimeSlotLabel(timeSlot);
        
        if (notificationFormat === 'formal') {
          // Get the appropriate label from template
          let timeSlotLabel = '';
          switch (timeSlot) {
            case 'morning':
              timeSlotLabel = template.morningLabel;
              break;
            case 'afternoon':
              timeSlotLabel = template.afternoonLabel;
              break;
            case 'evening':
              timeSlotLabel = template.eveningLabel;
              break;
            default:
              timeSlotLabel = `${getTimeSlotEmoji(timeSlot)} CA ${label.toUpperCase()}:`;
          }

          notification += `${timeSlotLabel}\n`;

          scheduleList.forEach((schedule, index) => {
            const className = getClassName(schedule.classId);
            const classroomName = getClassroomName(schedule.classroomId || '');
            const teacherName = getTeacherName(schedule.teacherId);

            const subjectName = getSubjectName(schedule.classId, schedule.subjectId);

            // Use template format
            let scheduleText = template.scheduleFormat
              .replace('{index}', (index + 1).toString())
              .replace('{startTime}', schedule.startTime)
              .replace('{endTime}', schedule.endTime)
              .replace('{className}', className)
              .replace('{subjectName}', subjectName || '')
              .replace('{teacherName}', teacherName)
              .replace('{classroomName}', classroomName || '');

            // Clean up empty parentheses if no subject
            if (!subjectName) {
              scheduleText = scheduleText.replace(' ()', '');
            }

            // Clean up empty classroom info
            if (!classroomName) {
              scheduleText = scheduleText.replace('  tại ', '');
            }

            notification += scheduleText + '\n';
          });
        } else {
          // Simple format
          scheduleList.forEach((schedule) => {
            const className = getClassName(schedule.classId);
            const teacherName = getTeacherName(schedule.teacherId);
            const subjectName = getSubjectName(schedule.classId, schedule.subjectId);

            notification += `-Buổi ${label.toLowerCase()} (${schedule.startTime}-${schedule.endTime}) ${teacherName} dạy ${subjectName || className}\n`;
          });
        }
        
        notification += '\n';
      }
    });

    // Add footer
    if (notificationFormat === 'formal') {
      notification += template.footer;
    }

    return notification;
  };

  const handleGenerateNotification = () => {
    try {
      const notification = generateDayNotification();
      setGeneratedNotification(notification);
      toast.success('Đã tạo thông báo lịch học thành công!');
    } catch (error) {
      console.error('Error generating notification:', error);
      toast.error('Có lỗi xảy ra khi tạo thông báo!');
    }
  };

  const copyNotification = async () => {
    if (!generatedNotification) {
      toast.error('Vui lòng tạo thông báo trước!');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(generatedNotification);
      toast.success('Đã sao chép thông báo lịch học!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.info('Thông báo đã được tạo');
    }
  };

  const shareNotification = () => {
    if (!generatedNotification) {
      toast.error('Vui lòng tạo thông báo trước!');
      return;
    }
    
    if (navigator.share) {
      navigator.share({
        title: 'Lịch học hôm nay',
        text: generatedNotification,
      }).catch(console.error);
    } else {
      copyNotification();
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(formatDateForInput(currentDate));
    setGeneratedNotification(''); // Reset notification when date changes
  };

  const goToToday = () => {
    setSelectedDate(getTodayVN());
    setGeneratedNotification('');
  };

  const isToday = selectedDate === getTodayVN();

  const templateExample = `Dạ thưa quý Phụ Huynh ạ. 
Con xin thông báo lịch cho thứ 6
-Buổi chiều (2h-4h) cô Thuần dạy toán (lớp lá)
-Buổi chiều (2h-4h) cô Trâm dạy lịch sữ (lớp lớn)
-Buổi chiều (5h30-7h) cô Bích Thu dạy tiếng việt (lớp lá)`;

  // Kiểm tra quyền xem thông báo
  if (!canViewNotifications) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto mb-4 text-gray-300" style={{ fontSize: '48px' }}>🚫</div>
        <p className="text-gray-500">Bạn không có quyền truy cập chức năng này</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tạo thông báo lịch học</h1>
          <p className="text-gray-600 mt-1">
            Tạo thông báo lịch học theo ngày với thông tin chi tiết
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Megaphone size={24} className="text-blue-600" />
        </div>
      </div>

      {/* Format Selection */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Định dạng thông báo</h3>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div 
            className={`flex-1 p-4 border-2 rounded-xl cursor-pointer transition-all ${
              notificationFormat === 'formal' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setNotificationFormat('formal')}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Định dạng chính thức</h4>
              {notificationFormat === 'formal' && (
                <CheckCircle size={18} className="text-blue-600" />
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">Thông báo đầy đủ với tiêu đề, phân loại theo ca</p>
            <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
              <pre className="whitespace-pre-wrap">
                📅 THÔNG BÁO LỊCH HỌC THỨ HAI
                
                🌅 CA SÁNG:
                1. 8:00 - 10:00: Lớp Toán 6A (Toán học) - thầy Minh
                ...
              </pre>
            </div>
          </div>
          
          <div 
            className={`flex-1 p-4 border-2 rounded-xl cursor-pointer transition-all ${
              notificationFormat === 'simple' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setNotificationFormat('simple')}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Định dạng đơn giản</h4>
              {notificationFormat === 'simple' && (
                <CheckCircle size={18} className="text-blue-600" />
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">Thông báo ngắn gọn, thân thiện dành cho phụ huynh</p>
            <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
              <pre className="whitespace-pre-wrap">
                Dạ thưa quý Phụ Huynh ạ.
                Con xin thông báo lịch cho thứ hai
                
                -Buổi sáng (8h-10h) thầy Minh dạy Toán học
                ...
              </pre>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <button
            onClick={() => setShowTemplateExample(!showTemplateExample)}
            className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1"
          >
            {showTemplateExample ? 'Ẩn' : 'Xem'} mẫu thông báo
          </button>
          
          {showTemplateExample && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Mẫu thông báo</h4>
              <pre className="whitespace-pre-wrap text-sm text-yellow-700">
                {templateExample}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Date Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateDate('prev')}
                className="p-2.5 hover:bg-white/80 rounded-xl transition-all duration-200 text-gray-600 hover:text-gray-800"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {new Date(selectedDate).toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    timeZone: 'Asia/Ho_Chi_Minh'
                  })}
                </h2>
                {isToday && (
                  <span className="inline-block mt-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-full font-medium">
                    Hôm nay
                  </span>
                )}
              </div>
              <button
                onClick={() => navigateDate('next')}
                className="p-2.5 hover:bg-white/80 rounded-xl transition-all duration-200 text-gray-600 hover:text-gray-800"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setGeneratedNotification('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <button
                onClick={goToToday}
                className="bg-white text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-50 transition-all duration-200 flex items-center gap-2 border border-blue-200 shadow-sm"
              >
                <Calendar size={16} />
                Hôm nay
              </button>
            </div>
          </div>
        </div>

        {/* Schedule Preview */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CalendarDays size={20} />
            Lịch dạy ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}
            <span className="text-sm font-normal text-gray-500">
              ({selectedDateSchedules.length} buổi học)
            </span>
          </h3>
          
          {selectedDateSchedules.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {selectedDateSchedules.map((schedule) => {
                const classInfo = classes.find(c => c.id === schedule.classId);
                const classroomName = getClassroomName(schedule.classroomId || '');
                const teacherName = getTeacherName(schedule.teacherId);

                const studentCount = classInfo ? students.filter(s =>
                  classInfo.studentIds.includes(s.id) && s.status === 'active'
                ).length : 0;
                const subjectName = getSubjectName(schedule.classId, schedule.subjectId);
                
                return (
                  <div key={schedule.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                        schedule.timeSlot === 'morning' ? 'bg-yellow-100 text-yellow-800' :
                        schedule.timeSlot === 'afternoon' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {getTimeSlotEmoji(schedule.timeSlot)} {getTimeSlotLabel(schedule.timeSlot)}
                      </span>
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 mb-2">{getClassName(schedule.classId)}</h4>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>{schedule.startTime} - {schedule.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User size={14} />
                        <span>{teacherName}</span>
                      </div>
                      {subjectName && (
                        <div className="flex items-center gap-2">
                          <BookMarked size={14} />
                          <span>{subjectName}</span>
                        </div>
                      )}
                      {classroomName && (
                        <div className="flex items-center gap-2">
                          <Building size={14} />
                          <span>{classroomName}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Users size={14} />
                        <span>{studentCount} học sinh</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 mb-6">
              <Calendar className="mx-auto mb-4 text-gray-300" size={48} />
              <p className="text-gray-500">Không có lịch dạy trong ngày này</p>
            </div>
          )}

          {/* Generate Notification Button */}
          <div className="flex justify-center">
            <button
              onClick={handleGenerateNotification}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <MessageSquare size={20} />
              Tạo thông báo lịch học
            </button>
          </div>
        </div>
      </div>

      {/* Generated Notification */}
      {generatedNotification && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-600" />
                Thông báo đã tạo
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyNotification}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                  <Copy size={16} />
                  Sao chép
                </button>
                <button
                  onClick={shareNotification}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
                >
                  <Send size={16} />
                  Chia sẻ
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                {generatedNotification}
              </pre>
            </div>
            
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <span>Độ dài: {generatedNotification.length} ký tự</span>
              <span>Tạo lúc: {getCurrentDateVN().toLocaleString('vi-VN')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Bell size={20} />
          Hướng dẫn sử dụng
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-semibold text-sm">1</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Chọn định dạng</h4>
                <p className="text-sm text-gray-600">Chọn định dạng thông báo phù hợp với nhu cầu của bạn</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-semibold text-sm">2</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Chọn ngày</h4>
                <p className="text-sm text-gray-600">Sử dụng nút điều hướng hoặc chọn ngày trực tiếp để xem lịch dạy</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-semibold text-sm">3</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Tạo thông báo</h4>
                <p className="text-sm text-gray-600">Nhấn nút "Tạo thông báo" để tự động tạo nội dung thông báo</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-semibold text-sm">4</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Sao chép & chia sẻ</h4>
                <p className="text-sm text-gray-600">Sao chép nội dung hoặc chia sẻ trực tiếp qua các ứng dụng</p>
              </div>
            </div>
          </div>
        </div>
      </div>




    </div>
  );
}