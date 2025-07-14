import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  Info,
  AlertTriangle,
  CheckCircle,
  X,
  FileText,
  HardDrive,
  Calendar,
  Users,
  BookOpen,
  UserCheck,
  DollarSign,
  Package,
  Bell,
  UserPlus,
  Award,
  BarChart3,
  Trash2,
  RotateCcw,
  Wifi,
  WifiOff,
  Server,
} from 'lucide-react';

export default function DatabaseManager() {
  const { 
    exportDatabase, 
    importDatabase, 
    resetDatabase, 
    getDatabaseInfo,
    isLoading,
    error,
    refreshData,
  } = useData();
  const { user } = useAuth();
  const toast = useToastContext();
  const [showModal, setShowModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [dbInfo, setDbInfo] = useState<any>(null);

  const canManageDatabase = user?.role === 'admin';

  // Load database info
  React.useEffect(() => {
    const loadDbInfo = async () => {
      try {
        const info = await getDatabaseInfo();
        setDbInfo(info);
      } catch (err) {
        console.error('Error loading database info:', err);
      }
    };

    if (canManageDatabase) {
      loadDbInfo();
    }
  }, [canManageDatabase, getDatabaseInfo]);

  const handleExport = async () => {
    try {
      await exportDatabase();
      toast.success('Xuất cơ sở dữ liệu thành công!');
    } catch (error) {
      console.error('Error exporting database:', error);
      toast.error('Có lỗi xảy ra khi xuất cơ sở dữ liệu!');
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error('Vui lòng chọn file để import!');
      return;
    }

    setIsImporting(true);
    try {
      const success = await importDatabase(importFile);
      if (success) {
        toast.success('Import cơ sở dữ liệu thành công!');
        setShowModal(false);
        setImportFile(null);
        // Refresh database info
        const info = await getDatabaseInfo();
        setDbInfo(info);
      } else {
        toast.error('Import thất bại! Vui lòng kiểm tra định dạng file.');
      }
    } catch (error) {
      console.error('Error importing database:', error);
      toast.error('Có lỗi xảy ra khi import cơ sở dữ liệu!');
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = async () => {
    try {
      await resetDatabase();
      toast.success('Reset cơ sở dữ liệu thành công!');
      setShowResetConfirm(false);
      // Refresh database info
      const info = await getDatabaseInfo();
      setDbInfo(info);
    } catch (error) {
      console.error('Error resetting database:', error);
      toast.error('Có lỗi xảy ra khi reset cơ sở dữ liệu!');
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshData();
      const info = await getDatabaseInfo();
      setDbInfo(info);
      toast.success('Làm mới dữ liệu thành công!');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Có lỗi xảy ra khi làm mới dữ liệu!');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        setImportFile(file);
      } else {
        toast.error('Vui lòng chọn file JSON!');
        e.target.value = '';
      }
    }
  };

  if (!canManageDatabase) {
    return (
      <div className="text-center py-8">
        <Database className="mx-auto mb-4 text-gray-300" size={48} />
        <p className="text-gray-500">Bạn không có quyền truy cập chức năng này</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý cơ sở dữ liệu</h1>
          <p className="text-gray-600 mt-1">
            Sao lưu, khôi phục và quản lý dữ liệu hệ thống với Supabase
          </p>
        </div>
        <div className="flex items-center gap-3 animate-fade-in-delay">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 hover:scale-105 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 transform hover:shadow-lg"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : 'hover:rotate-180 transition-transform duration-300'} />
            Làm mới
          </button>
          <button
            onClick={handleExport}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 hover:scale-105 transition-all duration-300 flex items-center gap-2 transform hover:shadow-lg"
          >
            <Download size={20} className="hover:animate-bounce" />
            Xuất dữ liệu
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 hover:scale-105 transition-all duration-300 flex items-center gap-2 transform hover:shadow-lg"
          >
            <Upload size={20} className="hover:animate-bounce" />
            Nhập dữ liệu
          </button>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 hover:scale-105 transition-all duration-300 flex items-center gap-2 transform hover:shadow-lg"
          >
            <RotateCcw size={20} className="hover:rotate-180 transition-transform duration-300" />
            Reset
          </button>
        </div>
      </div>

      {/* Connection Status */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 animate-fade-in">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 animate-slide-in-left">
          <Server size={20} className="animate-pulse-slow" />
          Trạng thái kết nối
        </h3>

        <div className="flex items-center gap-4 animate-slide-in-right">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transform hover:scale-105 transition-all duration-300 ${
            error ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}>
            {error ? <WifiOff size={16} className="animate-pulse" /> : <Wifi size={16} className="animate-pulse-slow" />}
            <span className="font-medium">
              {error ? 'Mất kết nối' : 'Đã kết nối'}
            </span>
          </div>

          <div className="text-sm text-gray-600 animate-fade-in-delay">
            {error ? (
              <span>Đang sử dụng dữ liệu cục bộ</span>
            ) : (
              <span>Kết nối với Supabase thành công</span>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Lưu ý:</p>
                <p>Hệ thống đang hoạt động ở chế độ offline. Dữ liệu sẽ được đồng bộ khi kết nối được khôi phục.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Database Information */}
      {dbInfo && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 animate-fade-in-delay transform hover:shadow-lg transition-all duration-300">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 animate-slide-in-left">
            <Info size={20} className="animate-bounce-slow" />
            Thông tin cơ sở dữ liệu
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-in-up" style={{animationDelay: '0.1s'}}>
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-blue-600 animate-bounce-slow" />
                <span className="text-sm font-medium text-blue-900">Học sinh</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 animate-number-count">{dbInfo.totalStudents}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-in-up" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={16} className="text-green-600 animate-bounce-slow" />
                <span className="text-sm font-medium text-green-900">Lớp học</span>
              </div>
              <p className="text-2xl font-bold text-green-600 animate-number-count">{dbInfo.totalClasses}</p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-in-up" style={{animationDelay: '0.3s'}}>
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={16} className="text-orange-600 animate-bounce-slow" />
                <span className="text-sm font-medium text-orange-900">Lịch dạy</span>
              </div>
              <p className="text-2xl font-bold text-orange-600 animate-number-count">{dbInfo.totalSchedules}</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-in-up" style={{animationDelay: '0.4s'}}>
              <div className="flex items-center gap-2 mb-2">
                <UserCheck size={16} className="text-purple-600 animate-bounce-slow" />
                <span className="text-sm font-medium text-purple-900">Điểm danh</span>
              </div>
              <p className="text-2xl font-bold text-purple-600 animate-number-count">{dbInfo.totalAttendance}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-yellow-50 p-4 rounded-lg transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-in-up" style={{animationDelay: '0.5s'}}>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={16} className="text-yellow-600 animate-bounce-slow" />
                <span className="text-sm font-medium text-yellow-900">Tài chính</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600 animate-number-count">{dbInfo.totalFinances}</p>
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-in-up" style={{animationDelay: '0.6s'}}>
              <div className="flex items-center gap-2 mb-2">
                <Package size={16} className="text-indigo-600 animate-bounce-slow" />
                <span className="text-sm font-medium text-indigo-900">Tài sản</span>
              </div>
              <p className="text-2xl font-bold text-indigo-600 animate-number-count">{dbInfo.totalAssets}</p>
            </div>

            <div className="bg-pink-50 p-4 rounded-lg transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-in-up" style={{animationDelay: '0.7s'}}>
              <div className="flex items-center gap-2 mb-2">
                <Bell size={16} className="text-pink-600 animate-bounce-slow" />
                <span className="text-sm font-medium text-pink-900">Thông báo</span>
              </div>
              <p className="text-2xl font-bold text-pink-600 animate-number-count">{dbInfo.totalNotifications}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-in-up" style={{animationDelay: '0.8s'}}>
              <div className="flex items-center gap-2 mb-2">
                <HardDrive size={16} className="text-gray-600 animate-pulse-slow" />
                <span className="text-sm font-medium text-gray-900">Dung lượng DB</span>
              </div>
              <p className="text-2xl font-bold text-gray-600 animate-number-count">
                {dbInfo.databaseSize ? `${dbInfo.databaseSize} MB` : 'N/A'}
              </p>
            </div>

            <div className="bg-teal-50 p-4 rounded-lg transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-in-up" style={{animationDelay: '0.9s'}}>
              <div className="flex items-center gap-2 mb-2">
                <UserPlus size={16} className="text-teal-600 animate-bounce-slow" />
                <span className="text-sm font-medium text-teal-900">Người dùng</span>
              </div>
              <p className="text-2xl font-bold text-teal-600 animate-number-count">{dbInfo.totalUsers}</p>
            </div>
          </div>

          {/* Grade management stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-emerald-50 p-4 rounded-lg transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-in-up" style={{animationDelay: '1.0s'}}>
              <div className="flex items-center gap-2 mb-2">
                <Award size={16} className="text-emerald-600 animate-bounce-slow" />
                <span className="text-sm font-medium text-emerald-900">Đợt điểm</span>
              </div>
              <p className="text-2xl font-bold text-emerald-600 animate-number-count">{dbInfo.totalGradePeriods}</p>
            </div>

            <div className="bg-cyan-50 p-4 rounded-lg transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-in-up" style={{animationDelay: '1.1s'}}>
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 size={16} className="text-cyan-600 animate-bounce-slow" />
                <span className="text-sm font-medium text-cyan-900">Cột điểm</span>
              </div>
              <p className="text-2xl font-bold text-cyan-600 animate-number-count">{dbInfo.totalGradeColumns}</p>
            </div>

            <div className="bg-violet-50 p-4 rounded-lg transform hover:scale-105 transition-all duration-300 hover:shadow-lg animate-slide-in-up" style={{animationDelay: '1.2s'}}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={16} className="text-violet-600 animate-bounce-slow" />
                <span className="text-sm font-medium text-violet-900">Điểm số</span>
              </div>
              <p className="text-2xl font-bold text-violet-600 animate-number-count">{dbInfo.totalGrades}</p>
            </div>
          </div>

          {/* Database Size Details */}
          <div className="pt-4 border-t border-gray-200 animate-slide-in-up">
            <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2 animate-fade-in-delay">
              <HardDrive size={18} className="animate-bounce-slow" />
              Chi tiết dung lượng
            </h4>

            <div className="bg-gray-50 p-4 rounded-lg mb-4 transform hover:scale-[1.02] transition-all duration-300 hover:shadow-md animate-fade-in-delay-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 animate-slide-in-left">Tổng dung lượng ước tính</span>
                <div className="flex items-center gap-2 animate-slide-in-right">
                  <span className="text-lg font-bold text-gray-900 animate-number-count">
                    {dbInfo.databaseSize} MB
                  </span>
                  <div className={`w-3 h-3 rounded-full animate-pulse-slow ${
                    dbInfo.databaseSize < 10 ? 'bg-green-500' :
                    dbInfo.databaseSize < 50 ? 'bg-yellow-500' :
                    dbInfo.databaseSize < 100 ? 'bg-orange-500' : 'bg-red-500'
                  }`}></div>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-1000 ease-out animate-progress-fill ${
                    dbInfo.databaseSize < 10 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                    dbInfo.databaseSize < 50 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                    dbInfo.databaseSize < 100 ? 'bg-gradient-to-r from-orange-400 to-orange-600' : 'bg-gradient-to-r from-red-400 to-red-600'
                  }`}
                  style={{
                    width: `${Math.min((dbInfo.databaseSize / 100) * 100, 100)}%`,
                    animation: 'progressFill 1.5s ease-out'
                  }}
                ></div>
              </div>

              <div className="flex justify-between text-xs text-gray-500 mt-2 animate-fade-in-delay-3">
                <span className="animate-slide-in-left">0 MB</span>
                <span className="flex items-center gap-1 animate-slide-in-right">
                  <span>100 MB</span>
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium transform hover:scale-110 transition-all duration-200 animate-bounce-in ${
                    dbInfo.databaseSize < 10 ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                    dbInfo.databaseSize < 50 ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' :
                    dbInfo.databaseSize < 100 ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}>
                    {dbInfo.databaseSize < 10 ? 'Tốt' :
                     dbInfo.databaseSize < 50 ? 'Bình thường' :
                     dbInfo.databaseSize < 100 ? 'Cao' : 'Rất cao'}
                  </span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded transform hover:scale-105 transition-all duration-300 hover:shadow-md animate-slide-in-up" style={{animationDelay: '0.1s'}}>
                <span className="text-blue-700">Học sinh</span>
                <span className="font-medium text-blue-900 animate-number-count">{dbInfo.totalStudents}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-green-50 rounded transform hover:scale-105 transition-all duration-300 hover:shadow-md animate-slide-in-up" style={{animationDelay: '0.2s'}}>
                <span className="text-green-700">Lịch dạy</span>
                <span className="font-medium text-green-900 animate-number-count">{dbInfo.totalSchedules}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-orange-50 rounded transform hover:scale-105 transition-all duration-300 hover:shadow-md animate-slide-in-up" style={{animationDelay: '0.3s'}}>
                <span className="text-orange-700">Điểm danh</span>
                <span className="font-medium text-orange-900 animate-number-count">{dbInfo.totalAttendance}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-purple-50 rounded transform hover:scale-105 transition-all duration-300 hover:shadow-md animate-slide-in-up" style={{animationDelay: '0.4s'}}>
                <span className="text-purple-700">Tài chính</span>
                <span className="font-medium text-purple-900 animate-number-count">{dbInfo.totalFinances}</span>
              </div>
            </div>

            <div className="mt-3 p-3 bg-blue-50 rounded-lg transform hover:scale-[1.02] transition-all duration-300 hover:shadow-sm animate-fade-in-delay-4">
              <div className="flex items-start gap-2">
                <Info size={14} className="text-blue-600 mt-0.5 animate-pulse-slow" />
                <div className="text-xs text-blue-800 animate-slide-in-left">
                  <p className="font-medium mb-1">Lưu ý về dung lượng:</p>
                  <p>Dung lượng được tính dựa trên kích thước dữ liệu JSON ước tính. Dung lượng thực tế trên Supabase có thể khác do cách lưu trữ và index của PostgreSQL.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={16} />
                <span className="text-sm">
                  Cập nhật lần cuối: {new Date(dbInfo.lastUpdated).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Database size={16} />
                <span className="text-sm">
                  Phiên bản: {dbInfo.version || '2.0.0'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Usage Instructions */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText size={20} />
          Hướng dẫn sử dụng
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
            <CheckCircle size={20} className="text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900 mb-1">Xuất dữ liệu</h4>
              <p className="text-sm text-green-800">
                Tải xuống toàn bộ dữ liệu từ Supabase dưới dạng file JSON để sao lưu.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <Upload size={20} className="text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Nhập dữ liệu</h4>
              <p className="text-sm text-blue-800">
                Khôi phục dữ liệu từ file JSON đã xuất trước đó. Dữ liệu hiện tại sẽ bị ghi đè.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
            <RefreshCw size={20} className="text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-900 mb-1">Reset dữ liệu</h4>
              <p className="text-sm text-orange-800">
                Xóa toàn bộ dữ liệu trong Supabase. Sử dụng cẩn thận!
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <Server size={20} className="text-gray-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Kết nối Supabase</h4>
              <p className="text-sm text-gray-800">
                Dữ liệu được lưu trữ an toàn trên Supabase và đồng bộ real-time giữa các thiết bị.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Nhập dữ liệu</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setImportFile(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Cảnh báo:</p>
                    <p>Việc nhập dữ liệu sẽ ghi đè toàn bộ dữ liệu hiện tại trong Supabase. Hãy đảm bảo bạn đã sao lưu dữ liệu trước khi thực hiện.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn file JSON
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {importFile && (
                  <p className="text-sm text-green-600 mt-1">
                    Đã chọn: {importFile.name}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setImportFile(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                  disabled={isImporting}
                >
                  Hủy
                </button>
                <button
                  onClick={handleImport}
                  disabled={!importFile || isImporting}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isImporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang nhập...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Nhập dữ liệu
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Xác nhận reset</h2>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="text-red-600 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <p className="font-medium mb-1">CẢNH BÁO NGHIÊM TRỌNG:</p>
                    <p>Việc reset sẽ xóa toàn bộ dữ liệu trong Supabase. Hành động này không thể hoàn tác!</p>
                  </div>
                </div>
              </div>

              <p className="text-gray-700">
                Bạn có chắc chắn muốn reset toàn bộ cơ sở dữ liệu không?
              </p>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw size={16} />
                  Xác nhận reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}