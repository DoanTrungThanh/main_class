import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  GraduationCap,
  Calendar,
  Clock,
  BookOpen,
  TrendingUp,
  Award,
  Target,
  BarChart3,
  PieChart,
} from 'lucide-react';

export default function HomePage() {
  const { students, classes, schedules } = useData();
  const { user } = useAuth();

  // Calculate statistics
  const stats = useMemo(() => {
    // Total classes
    const totalClasses = classes.length;

    // Age distribution
    const ageDistribution = students.reduce((acc, student) => {
      if (student.dateOfBirth) {
        const age = new Date().getFullYear() - new Date(student.dateOfBirth).getFullYear();
        acc[age] = (acc[age] || 0) + 1;
      }
      return acc;
    }, {} as Record<number, number>);

    // Weekly schedule hours
    const weeklyHours = schedules.reduce((acc, schedule) => {
      const startTime = new Date(`2000-01-01 ${schedule.startTime}`);
      const endTime = new Date(`2000-01-01 ${schedule.endTime}`);
      const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60); // hours
      return acc + duration;
    }, 0);

    // Active students (status = 'active')
    const activeStudents = students.filter(s => s.status === 'active').length;

    // Classes by time slot
    const timeSlotDistribution = schedules.reduce((acc, schedule) => {
      acc[schedule.timeSlot] = (acc[schedule.timeSlot] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalClasses,
      totalStudents: students.length,
      activeStudents,
      ageDistribution,
      weeklyHours,
      timeSlotDistribution,
    };
  }, [students, classes, schedules]);

  const getTimeSlotLabel = (timeSlot: string) => {
    switch (timeSlot) {
      case 'morning': return 'Sáng';
      case 'afternoon': return 'Trưa';
      case 'evening': return 'Chiều';
      default: return timeSlot;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Chào mừng, {user?.name || 'Admin'}!
            </h1>
            <p className="text-blue-100">
              Tổng quan hệ thống quản lý lớp học
            </p>
          </div>
          <div className="bg-white bg-opacity-20 p-4 rounded-lg">
            <GraduationCap size={48} />
          </div>
        </div>
      </div>

      {/* Main Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng số lớp</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalClasses}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <BookOpen size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng học viên</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Users size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Học viên đang học</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeStudents}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp size={24} className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Giờ học/tuần</p>
              <p className="text-3xl font-bold text-gray-900">{stats.weeklyHours.toFixed(1)}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Clock size={24} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-2 rounded-lg">
              <BarChart3 size={20} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Phân bố độ tuổi học viên</h3>
          </div>
          
          <div className="space-y-4">
            {Object.entries(stats.ageDistribution)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([age, count]) => (
                <div key={age} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{age} tuổi</span>
                  <div className="flex items-center gap-3 flex-1 ml-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(count / Math.max(...Object.values(stats.ageDistribution))) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Time Slot Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 p-2 rounded-lg">
              <PieChart size={20} className="text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Thời gian học trong tuần</h3>
          </div>
          
          <div className="space-y-4">
            {Object.entries(stats.timeSlotDistribution).map(([timeSlot, count]) => (
              <div key={timeSlot} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Ca {getTimeSlotLabel(timeSlot)}
                </span>
                <div className="flex items-center gap-3 flex-1 ml-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${(count / Math.max(...Object.values(stats.timeSlotDistribution))) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-left">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Users size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Quản lý học sinh</p>
                <p className="text-sm text-gray-600">Thêm, sửa thông tin học sinh</p>
              </div>
            </div>
          </button>

          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-left">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Calendar size={20} className="text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Lịch dạy</p>
                <p className="text-sm text-gray-600">Xem và quản lý lịch dạy</p>
              </div>
            </div>
          </button>

          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-left">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Award size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Quản lý điểm</p>
                <p className="text-sm text-gray-600">Nhập và theo dõi điểm số</p>
              </div>
            </div>
          </button>

          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-left">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Target size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Báo cáo</p>
                <p className="text-sm text-gray-600">Xem báo cáo và thống kê</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
