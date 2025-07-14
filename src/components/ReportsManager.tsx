import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../constants/permissions';
import {
  BarChart3,
  Calendar,
  Users,
  BookOpen,
  UserCheck,
  TrendingUp,
  Download,
  Filter,
  PieChart,
} from 'lucide-react';
import { exportStudents, exportClasses, exportSchedules, exportAttendance, exportGrades, exportFinances } from '../lib/excelExport';

export default function ReportsManager() {
  const { students, classes, schedules, attendance, finances, subjects, grades, gradeColumns } = useData();
  const { user, users } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<string>('');

  // Kiểm tra quyền dựa trên permissions
  const userPermissions = user?.permissions || [];
  const userRole = user?.role;
  const canViewReports = hasPermission(userPermissions, 'reports.view', userRole);
  const canCreateReports = hasPermission(userPermissions, 'reports.create', userRole);
  const canEditReports = hasPermission(userPermissions, 'reports.edit', userRole);
  const canDeleteReports = hasPermission(userPermissions, 'reports.delete', userRole);

  const getAttendanceStats = () => {
    const startDate = selectedPeriod === 'week' 
      ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : selectedPeriod === 'month'
      ? `${selectedMonth}-01`
      : new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];

    const endDate = selectedPeriod === 'week'
      ? new Date().toISOString().split('T')[0]
      : selectedPeriod === 'month'
      ? `${selectedMonth}-31`
      : new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0];

    const periodAttendance = attendance.filter(a => {
      const schedule = schedules.find(s => s.id === a.scheduleId);
      return schedule && schedule.date >= startDate && schedule.date <= endDate;
    });

    const totalSessions = schedules.filter(s => s.date >= startDate && s.date <= endDate).length;
    const presentCount = periodAttendance.filter(a => a.status === 'present').length;
    const absentCount = periodAttendance.filter(a => a.status === 'absent').length;
    const lateCount = periodAttendance.filter(a => a.status === 'late').length;

    return {
      totalSessions,
      present: presentCount,
      absent: absentCount,
      late: lateCount,
      attendanceRate: totalSessions > 0 ? Math.round((presentCount / (presentCount + absentCount + lateCount)) * 100) : 0,
    };
  };

  const getFinanceStats = () => {
    const startDate = selectedPeriod === 'week' 
      ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : selectedPeriod === 'month'
      ? `${selectedMonth}-01`
      : new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];

    const endDate = selectedPeriod === 'week'
      ? new Date().toISOString().split('T')[0]
      : selectedPeriod === 'month'
      ? `${selectedMonth}-31`
      : new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0];

    const periodFinances = finances.filter(f => f.date >= startDate && f.date <= endDate);
    
    const income = periodFinances.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0);
    const expense = periodFinances.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0);

    return {
      income,
      expense,
      profit: income - expense,
    };
  };

  const getClassStats = () => {
    return classes.map(cls => {
      const classSchedules = schedules.filter(s => s.classId === cls.id);
      const classAttendance = attendance.filter(a => {
        const schedule = schedules.find(s => s.id === a.scheduleId);
        return schedule && schedule.classId === cls.id;
      });

      const presentCount = classAttendance.filter(a => a.status === 'present').length;
      const totalAttendance = classAttendance.length;

      return {
        name: cls.name,
        studentCount: students.filter(s => cls.studentIds.includes(s.id) && s.status === 'active').length,
        sessionCount: classSchedules.length,
        attendanceRate: totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0,
      };
    });
  };

  const attendanceStats = getAttendanceStats();
  const financeStats = getFinanceStats();
  const classStats = getClassStats();

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'week':
        return 'tuần này';
      case 'month':
        return `tháng ${selectedMonth.split('-')[1]}/${selectedMonth.split('-')[0]}`;
      case 'year':
        return `năm ${new Date().getFullYear()}`;
      default:
        return '';
    }
  };

  const handleExport = async (type: string) => {
    try {
      setIsExporting(true);
      setExportType(type);
      
      const startDate = selectedPeriod === 'week' 
        ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : selectedPeriod === 'month'
        ? `${selectedMonth}-01`
        : new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];

      const endDate = selectedPeriod === 'week'
        ? new Date().toISOString().split('T')[0]
        : selectedPeriod === 'month'
        ? `${selectedMonth}-31`
        : new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0];
      
      switch (type) {
        case 'students':
          await exportStudents(students, classes);
          break;
        case 'classes':
          await exportClasses(classes, students, subjects);
          break;
        case 'schedules':
          await exportSchedules(schedules, classes, [], users, subjects, startDate, endDate);
          break;
        case 'attendance':
          await exportAttendance(attendance, schedules, classes, students, startDate, endDate);
          break;
        case 'grades':
          await exportGrades(grades, gradeColumns, students, classes, subjects);
          break;
        case 'finances':
          await exportFinances(finances, startDate, endDate);
          break;
        default:
          break;
      }
      
      toast.success('Xuất dữ liệu thành công!');
    } catch (error) {
      console.error(`Error exporting ${type}:`, error);
      toast.error('Có lỗi xảy ra khi xuất dữ liệu!');
    } finally {
      setIsExporting(false);
      setExportType('');
    }
  };

  // Kiểm tra quyền xem báo cáo
  if (!canViewReports) {
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
          <h1 className="text-3xl font-bold text-gray-900">Báo cáo thống kê</h1>
          <p className="text-gray-600 mt-1">
            Tổng quan hoạt động và hiệu quả của trung tâm
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">Tuần này</option>
            <option value="month">Theo tháng</option>
            <option value="year">Năm này</option>
          </select>
          
          {selectedPeriod === 'month' && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}
        </div>
      </div>

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng học sinh</p>
              <p className="text-2xl font-bold text-blue-600">{students.length}</p>
              <p className="text-xs text-gray-500 mt-1">Đang hoạt động</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <Users size={24} className="text-blue-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => handleExport('students')}
              disabled={isExporting && exportType === 'students'}
              className="w-full bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Download size={16} />
              {isExporting && exportType === 'students' ? 'Đang xuất...' : 'Xuất Excel'}
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Lớp học</p>
              <p className="text-2xl font-bold text-green-600">{classes.length}</p>
              <p className="text-xs text-gray-500 mt-1">Đang dạy</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <BookOpen size={24} className="text-green-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => handleExport('classes')}
              disabled={isExporting && exportType === 'classes'}
              className="w-full bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Download size={16} />
              {isExporting && exportType === 'classes' ? 'Đang xuất...' : 'Xuất Excel'}
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Buổi học {getPeriodLabel()}</p>
              <p className="text-2xl font-bold text-orange-600">{attendanceStats.totalSessions}</p>
              <p className="text-xs text-gray-500 mt-1">Đã thực hiện</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-100">
              <Calendar size={24} className="text-orange-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => handleExport('schedules')}
              disabled={isExporting && exportType === 'schedules'}
              className="w-full bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Download size={16} />
              {isExporting && exportType === 'schedules' ? 'Đang xuất...' : 'Xuất Excel'}
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tỉ lệ có mặt</p>
              <p className="text-2xl font-bold text-purple-600">{attendanceStats.attendanceRate}%</p>
              <p className="text-xs text-gray-500 mt-1">{getPeriodLabel()}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <UserCheck size={24} className="text-purple-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => handleExport('attendance')}
              disabled={isExporting && exportType === 'attendance'}
              className="w-full bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Download size={16} />
              {isExporting && exportType === 'attendance' ? 'Đang xuất...' : 'Xuất Excel'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Thống kê điểm danh */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <UserCheck size={20} />
              Thống kê điểm danh {getPeriodLabel()}
            </h3>
            <button
              onClick={() => handleExport('attendance')}
              disabled={isExporting && exportType === 'attendance'}
              className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center gap-2 text-sm"
            >
              <Download size={16} />
              {isExporting && exportType === 'attendance' ? 'Đang xuất...' : 'Xuất Excel'}
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Có mặt</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-green-600">{attendanceStats.present}</span>
                <span className="text-sm text-gray-500 ml-2">
                  ({attendanceStats.present + attendanceStats.absent + attendanceStats.late > 0 
                    ? Math.round((attendanceStats.present / (attendanceStats.present + attendanceStats.absent + attendanceStats.late)) * 100)
                    : 0}%)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-700">Vắng mặt</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-red-600">{attendanceStats.absent}</span>
                <span className="text-sm text-gray-500 ml-2">
                  ({attendanceStats.present + attendanceStats.absent + attendanceStats.late > 0 
                    ? Math.round((attendanceStats.absent / (attendanceStats.present + attendanceStats.absent + attendanceStats.late)) * 100)
                    : 0}%)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-700">Đi muộn</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-yellow-600">{attendanceStats.late}</span>
                <span className="text-sm text-gray-500 ml-2">
                  ({attendanceStats.present + attendanceStats.absent + attendanceStats.late > 0 
                    ? Math.round((attendanceStats.late / (attendanceStats.present + attendanceStats.absent + attendanceStats.late)) * 100)
                    : 0}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Thống kê tài chính */}
        {user?.role === 'admin' && (
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp size={20} />
                Thống kê tài chính {getPeriodLabel()}
              </h3>
              <button
                onClick={() => handleExport('finances')}
                disabled={isExporting && exportType === 'finances'}
                className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center gap-2 text-sm"
              >
                <Download size={16} />
                {isExporting && exportType === 'finances' ? 'Đang xuất...' : 'Xuất Excel'}
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Tổng thu</span>
                </div>
                <span className="font-semibold text-green-600">
                  {financeStats.income.toLocaleString('vi-VN')} VNĐ
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-gray-700">Tổng chi</span>
                </div>
                <span className="font-semibold text-red-600">
                  {financeStats.expense.toLocaleString('vi-VN')} VNĐ
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-t-2 border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">Lợi nhuận</span>
                </div>
                <span className={`font-bold ${financeStats.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {financeStats.profit.toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Thống kê theo lớp */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 size={20} />
            Thống kê theo lớp học
          </h3>
          <button
            onClick={() => handleExport('classes')}
            disabled={isExporting && exportType === 'classes'}
            className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center gap-2 text-sm"
          >
            <Download size={16} />
            {isExporting && exportType === 'classes' ? 'Đang xuất...' : 'Xuất Excel'}
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Lớp học</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Số học sinh</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Số buổi học</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tỉ lệ có mặt</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Đánh giá</th>
              </tr>
            </thead>
            <tbody>
              {classStats.map((cls, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{cls.name}</td>
                  <td className="py-3 px-4">{cls.studentCount}</td>
                  <td className="py-3 px-4">{cls.sessionCount}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${cls.attendanceRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{cls.attendanceRate}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      cls.attendanceRate >= 90 ? 'bg-green-100 text-green-800' :
                      cls.attendanceRate >= 75 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {cls.attendanceRate >= 90 ? 'Xuất sắc' :
                       cls.attendanceRate >= 75 ? 'Tốt' : 'Cần cải thiện'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {classStats.length === 0 && (
          <div className="text-center py-8">
            <PieChart className="mx-auto mb-4 text-gray-300" size={48} />
            <p className="text-gray-500">Chưa có dữ liệu thống kê</p>
          </div>
        )}
      </div>

      {/* Xuất dữ liệu */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Download size={20} />
          Xuất dữ liệu
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Danh sách học sinh</h4>
              <Users size={20} className="text-blue-600" />
            </div>
            <p className="text-sm text-gray-600 mb-4">Xuất danh sách tất cả học sinh và thông tin chi tiết</p>
            <button
              onClick={() => handleExport('students')}
              disabled={isExporting && exportType === 'students'}
              className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <Download size={16} />
              {isExporting && exportType === 'students' ? 'Đang xuất...' : 'Xuất Excel'}
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Danh sách lớp học</h4>
              <BookOpen size={20} className="text-green-600" />
            </div>
            <p className="text-sm text-gray-600 mb-4">Xuất danh sách lớp học và học sinh trong từng lớp</p>
            <button
              onClick={() => handleExport('classes')}
              disabled={isExporting && exportType === 'classes'}
              className="w-full bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2"
            >
              <Download size={16} />
              {isExporting && exportType === 'classes' ? 'Đang xuất...' : 'Xuất Excel'}
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Lịch dạy</h4>
              <Calendar size={20} className="text-orange-600" />
            </div>
            <p className="text-sm text-gray-600 mb-4">Xuất lịch dạy theo khoảng thời gian đã chọn</p>
            <button
              onClick={() => handleExport('schedules')}
              disabled={isExporting && exportType === 'schedules'}
              className="w-full bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 transition-all flex items-center justify-center gap-2"
            >
              <Download size={16} />
              {isExporting && exportType === 'schedules' ? 'Đang xuất...' : 'Xuất Excel'}
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Điểm danh</h4>
              <UserCheck size={20} className="text-purple-600" />
            </div>
            <p className="text-sm text-gray-600 mb-4">Xuất dữ liệu điểm danh theo khoảng thời gian</p>
            <button
              onClick={() => handleExport('attendance')}
              disabled={isExporting && exportType === 'attendance'}
              className="w-full bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
            >
              <Download size={16} />
              {isExporting && exportType === 'attendance' ? 'Đang xuất...' : 'Xuất Excel'}
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Bảng điểm</h4>
              <BarChart3 size={20} className="text-indigo-600" />
            </div>
            <p className="text-sm text-gray-600 mb-4">Xuất bảng điểm của tất cả lớp học</p>
            <button
              onClick={() => handleExport('grades')}
              disabled={isExporting && exportType === 'grades'}
              className="w-full bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              <Download size={16} />
              {isExporting && exportType === 'grades' ? 'Đang xuất...' : 'Xuất Excel'}
            </button>
          </div>
          
          {user?.role === 'admin' && (
            <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Tài chính</h4>
                <TrendingUp size={20} className="text-pink-600" />
              </div>
              <p className="text-sm text-gray-600 mb-4">Xuất báo cáo tài chính theo khoảng thời gian</p>
              <button
                onClick={() => handleExport('finances')}
                disabled={isExporting && exportType === 'finances'}
                className="w-full bg-pink-600 text-white px-3 py-2 rounded-lg hover:bg-pink-700 transition-all flex items-center justify-center gap-2"
              >
                <Download size={16} />
                {isExporting && exportType === 'finances' ? 'Đang xuất...' : 'Xuất Excel'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}