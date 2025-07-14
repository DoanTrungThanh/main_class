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
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: settings.colors.primary }}>
                <GraduationCap size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{settings.centerName}</h1>
                <p className="text-xs text-gray-600">{settings.centerSlogan}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowActivityReport(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
              >
                <FileText size={18} />
                Báo cáo hoạt động sự kiện
              </button>
              <button
                onClick={onLoginClick}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                <LogIn size={16} />
                Đăng nhập
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Statistics Section */}
      <section className="pt-8 pb-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Thống kê trung tâm</h2>
            <p className="text-gray-600">Những con số ấn tượng về hoạt động của chúng tôi</p>
          </div>

          {/* Main Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Tổng số lớp học</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.totalClasses}</p>
                  <p className="text-xs text-blue-600 mt-1">Đang hoạt động</p>
                </div>
                <div className="bg-blue-600 p-3 rounded-lg">
                  <BookOpen size={24} className="text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Tổng học viên</p>
                  <p className="text-3xl font-bold text-green-900">{stats.totalStudents}</p>
                  <p className="text-xs text-green-600 mt-1">Đã đăng ký</p>
                </div>
                <div className="bg-green-600 p-3 rounded-lg">
                  <Users size={24} className="text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Học viên đang học</p>
                  <p className="text-3xl font-bold text-purple-900">{stats.activeStudents}</p>
                  <p className="text-xs text-purple-600 mt-1">Đang theo học</p>
                </div>
                <div className="bg-purple-600 p-3 rounded-lg">
                  <TrendingUp size={24} className="text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Độ tuổi trung bình</p>
                  <p className="text-3xl font-bold text-orange-900">{stats.averageAge}</p>
                  <p className="text-xs text-orange-600 mt-1">Tuổi</p>
                </div>
                <div className="bg-orange-600 p-3 rounded-lg">
                  <Target size={24} className="text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Age Distribution */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <BarChart3 size={20} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Phân bố độ tuổi học viên</h3>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {Object.entries(stats.ageDistribution)
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .map(([age, count]) => (
                    <div key={age} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{age} tuổi</span>
                      <div className="flex items-center gap-3 flex-1 ml-4">
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                            style={{
                              width: `${(count / Math.max(...Object.values(stats.ageDistribution))) * 100}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                          {count} HS
                        </span>
                      </div>
                    </div>
                  ))}
                {Object.keys(stats.ageDistribution).length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    Chưa có dữ liệu độ tuổi
                  </div>
                )}
              </div>
            </div>

            {/* Time Slot Distribution */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-green-100 p-2 rounded-lg">
                  <PieChart size={20} className="text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Phân bố ca học</h3>
              </div>

              <div className="space-y-4">
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
                    <div key={timeSlot} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {timeSlotNames[timeSlot as keyof typeof timeSlotNames] || `Ca ${timeSlot}`}
                      </span>
                      <div className="flex items-center gap-3 flex-1 ml-4">
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div
                            className={`bg-gradient-to-r h-3 rounded-full ${colors[timeSlot as keyof typeof colors] || 'from-gray-500 to-gray-600'}`}
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
                  );
                })}
                {Object.keys(stats.timeSlotDistribution).length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    Chưa có dữ liệu ca học
                  </div>
                )}
              </div>
            </div>


          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <PublicScheduleView />
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Hình ảnh trung tâm</h2>
            <p className="text-gray-600">Khám phá không gian học tập hiện đại và thân thiện của chúng tôi</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {settings.gallery.map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative h-48 bg-gray-200">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://via.placeholder.com/400x300/e5e7eb/6b7280?text=${encodeURIComponent(item.title)}`;
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 hover:bg-opacity-10 transition-all duration-300"></div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Finance and Assets Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
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
