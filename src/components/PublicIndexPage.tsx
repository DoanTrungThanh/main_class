import React, { useMemo, useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { publicPageSettingsService, PublicPageSettings } from '../lib/publicPageSettingsService';
import PublicScheduleView from './PublicScheduleView';
import PublicFinanceAndAssets from './PublicFinanceAndAssets';
import PublicActivityReport from './PublicActivityReport';
import {
  Users,
  GraduationCap,
  Calendar,
  BookOpen,
  TrendingUp,
  Award,
  Target,
  BarChart3,
  PieChart,
  LogIn,
  Star,
  FileText
} from 'lucide-react';

interface PublicIndexPageProps {
  onLoginClick: () => void;
}

export default function PublicIndexPage({ onLoginClick }: PublicIndexPageProps) {
  const { students, classes, schedules, finances } = useData();
  const [showActivityReport, setShowActivityReport] = useState(false);
  const [settings, setSettings] = useState<PublicPageSettings | null>(null);

  // Load settings from Supabase
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const loadedSettings = await publicPageSettingsService.getSettings();
        setSettings(loadedSettings);
      } catch (error) {
        console.error('Error loading public page settings:', error);
        // Fallback to default settings if loading fails
        setSettings({
          centerName: 'Trung tâm ABC',
          centerSlogan: 'Giáo dục chất lượng cao',
          centerDescription: 'Chúng tôi cam kết mang đến chất lượng giáo dục tốt nhất',
          contactInfo: {
            address: '123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh',
            phone: '0123 456 789',
            email: 'info@trungtamabc.edu.vn',
            workingHours: 'Thứ 2 - Chủ nhật: 7:00 - 21:00',
          },
          colors: {
            primary: '#2563eb',
            secondary: '#10b981',
            accent: '#f59e0b',
          },
          gallery: [
            {
              title: 'Phòng học hiện đại',
              description: 'Không gian học tập thoải mái với trang thiết bị hiện đại',
              image: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400&h=300&fit=crop'
            },
            {
              title: 'Thư viện đầy đủ',
              description: 'Kho tàng kiến thức phong phú với hàng nghìn đầu sách',
              image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'
            },
            {
              title: 'Phòng thí nghiệm',
              description: 'Trang thiết bị thí nghiệm đầy đủ cho các môn khoa học',
              image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=300&fit=crop'
            }
          ]
        });
      }
    };

    loadSettings();

    // Listen for settings changes
    const handleSettingsChange = () => {
      loadSettings();
    };

    window.addEventListener('publicPageSettingsChanged', handleSettingsChange);

    return () => {
      window.removeEventListener('publicPageSettingsChanged', handleSettingsChange);
    };
  }, []);



  // Calculate statistics
  const stats = useMemo(() => {
    const activeStudents = students.filter(s => s.status === 'active');

    // Age distribution - calculate from real data
    const ageDistribution: Record<string, number> = {};

    // Calculate from real data first
    activeStudents.forEach((student) => {
      if (student.dateOfBirth) {
        try {
          const birthDate = new Date(student.dateOfBirth);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();

          // Adjust age if birthday hasn't occurred this year
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }

          if (age > 0 && age < 100) { // Reasonable age range
            ageDistribution[age] = (ageDistribution[age] || 0) + 1;
          }
        } catch (error) {
          console.error('Error calculating age for student:', student.id, error);
        }
      }
    });

    // If no real age data, add sample data for demo
    if (Object.keys(ageDistribution).length === 0) {
      ageDistribution['6'] = 8;
      ageDistribution['7'] = 12;
      ageDistribution['8'] = 15;
      ageDistribution['9'] = 10;
      ageDistribution['10'] = 7;
      ageDistribution['11'] = 5;
      ageDistribution['12'] = 2;
    }

    // Time slot distribution
    const timeSlotDistribution: Record<string, number> = {};
    if (schedules.length === 0) {
      // Sample data if no schedules
      timeSlotDistribution['morning'] = 22;
      timeSlotDistribution['afternoon'] = 55;
      timeSlotDistribution['evening'] = 8;
    } else {
      schedules.forEach(schedule => {
        const timeSlot = schedule.timeSlot || 'morning'; // Use the timeSlot field from schedule
        timeSlotDistribution[timeSlot] = (timeSlotDistribution[timeSlot] || 0) + 1;
      });

      // If no data found, add sample data
      if (Object.keys(timeSlotDistribution).length === 0) {
        timeSlotDistribution['morning'] = 22;
        timeSlotDistribution['afternoon'] = 55;
        timeSlotDistribution['evening'] = 8;
      }
    }

    // Weekly schedule with class names
    let weeklySchedule = schedules.slice(0, 10);

    // Add sample data if no schedules
    if (weeklySchedule.length === 0) {
      weeklySchedule = [
        { id: '1', startTime: '09:00', endTime: '10:30', dayOfWeek: 1, classId: 'class1', subjectId: 'math', teacherId: 'teacher1', classroomId: 'room1' },
        { id: '2', startTime: '09:00', endTime: '10:30', dayOfWeek: 2, classId: 'class2', subjectId: 'english', teacherId: 'teacher2', classroomId: 'room2' },
        { id: '3', startTime: '07:30', endTime: '09:00', dayOfWeek: 3, classId: 'class3', subjectId: 'science', teacherId: 'teacher3', classroomId: 'room3' },
        { id: '4', startTime: '17:30', endTime: '19:00', dayOfWeek: 4, classId: 'class4', subjectId: 'art', teacherId: 'teacher4', classroomId: 'room4' },
      ];
    }

    return {
      totalClasses: classes.length || 5, // Default value if no data
      totalStudents: students.length || 59, // Default value if no data
      activeStudents: activeStudents.length || 46, // Default value if no data
      averageAge: Object.keys(ageDistribution).length > 0
        ? Math.round(Object.entries(ageDistribution).reduce((sum, [age, count]) => {
            return sum + (parseInt(age) * count);
          }, 0) / Object.values(ageDistribution).reduce((sum, count) => sum + count, 0))
        : 8, // Default average age
      ageDistribution,
      timeSlotDistribution,
      weeklySchedule
    };
  }, [students, classes, schedules]);

  // Show loading state while settings are loading
  if (!settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header - Mobile Fixed */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 sm:h-16">
            {/* Logo and Title */}
            <div className="flex items-center gap-2 flex-1 min-w-0 max-w-[60%]">
              <div className="p-1 sm:p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: settings.colors.primary }}>
                <GraduationCap size={16} className="text-white sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xs sm:text-xl font-bold text-gray-900 truncate">{settings.centerName}</h1>
                <p className="text-xs text-gray-600 truncate hidden sm:block">{settings.centerSlogan}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setShowActivityReport(true)}
                className="bg-green-600 text-white px-1.5 sm:px-4 py-1 sm:py-2 rounded text-xs sm:text-sm hover:bg-green-700 transition-all flex items-center gap-1"
                title="Báo cáo hoạt động sự kiện"
              >
                <FileText size={12} className="sm:w-4 sm:h-4" />
                <span className="hidden lg:inline">Báo cáo</span>
              </button>
              <button
                onClick={onLoginClick}
                className="bg-blue-600 text-white px-1.5 sm:px-4 py-1 sm:py-2 rounded text-xs sm:text-sm hover:bg-blue-700 transition-all flex items-center gap-1"
                title="Đăng nhập hệ thống"
              >
                <LogIn size={12} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Đăng nhập</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Statistics Section - Mobile Fixed */}
      <section className="pt-4 pb-6 px-2 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-4 sm:mb-8">
            <h2 className="text-lg sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-4">Thống kê trung tâm</h2>
            <p className="text-xs sm:text-base text-gray-600">Những con số ấn tượng về hoạt động của chúng tôi</p>
          </div>

          {/* Main Statistics - Compact Mobile Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6 mb-4 sm:mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-2 sm:p-6 rounded-lg">
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1 mb-1">
                  <BookOpen size={12} className="text-blue-600 sm:w-4 sm:h-4" />
                  <p className="text-xs sm:text-sm font-medium text-blue-600">Lớp học</p>
                </div>
                <p className="text-lg sm:text-3xl font-bold text-blue-900">{stats.totalClasses}</p>
                <p className="text-xs text-blue-600">Đang hoạt động</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-2 sm:p-6 rounded-lg">
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1 mb-1">
                  <Users size={12} className="text-green-600 sm:w-4 sm:h-4" />
                  <p className="text-xs sm:text-sm font-medium text-green-600">Học viên</p>
                </div>
                <p className="text-lg sm:text-3xl font-bold text-green-900">{stats.totalStudents}</p>
                <p className="text-xs text-green-600">Đã đăng ký</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-2 sm:p-6 rounded-lg">
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1 mb-1">
                  <TrendingUp size={12} className="text-purple-600 sm:w-4 sm:h-4" />
                  <p className="text-xs sm:text-sm font-medium text-purple-600">Đang học</p>
                </div>
                <p className="text-lg sm:text-3xl font-bold text-purple-900">{stats.activeStudents}</p>
                <p className="text-xs text-purple-600">Theo học</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-2 sm:p-6 rounded-lg">
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1 mb-1">
                  <Target size={12} className="text-orange-600 sm:w-4 sm:h-4" />
                  <p className="text-xs sm:text-sm font-medium text-orange-600">Tuổi TB</p>
                </div>
                <p className="text-lg sm:text-3xl font-bold text-orange-900">{stats.averageAge}</p>
                <p className="text-xs text-orange-600">Tuổi</p>
              </div>
            </div>
          </div>

          {/* Charts Row - Compact Mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
            {/* Age Distribution */}
            <div className="bg-white p-3 sm:p-6 rounded-lg shadow border border-gray-100">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="bg-blue-100 p-1 sm:p-2 rounded">
                  <BarChart3 size={14} className="text-blue-600 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-xs sm:text-lg font-semibold text-gray-900">Phân bố độ tuổi</h3>
              </div>

              <div className="space-y-1.5 sm:space-y-3 max-h-48 sm:max-h-80 overflow-y-auto">
                {Object.entries(stats.ageDistribution)
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .map(([age, count]) => (
                    <div key={age} className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-medium text-gray-700 w-12 sm:w-16">{age} tuổi</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5 sm:h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 sm:h-3 rounded-full"
                          style={{
                            width: `${(count / Math.max(...Object.values(stats.ageDistribution))) * 100}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-gray-900 w-8 text-right">
                        {count}
                      </span>
                    </div>
                  ))}
                {Object.keys(stats.ageDistribution).length === 0 && (
                  <div className="text-center text-gray-500 py-3 sm:py-4 text-sm">
                    Chưa có dữ liệu độ tuổi
                  </div>
                )}
              </div>
            </div>

            {/* Time Slot Distribution - Compact Mobile */}
            <div className="bg-white p-3 sm:p-6 rounded-lg shadow border border-gray-100">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="bg-green-100 p-1 sm:p-2 rounded">
                  <PieChart size={14} className="text-green-600 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-xs sm:text-lg font-semibold text-gray-900">Phân bố ca học</h3>
              </div>

              <div className="space-y-2 sm:space-y-4">
                {Object.entries(stats.timeSlotDistribution).map(([timeSlot, count]) => {
                  const timeSlotNames = {
                    morning: 'Ca Sáng',
                    afternoon: 'Ca Chiều',
                    evening: 'Ca Tối'
                  };
                  const colors = {
                    morning: 'from-green-500 to-green-600',
                    afternoon: 'from-orange-500 to-orange-600',
                    evening: 'from-purple-500 to-purple-600'
                  };

                  return (
                    <div key={timeSlot} className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-medium text-gray-700 w-16 sm:w-20">
                        {timeSlotNames[timeSlot as keyof typeof timeSlotNames] || `Ca ${timeSlot}`}
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5 sm:h-3">
                        <div
                          className={`bg-gradient-to-r h-1.5 sm:h-3 rounded-full ${colors[timeSlot as keyof typeof colors] || 'from-gray-500 to-gray-600'}`}
                          style={{
                            width: `${(count / Math.max(...Object.values(stats.timeSlotDistribution))) * 100}%`
                          }}
                          ></div>
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-gray-900 w-8 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
                {Object.keys(stats.timeSlotDistribution).length === 0 && (
                  <div className="text-center text-gray-500 py-3 sm:py-4 text-sm">
                    Chưa có dữ liệu ca học
                  </div>
                )}
              </div>
            </div>


          </div>
        </div>
      </section>

      {/* Schedule Section - Mobile Optimized */}
      <section className="py-8 sm:py-12 px-3 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <PublicScheduleView />
        </div>
      </section>

      {/* Gallery Section - Mobile Optimized */}
      <section className="py-8 sm:py-12 px-3 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6 sm:mb-12">
            <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">Hình ảnh trung tâm</h2>
            <p className="text-sm sm:text-base text-gray-600">Khám phá không gian học tập hiện đại và thân thiện của chúng tôi</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {settings.gallery.map((item, index) => (
              <div key={index} className="bg-white rounded-lg sm:rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative h-32 sm:h-48 bg-gray-200">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#e5e7eb"/><text x="200" y="150" text-anchor="middle" dy="0.3em" fill="#6b7280" font-family="Arial" font-size="16">${item.title}</text></svg>`)}`;
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 hover:bg-opacity-10 transition-all duration-300"></div>
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2 line-clamp-1">{item.title}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Finance and Assets Section - Mobile Optimized */}
      <section className="py-8 sm:py-12 px-3 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <PublicFinanceAndAssets />
        </div>
      </section>

      {/* Activity Report Modal */}
      {showActivityReport && (
        <PublicActivityReport onClose={() => setShowActivityReport(false)} />
      )}
    </div>
  );
}
