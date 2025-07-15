import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, User, BookOpen } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  formatDateForInput,
  getWeekStart,
  getWeekEnd,
  formatWeekRange,
  getVietnameseDayName,
  getCurrentWeekVN,
  getTodayVN,
  isTodayVN,
  isSameDateVN
} from '../utils/dateUtils';

export default function PublicScheduleView() {
  const { schedules, classes, classrooms, subjects } = useData();
  const { users } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(getCurrentWeekVN());

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  // Get week schedules
  const weekSchedules = useMemo(() => {
    const startOfWeek = getWeekStart(currentWeek);

    // Debug log
    console.log('PublicScheduleView - Current week:', currentWeek);
    console.log('PublicScheduleView - Week start:', startOfWeek);
    console.log('PublicScheduleView - Total schedules:', schedules.length);

    const weekSchedules = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = formatDateForInput(date);

      const daySchedules = schedules.filter(s => isSameDateVN(s.date, dateStr));

      // Get Vietnamese day name
      const vietnameseDayName = getVietnameseDayName(date);

      // Debug log for each day
      console.log(`Day ${i}: ${dateStr} (${vietnameseDayName}) - ${daySchedules.length} schedules`);

      weekSchedules.push({
        date: dateStr,
        dayName: vietnameseDayName,
        dayNumber: date.getDate(),
        fullDate: date,
        schedules: daySchedules,
        isToday: isTodayVN(dateStr),
      });
    }

    console.log('PublicScheduleView - Week schedules:', weekSchedules);
    return weekSchedules;
  }, [currentWeek, schedules]);

  // Helper function to get schedule details
  const getScheduleDetails = (schedule: any) => {
    const classInfo = classes.find(c => c.id === schedule.classId);
    const subjectInfo = subjects.find(s => s.id === schedule.subjectId);
    const classroomInfo = classrooms.find(cr => cr.id === schedule.classroomId);
    const teacherInfo = users.find(u => u.id === schedule.teacherId);

    return {
      className: classInfo?.name || 'Lớp không xác định',
      subjectName: subjectInfo?.name || 'Môn học không xác định',
      classroomName: classroomInfo?.name || 'Phòng không xác định',
      teacherName: teacherInfo?.name || 'Giáo viên không xác định',
    };
  };

  // Get time slot color
  const getTimeSlotColor = (timeSlot: string) => {
    switch (timeSlot) {
      case 'morning':
        return 'border-green-200 bg-green-50';
      case 'afternoon':
        return 'border-orange-200 bg-orange-50';
      case 'evening':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getTimeSlotTextColor = (timeSlot: string) => {
    switch (timeSlot) {
      case 'morning':
        return 'text-green-700';
      case 'afternoon':
        return 'text-orange-700';
      case 'evening':
        return 'text-purple-700';
      default:
        return 'text-gray-700';
    }
  };

  // Split into two rows for better layout
  const firstRowDays = weekSchedules.slice(0, 3); // Monday, Tuesday, Wednesday
  const secondRowDays = weekSchedules.slice(3);   // Thursday, Friday, Saturday, Sunday

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Mobile Optimized */}
      <div className="text-center">
        <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Lịch dạy</h2>
        <p className="text-sm sm:text-base text-gray-600">Xem lịch dạy của trung tâm theo tuần</p>
      </div>

      {/* Week Navigation - Mobile Optimized */}
      <div className="bg-white p-3 sm:p-6 rounded-lg sm:rounded-xl border border-gray-200">
        <div className="flex items-center justify-center mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-md sm:rounded-lg transition-all"
            >
              <ChevronLeft size={16} className="sm:w-5 sm:h-5" />
            </button>
            <div className="text-center min-w-[200px] sm:min-w-[250px]">
              <h3 className="text-sm sm:text-xl font-semibold text-gray-900">
                Tuần {formatWeekRange(currentWeek)}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                {getWeekStart(currentWeek).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <button
              onClick={() => navigateWeek('next')}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-md sm:rounded-lg transition-all"
            >
              <ChevronRight size={16} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Mobile: Single column, Desktop: Grid layout */}
        <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-2 lg:gap-4 mb-3 sm:mb-4">
          {firstRowDays.map((day) => (
            <div
              key={day.date}
              className={`border rounded-lg p-3 sm:p-2 lg:p-4 min-h-[100px] sm:min-h-[150px] lg:min-h-[200px] ${
                day.isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="text-center mb-2 sm:mb-3">
                <h4 className={`text-sm sm:text-base font-semibold ${day.isToday ? 'text-blue-900' : 'text-gray-900'}`}>
                  {day.dayName}
                </h4>
                <p className={`text-xs sm:text-sm ${day.isToday ? 'text-blue-700' : 'text-gray-600'}`}>
                  {day.dayNumber}
                </p>
                {day.isToday && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                    Hôm nay
                  </span>
                )}
              </div>

              <div className="space-y-1 sm:space-y-2">
                {day.schedules.length === 0 ? (
                  <div className="text-center text-gray-400 py-2 sm:py-4">
                    <p className="text-xs sm:text-sm">Không có lịch dạy</p>
                  </div>
                ) : (
                  day.schedules.map((schedule) => {
                    const details = getScheduleDetails(schedule);
                    return (
                      <div
                        key={schedule.id}
                        className={`p-2 sm:p-2 rounded border ${getTimeSlotColor(schedule.timeSlot)}`}
                      >
                        <div className="space-y-0.5 sm:space-y-1">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-medium ${getTimeSlotTextColor(schedule.timeSlot)}`}>
                              {schedule.startTime} - {schedule.endTime}
                            </span>
                          </div>
                          <div className="text-xs text-gray-700 font-medium line-clamp-1">
                            {details.className}
                          </div>
                          <div className="text-xs text-gray-600 line-clamp-1">
                            {details.subjectName}
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="line-clamp-1 flex-1 mr-1">{details.teacherName}</span>
                            <span className="line-clamp-1 text-right">{details.classroomName}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Second row: Thursday-Sunday - Mobile Optimized */}
        <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-2 lg:gap-4">
          {secondRowDays.map((day) => (
            <div
              key={day.date}
              className={`border rounded-lg p-3 sm:p-2 lg:p-4 min-h-[100px] sm:min-h-[150px] lg:min-h-[200px] ${
                day.isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="text-center mb-2 sm:mb-3">
                <h4 className={`text-sm sm:text-base font-semibold ${day.isToday ? 'text-blue-900' : 'text-gray-900'}`}>
                  {day.dayName}
                </h4>
                <p className={`text-sm ${day.isToday ? 'text-blue-700' : 'text-gray-600'}`}>
                  {day.dayNumber}
                </p>
                {day.isToday && (
                  <span className="inline-block mt-1 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                    Hôm nay
                  </span>
                )}
              </div>

              <div className="space-y-1 sm:space-y-2">
                {day.schedules.length === 0 ? (
                  <div className="text-center text-gray-400 py-4">
                    <p className="text-xs sm:text-sm">Không có lịch dạy</p>
                  </div>
                ) : (
                  day.schedules.map((schedule) => {
                    const details = getScheduleDetails(schedule);
                    return (
                      <div
                        key={schedule.id}
                        className={`p-1 sm:p-2 rounded border ${getTimeSlotColor(schedule.timeSlot)}`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-medium ${getTimeSlotTextColor(schedule.timeSlot)}`}>
                              {schedule.startTime} - {schedule.endTime}
                            </span>
                          </div>
                          <div className="text-xs text-gray-700 font-medium">
                            {details.className}
                          </div>
                          <div className="text-xs text-gray-600">
                            {details.subjectName}
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{details.teacherName}</span>
                            <span>{details.classroomName}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
